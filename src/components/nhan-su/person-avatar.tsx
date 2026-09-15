import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "cn";
import type { Role } from "@/lib/constants/roles";

// Khong dung anh dai dien (avatar_url da bo khoi schema) — thay bang huy
// hieu chu cai dau ten, to mau theo vai tro dung dung bang mau vai tro du
// lieu o thietke-giao-dien.md muc 1 (khong tu bia mau hash rieng cho tung
// nguoi).
const ROLE_AVATAR_CLASS: Record<Role, string> = {
  giang_vien: "bg-data-giang-vien/15 text-data-giang-vien",
  tro_giang: "bg-data-tro-giang/15 text-data-tro-giang",
  quan_ly_dao_tao: "bg-data-lop-hoc/15 text-data-lop-hoc",
  admin: "bg-data-lop-hoc/15 text-data-lop-hoc",
};

// Tint nen the/card theo vai tro (nhu khoi "About Company" trong
// mauthietke.png) — dung chung 1 bang mau voi ROLE_AVATAR_CLASS o tren.
export const ROLE_TINT_CLASS: Record<Role, string> = {
  giang_vien: "border-data-giang-vien/25 bg-data-giang-vien/12",
  tro_giang: "border-data-tro-giang/25 bg-data-tro-giang/12",
  quan_ly_dao_tao: "border-data-lop-hoc/25 bg-data-lop-hoc/12",
  admin: "border-data-lop-hoc/25 bg-data-lop-hoc/12",
};

function initialsOf(fullName: string): string {
  const words = fullName.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "??";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export function PersonAvatar({
  fullName,
  role,
  size = "default",
  className,
}: {
  fullName: string;
  role: Role;
  size?: "default" | "sm" | "lg";
  className?: string;
}) {
  return (
    <Avatar size={size} className={className}>
      <AvatarFallback className={cn("font-medium", ROLE_AVATAR_CLASS[role])}>
        {initialsOf(fullName)}
      </AvatarFallback>
    </Avatar>
  );
}
