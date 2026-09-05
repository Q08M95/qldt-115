import { PageHeader } from "@/components/layout/page-header";
import { getCurrentProfile } from "@/lib/auth";

const ROLE_LABEL: Record<string, string> = {
  admin: "Quản trị viên",
  quan_ly_dao_tao: "Quản lý đào tạo",
  giang_vien: "Giảng viên",
  tro_giang: "Trợ giảng",
};

// Stub tam thoi cho Giai doan 3 (chi de co diem neo cho luong dang nhap va
// sidebar/header). Noi dung dashboard that theo tung vai tro se do agent
// dashboard-bao-cao xay o Giai doan 9 — KHONG mo rong nghiep vu o day.
export default async function DashboardPage() {
  const profile = await getCurrentProfile();

  return (
    <>
      <PageHeader items={[{ label: "Tổng quan" }]} />
      <div className="p-4 md:p-6">
        <p className="text-lg font-medium">Xin chào, {profile?.full_name}</p>
        <p className="text-sm text-muted-foreground">
          Vai trò: {profile ? ROLE_LABEL[profile.role] : "—"}
        </p>
      </div>
    </>
  );
}
