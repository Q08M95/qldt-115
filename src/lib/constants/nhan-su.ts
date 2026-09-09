// Phan tang noi bo nhan su (1-5) — chi admin/quan_ly_dao_tao thay, khong
// phai la ROLE (giang_vien/tro_giang van dang ky duoc ca 2 vai tro khi
// dang ky giang day, xem dang_ky_giang_day.vai_tro o Giai doan 5).
export const NHOM_PHAN_LOAI_VALUES = [1, 2, 3, 4, 5] as const;

export type NhomPhanLoai = (typeof NHOM_PHAN_LOAI_VALUES)[number];

export const NHOM_PHAN_LOAI_LABEL: Record<NhomPhanLoai, string> = {
  1: "Nhóm 1 — Ban giám đốc",
  2: "Nhóm 2 — Giảng viên là bác sĩ",
  3: "Nhóm 3 — Giảng viên không là bác sĩ",
  4: "Nhóm 4 — Trợ giảng là bác sĩ",
  5: "Nhóm 5 — Trợ giảng không là bác sĩ",
};
