"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";

const buoiGiangSchema = z.object({
  ten_buoi: z.string().trim().min(1, "Vui lòng nhập tên buổi"),
  so_giang_vien_can: z.coerce.number().int().min(0),
  so_tro_giang_can: z.coerce.number().int().min(0),
  mo_dang_ky: z.preprocess((v) => v === "on" || v === true, z.boolean()),
  giang_vien_chi_dinh_id: z
    .string()
    .trim()
    .nullish()
    .transform((v) => (v && v !== "none" ? v : null)),
  tro_giang_chi_dinh_id: z
    .string()
    .trim()
    .nullish()
    .transform((v) => (v && v !== "none" ? v : null)),
});

async function requireQuanLy() {
  const current = await getCurrentProfile();
  if (current?.role !== "admin" && current?.role !== "quan_ly_dao_tao") {
    return { error: "Chỉ admin/quản lý đào tạo được thao tác trên buổi giảng" };
  }
  return null;
}

function readFields(formData: FormData) {
  return {
    ten_buoi: formData.get("ten_buoi"),
    so_giang_vien_can: formData.get("so_giang_vien_can"),
    so_tro_giang_can: formData.get("so_tro_giang_can"),
    mo_dang_ky: formData.get("mo_dang_ky"),
    giang_vien_chi_dinh_id: formData.get("giang_vien_chi_dinh_id"),
    tro_giang_chi_dinh_id: formData.get("tro_giang_chi_dinh_id"),
  };
}

export async function createBuoiGiang(
  lopHocId: string,
  formData: FormData,
): Promise<{ error?: string }> {
  const denied = await requireQuanLy();
  if (denied) return denied;

  const parsed = buoiGiangSchema.safeParse(readFields(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };

  const supabase = await createClient();
  // Thu_tu khong nhap tay (keo-tha thay the) — luon them vao cuoi.
  const { count } = await supabase
    .from("buoi_giang")
    .select("id", { count: "exact", head: true })
    .eq("lop_hoc_id", lopHocId);

  const { error } = await supabase
    .from("buoi_giang")
    .insert({ ...parsed.data, lop_hoc_id: lopHocId, thu_tu: (count ?? 0) + 1 });
  if (error) return { error: error.message };

  revalidatePath(`/lop-hoc/${lopHocId}`);
  return {};
}

export async function updateBuoiGiang(
  id: string,
  lopHocId: string,
  formData: FormData,
): Promise<{ error?: string }> {
  const denied = await requireQuanLy();
  if (denied) return denied;

  const parsed = buoiGiangSchema.safeParse(readFields(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };

  const supabase = await createClient();
  const { error } = await supabase.from("buoi_giang").update(parsed.data).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath(`/lop-hoc/${lopHocId}`);
  return {};
}

export async function deleteBuoiGiang(
  id: string,
  lopHocId: string,
): Promise<{ error?: string }> {
  const denied = await requireQuanLy();
  if (denied) return denied;

  const supabase = await createClient();
  // Bai giang thuoc buoi nay se ve lai trang "chua gom buoi" (on delete set
  // null tren bai_giang.buoi_giang_id), khong bi xoa theo.
  const { error } = await supabase.from("buoi_giang").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath(`/lop-hoc/${lopHocId}`);
  return {};
}

export async function reorderBuoiGiang(
  lopHocId: string,
  orderedIds: string[],
): Promise<{ error?: string }> {
  const denied = await requireQuanLy();
  if (denied) return denied;

  const supabase = await createClient();
  const { error } = await supabase.rpc("reorder_buoi_giang", {
    p_lop_hoc_id: lopHocId,
    p_ids: orderedIds,
  });
  if (error) return { error: error.message };

  revalidatePath(`/lop-hoc/${lopHocId}`);
  return {};
}
