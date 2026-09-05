import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  GraduationCap,
  LayoutDashboard,
  Sliders,
  Users,
} from "lucide-react";
import type { CurrentProfile } from "@/lib/auth";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
  // Nhom chi hien voi cac role trong danh sach nay; bo trong = ai cung thay.
  rolesAllowed?: CurrentProfile["role"][];
};

// Cau truc menu dung theo CLAUDE.md muc 3 — dung 1 lan cho toan bo du an,
// cac agent module KHONG tu them muc sidebar rieng ngoai cau truc nay.
export const NAV_OVERVIEW: NavItem = {
  label: "Tổng quan",
  href: "/dashboard",
  icon: LayoutDashboard,
};

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Đào tạo",
    items: [
      { label: "Lớp học", href: "/lop-hoc", icon: GraduationCap },
      { label: "Lịch giảng", href: "/lich-giang", icon: CalendarDays },
    ],
  },
  {
    label: "Nhân sự",
    items: [{ label: "Nhân sự", href: "/nhan-su", icon: Users }],
  },
  {
    label: "Đánh giá",
    items: [{ label: "Đánh giá & KPI", href: "/kpi", icon: ClipboardCheck }],
  },
  {
    label: "Cấu hình",
    rolesAllowed: ["admin", "quan_ly_dao_tao"],
    items: [
      { label: "Chương trình đào tạo", href: "/cau-hinh/chuong-trinh", icon: BookOpen },
      { label: "Cấu hình KPI", href: "/cau-hinh/kpi", icon: Sliders },
    ],
  },
];
