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
  const doiTuong = formData.get("doi_tuong_hoc_vien");
  const giangVienChiDinh = formData.get("giang_vien_chi_dinh_id");
  const troGiangChiDinh = formData.get("tro_giang_chi_dinh_id");
  return {
    ten_lop: formData.get("ten_lop"),
    mo_ta: formData.get("mo_ta"),
    loai_lop: formData.get("loai_lop"),
    doi_tuong_hoc_vien: doiTuong === "none" ? null : doiTuong,
    co_kinh_phi: formData.get("co_kinh_phi"),
    la_lop_gap: formData.get("la_lop_gap"),
    la_lop_cong_dong: formData.get("la_lop_cong_dong"),
    ngay_khai_giang: formData.get("ngay_khai_giang"),
    ngay_ket_thuc: formData.get("ngay_ket_thuc"),
    so_giang_vien_can: formData.get("so_giang_vien_can"),
    so_tro_giang_can: formData.get("so_tro_giang_can"),
    mo_dang_ky: formData.get("mo_dang_ky"),
    nhom_giang_vien_phu_hop: formData.getAll("nhom_giang_vien_phu_hop"),
    nhom_tro_giang_phu_hop: formData.getAll("nhom_tro_giang_phu_hop"),
    giang_vien_chi_dinh_id: giangVienChiDinh === "none" ? null : giangVienChiDinh,
    tro_giang_chi_dinh_id: troGiangChiDinh === "none" ? null : troGiangChiDinh,
  };
}

// Tao lop hoc goi qua RPC tao_lop_hoc (xem migration
// 20260914000000_lop_hoc_rework.sql) — gop insert lop_hoc + copy bai_giang
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
    p_doi_tuong_hoc_vien: parsed.data.doi_tuong_hoc_vien,
    p_co_kinh_phi: parsed.data.co_kinh_phi,
    p_la_lop_gap: parsed.data.la_lop_gap,
    p_la_lop_cong_dong: parsed.data.la_lop_cong_dong,
    p_ngay_khai_giang: parsed.data.ngay_khai_giang,
    p_ngay_ket_thuc: parsed.data.ngay_ket_thuc,
    p_so_giang_vien_can: parsed.data.so_giang_vien_can,
    p_so_tro_giang_can: parsed.data.so_tro_giang_can,
    p_mo_dang_ky: parsed.data.mo_dang_ky,
    p_nhom_giang_vien_phu_hop: parsed.data.nhom_giang_vien_phu_hop,
    p_nhom_tro_giang_phu_hop: parsed.data.nhom_tro_giang_phu_hop,
    p_giang_vien_chi_dinh_id: parsed.data.giang_vien_chi_dinh_id,
    p_tro_giang_chi_dinh_id: parsed.data.tro_giang_chi_dinh_id,
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

// Xoa cung 1 lop hoc — thay the hoan toan khai niem "huy lop" truoc day
// (nguoi dung xac nhan: hoan lop = sua lai ngay, huy lop = xoa han). RPC
// xoa_lop_hoc tu kiem tra du lieu lien quan (dang ky/lich giang/khao sat)
// truoc khi xoa, bao loi ro rang neu con.
export async function deleteLopHoc(id: string): Promise<{ error?: string }> {
  const denied = await requireQuanLy();
  if (denied) return denied;

  const supabase = await createClient();
  const { error } = await supabase.rpc("xoa_lop_hoc", { p_id: id });
  if (error) return { error: error.message };

  revalidatePath("/lop-hoc");
  return {};
}
