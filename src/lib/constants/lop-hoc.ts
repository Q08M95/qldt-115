export const TRANG_THAI_LOP_VALUES = [
  "cho_khai_giang",
  "dang_dien_ra",
  "hoan_thanh",
  "thieu_nhan_su",
  "huy",
] as const;

export type TrangThaiLop = (typeof TRANG_THAI_LOP_VALUES)[number];

export const TRANG_THAI_LOP_LABEL: Record<TrangThaiLop, string> = {
  cho_khai_giang: "Chờ khai giảng",
  dang_dien_ra: "Đang diễn ra",
  hoan_thanh: "Hoàn thành",
  thieu_nhan_su: "Thiếu nhân sự",
  huy: "Đã huỷ",
};

// Mau badge tuong ung. thieu_nhan_su KHONG dung variant "destructive" (do
// chung chung cua he thong) ma dung dung mau cam "Canh bao / thieu nhan su"
// da chot trong CLAUDE.md muc 3 (--color-data-canh-bao), qua className rieng.
export const TRANG_THAI_LOP_BADGE: Record<TrangThaiLop, "default" | "secondary" | "outline"> = {
  cho_khai_giang: "outline",
  dang_dien_ra: "default",
  hoan_thanh: "secondary",
  thieu_nhan_su: "outline",
  huy: "secondary",
};

export const TRANG_THAI_LOP_CLASSNAME: Partial<Record<TrangThaiLop, string>> = {
  thieu_nhan_su: "border-data-canh-bao/40 bg-data-canh-bao/10 text-data-canh-bao",
};

export const DOI_TUONG_HOC_VIEN_VALUES = ["nhan_vien_y_te", "cong_dong"] as const;

export type DoiTuongHocVien = (typeof DOI_TUONG_HOC_VIEN_VALUES)[number];

export const DOI_TUONG_HOC_VIEN_LABEL: Record<DoiTuongHocVien, string> = {
  nhan_vien_y_te: "Nhân viên y tế",
  cong_dong: "Cộng đồng",
};
