"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { NAV_OVERVIEW, NAV_GROUPS, type NavItem } from "./nav-config";
import type { CurrentProfile } from "@/lib/auth";

// Sidebar dac mau navy co dinh, icon-only, Tooltip that khi hover — khong
// doi theo light/dark mode (thietke-giao-dien.md muc 3, lay cam hung tu
// mauthietke.png). Chi hien tu md tro len, duoi md dung BottomTabBar.
export function Sidebar({ role }: { role: CurrentProfile["role"] }) {
  const pathname = usePathname();
  const groups = NAV_GROUPS.filter((g) => !g.rolesAllowed || g.rolesAllowed.includes(role));

  return (
    <aside className="hidden w-[72px] shrink-0 flex-col items-center gap-1 overflow-y-auto bg-sidebar py-4 md:flex">
      <NavIcon item={NAV_OVERVIEW} active={pathname === NAV_OVERVIEW.href} />
      {groups.map((group, gi) => (
        <div
          key={group.label}
          className={cn("flex flex-col items-center gap-1", gi === 0 ? "mt-3 border-t border-sidebar-border pt-3" : "mt-1 border-t border-sidebar-border pt-1")}
        >
          {group.items.map((item) => (
            <NavIcon key={item.href} item={item} active={pathname.startsWith(item.href)} />
          ))}
        </div>
      ))}
    </aside>
  );
}

function NavIcon({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon as ComponentType<{ className?: string; strokeWidth?: number }>;
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Link
            href={item.href}
            className={cn(
              "flex size-11 items-center justify-center rounded-xl text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground",
              active && "bg-sidebar-accent text-sidebar-foreground",
            )}
          />
        }
      >
        <Icon className="size-5" strokeWidth={1.5} />
      </TooltipTrigger>
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  );
}
