import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileTopBar } from "@/components/layout/mobile-topbar";
import { BottomTabBar } from "@/components/layout/bottom-tab-bar";
import { getCurrentProfile } from "@/lib/auth";

// Layout dung chung cho toan bo trang da dang nhap — thietke-giao-dien.md
// muc 3. Khung "cua so app" chiem TRON viewport (khong vien/khong gradient
// quanh no). Desktop: sidebar navy co dinh + noi dung. Mobile (< md): thanh
// tren gon (logo + tim kiem + avatar) + BottomTabBar dieu huong chinh, thay
// hoan toan cho hamburger/Sheet Drawer cu.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="flex h-svh w-full flex-col overflow-hidden">
      <MobileTopBar profile={profile} />

      <div className="flex min-h-0 flex-1 overflow-hidden bg-card">
        <Sidebar role={profile.role} />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Header profile={profile} />
          <main className="flex-1 overflow-y-auto pb-16 md:pb-0">{children}</main>
        </div>
      </div>

      <BottomTabBar role={profile.role} />
    </div>
  );
}
