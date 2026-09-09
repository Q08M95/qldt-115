import { SidebarNav } from "./sidebar-nav";
import type { CurrentProfile } from "@/lib/auth";

// Chi hien tren desktop (>= md) — tren mobile dung MobileNav (Drawer) o
// Header thay the, dung chung noi dung menu qua SidebarNav (CLAUDE.md muc 3.2).
export function Sidebar({ role }: { role: CurrentProfile["role"] }) {
  return (
    <aside className="hidden w-64 shrink-0 border-r bg-sidebar text-sidebar-foreground md:flex md:flex-col">
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <span className="text-sm font-semibold">QLĐT 115</span>
      </div>
      <SidebarNav role={role} />
    </aside>
  );
}
