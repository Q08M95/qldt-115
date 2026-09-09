import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { TrangThaiLop } from "@/lib/constants/lop-hoc";

type LopChoTinh = {
  id: string;
  trang_thai: TrangThaiLop;
  ngay_khai_giang: string | null;
  ngay_ket_thuc: string | null;
  so_giang_vien_can: number;
  so_tro_giang_can: number;
};

/**
 * Tinh trang_thai "dung theo thuc te" cua 1 lop hoc (tientrinh.md Giai doan
 * 4 muc 6). Thu tu uu tien:
 * 1. 'huy' la trang thai chot — khong bao gio tu dong doi lai (chi admin/
 *    quan_ly bam nut "Mo lai" moi thoat khoi trang thai nay).
 * 2. Da qua ngay_ket_thuc -> 'hoan_thanh'.
 * 3. Chua du so nguoi da duoc gan qua lich_giang (dem theo giang_vien_id/
 *    tro_giang_id, khong tinh cac buoi da 'huy') -> 'thieu_nhan_su' — canh
 *    bao nay uu tien hon ca 'dang_dien_ra'/'cho_khai_giang' vi la tin hieu
 *    quan trong nhat voi nguoi quan ly.
 * 4. Da den ngay khai giang -> 'dang_dien_ra'.
 * 5. Con lai -> 'cho_khai_giang'.
 */
export function computeTrangThaiLop(
  lop: LopChoTinh,
  soGiangVienDaGan: number,
  soTroGiangDaGan: number,
): TrangThaiLop {
  if (lop.trang_thai === "huy") return "huy";

  const homNay = new Date();
  if (lop.ngay_ket_thuc && homNay > new Date(lop.ngay_ket_thuc)) {
    return "hoan_thanh";
  }
  if (soGiangVienDaGan < lop.so_giang_vien_can || soTroGiangDaGan < lop.so_tro_giang_can) {
    return "thieu_nhan_su";
  }
  if (lop.ngay_khai_giang && homNay >= new Date(lop.ngay_khai_giang)) {
    return "dang_dien_ra";
  }
  return "cho_khai_giang";
}

/**
 * Dem so giang vien/tro giang duy nhat da duoc gan cho 1 danh sach lop qua
 * lich_giang (bo qua buoi da huy). Tra ve map lop_hoc_id -> {gv, tg}.
 */
export async function demNhanSuDaGan(
  lopHocIds: string[],
): Promise<Record<string, { gv: number; tg: number }>> {
  const result: Record<string, { gv: number; tg: number }> = {};
  if (lopHocIds.length === 0) return result;

  const supabase = await createClient();
  const { data } = await supabase
    .from("lich_giang")
    .select("lop_hoc_id, giang_vien_id, tro_giang_id, trang_thai")
    .in("lop_hoc_id", lopHocIds)
    .neq("trang_thai", "huy");

  const gvSets: Record<string, Set<string>> = {};
  const tgSets: Record<string, Set<string>> = {};
  for (const row of data ?? []) {
    gvSets[row.lop_hoc_id] ??= new Set();
    tgSets[row.lop_hoc_id] ??= new Set();
    if (row.giang_vien_id) gvSets[row.lop_hoc_id].add(row.giang_vien_id);
    if (row.tro_giang_id) tgSets[row.lop_hoc_id].add(row.tro_giang_id);
  }

  for (const id of lopHocIds) {
    result[id] = { gv: gvSets[id]?.size ?? 0, tg: tgSets[id]?.size ?? 0 };
  }
  return result;
}

/**
 * Doi chieu trang_thai tinh duoc voi gia tri dang luu trong DB — neu lech
 * thi ghi lai. Chi goi khi nguoi xem hien tai co quyen ghi lop_hoc
 * (is_quan_ly), vi RLS lop_hoc_write chi cho phep admin/quan_ly_dao_tao;
 * giang_vien/tro_giang chi xem duoc gia tri da tinh (khong ghi duoc, se bi
 * RLS tu choi) — trang hien thi van dung gia tri tinh o day, chi rieng viec
 * ghi lai vao DB la bi bo qua cho ho.
 */
export async function dongBoTrangThaiLop(
  lop: LopChoTinh,
  soGiangVienDaGan: number,
  soTroGiangDaGan: number,
  coQuyenGhi: boolean,
): Promise<TrangThaiLop> {
  const trangThaiMoi = computeTrangThaiLop(lop, soGiangVienDaGan, soTroGiangDaGan);
  if (trangThaiMoi === lop.trang_thai || !coQuyenGhi) {
    return trangThaiMoi;
  }

  const supabase = await createClient();
  await supabase.from("lop_hoc").update({ trang_thai: trangThaiMoi }).eq("id", lop.id);
  return trangThaiMoi;
}
