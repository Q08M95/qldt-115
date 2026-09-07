export const ROLE_VALUES = ["admin", "quan_ly_dao_tao", "giang_vien", "tro_giang"] as const;

export type Role = (typeof ROLE_VALUES)[number];

// Nguon chan ly duy nhat cho nhan/gia tri vai tro — truoc day bi chep tay
// lap lai o 7 file khac nhau (page.tsx, [id]/page.tsx, profile-form.tsx,
// add-profile-dialog.tsx, nhan-su-filters.tsx, user-menu.tsx, dashboard),
// sua 1 nhan phai sua tung do, de sot.
export const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "giang_vien", label: "Giảng viên" },
  { value: "tro_giang", label: "Trợ giảng" },
  { value: "quan_ly_dao_tao", label: "Quản lý đào tạo" },
  { value: "admin", label: "Quản trị viên" },
];

export const ROLE_LABEL: Record<Role, string> = Object.fromEntries(
  ROLE_OPTIONS.map((r) => [r.value, r.label]),
) as Record<Role, string>;
