import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/layout/page-header";
import { CertificateList } from "@/components/nhan-su/certificate-list";
import { UploadCertificateDialog } from "@/components/nhan-su/upload-certificate-dialog";
import { ToggleActiveButton } from "@/components/nhan-su/toggle-active-button";
import { ResendInviteButton } from "@/components/nhan-su/resend-invite-button";
import { DeleteProfileButton } from "@/components/nhan-su/delete-profile-button";
import { PersonAvatar } from "@/components/nhan-su/person-avatar";
import { ProfileForm } from "@/components/nhan-su/profile-form";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ROLE_LABEL } from "@/lib/constants/roles";
import { NHOM_PHAN_LOAI_LABEL } from "@/lib/constants/nhan-su";
import { updateProfileByAdmin } from "../actions";

export default async function NhanSuDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const current = await getCurrentProfile();
  const supabase = await createClient();

  const [{ data: profile }, { data: certificates }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", id).single(),
    supabase
      .from("chung_chi")
      .select("id, ten_chung_chi, so_chung_chi, noi_cap, ngay_cap, ngay_het_han, bat_buoc, file_url")
      .eq("profile_id", id)
      .order("ngay_cap", { ascending: false }),
  ]);

  if (!profile) {
    notFound();
  }

  const isAdmin = current?.role === "admin";
  const isQuanLy = current?.role === "quan_ly_dao_tao";
  const isSelf = current?.id === id;
  const canEditCertificates = isAdmin || isSelf;

  return (
    <>
      <PageHeader
        items={[{ label: "Nhân sự", href: "/nhan-su" }, { label: profile.full_name }]}
        actions={
          isAdmin || isQuanLy ? (
            <div className="flex items-center gap-2">
              {isAdmin ? <ResendInviteButton profileId={profile.id} /> : null}
              <ToggleActiveButton id={profile.id} active={profile.trang_thai_hoat_dong} />
              {isAdmin ? <DeleteProfileButton id={profile.id} redirectAfter="/nhan-su" /> : null}
            </div>
          ) : null
        }
      />
      <div className="flex flex-col gap-4 p-4 md:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <PersonAvatar fullName={profile.full_name} role={profile.role} size="lg" />
          <h1 className="text-xl font-semibold">{profile.full_name}</h1>
          <Badge variant="outline">{ROLE_LABEL[profile.role] ?? profile.role}</Badge>
          <Badge variant={profile.trang_thai_hoat_dong ? "default" : "secondary"}>
            {profile.trang_thai_hoat_dong ? "Đang hoạt động" : "Đã khoá"}
          </Badge>
          {(isAdmin || isQuanLy) && profile.nhom_phan_loai ? (
            <Badge variant="outline">
              {NHOM_PHAN_LOAI_LABEL[profile.nhom_phan_loai as 1 | 2 | 3 | 4 | 5]}
            </Badge>
          ) : null}
        </div>

        <Tabs defaultValue="ho-so">
          <TabsList>
            <TabsTrigger value="ho-so">Hồ sơ</TabsTrigger>
            <TabsTrigger value="chung-chi">Chứng chỉ</TabsTrigger>
          </TabsList>

          <TabsContent value="ho-so" className="pt-4">
            {isAdmin ? (
              <ProfileForm
                profile={profile}
                showRole
                onSubmit={updateProfileByAdmin.bind(null, profile.id)}
              />
            ) : (
              <dl className="grid max-w-lg grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <dt className="text-muted-foreground">Học vị</dt>
                <dd>{profile.hoc_vi ?? "—"}</dd>
                <dt className="text-muted-foreground">Chức danh</dt>
                <dd>{profile.chuc_danh ?? "—"}</dd>
                <dt className="text-muted-foreground">Chuyên môn</dt>
                <dd>{profile.chuyen_mon ?? "—"}</dd>
                <dt className="text-muted-foreground">Khoa/Phòng công tác</dt>
                <dd>{profile.khoa_phong_cong_tac ?? "—"}</dd>
                {isQuanLy ? (
                  <>
                    <dt className="text-muted-foreground">Email</dt>
                    <dd>{profile.email ?? "—"}</dd>
                    <dt className="text-muted-foreground">Nhóm phân loại</dt>
                    <dd>
                      {profile.nhom_phan_loai
                        ? NHOM_PHAN_LOAI_LABEL[profile.nhom_phan_loai as 1 | 2 | 3 | 4 | 5]
                        : "Chưa phân nhóm"}
                    </dd>
                  </>
                ) : null}
              </dl>
            )}
          </TabsContent>

          <TabsContent value="chung-chi" className="flex flex-col gap-4 pt-4">
            {canEditCertificates ? (
              <div>
                <UploadCertificateDialog profileId={profile.id} />
              </div>
            ) : null}
            <CertificateList
              profileId={profile.id}
              certificates={certificates ?? []}
              canEdit={canEditCertificates}
            />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
