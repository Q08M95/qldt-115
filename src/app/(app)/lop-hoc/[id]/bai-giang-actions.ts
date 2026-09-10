"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";

const optionalId = z
  .string()
  .trim()
  .nullish()
  .transform((v) => (v && v !== "none" ? v : null));

// buoi_giang_id KHONG nam trong schema/form nay — gan buoi lam qua action
// rieng setBuoiGiang (inline select tren dong bang), de tranh viec sua cac
// truong khac trong dialog vo tinh ghi de/xoa mat buoi da gan.
const baiGiangSchema = z.object({
  ten_bai: z.string().trim().min(1, "Vui lòng nhập tên bài giảng"),
  chuyen_de: z
    .string()
    .trim()
    .optional()
    .transform((v) => v || null),
  // So tiet cho phep < 1 (vd 0.5) — theo yeu cau nguoi dung 2026-09-10.
  thoi_luong_tiet: z.coerce.number().positive("Số tiết phải lớn hơn 0"),
  mo_dang_ky: z.preprocess((v) => v === "on" || v === true, z.boolean()),
  giang_vien_chi_dinh_id: optionalId,
  tro_giang_chi_dinh_id: optionalId,
});

function readFields(formData: FormData) {
  return {
    ten_bai: formData.get("ten_bai"),
    chuyen_de: formData.get("chuyen_de"),
    thoi_luong_tiet: formData.get("thoi_luong_tiet"),
    mo_dang_ky: formData.get("mo_dang_ky"),
    giang_vien_chi_dinh_id: formData.get("giang_vien_chi_dinh_id"),
    tro_giang_chi_dinh_id: formData.get("tro_giang_chi_dinh_id"),
  };
}

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

  const parsed = baiGiangSchema.safeParse(readFields(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };

  const supabase = await createClient();
  // Thu_tu khong con nhap tay (keo-tha thay the) — luon them vao cuoi danh
  // sach hien co cua lop nay.
  const { count } = await supabase
    .from("bai_giang")
    .select("id", { count: "exact", head: true })
    .eq("lop_hoc_id", lopHocId);

  const { error } = await supabase
    .from("bai_giang")
    .insert({ ...parsed.data, lop_hoc_id: lopHocId, thu_tu: (count ?? 0) + 1 });
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

  const parsed = baiGiangSchema.safeParse(readFields(formData));
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

// Gan/bo gan 1 bai giang vao 1 buoi giang — sua ngay tren dong bang (inline
// select trong BaiGiangList), khong can mo dialog vi day thuan tuy la thao
// tac phan loai/sap xep, khong lien quan cac truong khac cua bai giang.
export async function setBuoiGiang(
  id: string,
  lopHocId: string,
  buoiGiangId: string | null,
): Promise<{ error?: string }> {
  const denied = await requireQuanLy();
  if (denied) return denied;

  const supabase = await createClient();
  const { error } = await supabase
    .from("bai_giang")
    .update({ buoi_giang_id: buoiGiangId })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath(`/lop-hoc/${lopHocId}`);
  return {};
}

// Sap xep lai bang keo-tha — goi RPC gop 1 cau UPDATE set-based thay vi N
// lan update roi rac tu client (CLAUDE.md muc 4).
export async function reorderBaiGiang(
  lopHocId: string,
  orderedIds: string[],
): Promise<{ error?: string }> {
  const denied = await requireQuanLy();
  if (denied) return denied;

  const supabase = await createClient();
  const { error } = await supabase.rpc("reorder_bai_giang", {
    p_lop_hoc_id: lopHocId,
    p_ids: orderedIds,
  });
  if (error) return { error: error.message };

  revalidatePath(`/lop-hoc/${lopHocId}`);
  return {};
}
