// Chi con 3 trang thai, tinh thuan tuy theo ngay_khai_giang/ngay_ket_thuc
// (xem src/lib/lop-hoc/trang-thai.ts) — bo "thieu_nhan_su" va "huy" theo
// yeu cau nguoi dung 2026-09-10: hoan lop la sua lai ngay, huy lop la xoa
// cung (RPC xoa_lop_hoc), khong con la 1 trang thai luu tru.
export const TRANG_THAI_LOP_VALUES = ["chua_mo", "dang_dien_ra", "hoan_thanh"] as const;

export type TrangThaiLop = (typeof TRANG_THAI_LOP_VALUES)[number];

export const TRANG_THAI_LOP_LABEL: Record<TrangThaiLop, string> = {
  chua_mo: "Chưa mở",
  dang_dien_ra: "Đang diễn ra",
  hoan_thanh: "Hoàn thành",
};

export const TRANG_THAI_LOP_BADGE: Record<TrangThaiLop, "default" | "secondary" | "outline"> = {
  chua_mo: "outline",
  dang_dien_ra: "default",
  hoan_thanh: "secondary",
};

// Danh sach co dinh loai lop (khop 6 chuong trinh dao tao that cua trung
// tam) — dung cho ca Select trong form lan toggle filter o /lop-hoc.
export const LOAI_LOP_VALUES = ["ABCDE", "ACLS", "BLS", "SCC-CĐ", "BTXH", "SCC-LX"] as const;

export const DOI_TUONG_HOC_VIEN_VALUES = ["nhan_vien_y_te", "cong_dong"] as const;

export type DoiTuongHocVien = (typeof DOI_TUONG_HOC_VIEN_VALUES)[number];

export const DOI_TUONG_HOC_VIEN_LABEL: Record<DoiTuongHocVien, string> = {
  nhan_vien_y_te: "Nhân viên y tế",
  cong_dong: "Cộng đồng",
};
