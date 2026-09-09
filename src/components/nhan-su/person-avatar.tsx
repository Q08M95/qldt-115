import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "cn";
import type { Role } from "@/lib/constants/roles";

// Khong dung anh dai dien (avatar_url da bo khoi schema) — thay bang huy
// hieu chu cai dau ten, to mau theo vai tro dung dung 6 tong mau da kiem
// chung OKLCH/CVD o CLAUDE.md muc 3 (khong tu bia mau hash rieng cho tung
// nguoi de tranh pha vo bang mau da duyet).
const ROLE_AVATAR_CLASS: Record<Role, string> = {
  giang_vien: "bg-data-giang-vien/15 text-data-giang-vien",
  tro_giang: "bg-data-tro-giang/15 text-data-tro-giang",
  quan_ly_dao_tao: "bg-data-lop-hoc/15 text-data-lop-hoc",
  admin: "bg-data-lop-hoc/15 text-data-lop-hoc",
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
