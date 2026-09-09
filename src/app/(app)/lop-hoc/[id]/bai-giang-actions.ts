"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";

const baiGiangSchema = z.object({
  ten_bai: z.string().trim().min(1, "Vui lòng nhập tên bài giảng"),
  chuyen_de: z
    .string()
    .trim()
    .optional()
    .transform((v) => v || null),
  thoi_luong_tiet: z.coerce.number().int().min(1, "Số tiết phải >= 1"),
  thu_tu: z.coerce.number().int().min(1, "Thứ tự phải >= 1"),
});

async function requireQuanLy() {
  const current = await getCurrentProfile();
  if (current?.role !== "admin" && current?.role !== "quan_ly_dao_tao") {
    return { error: "Chỉ admin/quản lý đào tạo được thao tác trên bài giảng" };
  }
  return null;
}

export async function createBaiGiang(
  lopHocId: string,
  formData: FormData,
): Promise<{ error?: string }> {
  const denied = await requireQuanLy();
  if (denied) return denied;

  const parsed = baiGiangSchema.safeParse({
    ten_bai: formData.get("ten_bai"),
    chuyen_de: formData.get("chuyen_de"),
    thoi_luong_tiet: formData.get("thoi_luong_tiet"),
    thu_tu: formData.get("thu_tu"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("bai_giang")
    .insert({ ...parsed.data, lop_hoc_id: lopHocId });
  if (error) return { error: error.message };

  revalidatePath(`/lop-hoc/${lopHocId}`);
  return {};
}

export async function updateBaiGiang(
  id: string,
  lopHocId: string,
  formData: FormData,
): Promise<{ error?: string }> {
  const denied = await requireQuanLy();
  if (denied) return denied;

  const parsed = baiGiangSchema.safeParse({
    ten_bai: formData.get("ten_bai"),
    chuyen_de: formData.get("chuyen_de"),
    thoi_luong_tiet: formData.get("thoi_luong_tiet"),
    thu_tu: formData.get("thu_tu"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };

  const supabase = await createClient();
  const { error } = await supabase.from("bai_giang").update(parsed.data).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath(`/lop-hoc/${lopHocId}`);
  return {};
}

export async function deleteBaiGiang(
  id: string,
  lopHocId: string,
): Promise<{ error?: string }> {
  const denied = await requireQuanLy();
  if (denied) return denied;

  const supabase = await createClient();
  const { error } = await supabase.from("bai_giang").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath(`/lop-hoc/${lopHocId}`);
  return {};
}
