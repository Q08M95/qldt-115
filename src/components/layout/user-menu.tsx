"use client";

import { ChevronDown } from "lucide-react";
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

// Tach rieng thanh Client Component: goi truc tiep Server Action logout()
// qua onClick (khong boc qua <form> ben trong DropdownMenuItem) — dat form
// trong 1 menu item co the bi thu vien menu chan mat su kien click submit
// khi dong menu, khien nut Dang xuat khong phan hoi.
export function UserMenu({ profile }: { profile: CurrentProfile }) {
  const initials = profile.full_name?.trim()?.slice(0, 2)?.toUpperCase() || "??";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" className="ml-1 gap-2 px-2" />}>
        <Avatar className="h-7 w-7">
          <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        <span className="hidden max-w-40 truncate text-sm sm:inline">{profile.full_name}</span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
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
        <DropdownMenuItem
          variant="destructive"
          onClick={() => {
            void logout();
          }}
        >
          Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
