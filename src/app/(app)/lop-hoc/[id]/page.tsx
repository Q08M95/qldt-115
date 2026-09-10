import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { EditClassDialog } from "@/components/lop-hoc/edit-class-dialog";
import { DeleteClassButton } from "@/components/lop-hoc/delete-class-button";
import { BaiGiangList } from "@/components/lop-hoc/bai-giang-list";
import { BaiGiangDialog } from "@/components/lop-hoc/bai-giang-dialog";
import { BuoiGiangList } from "@/components/lop-hoc/buoi-giang-list";
import { BuoiGiangDialog } from "@/components/lop-hoc/buoi-giang-dialog";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { TRANG_THAI_LOP_LABEL, TRANG_THAI_LOP_BADGE, DOI_TUONG_HOC_VIEN_LABEL } from "@/lib/constants/lop-hoc";
import { NHOM_PHAN_LOAI_LABEL } from "@/lib/constants/nhan-su";
import { dongBoTrangThaiLop } from "@/lib/lop-hoc/trang-thai";

export default async function LopHocDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const current = await getCurrentProfile();
  const canManage = current?.role === "admin" || current?.role === "quan_ly_dao_tao";

  const supabase = await createClient();
  const [{ data: lop }, { data: baiGiang }, { data: buoiGiang }, { data: profiles }] =
    await Promise.all([
      supabase.from("lop_hoc").select("*").eq("id", id).single(),
      supabase
        .from("bai_giang")
        .select(
          "id, ten_bai, chuyen_de, thoi_luong_tiet, thu_tu, buoi_giang_id, mo_dang_ky, giang_vien_chi_dinh_id, tro_giang_chi_dinh_id",
        )
        .eq("lop_hoc_id", id)
        .order("thu_tu"),
      supabase
        .from("buoi_giang")
        .select(
          "id, ten_buoi, thu_tu, so_giang_vien_can, so_tro_giang_can, mo_dang_ky, giang_vien_chi_dinh_id, tro_giang_chi_dinh_id",
        )
        .eq("lop_hoc_id", id)
        .order("thu_tu"),
      supabase
        .from("profiles")
        .select("id, full_name, role")
        .eq("trang_thai_hoat_dong", true)
        .order("full_name"),
    ]);

  if (!lop) notFound();

  const trangThaiThucTe = await dongBoTrangThaiLop(lop, canManage);
  const nguoiMap = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));

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
                  so_giang_vien_can: lop.so_giang_vien_can,
                  so_tro_giang_can: lop.so_tro_giang_can,
                  mo_dang_ky: lop.mo_dang_ky,
                  nhom_giang_vien_phu_hop: lop.nhom_giang_vien_phu_hop,
                  nhom_tro_giang_phu_hop: lop.nhom_tro_giang_phu_hop,
                  giang_vien_chi_dinh_id: lop.giang_vien_chi_dinh_id,
                  tro_giang_chi_dinh_id: lop.tro_giang_chi_dinh_id,
                }}
                profiles={profiles ?? []}
              />
              <DeleteClassButton id={lop.id} />
            </div>
          ) : null
        }
      />
      <div className="flex flex-col gap-4 p-4 md:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold">{lop.ten_lop}</h1>
          {lop.loai_lop ? <Badge variant="outline">{lop.loai_lop}</Badge> : null}
          {lop.doi_tuong_hoc_vien ? (
            <Badge variant="outline">{DOI_TUONG_HOC_VIEN_LABEL[lop.doi_tuong_hoc_vien]}</Badge>
          ) : null}
          <Badge variant={TRANG_THAI_LOP_BADGE[trangThaiThucTe]}>
            {TRANG_THAI_LOP_LABEL[trangThaiThucTe]}
          </Badge>
          {lop.mo_dang_ky ? (
            <Badge className="border-data-dang-ky/40 bg-data-dang-ky/10 text-data-dang-ky">
              Mở đăng ký
            </Badge>
          ) : null}
        </div>

        <dl className="grid max-w-2xl grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
          <dt className="text-muted-foreground">Ngày khai giảng</dt>
          <dd className="col-span-1 sm:col-span-2">{lop.ngay_khai_giang ?? "—"}</dd>
          <dt className="text-muted-foreground">Ngày kết thúc</dt>
          <dd className="col-span-1 sm:col-span-2">{lop.ngay_ket_thuc ?? "—"}</dd>
          <dt className="text-muted-foreground">Chỉ tiêu GV/TG</dt>
          <dd className="col-span-1 sm:col-span-2">
            {lop.so_giang_vien_can} giảng viên · {lop.so_tro_giang_can} trợ giảng
          </dd>
          <dt className="text-muted-foreground">Chỉ định giảng viên</dt>
          <dd className="col-span-1 sm:col-span-2">
            {lop.giang_vien_chi_dinh_id ? (nguoiMap.get(lop.giang_vien_chi_dinh_id) ?? "—") : "—"}
          </dd>
          <dt className="text-muted-foreground">Chỉ định trợ giảng</dt>
          <dd className="col-span-1 sm:col-span-2">
            {lop.tro_giang_chi_dinh_id ? (nguoiMap.get(lop.tro_giang_chi_dinh_id) ?? "—") : "—"}
          </dd>
          {lop.nhom_giang_vien_phu_hop && lop.nhom_giang_vien_phu_hop.length > 0 ? (
            <>
              <dt className="text-muted-foreground">Nhóm GV phù hợp</dt>
              <dd className="col-span-1 sm:col-span-2">
                {lop.nhom_giang_vien_phu_hop
                  .map((n) => NHOM_PHAN_LOAI_LABEL[n as 1 | 2 | 3 | 4 | 5])
                  .join(", ")}
              </dd>
            </>
          ) : null}
          {lop.nhom_tro_giang_phu_hop && lop.nhom_tro_giang_phu_hop.length > 0 ? (
            <>
              <dt className="text-muted-foreground">Nhóm TG phù hợp</dt>
              <dd className="col-span-1 sm:col-span-2">
                {lop.nhom_tro_giang_phu_hop
                  .map((n) => NHOM_PHAN_LOAI_LABEL[n as 1 | 2 | 3 | 4 | 5])
                  .join(", ")}
              </dd>
            </>
          ) : null}
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

          <TabsContent value="bai-giang" className="flex flex-col gap-6 pt-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-muted-foreground">
                  {buoiGiang?.length ?? 0} buổi giảng
                </h2>
                {canManage ? (
                  <BuoiGiangDialog lopHocId={lop.id} profiles={profiles ?? []} />
                ) : null}
              </div>
              <BuoiGiangList
                lopHocId={lop.id}
                items={buoiGiang ?? []}
                profiles={profiles ?? []}
                canEdit={canManage}
              />
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-muted-foreground">
                  {baiGiang?.length ?? 0} bài giảng
                </h2>
                {canManage ? (
                  <BaiGiangDialog lopHocId={lop.id} buoiList={buoiGiang ?? []} profiles={profiles ?? []} />
                ) : null}
              </div>
              <BaiGiangList
                lopHocId={lop.id}
                items={baiGiang ?? []}
                buoiList={buoiGiang ?? []}
                profiles={profiles ?? []}
                canEdit={canManage}
              />
            </div>
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
