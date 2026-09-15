import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { AddProfileDialog } from "@/components/nhan-su/add-profile-dialog";
import { NhanSuFilters } from "@/components/nhan-su/nhan-su-filters";
import { ToggleActiveButton } from "@/components/nhan-su/toggle-active-button";
import { ResendInviteButton } from "@/components/nhan-su/resend-invite-button";
import { DeleteProfileButton } from "@/components/nhan-su/delete-profile-button";
import { CertificateList } from "@/components/nhan-su/certificate-list";
import { PersonAvatar, ROLE_TINT_CLASS } from "@/components/nhan-su/person-avatar";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ROLE_LABEL } from "@/lib/constants/roles";
import { NHOM_PHAN_LOAI_LABEL } from "@/lib/constants/nhan-su";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 30;

// Master-detail 2/3-1/3 (thietke-giao-dien.md muc 4/5.3): cot trai 2/3 = chi
// tiet nguoi dang chon (Tab Tong quan/Chung chi), cot phai 1/3 = danh sach
// gon. Tim kiem tach rieng 1 hang. Mac dinh tu chon nguoi dau danh sach.
export default async function NhanSuPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; xem?: string }>;
}) {
  const { q, page: pageParam, xem } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const current = await getCurrentProfile();
  const isAdmin = current?.role === "admin";
  const canManage = isAdmin || current?.role === "quan_ly_dao_tao";

  const supabase = await createClient();
  let query = supabase
    .from("profiles")
    .select("id, full_name, role, nhom_phan_loai, trang_thai_hoat_dong", { count: "exact" })
    .order("nhom_phan_loai", { ascending: true, nullsFirst: false })
    .order("full_name");

  if (q) query = query.ilike("full_name", `%${q}%`);

  const from = (page - 1) * PAGE_SIZE;
  const { data: profiles, count } = await query.range(from, from + PAGE_SIZE - 1);

  const effectiveXem = xem || profiles?.[0]?.id || null;

  const [{ data: selectedProfile }, { data: selectedCertificates }] = effectiveXem
    ? await Promise.all([
        supabase.from("profiles").select("*").eq("id", effectiveXem).single(),
        supabase
          .from("chung_chi")
          .select("id, ten_chung_chi, so_chung_chi, noi_cap, ngay_cap, ngay_het_han, bat_buoc, file_url")
          .eq("profile_id", effectiveXem)
          .order("ngay_cap", { ascending: false }),
      ])
    : [{ data: null }, { data: null }];

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  function rowHref(id: string) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (page > 1) params.set("page", String(page));
    params.set("xem", id);
    return `/nhan-su?${params.toString()}`;
  }

  function pageHref(nextPage: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (effectiveXem) params.set("xem", effectiveXem);
    if (nextPage > 1) params.set("page", String(nextPage));
    const qs = params.toString();
    return qs ? `/nhan-su?${qs}` : "/nhan-su";
  }

  return (
    <>
      <PageHeader
        items={[{ label: "Nhân sự" }]}
        actions={current?.role === "admin" ? <AddProfileDialog /> : null}
      />
      <div className="flex flex-col gap-4 p-4 md:p-6">
        <div className={cn(effectiveXem && "hidden lg:block")}>
          <NhanSuFilters q={q ?? ""} />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className={cn("flex flex-col gap-4 lg:col-span-2", !effectiveXem && "hidden lg:flex")}>
            {!selectedProfile ? (
              <EmptyState
                title="Chưa có nhân sự phù hợp tìm kiếm"
                action={
                  q ? (
                    <Button variant="outline" size="sm" render={<Link href="/nhan-su" />}>
                      Xoá tìm kiếm
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <>
                <Link
                  href={q ? `/nhan-su?q=${encodeURIComponent(q)}` : "/nhan-su"}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground lg:hidden"
                >
                  <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
                  Quay lại danh sách
                </Link>

                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <PersonAvatar fullName={selectedProfile.full_name} role={selectedProfile.role} size="lg" />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-xl font-semibold">{selectedProfile.full_name}</h1>
                        <Badge variant="outline">{ROLE_LABEL[selectedProfile.role] ?? selectedProfile.role}</Badge>
                        <Badge variant={selectedProfile.trang_thai_hoat_dong ? "default" : "secondary"}>
                          {selectedProfile.trang_thai_hoat_dong ? "Đang hoạt động" : "Đã khoá"}
                        </Badge>
                      </div>
                      {selectedProfile.chuc_danh || selectedProfile.khoa_phong_cong_tac ? (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {[selectedProfile.chuc_danh, selectedProfile.khoa_phong_cong_tac]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {canManage ? (
                      <>
                        {isAdmin ? <ResendInviteButton profileId={selectedProfile.id} /> : null}
                        <ToggleActiveButton id={selectedProfile.id} active={selectedProfile.trang_thai_hoat_dong} />
                        {isAdmin ? <DeleteProfileButton id={selectedProfile.id} /> : null}
                      </>
                    ) : null}
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Button
                            size="icon-sm"
                            variant="outline"
                            render={<Link href={`/nhan-su/${selectedProfile.id}`} />}
                          />
                        }
                      >
                        <Pencil className="size-4" strokeWidth={1.5} />
                      </TooltipTrigger>
                      <TooltipContent>Sửa hồ sơ</TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                <Tabs defaultValue="tong-quan">
                  <TabsList>
                    <TabsTrigger value="tong-quan">Tổng quan</TabsTrigger>
                    <TabsTrigger value="chung-chi">
                      Chứng chỉ
                      {selectedCertificates ? ` (${selectedCertificates.length})` : ""}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="tong-quan" className="pt-4">
                    <div className={cn("rounded-2xl border p-4 md:p-6", ROLE_TINT_CLASS[selectedProfile.role])}>
                      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                        <dt className="text-muted-foreground">Học vị</dt>
                        <dd>{selectedProfile.hoc_vi ?? "—"}</dd>
                        <dt className="text-muted-foreground">Chức danh</dt>
                        <dd>{selectedProfile.chuc_danh ?? "—"}</dd>
                        <dt className="col-span-2 text-muted-foreground">Chuyên môn</dt>
                        <dd className="col-span-2">{selectedProfile.chuyen_mon ?? "—"}</dd>
                        <dt className="col-span-2 text-muted-foreground">Khoa/Phòng công tác</dt>
                        <dd className="col-span-2">{selectedProfile.khoa_phong_cong_tac ?? "—"}</dd>
                        {canManage ? (
                          <>
                            <dt className="col-span-2 text-muted-foreground">Email</dt>
                            <dd className="col-span-2">{selectedProfile.email ?? "—"}</dd>
                            <dt className="col-span-2 text-muted-foreground">Nhóm phân loại</dt>
                            <dd className="col-span-2">
                              {selectedProfile.nhom_phan_loai
                                ? NHOM_PHAN_LOAI_LABEL[selectedProfile.nhom_phan_loai as 1 | 2 | 3 | 4 | 5]
                                : "Chưa phân nhóm"}
                            </dd>
                          </>
                        ) : null}
                      </dl>
                    </div>
                  </TabsContent>

                  <TabsContent value="chung-chi" className="pt-4">
                    <div className="rounded-2xl border border-border bg-muted/40 p-4 md:p-6">
                      <CertificateList
                        profileId={selectedProfile.id}
                        certificates={selectedCertificates ?? []}
                        canEdit={false}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>

          <div className={cn("flex flex-col gap-2 lg:col-span-1", effectiveXem && "hidden lg:flex")}>
            {!profiles || profiles.length === 0 ? (
              <EmptyState title="Chưa có nhân sự phù hợp tìm kiếm" />
            ) : (
              <>
                <div className="flex flex-col gap-1">
                  {profiles.map((p) => (
                    <Link
                      key={p.id}
                      href={rowHref(p.id)}
                      className={cn(
                        "flex items-center gap-2 rounded-xl p-2 transition-colors hover:bg-muted",
                        p.id === effectiveXem && "bg-muted",
                      )}
                    >
                      <PersonAvatar fullName={p.full_name} role={p.role} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{p.full_name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {ROLE_LABEL[p.role] ?? p.role}
                          {canManage && p.nhom_phan_loai
                            ? ` · ${NHOM_PHAN_LOAI_LABEL[p.nhom_phan_loai as 1 | 2 | 3 | 4 | 5]}`
                            : ""}
                        </p>
                      </div>
                      {!p.trang_thai_hoat_dong ? (
                        <Badge variant="secondary" className="shrink-0">
                          Đã khoá
                        </Badge>
                      ) : null}
                    </Link>
                  ))}
                </div>

                {totalPages > 1 ? (
                  <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
                    <span>
                      Trang {page}/{totalPages} — {count} nhân sự
                    </span>
                    <div className="flex gap-1.5">
                      <Button
                        variant="outline"
                        size="icon-sm"
                        disabled={page <= 1}
                        render={page <= 1 ? undefined : <Link href={pageHref(page - 1)} />}
                      >
                        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        disabled={page >= totalPages}
                        render={page >= totalPages ? undefined : <Link href={pageHref(page + 1)} />}
                      >
                        <ArrowLeft className="h-4 w-4 rotate-180" strokeWidth={1.5} />
                      </Button>
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
