"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/auth";

const ROLES = ["admin", "quan_ly_dao_tao", "giang_vien", "tro_giang"] as const;

// Loi mong doi tra ve qua gia tri (khong throw) — Next.js che message cua
// loi throw trong production (chi con "digest" chung chung).
export async function createProfile(formData: FormData): Promise<{ error?: string }> {
  const current = await getCurrentProfile();
  if (current?.role !== "admin") {
    return { error: "Chỉ admin được thêm nhân sự mới" };
  }

  const email = String(formData.get("email") ?? "");
  const fullName = String(formData.get("full_name") ?? "");
  const role = String(formData.get("role") ?? "tro_giang");
  const hocVi = String(formData.get("hoc_vi") ?? "") || null;
  const chuyenMon = String(formData.get("chuyen_mon") ?? "") || null;

  if (!email.trim() || !fullName.trim()) {
    return { error: "Vui lòng nhập đủ email và họ tên" };
  }
  if (!ROLES.includes(role as (typeof ROLES)[number])) {
    return { error: "Vai trò không hợp lệ" };
  }

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
  const supabase = await createClient();

  const payload = {
    full_name: String(formData.get("full_name") ?? ""),
    role: String(formData.get("role") ?? ""),
    hoc_vi: String(formData.get("hoc_vi") ?? "") || null,
    chuc_danh: String(formData.get("chuc_danh") ?? "") || null,
    chuyen_mon: String(formData.get("chuyen_mon") ?? "") || null,
    don_vi_cong_tac: String(formData.get("don_vi_cong_tac") ?? "") || null,
    so_dien_thoai: String(formData.get("so_dien_thoai") ?? "") || null,
    ngay_vao_lam: String(formData.get("ngay_vao_lam") ?? "") || null,
  };

  const { error } = await supabase.from("profiles").update(payload).eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/nhan-su/${id}`);
  return {};
}
