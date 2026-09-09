"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { createLopHocSchema, updateLopHocSchema, firstIssueMessage } from "./schema";

async function requireQuanLy() {
  const current = await getCurrentProfile();
  if (current?.role !== "admin" && current?.role !== "quan_ly_dao_tao") {
    return { error: "Chỉ admin/quản lý đào tạo được thao tác trên lớp học" };
  }
  return null;
}

function readLopHocFields(formData: FormData) {
  const nguoiPhuTrach = formData.get("nguoi_phu_trach_id");
  return {
    ten_lop: formData.get("ten_lop"),
    mo_ta: formData.get("mo_ta"),
    loai_lop: formData.get("loai_lop"),
    hinh_thuc: formData.get("hinh_thuc"),
    co_kinh_phi: formData.get("co_kinh_phi"),
    la_lop_gap: formData.get("la_lop_gap"),
    la_gio_hiem: formData.get("la_gio_hiem"),
    la_lop_cong_dong: formData.get("la_lop_cong_dong"),
    ngay_khai_giang: formData.get("ngay_khai_giang"),
    ngay_ket_thuc: formData.get("ngay_ket_thuc"),
    so_hoc_vien_du_kien: formData.get("so_hoc_vien_du_kien") || undefined,
    so_giang_vien_can: formData.get("so_giang_vien_can"),
    so_tro_giang_can: formData.get("so_tro_giang_can"),
    nguoi_phu_trach_id: nguoiPhuTrach === "none" ? null : nguoiPhuTrach,
  };
}

// Tao lop hoc goi qua RPC tao_lop_hoc (xem migration
// 20260909000000_rpc_tao_lop_hoc.sql) — gop insert lop_hoc + copy bai_giang
// tu chuong trinh mau (neu co chon) vao 1 transaction, dung quy uoc CLAUDE.md
// muc 4 (khong tach nhieu lenh roi o client cho nghiep vu nhieu buoc).
export async function createLopHoc(formData: FormData): Promise<{ error?: string; id?: string }> {
  const denied = await requireQuanLy();
  if (denied) return denied;

  const chuongTrinhRaw = formData.get("chuong_trinh_id");
  const parsed = createLopHocSchema.safeParse({
    ...readLopHocFields(formData),
    chuong_trinh_id: chuongTrinhRaw === "none" ? null : chuongTrinhRaw,
  });
  if (!parsed.success) return { error: firstIssueMessage(parsed) };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("tao_lop_hoc", {
    p_ten_lop: parsed.data.ten_lop,
    p_mo_ta: parsed.data.mo_ta,
    p_loai_lop: parsed.data.loai_lop,
    p_hinh_thuc: parsed.data.hinh_thuc,
    p_co_kinh_phi: parsed.data.co_kinh_phi,
    p_la_lop_gap: parsed.data.la_lop_gap,
    p_la_gio_hiem: parsed.data.la_gio_hiem,
    p_la_lop_cong_dong: parsed.data.la_lop_cong_dong,
    p_ngay_khai_giang: parsed.data.ngay_khai_giang,
    p_ngay_ket_thuc: parsed.data.ngay_ket_thuc,
    p_so_hoc_vien_du_kien: parsed.data.so_hoc_vien_du_kien ?? null,
    p_so_giang_vien_can: parsed.data.so_giang_vien_can,
    p_so_tro_giang_can: parsed.data.so_tro_giang_can,
    p_nguoi_phu_trach_id: parsed.data.nguoi_phu_trach_id,
    p_chuong_trinh_id: parsed.data.chuong_trinh_id,
  });
  if (error) return { error: error.message };

  revalidatePath("/lop-hoc");
  return { id: data ?? undefined };
}

export async function updateLopHoc(id: string, formData: FormData): Promise<{ error?: string }> {
  const denied = await requireQuanLy();
  if (denied) return denied;

  const parsed = updateLopHocSchema.safeParse(readLopHocFields(formData));
  if (!parsed.success) return { error: firstIssueMessage(parsed) };

  const supabase = await createClient();
  const { error } = await supabase.from("lop_hoc").update(parsed.data).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/lop-hoc");
  revalidatePath(`/lop-hoc/${id}`);
  return {};
}

// Huy/mo lai lop — khong xoa cung, dung tinh than "khoa/mo" da ap dung cho
// nhan su (CLAUDE.md/tientrinh.md). Mo lai dua ve 'cho_khai_giang', lan
// load trang tiep theo se tu tinh lai trang_thai dung theo thuc te (xem
// src/lib/lop-hoc/trang-thai.ts).
export async function setHuyLop(id: string, huy: boolean): Promise<{ error?: string }> {
  const denied = await requireQuanLy();
  if (denied) return denied;

  const supabase = await createClient();
  const { error } = await supabase
    .from("lop_hoc")
    .update({ trang_thai: huy ? "huy" : "cho_khai_giang" })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/lop-hoc");
  revalidatePath(`/lop-hoc/${id}`);
  return {};
}
