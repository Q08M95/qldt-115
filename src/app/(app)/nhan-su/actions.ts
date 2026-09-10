"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/auth";
import { createProfileSchema, updateProfileByAdminSchema, firstIssueMessage } from "./schema";

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

// Form Ho so gop chung email dang nhap voi cac truong thong tin khac (thay
// vi 1 dialog rieng "ben ngoai" nhu truoc) — neu email doi so voi ban ghi
// cu, phai goi Admin API doi ca auth.users.email (khong chi cot profiles)
// roi tu dong gui email dat mat khau lan dau toi dia chi moi.
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
    email: formData.get("email"),
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

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("profiles")
    .select("email")
    .eq("id", id)
    .single();
  const emailChanged = existing?.email !== parsed.data.email;

  if (emailChanged) {
    const { error: authError } = await admin.auth.admin.updateUserById(id, {
      email: parsed.data.email,
      email_confirm: true,
    });
    if (authError) {
      return { error: authError.message };
    }
  }

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update(parsed.data).eq("id", id);

  if (error) {
    return { error: error.message };
  }

  if (emailChanged) {
    const origin = (await headers()).get("origin");
    await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${origin}/auth/confirm?next=/dat-lai-mat-khau`,
    });
  }

  revalidatePath("/nhan-su");
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
