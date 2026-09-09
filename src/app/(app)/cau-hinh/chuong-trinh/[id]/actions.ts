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
  });
  if (!parsed.success) return { error: firstIssueMessage(parsed) };

  const supabase = await createClient();
  // Thu_tu khong con nhap tay (keo-tha thay the) — luon them vao cuoi.
  const { count } = await supabase
    .from("chuong_trinh_mau_bai_giang")
    .select("id", { count: "exact", head: true })
    .eq("chuong_trinh_id", chuongTrinhId);

  const { error } = await supabase
    .from("chuong_trinh_mau_bai_giang")
    .insert({ ...parsed.data, chuong_trinh_id: chuongTrinhId, thu_tu: (count ?? 0) + 1 });
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

// Sap xep lai bang keo-tha — goi RPC gop 1 cau UPDATE set-based thay vi N
// lan update roi rac tu client (CLAUDE.md muc 4).
export async function reorderMauBaiGiang(
  chuongTrinhId: string,
  orderedIds: string[],
): Promise<{ error?: string }> {
  const denied = await requireQuanLy();
  if (denied) return denied;

  const supabase = await createClient();
  const { error } = await supabase.rpc("reorder_chuong_trinh_mau_bai_giang", {
    p_chuong_trinh_id: chuongTrinhId,
    p_ids: orderedIds,
  });
  if (error) return { error: error.message };

  revalidatePath(`/cau-hinh/chuong-trinh/${chuongTrinhId}`);
  return {};
}
