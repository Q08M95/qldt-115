import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { logout } from "./actions";

// Trang stub tam thoi cho Giai doan 2 (chi de xac nhan luong dang nhap hoat
// dong). Giao dien that (sidebar, header...) se do agent giao-dien-nen dung o
// Giai doan 3; noi dung dashboard theo vai tro se do agent dashboard-bao-cao
// hoan thien o Giai doan 9 — KHONG mo rong nghiep vu o day.
export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center gap-4 p-4">
      <div className="text-center">
        <p className="text-lg font-medium">Xin chào, {profile?.full_name ?? user.email}</p>
        <p className="text-sm text-muted-foreground">Vai trò: {profile?.role ?? "chưa xác định"}</p>
      </div>
      <form action={logout}>
        <Button type="submit" variant="outline">
          Đăng xuất
        </Button>
      </form>
    </div>
  );
}
