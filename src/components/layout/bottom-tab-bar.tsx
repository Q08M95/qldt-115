"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";
import { NAV_OVERVIEW, NAV_GROUPS } from "./nav-config";
import type { CurrentProfile } from "@/lib/auth";

// Dieu huong chinh tren mobile — thanh tab co dinh duoi cung thay cho
// hamburger + Sheet Drawer cu (thietke-giao-dien.md muc 3.1, "sua lai toan
// bo" theo yeu cau nguoi dung). Moi nhom trong nav-config gop thanh 1 tab
// (tro toi trang dau tien co that cua nhom), toi da 5 tab voi cau hinh hien
// tai nen chua can Sheet "Them" — se bo sung khi NAV_GROUPS vuot qua so tab
// hien thi vua man hinh.
export function BottomTabBar({ role }: { role: CurrentProfile["role"] }) {
  const pathname = usePathname();
  const groups = NAV_GROUPS.filter((g) => !g.rolesAllowed || g.rolesAllowed.includes(role));
  const tabs = [
    NAV_OVERVIEW,
    ...groups.map((g) => ({ label: g.label, href: g.items[0].href, icon: g.items[0].icon })),
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-stretch border-t border-sidebar-border bg-sidebar md:hidden">
      {tabs.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        const Icon = tab.icon as ComponentType<{ className?: string; strokeWidth?: number }>;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] text-sidebar-foreground/60 transition-colors",
              active && "text-sidebar-foreground",
            )}
          >
            <Icon className="size-5" strokeWidth={1.5} />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
