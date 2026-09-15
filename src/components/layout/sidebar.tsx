"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { NAV_GROUPS, NAV_OVERVIEW, type NavItem } from "./nav-config";
import type { CurrentProfile } from "@/lib/auth";

// Thanh dieu huong dac mau navy, gan lien met trai cua khung "cua so app"
// hop nhat (CLAUDE.md muc 3, chot lai 2026-09-15 theo mauthietke.png) — thay
// the hoan toan dock noi kinh mo truoc do. Chi hien tu md tro len; duoi md
// dung MobileNav (Drawer) voi cung mau nen (xem mobile-nav.tsx).
export function Sidebar({ role }: { role: CurrentProfile["role"] }) {
  const pathname = usePathname();
  const visibleGroups = NAV_GROUPS.filter(
    (group) => !group.rolesAllowed || group.rolesAllowed.includes(role),
  );

  return (
    <aside className="hidden w-[72px] shrink-0 flex-col items-center gap-1.5 bg-sidebar py-4 md:flex">
      <NavButton item={NAV_OVERVIEW} pathname={pathname} />
      {visibleGroups.map((group) => (
        <div key={group.label} className="flex flex-col items-center gap-1.5">
          <div className="my-0.5 h-px w-8 bg-sidebar-border" />
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
              "flex h-11 w-11 items-center justify-center rounded-xl transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
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
