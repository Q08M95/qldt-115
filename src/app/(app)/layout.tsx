import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { getCurrentProfile } from "@/lib/auth";

// Layout dung chung cho toan bo trang da dang nhap: Sidebar + Header. Moi
// trang con tu render breadcrumb ngu canh rieng bang component PageHeader
// (xem src/components/layout/page-header.tsx) ngay dau noi dung cua no.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="flex h-svh w-full overflow-hidden">
      <Sidebar role={profile.role} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header profile={profile} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
