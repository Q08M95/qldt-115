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
            khoa_phong_cong_tac: profile.khoa_phong_cong_tac,
          }}
          showRole={false}
          onSubmit={updateOwnProfile}
        />
      </div>
    </>
  );
}
