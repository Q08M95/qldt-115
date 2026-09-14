import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { UserMenu } from "@/components/layout/user-menu";
import { getCurrentProfile } from "@/lib/auth";

// Layout dung chung cho toan bo trang da dang nhap — "ban lam viec noi"
// (CLAUDE.md muc 3, chot 2026-09-14 sau khi duyet /thu-nghiem-giao-dien):
// nen gradient truu tuong mem (.app-gradient-bg, khong dung anh phong canh
// that) + dock cong cu noi trai (Sidebar) + header kinh mo (Header), CA HAI
// CHI hien tu md tro len. Duoi md giu nguyen thanh header phang + Drawer
// (MobileNav) nhu truoc — khong ap dung kinh mo/gradient tren mobile
// (CLAUDE.md muc 3.2, quyet dinh nguoi dung 2026-09-14).
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="flex h-svh w-full flex-col overflow-hidden md:app-gradient-bg md:flex-row md:gap-4 md:p-4">
      {/* Thanh tren cung cho mobile — khong kinh mo, giu don gian. */}
      <div className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4 md:hidden">
        <MobileNav role={profile.role} />
        <span className="text-sm font-semibold">QLĐT 115</span>
        <div className="ml-auto">
          <UserMenu profile={profile} />
        </div>
      </div>

      <Sidebar role={profile.role} />

      <div className="flex min-w-0 flex-1 flex-col gap-4 overflow-hidden">
        <Header profile={profile} />
        {/* Outer: bo goc + kinh mo + cat lop noi dung cuon ben trong theo
            dung goc bo tron (overflow-hidden). Inner <main>: cuon that
            (overflow-y-auto) — tach 2 lop vi 1 phan tu khong the vua bo
            goc-cat-lop vua cuon duoc cung luc. */}
        <div className="min-h-0 flex-1 md:overflow-hidden md:rounded-[32px] md:border md:border-white/40 md:bg-white/40 md:backdrop-blur-md md:dark:border-white/10 md:dark:bg-white/[0.04]">
          <main className="h-full overflow-y-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}
