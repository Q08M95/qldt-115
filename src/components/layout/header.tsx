import { Bell, CalendarDays, HelpCircle } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CurrentProfile } from "@/lib/auth";
import { logout } from "@/app/(app)/actions";

const ROLE_LABEL: Record<CurrentProfile["role"], string> = {
  admin: "Quản trị viên",
  quan_ly_dao_tao: "Quản lý đào tạo",
  giang_vien: "Giảng viên",
  tro_giang: "Trợ giảng",
};

export function Header({ profile }: { profile: CurrentProfile }) {
  const initials = profile.full_name?.trim()?.slice(0, 2)?.toUpperCase() || "??";

  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-1 md:hidden">
        <span className="text-sm font-semibold">QLĐT 115</span>
      </div>
      <div className="flex flex-1 items-center justify-end gap-1">
        <Button
          variant="ghost"
          size="icon"
          title="Lịch giảng"
          render={<Link href="/lich-giang" />}
        >
          <CalendarDays className="h-4.5 w-4.5" />
        </Button>
        <Button variant="ghost" size="icon" title="Trợ giúp">
          <HelpCircle className="h-4.5 w-4.5" />
        </Button>
        <Button variant="ghost" size="icon" title="Thông báo" className="relative">
          <Bell className="h-4.5 w-4.5" />
          {/* Cham bao chua doc — noi dung/logic thuc te do agent thong-bao-realtime (Giai doan 8) xu ly */}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" className="ml-1 gap-2 px-2" />}>
            <Avatar className="h-7 w-7">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <span className="hidden text-sm sm:inline">{profile.full_name}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex flex-col">
              <span className="font-medium">{profile.full_name}</span>
              <span className="text-xs font-normal text-muted-foreground">
                {ROLE_LABEL[profile.role]}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/ho-so" />}>Hồ sơ cá nhân</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" render={<form action={logout} />}>
              <button type="submit" className="w-full text-left">
                Đăng xuất
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
