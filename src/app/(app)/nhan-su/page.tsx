import Link from "next/link";
import { Users, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { SURFACE_MUTED } from "@/lib/design/surface";

const PAGE_SIZE = 20;

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

  // Truy van danh sach + nguoi dang chon (neu co) song song — panel xem
  // nhanh 1/3 phai (master-detail, yeu cau nguoi dung 2026-09-15) chi can
  // 1 vong round-trip them, khong anh huong toc do trang chinh.
  const [{ data: profiles, count }, selected] = await Promise.all([
    query.range(from, from + PAGE_SIZE - 1),
    xem
      ? Promise.all([
          supabase.from("profiles").select("*").eq("id", xem).single(),
          supabase
            .from("chung_chi")
            .select("id, ten_chung_chi, so_chung_chi, noi_cap, ngay_cap, ngay_het_han, bat_buoc, file_url")
            .eq("profile_id", xem)
            .order("ngay_cap", { ascending: false }),
        ])
      : Promise.resolve(null),
  ]);

  const selectedProfile = selected?.[0]?.data ?? null;
  const selectedCertificates = selected?.[1]?.data ?? [];

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
    if (xem) params.set("xem", xem);
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
      <div className="grid gap-4 p-4 md:p-6 lg:grid-cols-3">
        {/* Cot trai 2/3 — danh sach rut gon (ten, nhom, vai tro, trang thai).
            Tren mobile: an khi da chon 1 nguoi (nhuong cho panel chi tiet
            full-width, giong pattern list-detail 2 man hinh). */}
        <div className={cn("flex flex-col gap-4 lg:col-span-2", xem && "hidden lg:flex")}>
          <NhanSuFilters q={q ?? ""} />

          {!profiles || profiles.length === 0 ? (
            <EmptyState title="Chưa có nhân sự phù hợp tìm kiếm" />
          ) : (
            <>
              <div className={cn("overflow-x-auto rounded-2xl", SURFACE_MUTED)}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Họ và tên</TableHead>
                      <TableHead>Vai trò</TableHead>
                      {canManage ? <TableHead>Nhóm phân loại</TableHead> : null}
                      <TableHead>Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profiles.map((p) => (
                      <TableRow key={p.id} className={cn(p.id === xem && "bg-muted")}>
                        <TableCell className="font-medium">
                          <Link href={rowHref(p.id)} className="flex items-center gap-2 hover:underline">
                            <PersonAvatar fullName={p.full_name} role={p.role} size="sm" />
                            {p.full_name}
                          </Link>
                        </TableCell>
                        <TableCell>{ROLE_LABEL[p.role] ?? p.role}</TableCell>
                        {canManage ? (
                          <TableCell>
                            {p.nhom_phan_loai
                              ? NHOM_PHAN_LOAI_LABEL[p.nhom_phan_loai as 1 | 2 | 3 | 4 | 5]
                              : "—"}
                          </TableCell>
                        ) : null}
                        <TableCell>
                          <Badge variant={p.trang_thai_hoat_dong ? "default" : "secondary"}>
                            {p.trang_thai_hoat_dong ? "Đang hoạt động" : "Đã khoá"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 ? (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    Trang {page}/{totalPages} — {count} nhân sự
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      render={page <= 1 ? undefined : <Link href={pageHref(page - 1)} />}
                    >
                      Trang trước
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      render={page >= totalPages ? undefined : <Link href={pageHref(page + 1)} />}
                    >
                      Trang sau
                    </Button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>

        {/* Cot phai 1/3 — xem chi tiet day du khi bam chon 1 nguoi (nhu khoi
            noi dung chinh cua mauthietke.png), read-only + nut "Sua ho so"
            mo trang day du de sua that su (khong sua truc tiep trong panel
            hep — quyet dinh nguoi dung 2026-09-15). Tren mobile: chi hien
            khi da chon (thay the danh sach, co nut quay lai). */}
        <div className={cn("lg:col-span-1", !xem && "hidden lg:block")}>
          {!xem ? (
            <div className="flex h-full min-h-40 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              <Users className="h-6 w-6" strokeWidth={1.5} />
              Chọn 1 nhân sự để xem chi tiết
            </div>
          ) : !selectedProfile ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Không tìm thấy nhân sự này.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <Link
                href={q ? `/nhan-su?q=${encodeURIComponent(q)}` : "/nhan-su"}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground lg:hidden"
              >
                <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
                Quay lại danh sách
              </Link>

              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <PersonAvatar fullName={selectedProfile.full_name} role={selectedProfile.role} size="lg" />
                  <div>
                    <h2 className="font-heading text-base font-semibold">{selectedProfile.full_name}</h2>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      <Badge variant="outline">{ROLE_LABEL[selectedProfile.role] ?? selectedProfile.role}</Badge>
                      <Badge variant={selectedProfile.trang_thai_hoat_dong ? "default" : "secondary"}>
                        {selectedProfile.trang_thai_hoat_dong ? "Đang hoạt động" : "Đã khoá"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={cn(
                  "flex flex-col gap-3 rounded-2xl border p-4",
                  ROLE_TINT_CLASS[selectedProfile.role],
                )}
              >
                <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
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
                <Button size="sm" className="w-full" render={<Link href={`/nhan-su/${selectedProfile.id}`} />}>
                  Sửa hồ sơ
                </Button>
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-medium text-muted-foreground">Chứng chỉ</h3>
                <CertificateList
                  profileId={selectedProfile.id}
                  certificates={selectedCertificates}
                  canEdit={false}
                />
              </div>

              {canManage ? (
                <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
                  {isAdmin ? <ResendInviteButton profileId={selectedProfile.id} /> : null}
                  <ToggleActiveButton id={selectedProfile.id} active={selectedProfile.trang_thai_hoat_dong} />
                  {isAdmin ? <DeleteProfileButton id={selectedProfile.id} /> : null}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
