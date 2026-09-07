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

export async function updateProfileByAdmin(
  id: string,
  formData: FormData,
): Promise<{ error?: string }> {
  const current = await getCurrentProfile();
  if (current?.role !== "admin") {
    return { error: "Chỉ admin được sửa hồ sơ nhân sự khác" };
  }

  const parsed = updateProfileByAdminSchema.safeParse({
    full_name: formData.get("full_name"),
    role: formData.get("role"),
    hoc_vi: formData.get("hoc_vi"),
    chuc_danh: formData.get("chuc_danh"),
    chuyen_mon: formData.get("chuyen_mon"),
    don_vi_cong_tac: formData.get("don_vi_cong_tac"),
    so_dien_thoai: formData.get("so_dien_thoai"),
    ngay_vao_lam: formData.get("ngay_vao_lam"),
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
