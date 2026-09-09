"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/auth";
import {
  createProfileSchema,
  updateProfileByAdminSchema,
  updateProfileEmailSchema,
  firstIssueMessage,
} from "./schema";

// Loi mong doi tra ve qua gia tri (khong throw) — Next.js che message cua
// loi throw trong production (chi con "digest" chung chung).
export async function createProfile(formData: FormData): Promise<{ error?: string }> {
  const current = await getCurrentProfile();
  if (current?.role !== "admin") {
    return { error: "Chỉ admin được thêm nhân sự mới" };
  }

  const parsed = createProfileSchema.safeParse({
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    role: formData.get("role"),
    hoc_vi: formData.get("hoc_vi"),
    chuyen_mon: formData.get("chuyen_mon"),
  });
  if (!parsed.success) {
    return { error: firstIssueMessage(parsed) };
  }
  const { email, full_name: fullName, role, hoc_vi: hocVi, chuyen_mon: chuyenMon } = parsed.data;

  // Tao tai khoan auth.users qua Admin API — bat buoc dung service role vi
  // profiles.id co FK toi auth.users.id, khong the tao profile truoc.
  const admin = createAdminClient();
  const tempPassword = crypto.randomUUID();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (error || !data.user) {
    return { error: error?.message ?? "Không tạo được tài khoản" };
  }

  // Trigger da tu tao 1 dong profiles (role mac dinh tro_giang) — cap nhat
  // lai cho dung thong tin admin vua nhap. Dung admin client de bo qua gioi
  // han cua trigger enforce_profiles_update_scope (chi admin that qua UI
  // moi lam duoc buoc nay, o day dang chay dung boi admin).
  const { error: updateError } = await admin
    .from("profiles")
    .update({ full_name: fullName, role, hoc_vi: hocVi, chuyen_mon: chuyenMon })
    .eq("id", data.user.id);

  if (updateError) {
    return { error: updateError.message };
  }

  // Khong gui mat khau tam qua bat ky kenh nao o day — nhan su moi tu dung
  // "Quen mat khau" voi dung email nay de tao mat khau lan dau (tai su dung
  // ha tang email cua Giai doan 2, khong can Giai doan 8 moi hoat dong).
  revalidatePath("/nhan-su");
  return {};
}

export async function toggleActive(
  id: string,
  nextValue: boolean,
): Promise<{ error?: string }> {
  const current = await getCurrentProfile();
  if (current?.role !== "admin" && current?.role !== "quan_ly_dao_tao") {
    return { error: "Bạn không có quyền khoá/mở hoạt động nhân sự" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ trang_thai_hoat_dong: nextValue })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/nhan-su");
  revalidatePath(`/nhan-su/${id}`);
  return {};
}

export async function updateProfileByAdmin(
  id: string,
  formData: FormData,
): Promise<{ error?: string }> {
  const current = await getCurrentProfile();
  if (current?.role !== "admin") {
    return { error: "Chỉ admin được sửa hồ sơ nhân sự khác" };
  }

  const nhomRaw = formData.get("nhom_phan_loai");
  const parsed = updateProfileByAdminSchema.safeParse({
    full_name: formData.get("full_name"),
    role: formData.get("role"),
    hoc_vi: formData.get("hoc_vi"),
    chuc_danh: formData.get("chuc_danh"),
    chuyen_mon: formData.get("chuyen_mon"),
    khoa_phong_cong_tac: formData.get("khoa_phong_cong_tac"),
    nhom_phan_loai: nhomRaw === "none" || !nhomRaw ? null : Number(nhomRaw),
  });
  if (!parsed.success) {
    return { error: firstIssueMessage(parsed) };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update(parsed.data).eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/nhan-su/${id}`);
  return {};
}

// Gui lai email dat mat khau cho nhan su chua dang nhap lan nao (vd email
// dau bi loi, roi vao spam...). profiles khong luu email (chi auth.users co)
// nen phai dung admin client de tra cuu truoc.
export async function resendInvite(profileId: string): Promise<{ error?: string }> {
  const current = await getCurrentProfile();
  if (current?.role !== "admin") {
    return { error: "Chỉ admin được thực hiện thao tác này" };
  }

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.getUserById(profileId);
  if (error || !data.user?.email) {
    return { error: "Không tìm thấy email của nhân sự này" };
  }

  const origin = (await headers()).get("origin");
  const supabase = await createClient();
  const { error: resetError } = await supabase.auth.resetPasswordForEmail(data.user.email, {
    redirectTo: `${origin}/auth/confirm?next=/dat-lai-mat-khau`,
  });

  if (resetError) {
    return { error: resetError.message };
  }

  return {};
}

// Sua email dang nhap that cho 1 nhan su (vd ho so tao tu du lieu Excel
// dung email noi bo tam, nay co email that cua nguoi do) — phai doi qua
// admin API vi day la truong dinh danh dang nhap cua auth.users, khong
// chi la cot du lieu thuong trong profiles. Tu dong gui luon email dat
// mat khau ngay sau khi doi de giam thao tac cho admin.
export async function updateProfileEmail(
  id: string,
  formData: FormData,
): Promise<{ error?: string }> {
  const current = await getCurrentProfile();
  if (current?.role !== "admin") {
    return { error: "Chỉ admin được sửa email đăng nhập" };
  }

  const parsed = updateProfileEmailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: firstIssueMessage(parsed) };
  }

  const admin = createAdminClient();
  const { error: updateError } = await admin.auth.admin.updateUserById(id, {
    email: parsed.data.email,
    email_confirm: true,
  });
  if (updateError) {
    return { error: updateError.message };
  }

  const { error: profileError } = await admin
    .from("profiles")
    .update({ email: parsed.data.email })
    .eq("id", id);
  if (profileError) {
    return { error: profileError.message };
  }

  const origin = (await headers()).get("origin");
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/confirm?next=/dat-lai-mat-khau`,
  });

  revalidatePath("/nhan-su");
  revalidatePath(`/nhan-su/${id}`);
  return {};
}

// Xoa cung 1 nhan su — chi thanh cong khi chua co du lieu lien quan (lich
// giang, dang ky, danh gia KPI...), kiem tra trong RPC xoa_nhan_su thay vi
// bat loi rang buoc khoa ngoai chung chung tu GoTrue Admin API. Truong hop
// da co du lieu thi dung khoa hoat dong (toggleActive) thay vi xoa.
export async function deleteProfile(id: string): Promise<{ error?: string }> {
  const current = await getCurrentProfile();
  if (current?.role !== "admin") {
    return { error: "Chỉ admin được xoá nhân sự" };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("xoa_nhan_su", { p_id: id });
  if (error) {
    return { error: error.message };
  }

  revalidatePath("/nhan-su");
  return {};
}
