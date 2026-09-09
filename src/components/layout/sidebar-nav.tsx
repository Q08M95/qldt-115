"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NAV_GROUPS, NAV_OVERVIEW } from "./nav-config";
import type { CurrentProfile } from "@/lib/auth";

/**
 * Noi dung menu dieu huong dung chung cho ca Sidebar desktop va Drawer
 * mobile (MobileNav) — tach rieng de khong lap lai cung 1 danh sach link o
 * 2 noi (CLAUDE.md muc 3.2: sidebar phai chuyen thanh Drawer tren mobile).
 * `onNavigate` (khi co) duoc goi khi bam 1 link, dung de dong Drawer lai.
 */
export function SidebarNav({
  role,
  onNavigate,
}: {
  role: CurrentProfile["role"];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const visibleGroups = NAV_GROUPS.filter(
    (group) => !group.rolesAllowed || group.rolesAllowed.includes(role),
  );

  return (
    <ScrollArea className="flex-1">
      <nav className="flex flex-col gap-1 p-2">
        <NavLink
          item={NAV_OVERVIEW}
          active={pathname === NAV_OVERVIEW.href}
          onNavigate={onNavigate}
        />
        {visibleGroups.map((group) => (
          <NavGroupSection key={group.label} label={group.label}>
            {group.items.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                active={pathname === item.href || pathname.startsWith(`${item.href}/`)}
                onNavigate={onNavigate}
              />
            ))}
          </NavGroupSection>
        ))}
      </nav>
    </ScrollArea>
  );
}

function NavGroupSection({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="mt-2">
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground">
        {label}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </CollapsibleTrigger>
      <CollapsibleContent className="flex flex-col gap-1 pt-1">{children}</CollapsibleContent>
    </Collapsible>
  );
}

function NavLink({
  item,
  active,
  onNavigate,
}: {
  item: { label: string; href: string; icon: React.ComponentType<{ className?: string }> };
  active: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors",
        active
          ? "bg-sidebar-primary text-sidebar-primary-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      )}
    >
      <Icon className="h-4 w-4" />
      {item.label}
    </Link>
  );
}
