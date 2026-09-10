import Link from "next/link";
import { CalendarDays, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { LopHocFilters } from "@/components/lop-hoc/lop-hoc-filters";
import { AddClassDialog } from "@/components/lop-hoc/add-class-dialog";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  TRANG_THAI_LOP_LABEL,
  TRANG_THAI_LOP_BADGE,
  TRANG_THAI_LOP_VALUES,
  LOAI_LOP_VALUES,
  DOI_TUONG_HOC_VIEN_LABEL,
  DOI_TUONG_HOC_VIEN_VALUES,
  type TrangThaiLop,
} from "@/lib/constants/lop-hoc";
import { computeTrangThaiLop } from "@/lib/lop-hoc/trang-thai";

export default async function LopHocPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; loai?: string; doi_tuong?: string }>;
}) {
  const { q, loai, doi_tuong } = await searchParams;
  const loaiSelected = loai ? loai.split(",").filter((v) => (LOAI_LOP_VALUES as readonly string[]).includes(v)) : [];
  const current = await getCurrentProfile();
  const canManage = current?.role === "admin" || current?.role === "quan_ly_dao_tao";

  const supabase = await createClient();

  let query = supabase
    .from("lop_hoc")
    .select(
      "id, ten_lop, loai_lop, doi_tuong_hoc_vien, trang_thai, ngay_khai_giang, ngay_ket_thuc, co_kinh_phi, la_lop_gap, la_lop_cong_dong, mo_dang_ky, giang_vien_chi_dinh_id, tro_giang_chi_dinh_id",
    )
    .order("ngay_khai_giang", { ascending: true, nullsFirst: false });

  if (q) query = query.ilike("ten_lop", `%${q}%`);
  if (loaiSelected.length > 0) query = query.in("loai_lop", loaiSelected);
  if (doi_tuong && (DOI_TUONG_HOC_VIEN_VALUES as readonly string[]).includes(doi_tuong)) {
    query = query.eq("doi_tuong_hoc_vien", doi_tuong as (typeof DOI_TUONG_HOC_VIEN_VALUES)[number]);
  }

  const { data: lopHocList } = await query;

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("trang_thai_hoat_dong", true)
    .order("full_name");

  const { data: programs } = await supabase
    .from("chuong_trinh_dao_tao")
    .select("id, ten_chuong_trinh")
    .order("ten_chuong_trinh");

  const rows = (lopHocList ?? []).map((lop) => ({
    ...lop,
    trang_thai: computeTrangThaiLop(lop),
  }));

  // Ghi lai vao DB cac dong bi lech — cho doi that su (khong fire-and-forget)
  // vi Vercel co the huy cac Promise chua await ngay khi response duoc gui.
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

  const nguoiMap = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));

  const groups: { key: TrangThaiLop; items: typeof rows }[] = TRANG_THAI_LOP_VALUES.map((key) => ({
    key,
    items: rows.filter((r) => r.trang_thai === key),
  }));

  return (
    <>
      <PageHeader
        items={[{ label: "Lớp học" }]}
        actions={
          canManage ? (
            <AddClassDialog programs={programs ?? []} profiles={profiles ?? []} />
          ) : null
        }
      />
      <div className="flex flex-col gap-4 p-4 md:p-6">
        <LopHocFilters q={q ?? ""} loai={loaiSelected} doiTuong={doi_tuong ?? "all"} />

        {rows.length === 0 ? (
          <EmptyState title="Chưa có lớp học phù hợp bộ lọc" />
        ) : (
          <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-3">
            {groups.map((group) => (
              <section key={group.key} className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Badge variant={TRANG_THAI_LOP_BADGE[group.key]}>
                    {TRANG_THAI_LOP_LABEL[group.key]}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{group.items.length} lớp</span>
                </div>
                <div className="flex flex-col gap-3">
                  {group.items.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Không có lớp nào</p>
                  ) : (
                    group.items.map((lop) => (
                      <Link key={lop.id} href={`/lop-hoc/${lop.id}`}>
                        <Card className="transition-shadow hover:shadow-md">
                          <CardHeader>
                            <CardTitle className="flex items-start justify-between gap-2">
                              <span>{lop.ten_lop}</span>
                              {lop.mo_dang_ky ? (
                                <Badge className="shrink-0 border-data-dang-ky/40 bg-data-dang-ky/10 text-data-dang-ky">
                                  Mở đăng ký
                                </Badge>
                              ) : null}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="flex flex-col gap-2 text-sm">
                            <div className="flex flex-wrap gap-1.5">
                              {lop.loai_lop ? <Badge variant="outline">{lop.loai_lop}</Badge> : null}
                              {lop.doi_tuong_hoc_vien ? (
                                <Badge variant="outline">
                                  {DOI_TUONG_HOC_VIEN_LABEL[lop.doi_tuong_hoc_vien]}
                                </Badge>
                              ) : null}
                              {!lop.co_kinh_phi ? <Badge variant="outline">Không kinh phí</Badge> : null}
                              {lop.la_lop_gap ? <Badge variant="outline">Đột xuất</Badge> : null}
                              {lop.la_lop_cong_dong ? <Badge variant="outline">Cộng đồng</Badge> : null}
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <CalendarDays className="h-4 w-4 shrink-0" />
                              <span>
                                {lop.ngay_khai_giang ?? "Chưa xếp ngày"}
                                {lop.ngay_ket_thuc ? ` — ${lop.ngay_ket_thuc}` : ""}
                              </span>
                            </div>
                            {lop.giang_vien_chi_dinh_id || lop.tro_giang_chi_dinh_id ? (
                              <div className="flex items-start gap-2 text-muted-foreground">
                                <UserCheck className="h-4 w-4 shrink-0" />
                                <span>
                                  {lop.giang_vien_chi_dinh_id
                                    ? `GV: ${nguoiMap.get(lop.giang_vien_chi_dinh_id) ?? "—"}`
                                    : null}
                                  {lop.giang_vien_chi_dinh_id && lop.tro_giang_chi_dinh_id ? " · " : ""}
                                  {lop.tro_giang_chi_dinh_id
                                    ? `TG: ${nguoiMap.get(lop.tro_giang_chi_dinh_id) ?? "—"}`
                                    : null}
                                </span>
                              </div>
                            ) : null}
                          </CardContent>
                        </Card>
                      </Link>
                    ))
                  )}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
