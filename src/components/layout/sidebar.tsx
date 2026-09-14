"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { GLASS_SURFACE } from "@/lib/design/glass";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { NAV_GROUPS, NAV_OVERVIEW, type NavItem } from "./nav-config";
import type { CurrentProfile } from "@/lib/auth";

// Dock cong cu noi ben trai — thay the sidebar liet ke chu (CLAUDE.md muc 3,
// chot 2026-09-14 sau khi duyet /thu-nghiem-giao-dien). Chi hien tu md tro
// len; duoi md dung MobileNav (Drawer) nhu cu (CLAUDE.md muc 3.2). Icon-only
// + tooltip qua `title`, khong con nhan chu thuong truc — danh doi da duoc
// nguoi dung duyet qua trang thu nghiem.
export function Sidebar({ role }: { role: CurrentProfile["role"] }) {
  const pathname = usePathname();
  const visibleGroups = NAV_GROUPS.filter(
    (group) => !group.rolesAllowed || group.rolesAllowed.includes(role),
  );

  return (
    <aside
      className={cn(
        "sticky top-4 hidden h-fit shrink-0 flex-col items-center gap-1.5 self-start rounded-[32px] p-3 md:flex",
        GLASS_SURFACE,
      )}
    >
      <NavButton item={NAV_OVERVIEW} pathname={pathname} />
      {visibleGroups.map((group) => (
        <div key={group.label} className="flex flex-col items-center gap-1.5">
          <div className="my-0.5 h-px w-8 bg-foreground/10" />
          {group.items.map((item) => (
            <NavButton key={item.href} item={item} pathname={pathname} />
          ))}
        </div>
      ))}
    </aside>
  );
}

function NavButton({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
  const Icon = item.icon;
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Link
            href={item.href}
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-full transition-colors",
              active
                ? "bg-data-lop-hoc text-white shadow-[0_10px_24px_-10px_var(--data-lop-hoc)]"
                : "text-foreground/55 hover:bg-white/70 hover:text-data-lop-hoc dark:hover:bg-white/10",
            )}
          />
        }
      >
        <Icon className="h-5 w-5" strokeWidth={1.5} />
        <span className="sr-only">{item.label}</span>
      </TooltipTrigger>
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  );
}
