import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { EditClassDialog } from "@/components/lop-hoc/edit-class-dialog";
import { ClassStatusButton } from "@/components/lop-hoc/class-status-button";
import { BaiGiangList } from "@/components/lop-hoc/bai-giang-list";
import { BaiGiangDialog } from "@/components/lop-hoc/bai-giang-dialog";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  TRANG_THAI_LOP_LABEL,
  TRANG_THAI_LOP_BADGE,
  TRANG_THAI_LOP_CLASSNAME,
  DOI_TUONG_HOC_VIEN_LABEL,
} from "@/lib/constants/lop-hoc";
import { dongBoTrangThaiLop, demNhanSuDaGan } from "@/lib/lop-hoc/trang-thai";

export default async function LopHocDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const current = await getCurrentProfile();
  const canManage = current?.role === "admin" || current?.role === "quan_ly_dao_tao";

  const supabase = await createClient();
  const [{ data: lop }, { data: baiGiang }, { data: profiles }] = await Promise.all([
    supabase.from("lop_hoc").select("*").eq("id", id).single(),
    supabase
      .from("bai_giang")
      .select("id, ten_bai, chuyen_de, thoi_luong_tiet, thu_tu")
      .eq("lop_hoc_id", id)
      .order("thu_tu"),
    supabase
      .from("profiles")
      .select("id, full_name")
      .eq("trang_thai_hoat_dong", true)
      .order("full_name"),
  ]);

  if (!lop) notFound();

  const nhanSuDaGan = await demNhanSuDaGan([lop.id]);
  const gan = nhanSuDaGan[lop.id] ?? { gv: 0, tg: 0 };
  const trangThaiThucTe = await dongBoTrangThaiLop(lop, gan.gv, gan.tg, canManage);

  const nguoiPhuTrach = lop.nguoi_phu_trach_id
    ? (profiles ?? []).find((p) => p.id === lop.nguoi_phu_trach_id)
    : null;

  return (
    <>
      <PageHeader
        items={[{ label: "Lớp học", href: "/lop-hoc" }, { label: lop.ten_lop }]}
        actions={
          canManage ? (
            <div className="flex items-center gap-2">
              <EditClassDialog
                lopHocId={lop.id}
                defaults={{
                  ten_lop: lop.ten_lop,
                  mo_ta: lop.mo_ta,
                  loai_lop: lop.loai_lop,
                  doi_tuong_hoc_vien: lop.doi_tuong_hoc_vien,
                  co_kinh_phi: lop.co_kinh_phi,
                  la_lop_gap: lop.la_lop_gap,
                  la_lop_cong_dong: lop.la_lop_cong_dong,
                  ngay_khai_giang: lop.ngay_khai_giang,
                  ngay_ket_thuc: lop.ngay_ket_thuc,
                  so_hoc_vien_du_kien: lop.so_hoc_vien_du_kien,
                  so_giang_vien_can: lop.so_giang_vien_can,
                  so_tro_giang_can: lop.so_tro_giang_can,
                  nguoi_phu_trach_id: lop.nguoi_phu_trach_id,
                }}
                profiles={profiles ?? []}
              />
              <ClassStatusButton id={lop.id} daHuy={trangThaiThucTe === "huy"} />
            </div>
          ) : null
        }
      />
      <div className="flex flex-col gap-4 p-4 md:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold">{lop.ten_lop}</h1>
          {lop.doi_tuong_hoc_vien ? (
            <Badge variant="outline">{DOI_TUONG_HOC_VIEN_LABEL[lop.doi_tuong_hoc_vien]}</Badge>
          ) : null}
          <Badge
            variant={TRANG_THAI_LOP_BADGE[trangThaiThucTe]}
            className={TRANG_THAI_LOP_CLASSNAME[trangThaiThucTe]}
          >
            {TRANG_THAI_LOP_LABEL[trangThaiThucTe]}
          </Badge>
        </div>

        <dl className="grid max-w-2xl grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
          <dt className="text-muted-foreground">Ngày khai giảng</dt>
          <dd className="col-span-1 sm:col-span-2">{lop.ngay_khai_giang ?? "—"}</dd>
          <dt className="text-muted-foreground">Ngày kết thúc</dt>
          <dd className="col-span-1 sm:col-span-2">{lop.ngay_ket_thuc ?? "—"}</dd>
          <dt className="text-muted-foreground">Người được chỉ định</dt>
          <dd className="col-span-1 sm:col-span-2">{nguoiPhuTrach?.full_name ?? "—"}</dd>
          <dt className="text-muted-foreground">Nhân sự đã gán</dt>
          <dd className="col-span-1 sm:col-span-2">
            {gan.gv}/{lop.so_giang_vien_can} giảng viên · {gan.tg}/{lop.so_tro_giang_can} trợ giảng
          </dd>
          {lop.mo_ta ? (
            <>
              <dt className="text-muted-foreground">Mô tả</dt>
              <dd className="col-span-1 sm:col-span-2">{lop.mo_ta}</dd>
            </>
          ) : null}
        </dl>

        <Tabs defaultValue="bai-giang">
          <TabsList>
            <TabsTrigger value="bai-giang">Bài giảng</TabsTrigger>
            <TabsTrigger value="dang-ky">Đăng ký & Duyệt</TabsTrigger>
            <TabsTrigger value="lich-giang">Lịch giảng</TabsTrigger>
          </TabsList>

          <TabsContent value="bai-giang" className="flex flex-col gap-4 pt-4">
            {canManage ? (
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-muted-foreground">
                  {baiGiang?.length ?? 0} bài giảng
                </h2>
                <BaiGiangDialog lopHocId={lop.id} />
              </div>
            ) : null}
            <BaiGiangList lopHocId={lop.id} items={baiGiang ?? []} canEdit={canManage} />
          </TabsContent>

          <TabsContent value="dang-ky" className="pt-4">
            <EmptyState
              title="Chưa có nội dung"
              description="Đăng ký & Duyệt sẽ hoạt động ở Giai đoạn 5."
            />
          </TabsContent>

          <TabsContent value="lich-giang" className="pt-4">
            <EmptyState
              title="Chưa có nội dung"
              description="Lịch giảng của lớp sẽ hoạt động ở Giai đoạn 6."
            />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
