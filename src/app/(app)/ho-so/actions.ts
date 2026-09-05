"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";

export async function updateOwnProfile(formData: FormData) {
  const current = await getCurrentProfile();
  if (!current) {
    throw new Error("Chưa đăng nhập");
  }

  const supabase = await createClient();
  const payload = {
    full_name: String(formData.get("full_name") ?? ""),
    hoc_vi: String(formData.get("hoc_vi") ?? "") || null,
    chuc_danh: String(formData.get("chuc_danh") ?? "") || null,
    chuyen_mon: String(formData.get("chuyen_mon") ?? "") || null,
    don_vi_cong_tac: String(formData.get("don_vi_cong_tac") ?? "") || null,
    so_dien_thoai: String(formData.get("so_dien_thoai") ?? "") || null,
    ngay_vao_lam: String(formData.get("ngay_vao_lam") ?? "") || null,
  };

  const { error } = await supabase.from("profiles").update(payload).eq("id", current.id);
  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/ho-so");
}
