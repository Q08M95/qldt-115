import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { TaoLopForm } from "@/components/lop-hoc/tao-lop-form";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function TaoLopPage() {
  const current = await getCurrentProfile();
  if (current?.role !== "admin" && current?.role !== "quan_ly_dao_tao") {
    redirect("/lop-hoc");
  }

  const supabase = await createClient();
  const [{ data: programs }, { data: profiles }] = await Promise.all([
    supabase.from("chuong_trinh_dao_tao").select("id, ten_chuong_trinh").order("ten_chuong_trinh"),
    supabase
      .from("profiles")
      .select("id, full_name, role, nhom_phan_loai")
      .eq("trang_thai_hoat_dong", true)
      .order("full_name"),
  ]);

  return (
    <>
      <PageHeader items={[{ label: "Lớp học", href: "/lop-hoc" }, { label: "Thêm lớp học mới" }]} />
      <div className="flex flex-col gap-6 p-4 md:p-6">
        <TaoLopForm programs={programs ?? []} profiles={profiles ?? []} />
      </div>
    </>
  );
}
