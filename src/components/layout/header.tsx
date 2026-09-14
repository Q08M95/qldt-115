import { Bell, CalendarDays, HelpCircle, Siren } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { UserMenu } from "@/components/layout/user-menu";
import { cn } from "@/lib/utils";
import { GLASS_SURFACE } from "@/lib/design/glass";
import type { CurrentProfile } from "@/lib/auth";

function HeaderIconButton({
  label,
  href,
  className,
  children,
}: {
  label: string;
  href?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className={className}
            render={href ? <Link href={href} /> : undefined}
          />
        }
      >
        {children}
        <span className="sr-only">{label}</span>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

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
      {/* Wordmark — bo dong ten/email nguoi dung o day (da co o UserMenu ben
          phai, tranh lap lai), doi thanh 1 khoi thuong hieu ro trong luong
          hon: dau hieu tron mau chu dao + tieu de dam + nhan phu viet hoa
          dan chu (dung chuan nhan sieu du lieu, CLAUDE.md muc 3). */}
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-data-lop-hoc/12 text-data-lop-hoc">
          <Siren className="h-4.5 w-4.5" strokeWidth={1.5} />
        </span>
        <div className="flex flex-col leading-none">
          <p className="font-heading text-sm font-semibold text-foreground">Quản lý đào tạo</p>
          <p className="mt-1 text-[10px] font-medium tracking-[0.16em] text-foreground/45 uppercase">
            Trung tâm Cấp cứu 115
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <HeaderIconButton label="Lịch giảng" href="/lich-giang">
          <CalendarDays className="h-4.5 w-4.5" strokeWidth={1.5} />
        </HeaderIconButton>
        <HeaderIconButton label="Trợ giúp">
          <HelpCircle className="h-4.5 w-4.5" strokeWidth={1.5} />
        </HeaderIconButton>
        <HeaderIconButton label="Thông báo" className="relative">
          <Bell className="h-4.5 w-4.5" strokeWidth={1.5} />
          {/* Cham bao chua doc — noi dung/logic thuc te do agent thong-bao-realtime (Giai doan 8) xu ly */}
        </HeaderIconButton>
        <UserMenu profile={profile} />
      </div>
    </header>
  );
}
