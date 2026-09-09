"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";

export async function updateOwnProfile(formData: FormData): Promise<{ error?: string }> {
  const current = await getCurrentProfile();
  if (!current) {
    return { error: "Chưa đăng nhập" };
  }

  const supabase = await createClient();
  const payload = {
    full_name: String(formData.get("full_name") ?? ""),
    hoc_vi: String(formData.get("hoc_vi") ?? "") || null,
    chuc_danh: String(formData.get("chuc_danh") ?? "") || null,
    chuyen_mon: String(formData.get("chuyen_mon") ?? "") || null,
    khoa_phong_cong_tac: String(formData.get("khoa_phong_cong_tac") ?? "") || null,
  };

  const { error } = await supabase.from("profiles").update(payload).eq("id", current.id);
  if (error) {
    return { error: error.message };
  }

  revalidatePath("/ho-so");
  return {};
}
