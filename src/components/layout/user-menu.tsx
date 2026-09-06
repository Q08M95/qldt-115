import { LogOut } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { CurrentProfile } from "@/lib/auth";
import { logout } from "@/app/(app)/actions";

const ROLE_LABEL: Record<CurrentProfile["role"], string> = {
  admin: "Quản trị viên",
  quan_ly_dao_tao: "Quản lý đào tạo",
  giang_vien: "Giảng viên",
  tro_giang: "Trợ giảng",
};

// Co y khong dung DropdownMenu o day: dat form dang xuat ben trong 1 menu
// component (Base UI) tung gay loi diu hanh vi (menu tu chan/nuot su kien
// click). Dung lai dung co che <form action={...}> don gian, giong het
// cach /login, /register da chay dung, de giam rui ro toi da.
export function UserMenu({ profile }: { profile: CurrentProfile }) {
  const initials = profile.full_name?.trim()?.slice(0, 2)?.toUpperCase() || "??";

  return (
    <div className="ml-1 flex items-center gap-2">
      <Button
        variant="outline"
        className="gap-2 px-2"
        title={`${profile.full_name} — ${ROLE_LABEL[profile.role]}`}
        render={<Link href="/ho-so" />}
      >
        <Avatar className="h-7 w-7">
          <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        <span className="hidden max-w-40 truncate text-sm sm:inline">{profile.full_name}</span>
      </Button>
      <form action={logout}>
        <Button type="submit" variant="outline" size="icon" title="Đăng xuất">
          <LogOut className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
