import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { LopHocFilters } from "@/components/lop-hoc/lop-hoc-filters";
import { ClassCard } from "@/components/lop-hoc/class-card";
import { ChoDuyetPanel, type ChoDuyetItem } from "@/components/lop-hoc/cho-duyet-panel";
import { QuickCreateClassDialog } from "@/components/lop-hoc/quick-create-class-dialog";
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
      "id, ten_lop, loai_lop, doi_tuong_hoc_vien, trang_thai, ngay_khai_giang, ngay_ket_thuc, co_kinh_phi, la_lop_gap, la_lop_cong_dong, mo_dang_ky, so_giang_vien_can, so_tro_giang_can, nhom_giang_vien_phu_hop, nhom_tro_giang_phu_hop, giang_vien_chi_dinh_ids, tro_giang_chi_dinh_ids",
    )
    .order("ngay_khai_giang", { ascending: true, nullsFirst: false });

  if (q) query = query.ilike("ten_lop", `%${q}%`);
  if (loaiSelected !== "all") query = query.eq("loai_lop", loaiSelected);
  if (doi_tuong && (DOI_TUONG_HOC_VIEN_VALUES as readonly string[]).includes(doi_tuong)) {
    query = query.eq("doi_tuong_hoc_vien", doi_tuong as (typeof DOI_TUONG_HOC_VIEN_VALUES)[number]);
  }
  // Gian luoc man hinh chinh cho giang vien/tro giang (yeu cau nguoi dung
  // 2026-09-14): chi hien lop dang mo dang ky, khong can thay het moi lop
  // nhu goc nhin quan ly.
  const isSelfService = current?.role === "giang_vien" || current?.role === "tro_giang";
  if (isSelfService) query = query.eq("mo_dang_ky", true);

  // 3 truy van doc lap, chay song song (Promise.all) thay vi tuan tu — moi
  // vong round-trip toi Supabase (Singapore) tu ham Vercel (mac dinh o My
  // neu khong ghim region, xem vercel.json) deu ton hang tram ms, chay tuan
  // tu se cong don rat nhanh.
  const profilesQuery = supabase
    .from("profiles")
    .select("id, full_name, role, nhom_phan_loai")
    .eq("trang_thai_hoat_dong", true)
    .order("full_name");

  // Chi can cho QuickCreateClassDialog (chon chuong trinh mau luc tao) — chi
  // truy van khi canManage vi nguoi khac khong tao lop duoc.
  const programsQuery = canManage
    ? supabase.from("chuong_trinh_dao_tao").select("id, ten_chuong_trinh").order("ten_chuong_trinh")
    : Promise.resolve({ data: [] as { id: string; ten_chuong_trinh: string }[] });

  // Hop thu cho duyet tong hop (theo phan hoi nguoi dung 2026-09-14) — chi
  // truy van khi canManage, RLS dang_ky_giang_day_select da tu cho phep
  // is_quan_ly() thay toan bo (khong can loc them lop_hoc_id).
  const pendingQuery = canManage
    ? supabase
        .from("dang_ky_giang_day")
        .select("id, lop_hoc_id, profile_id, vai_tro")
        .eq("trang_thai", "cho_duyet")
        .order("created_at", { ascending: true })
    : Promise.resolve({ data: [] as ChoDuyetItem[] });

  const [{ data: lopHocList }, { data: profiles }, { data: pendingList }, { data: programs }] =
    await Promise.all([query, profilesQuery, pendingQuery, programsQuery]);

  // Lop nao khong nam trong `rows` (bi loc boi filter tren thanh tim kiem)
  // van phai hien duoc ten trong hop thu cho duyet — truy van rieng cho dung
  // cac id con thieu, chi khi thuc su co dang ky cho duyet.
  const pendingLopIds = Array.from(new Set((pendingList ?? []).map((p) => p.lop_hoc_id)));
  const { data: pendingLopNames } =
    pendingLopIds.length > 0
      ? await supabase.from("lop_hoc").select("id, ten_lop").in("id", pendingLopIds)
      : { data: [] as { id: string; ten_lop: string }[] };

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
  const pendingLopTenMap = new Map((pendingLopNames ?? []).map((l) => [l.id, l.ten_lop]));
  const pendingProfileMap = new Map(
    (profiles ?? []).map((p) => [p.id, { full_name: p.full_name, role: p.role }]),
  );

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
        actions={canManage ? <QuickCreateClassDialog programs={programs ?? []} /> : null}
      />
      <div className="flex flex-col gap-4 p-4 md:p-6">
        {canManage ? (
          <ChoDuyetPanel
            items={pendingList ?? []}
            lopTenMap={pendingLopTenMap}
            profileMap={pendingProfileMap}
          />
        ) : null}
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
                      <ClassCard key={lop.id} lop={lop} nguoiMap={nguoiMap} current={current} />
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
                          <ClassCard key={lop.id} lop={lop} nguoiMap={nguoiMap} current={current} />
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
