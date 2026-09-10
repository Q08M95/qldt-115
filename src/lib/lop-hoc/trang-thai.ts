import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { TrangThaiLop } from "@/lib/constants/lop-hoc";

type LopChoTinh = {
  id: string;
  trang_thai: TrangThaiLop;
  ngay_khai_giang: string | null;
  ngay_ket_thuc: string | null;
};

/**
 * Tinh trang_thai "dung theo thuc te" cua 1 lop hoc, thuan tuy theo ngay
 * (tientrinh.md Giai doan 4 muc 6, chot lai 2026-09-10 — bo "thieu_nhan_su"
 * va "huy" khoi khai niem trang_thai; huy lop gio la xoa cung, hoan lop la
 * sua lai ngay khai giang/ket thuc).
 */
export function computeTrangThaiLop(lop: LopChoTinh): TrangThaiLop {
  const homNay = new Date();
  if (lop.ngay_ket_thuc && homNay > new Date(lop.ngay_ket_thuc)) {
    return "hoan_thanh";
  }
  if (lop.ngay_khai_giang && homNay >= new Date(lop.ngay_khai_giang)) {
    return "dang_dien_ra";
  }
  return "chua_mo";
}

/**
 * Doi chieu trang_thai tinh duoc voi gia tri dang luu trong DB — neu lech
 * thi ghi lai. Chi goi khi nguoi xem hien tai co quyen ghi lop_hoc
 * (is_quan_ly); giang_vien/tro_giang chi xem duoc gia tri da tinh.
 */
export async function dongBoTrangThaiLop(
  lop: LopChoTinh,
  coQuyenGhi: boolean,
): Promise<TrangThaiLop> {
  const trangThaiMoi = computeTrangThaiLop(lop);
  if (trangThaiMoi === lop.trang_thai || !coQuyenGhi) {
    return trangThaiMoi;
  }

  const supabase = await createClient();
  await supabase.from("lop_hoc").update({ trang_thai: trangThaiMoi }).eq("id", lop.id);
  return trangThaiMoi;
}
