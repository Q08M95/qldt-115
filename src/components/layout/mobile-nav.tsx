"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SidebarNav } from "./sidebar-nav";
import type { CurrentProfile } from "@/lib/auth";

// Sidebar tren mobile la mot Drawer (Sheet) trigger boi icon hamburger,
// thay vi an han (CLAUDE.md muc 3.2) — truoc day duoi md sidebar bi
// "hidden" hoan toan, khong co cach nao dieu huong tren mobile.
export function MobileNav({ role }: { role: CurrentProfile["role"] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // Tu dong dong Drawer khi da chuyen trang xong — chinh state ngay trong
  // luc render (theo huong dan React: "Adjusting state when a prop
  // changes"), khong dung useEffect vi setState vo dieu kien trong effect
  // gay cascading render (react-hooks/set-state-in-effect).
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
        <Menu className="h-5 w-5" />
        <span className="sr-only">Mở menu điều hướng</span>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="flex w-72 flex-col gap-0 bg-sidebar p-0 text-sidebar-foreground"
      >
        <SheetHeader className="border-b px-4 py-3">
          <SheetTitle>QLĐT 115</SheetTitle>
        </SheetHeader>
        <SidebarNav role={role} onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
