import { Bell, CalendarDays, HelpCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/layout/user-menu";
import { cn } from "@/lib/utils";
import { GLASS_SURFACE } from "@/lib/design/glass";
import type { CurrentProfile } from "@/lib/auth";

// Thanh header dang pill kinh mo — chi desktop (md+, CLAUDE.md muc 3.2).
// Duoi md dung thanh don gian rieng trong (app)/layout.tsx (khong kinh mo,
// giu pattern cu). Chot 2026-09-14 sau khi duyet /thu-nghiem-giao-dien.
export function Header({ profile }: { profile: CurrentProfile }) {
  return (
    <header
      className={cn(
        "hidden h-16 items-center justify-between rounded-[28px] px-3 md:flex",
        GLASS_SURFACE,
      )}
    >
      <div>
        <p className="text-[10px] font-medium tracking-[0.16em] text-foreground/45 uppercase">
          Quản lý đào tạo 115
        </p>
        <p className="font-heading text-sm font-semibold text-foreground">{profile.full_name}</p>
      </div>
      <div className="flex items-center gap-1.5">
        <Button variant="ghost" size="icon" title="Lịch giảng" render={<Link href="/lich-giang" />}>
          <CalendarDays className="h-4.5 w-4.5" strokeWidth={1.5} />
        </Button>
        <Button variant="ghost" size="icon" title="Trợ giúp">
          <HelpCircle className="h-4.5 w-4.5" strokeWidth={1.5} />
        </Button>
        <Button variant="ghost" size="icon" title="Thông báo" className="relative">
          <Bell className="h-4.5 w-4.5" strokeWidth={1.5} />
          {/* Cham bao chua doc — noi dung/logic thuc te do agent thong-bao-realtime (Giai doan 8) xu ly */}
        </Button>
        <UserMenu profile={profile} />
      </div>
    </header>
  );
}
