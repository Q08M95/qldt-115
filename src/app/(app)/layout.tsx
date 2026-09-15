import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { UserMenu } from "@/components/layout/user-menu";
import { getCurrentProfile } from "@/lib/auth";

// Layout dung chung cho toan bo trang da dang nhap — Flat SaaS UI (CLAUDE.md
// muc 3, chot lai 2026-09-15 theo mauthietke.png). Khung "cua so app" chiem
// TRON viewport (khong vien/khong gradient quanh no — chot lai theo yeu cau
// nguoi dung, khac ban truoc co p-4 + app-gradient-bg lam vien ngoai). Duoi
// md: thanh header phang + Drawer (MobileNav) dung chung 1 bang mau/token
// voi ban desktop.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="flex h-svh w-full flex-col overflow-hidden">
      {/* Thanh tren cung cho mobile. */}
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-card px-4 md:hidden">
        <MobileNav role={profile.role} />
        <span className="font-heading text-sm font-semibold">QLĐT 115</span>
        <div className="ml-auto">
          <UserMenu profile={profile} />
        </div>
      </div>

      {/* Khung cua so app hop nhat — sidebar + noi dung chung 1 khoi, chiem
          tron phan con lai cua viewport, khong bo goc/khong vien ngoai. */}
      <div className="flex min-h-0 flex-1 overflow-hidden bg-card">
        <Sidebar role={profile.role} />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Header profile={profile} />
          <main className="h-full overflow-y-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}
