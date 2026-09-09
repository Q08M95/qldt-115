import { Bell, CalendarDays, HelpCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/layout/user-menu";
import { MobileNav } from "@/components/layout/mobile-nav";
import type { CurrentProfile } from "@/lib/auth";

export function Header({ profile }: { profile: CurrentProfile }) {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-1 md:hidden">
        <MobileNav role={profile.role} />
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
        <UserMenu profile={profile} />
      </div>
    </header>
  );
}
