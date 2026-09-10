import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { LopHocFilters } from "@/components/lop-hoc/lop-hoc-filters";
import { AddClassDialog } from "@/components/lop-hoc/add-class-dialog";
import { ClassCard } from "@/components/lop-hoc/class-card";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  TRANG_THAI_LOP_LABEL,
  TRANG_THAI_LOP_BADGE,
  TRANG_THAI_LOP_DISPLAY_ORDER,
  LOAI_LOP_VALUES,
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
  const loaiSelected = loai && (LOAI_LOP_VALUES as readonly string[]).includes(loai) ? loai : "all";
  const current = await getCurrentProfile();
  const canManage = current?.role === "admin" || current?.role === "quan_ly_dao_tao";

  const supabase = await createClient();

  let query = supabase
    .from("lop_hoc")
    .select(
      "id, ten_lop, loai_lop, doi_tuong_hoc_vien, trang_thai, ngay_khai_giang, ngay_ket_thuc, co_kinh_phi, la_lop_gap, la_lop_cong_dong, mo_dang_ky, so_giang_vien_can, so_tro_giang_can, giang_vien_chi_dinh_ids, tro_giang_chi_dinh_ids",
    )
    .order("ngay_khai_giang", { ascending: true, nullsFirst: false });

  if (q) query = query.ilike("ten_lop", `%${q}%`);
  if (loaiSelected !== "all") query = query.eq("loai_lop", loaiSelected);
  if (doi_tuong && (DOI_TUONG_HOC_VIEN_VALUES as readonly string[]).includes(doi_tuong)) {
    query = query.eq("doi_tuong_hoc_vien", doi_tuong as (typeof DOI_TUONG_HOC_VIEN_VALUES)[number]);
  }

  const { data: lopHocList } = await query;

  // nhom_phan_loai chi dung cho AddClassDialog (canManage-gated) — an toan
  // vi day la noi tieu thu duy nhat cua `profiles` tren trang nay.
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, role, nhom_phan_loai")
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

  const groups: { key: TrangThaiLop; items: typeof rows }[] = TRANG_THAI_LOP_DISPLAY_ORDER.map(
    (key) => ({
      key,
      items: rows.filter((r) => r.trang_thai === key),
    }),
  );

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
          <>
            {/* Mobile: tab ngang theo trang thai, chi hien 1 nhom tai 1 thoi
                diem — tranh cuon doc qua dai khi liet ke ca 3 nhom noi tiep
                nhau (yeu cau nguoi dung 2026-09-10). */}
            <Tabs defaultValue="dang_dien_ra" className="md:hidden">
              <TabsList className="w-full">
                {groups.map((group) => (
                  <TabsTrigger key={group.key} value={group.key} className="flex-1">
                    {TRANG_THAI_LOP_LABEL[group.key]}
                    <span className="text-xs text-muted-foreground">({group.items.length})</span>
                  </TabsTrigger>
                ))}
              </TabsList>
              {groups.map((group) => (
                <TabsContent key={group.key} value={group.key} className="flex flex-col gap-3 pt-3">
                  {group.items.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Không có lớp nào</p>
                  ) : (
                    group.items.map((lop) => (
                      <ClassCard key={lop.id} lop={lop} nguoiMap={nguoiMap} />
                    ))
                  )}
                </TabsContent>
              ))}
            </Tabs>

            {/* Desktop: 3 cot canh nhau theo thu tu Dang dien ra - Chua mo -
                Hoan thanh, moi cot cuon rieng (max-height) de trang khong bi
                keo dai qua muc khi 1 nhom (vd Hoan thanh) tich luy nhieu lop. */}
            <div className="hidden items-start gap-4 md:grid md:grid-cols-3">
              {groups.map((group) => (
                <section key={group.key} className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={TRANG_THAI_LOP_BADGE[group.key]}>
                      {TRANG_THAI_LOP_LABEL[group.key]}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{group.items.length} lớp</span>
                  </div>
                  {group.items.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Không có lớp nào</p>
                  ) : (
                    <ScrollArea className="max-h-[75vh] pr-3">
                      <div className="flex flex-col gap-3">
                        {group.items.map((lop) => (
                          <ClassCard key={lop.id} lop={lop} nguoiMap={nguoiMap} />
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </section>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
