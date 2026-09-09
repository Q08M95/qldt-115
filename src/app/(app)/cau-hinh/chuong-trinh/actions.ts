"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { programSchema, firstIssueMessage } from "./schema";

async function requireQuanLy() {
  const current = await getCurrentProfile();
  if (current?.role !== "admin" && current?.role !== "quan_ly_dao_tao") {
    return { error: "Chỉ admin/quản lý đào tạo được thao tác trên chương trình đào tạo" };
  }
  return null;
}

export async function createProgram(formData: FormData): Promise<{ error?: string }> {
  const denied = await requireQuanLy();
  if (denied) return denied;

  const parsed = programSchema.safeParse({
    ten_chuong_trinh: formData.get("ten_chuong_trinh"),
    mo_ta: formData.get("mo_ta"),
  });
  if (!parsed.success) return { error: firstIssueMessage(parsed) };

  const supabase = await createClient();
  const { error } = await supabase.from("chuong_trinh_dao_tao").insert(parsed.data);
  if (error) return { error: error.message };

  revalidatePath("/cau-hinh/chuong-trinh");
  return {};
}

export async function updateProgram(
  id: string,
  formData: FormData,
): Promise<{ error?: string }> {
  const denied = await requireQuanLy();
  if (denied) return denied;

  const parsed = programSchema.safeParse({
    ten_chuong_trinh: formData.get("ten_chuong_trinh"),
    mo_ta: formData.get("mo_ta"),
  });
  if (!parsed.success) return { error: firstIssueMessage(parsed) };

  const supabase = await createClient();
  const { error } = await supabase.from("chuong_trinh_dao_tao").update(parsed.data).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/cau-hinh/chuong-trinh");
  revalidatePath(`/cau-hinh/chuong-trinh/${id}`);
  return {};
}

export async function deleteProgram(id: string): Promise<{ error?: string }> {
  const denied = await requireQuanLy();
  if (denied) return denied;

  const supabase = await createClient();
  const { error } = await supabase.from("chuong_trinh_dao_tao").delete().eq("id", id);
  if (error) {
    // FK violation (23503): con lop hoc dang tham chieu chuong trinh nay.
    if (error.code === "23503") {
      return { error: "Không thể xoá vì đã có lớp học được tạo từ chương trình này" };
    }
    return { error: error.message };
  }

  revalidatePath("/cau-hinh/chuong-trinh");
  return {};
}
