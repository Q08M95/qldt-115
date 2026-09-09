import Link from "next/link";
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
import { DeleteProfileButton } from "@/components/nhan-su/delete-profile-button";
import { PersonAvatar } from "@/components/nhan-su/person-avatar";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ROLE_LABEL, ROLE_VALUES } from "@/lib/constants/roles";
import { NHOM_PHAN_LOAI_LABEL } from "@/lib/constants/nhan-su";

const PAGE_SIZE = 20;

export default async function NhanSuPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; trang_thai?: string; q?: string; page?: string }>;
}) {
  const { role, trang_thai, q, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const current = await getCurrentProfile();
  const isAdmin = current?.role === "admin";
  const canManage = isAdmin || current?.role === "quan_ly_dao_tao";

  const supabase = await createClient();
  // email/nhom_phan_loai la du lieu quan ly noi bo — luon lay ve nhung chi
  // render trong JSX khi canManage, khong bao gio truyen vao component con
  // cho giang_vien/tro_giang (React Server Component chi serialize ve
  // client dung phan thuc su duoc render).
  let query = supabase
    .from("profiles")
    .select(
      "id, full_name, role, email, hoc_vi, chuyen_mon, nhom_phan_loai, trang_thai_hoat_dong",
      { count: "exact" },
    )
    .order("full_name");

  if (role && (ROLE_VALUES as readonly string[]).includes(role)) {
    query = query.eq("role", role as (typeof ROLE_VALUES)[number]);
  }
  if (trang_thai && trang_thai !== "all") {
    query = query.eq("trang_thai_hoat_dong", trang_thai === "hoat_dong");
  }
  if (q) query = query.ilike("full_name", `%${q}%`);

  const from = (page - 1) * PAGE_SIZE;
  const { data: profiles, count } = await query.range(from, from + PAGE_SIZE - 1);

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  function pageHref(nextPage: number) {
    const params = new URLSearchParams();
    if (role && role !== "all") params.set("role", role);
    if (trang_thai && trang_thai !== "all") params.set("trang_thai", trang_thai);
    if (q) params.set("q", q);
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
        <NhanSuFilters role={role ?? "all"} trangThai={trang_thai ?? "all"} q={q ?? ""} />

        {!profiles || profiles.length === 0 ? (
          <EmptyState title="Chưa có nhân sự phù hợp bộ lọc" />
        ) : (
          <>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Họ và tên</TableHead>
                    <TableHead>Vai trò</TableHead>
                    <TableHead className="hidden md:table-cell">Học vị</TableHead>
                    <TableHead className="hidden md:table-cell">Chuyên môn</TableHead>
                    {canManage ? (
                      <TableHead className="hidden lg:table-cell">Email</TableHead>
                    ) : null}
                    {canManage ? (
                      <TableHead className="hidden lg:table-cell">Nhóm phân loại</TableHead>
                    ) : null}
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profiles.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">
                        <Link href={`/nhan-su/${p.id}`} className="flex items-center gap-2 hover:underline">
                          <PersonAvatar fullName={p.full_name} role={p.role} size="sm" />
                          {p.full_name}
                        </Link>
                      </TableCell>
                      <TableCell>{ROLE_LABEL[p.role] ?? p.role}</TableCell>
                      <TableCell className="hidden md:table-cell">{p.hoc_vi ?? "—"}</TableCell>
                      <TableCell className="hidden md:table-cell">{p.chuyen_mon ?? "—"}</TableCell>
                      {canManage ? (
                        <TableCell className="hidden lg:table-cell">{p.email ?? "—"}</TableCell>
                      ) : null}
                      {canManage ? (
                        <TableCell className="hidden lg:table-cell">
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
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {canManage ? (
                            <ToggleActiveButton id={p.id} active={p.trang_thai_hoat_dong} />
                          ) : null}
                          {isAdmin ? <DeleteProfileButton id={p.id} /> : null}
                        </div>
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
    </>
  );
}
