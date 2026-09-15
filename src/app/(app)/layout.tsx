import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { UserMenu } from "@/components/layout/user-menu";
import { getCurrentProfile } from "@/lib/auth";

// Layout dung chung cho toan bo trang da dang nhap — Flat SaaS UI (CLAUDE.md
// muc 3, chot lai 2026-09-15 theo mauthietke.png, thay the hoan toan phong
// cach kinh mo/dock noi cu). Tu md tro len: 1 khung "cua so app" hop nhat
// (sidebar dac mau navy + vung noi dung dac mau sang) noi tren nen gradient
// pastel nhe o vien ngoai. Duoi md: thanh header phang + Drawer (MobileNav)
// dung chung 1 bang mau/token voi ban desktop (khong con la "ngoai le giu
// pattern cu" nhu truoc).
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="flex h-svh w-full flex-col overflow-hidden md:app-gradient-bg md:p-4">
      {/* Thanh tren cung cho mobile. */}
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-card px-4 md:hidden">
        <MobileNav role={profile.role} />
        <span className="font-heading text-sm font-semibold">QLĐT 115</span>
        <div className="ml-auto">
          <UserMenu profile={profile} />
        </div>
      </div>

      {/* Khung cua so app hop nhat — sidebar + noi dung chung 1 khoi bo goc/
          border/shadow duy nhat, khong con la 3 manh noi rieng nhu truoc. */}
      <div className="flex min-h-0 flex-1 md:overflow-hidden md:rounded-[24px] md:border md:border-border md:bg-card md:shadow-xl">
        <Sidebar role={profile.role} />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Header profile={profile} />
          <main className="h-full overflow-y-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}
