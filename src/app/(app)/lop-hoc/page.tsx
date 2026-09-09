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
import { LopHocFilters } from "@/components/lop-hoc/lop-hoc-filters";
import { AddClassDialog } from "@/components/lop-hoc/add-class-dialog";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  TRANG_THAI_LOP_LABEL,
  TRANG_THAI_LOP_BADGE,
  TRANG_THAI_LOP_CLASSNAME,
  TRANG_THAI_LOP_VALUES,
  DOI_TUONG_HOC_VIEN_LABEL,
  DOI_TUONG_HOC_VIEN_VALUES,
} from "@/lib/constants/lop-hoc";
import { computeTrangThaiLop, demNhanSuDaGan } from "@/lib/lop-hoc/trang-thai";

const PAGE_SIZE = 20;

export default async function LopHocPage({
  searchParams,
}: {
  searchParams: Promise<{ trang_thai?: string; doi_tuong?: string; page?: string }>;
}) {
  const { trang_thai, doi_tuong, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const current = await getCurrentProfile();
  const canManage = current?.role === "admin" || current?.role === "quan_ly_dao_tao";

  const supabase = await createClient();

  let query = supabase
    .from("lop_hoc")
    .select(
      "id, ten_lop, doi_tuong_hoc_vien, trang_thai, ngay_khai_giang, ngay_ket_thuc, so_giang_vien_can, so_tro_giang_can, nguoi_phu_trach_id",
      { count: "exact" },
    )
    .order("created_at", { ascending: false });

  // Loc theo trang_thai da luu trong DB — gia tri nay co the tre 1 nhip so
  // voi trang thai "dung theo thuc te" hien thi trong bang (chi duoc dong
  // bo lai moi lan 1 admin/quan_ly tai trang, xem dongBoTrangThaiLop).
  if (trang_thai && (TRANG_THAI_LOP_VALUES as readonly string[]).includes(trang_thai)) {
    query = query.eq("trang_thai", trang_thai as (typeof TRANG_THAI_LOP_VALUES)[number]);
  }
  if (doi_tuong && (DOI_TUONG_HOC_VIEN_VALUES as readonly string[]).includes(doi_tuong)) {
    query = query.eq("doi_tuong_hoc_vien", doi_tuong as (typeof DOI_TUONG_HOC_VIEN_VALUES)[number]);
  }

  const from = (page - 1) * PAGE_SIZE;
  const { data: lopHocList, count } = await query.range(from, from + PAGE_SIZE - 1);
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  const ids = (lopHocList ?? []).map((l) => l.id);
  const [nhanSuDaGan, { data: programs }, { data: profiles }] = await Promise.all([
    demNhanSuDaGan(ids),
    supabase.from("chuong_trinh_dao_tao").select("id, ten_chuong_trinh").order("ten_chuong_trinh"),
    supabase
      .from("profiles")
      .select("id, full_name")
      .eq("trang_thai_hoat_dong", true)
      .order("full_name"),
  ]);

  const rows = (lopHocList ?? []).map((lop) => {
    const gan = nhanSuDaGan[lop.id] ?? { gv: 0, tg: 0 };
    return { ...lop, trang_thai: computeTrangThaiLop(lop, gan.gv, gan.tg) };
  });

  // Ghi lai vao DB cac dong bi lech — cho doi that su (khong fire-and-forget)
  // vi Vercel co the huy cac Promise chua await ngay khi response duoc gui,
  // lam mat ghi nhan im lang. Chi nguoi co quyen (is_quan_ly) moi ghi duoc
  // do RLS lop_hoc_write.
  if (canManage) {
    const lechs = rows.filter((r, i) => r.trang_thai !== lopHocList![i].trang_thai);
    if (lechs.length > 0) {
      await Promise.all(
        lechs.map((r) =>
          supabase.from("lop_hoc").update({ trang_thai: r.trang_thai }).eq("id", r.id),
        ),
      );
    }
  }

  const nguoiPhuTrachMap = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));

  function pageHref(nextPage: number) {
    const params = new URLSearchParams();
    if (trang_thai && trang_thai !== "all") params.set("trang_thai", trang_thai);
    if (doi_tuong && doi_tuong !== "all") params.set("doi_tuong", doi_tuong);
    if (nextPage > 1) params.set("page", String(nextPage));
    const qs = params.toString();
    return qs ? `/lop-hoc?${qs}` : "/lop-hoc";
  }

  return (
    <>
      <PageHeader
        items={[{ label: "Lớp học" }]}
        actions={canManage ? <AddClassDialog programs={programs ?? []} profiles={profiles ?? []} /> : null}
      />
      <div className="flex flex-col gap-4 p-4 md:p-6">
        <LopHocFilters trangThai={trang_thai ?? "all"} doiTuong={doi_tuong ?? "all"} />

        {rows.length === 0 ? (
          <EmptyState title="Chưa có lớp học phù hợp bộ lọc" />
        ) : (
          <>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên lớp</TableHead>
                    <TableHead className="hidden md:table-cell">Đối tượng</TableHead>
                    <TableHead className="hidden md:table-cell">Người được chỉ định</TableHead>
                    <TableHead>Khai giảng</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((lop) => (
                    <TableRow key={lop.id}>
                      <TableCell className="font-medium">
                        <Link href={`/lop-hoc/${lop.id}`} className="hover:underline">
                          {lop.ten_lop}
                        </Link>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {lop.doi_tuong_hoc_vien
                          ? DOI_TUONG_HOC_VIEN_LABEL[lop.doi_tuong_hoc_vien]
                          : "—"}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {lop.nguoi_phu_trach_id
                          ? (nguoiPhuTrachMap.get(lop.nguoi_phu_trach_id) ?? "—")
                          : "—"}
                      </TableCell>
                      <TableCell>{lop.ngay_khai_giang ?? "—"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={TRANG_THAI_LOP_BADGE[lop.trang_thai]}
                          className={TRANG_THAI_LOP_CLASSNAME[lop.trang_thai]}
                        >
                          {TRANG_THAI_LOP_LABEL[lop.trang_thai]}
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
                  Trang {page}/{totalPages} — {count} lớp học
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
