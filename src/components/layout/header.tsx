import type { ComponentType } from "react";
import { Bell, CalendarDays, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { GlobalSearch } from "./global-search";
import { UserMenu } from "./user-menu";
import type { CurrentProfile } from "@/lib/auth";

// Hang cong cu desktop, nam trong khung app (khong noi rieng) — thietke-giao-dien.md
// muc 3. Icon lich/tro giup/thong bao la khung san, chua co noi dung thuc su
// (Lich giang/Thong bao thuoc Giai doan 6/8 chua xay) — khong mo rong nghiep
// vu o day, chi giu cho dung vi tri chrome giong mauthietke.png.
export function Header({ profile }: { profile: CurrentProfile }) {
  return (
    <div className="hidden h-14 shrink-0 items-center gap-3 border-b border-border px-4 md:flex md:px-6">
      <GlobalSearch />
      <div className="ml-auto flex items-center gap-1">
        <HeaderIconButton label="Lịch" icon={CalendarDays} />
        <HeaderIconButton label="Trợ giúp" icon={HelpCircle} />
        <HeaderIconButton label="Thông báo" icon={Bell} />
        <UserMenu profile={profile} />
      </div>
    </div>
  );
}

function HeaderIconButton({
  label,
  icon: Icon,
}: {
  label: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
}) {
  return (
    <Tooltip>
      <TooltipTrigger render={<Button variant="ghost" size="icon" />}>
        <Icon className="size-[18px]" strokeWidth={1.5} />
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
