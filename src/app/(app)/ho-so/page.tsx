import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { ProfileForm } from "@/components/nhan-su/profile-form";
import { getCurrentProfile } from "@/lib/auth";
import { updateOwnProfile } from "./actions";

export default async function HoSoPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  return (
    <>
      <PageHeader items={[{ label: "Hồ sơ cá nhân" }]} />
      <div className="p-4 md:p-6">
        <ProfileForm
          profile={{
            full_name: profile.full_name,
            role: profile.role,
            hoc_vi: profile.hoc_vi,
            chuc_danh: profile.chuc_danh,
            chuyen_mon: profile.chuyen_mon,
            don_vi_cong_tac: profile.don_vi_cong_tac,
            so_dien_thoai: profile.so_dien_thoai,
            ngay_vao_lam: profile.ngay_vao_lam,
          }}
          showRole={false}
          onSubmit={updateOwnProfile}
        />
      </div>
    </>
  );
}
