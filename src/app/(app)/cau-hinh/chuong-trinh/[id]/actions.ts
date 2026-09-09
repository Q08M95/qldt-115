"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { mauBaiGiangSchema, firstIssueMessage } from "../schema";

async function requireQuanLy() {
  const current = await getCurrentProfile();
  if (current?.role !== "admin" && current?.role !== "quan_ly_dao_tao") {
    return { error: "Chỉ admin/quản lý đào tạo được thao tác trên chương trình đào tạo" };
  }
  return null;
}

export async function createMauBaiGiang(
  chuongTrinhId: string,
  formData: FormData,
): Promise<{ error?: string }> {
  const denied = await requireQuanLy();
  if (denied) return denied;

  const parsed = mauBaiGiangSchema.safeParse({
    ten_bai: formData.get("ten_bai"),
    chuyen_de: formData.get("chuyen_de"),
    thoi_luong_tiet: formData.get("thoi_luong_tiet"),
    thu_tu: formData.get("thu_tu"),
  });
  if (!parsed.success) return { error: firstIssueMessage(parsed) };

  const supabase = await createClient();
  const { error } = await supabase
    .from("chuong_trinh_mau_bai_giang")
    .insert({ ...parsed.data, chuong_trinh_id: chuongTrinhId });
  if (error) return { error: error.message };

  revalidatePath(`/cau-hinh/chuong-trinh/${chuongTrinhId}`);
  return {};
}

export async function updateMauBaiGiang(
  id: string,
  chuongTrinhId: string,
  formData: FormData,
): Promise<{ error?: string }> {
  const denied = await requireQuanLy();
  if (denied) return denied;

  const parsed = mauBaiGiangSchema.safeParse({
    ten_bai: formData.get("ten_bai"),
    chuyen_de: formData.get("chuyen_de"),
    thoi_luong_tiet: formData.get("thoi_luong_tiet"),
    thu_tu: formData.get("thu_tu"),
  });
  if (!parsed.success) return { error: firstIssueMessage(parsed) };

  const supabase = await createClient();
  const { error } = await supabase
    .from("chuong_trinh_mau_bai_giang")
    .update(parsed.data)
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath(`/cau-hinh/chuong-trinh/${chuongTrinhId}`);
  return {};
}

export async function deleteMauBaiGiang(
  id: string,
  chuongTrinhId: string,
): Promise<{ error?: string }> {
  const denied = await requireQuanLy();
  if (denied) return denied;

  const supabase = await createClient();
  const { error } = await supabase.from("chuong_trinh_mau_bai_giang").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath(`/cau-hinh/chuong-trinh/${chuongTrinhId}`);
  return {};
}
