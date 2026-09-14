import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { DeleteClassButton } from "@/components/lop-hoc/delete-class-button";
import { LopInfoAutosaveForm } from "@/components/lop-hoc/lop-info-autosave-form";
import { BaiGiangList } from "@/components/lop-hoc/bai-giang-list";
import { BaiGiangQuickAdd } from "@/components/lop-hoc/bai-giang-quick-add";
import { BuoiGiangList } from "@/components/lop-hoc/buoi-giang-list";
import { BuoiGiangQuickAdd } from "@/components/lop-hoc/buoi-giang-quick-add";
import { DangKyDialog } from "@/components/lop-hoc/dang-ky-dialog";
import { DangKyList } from "@/components/lop-hoc/dang-ky-list";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { TRANG_THAI_LOP_LABEL, TRANG_THAI_LOP_BADGE, DOI_TUONG_HOC_VIEN_LABEL } from "@/lib/constants/lop-hoc";
import { NHOM_PHAN_LOAI_LABEL } from "@/lib/constants/nhan-su";
import { dongBoTrangThaiLop } from "@/lib/lop-hoc/trang-thai";
import { coTheTuDangKy } from "@/lib/lop-hoc/dang-ky";

// Trang chi tiet lop hoc — thiet ke lai 2026-09-14 thanh 1 canvas cuon doc
// duy nhat, khong con Tabs va khong con wizard 2 buoc (WizardBanner/
// TaoLopForm da xoa). Nguoi quan ly sua thong tin lop truc tiep tai day
// (LopInfoAutosaveForm tu luu), them buoi/bai giang bang dong them nhanh
// (QuickAdd), va thay ngay khoi "Dang ky & Duyet" ma khong can bam tab —
// xem ghi chu tientrinh.md muc 1.2 (2026-09-14, "Thiet ke lai canvas").
export default async function LopHocDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const current = await getCurrentProfile();
  const canManage = current?.role === "admin" || current?.role === "quan_ly_dao_tao";

  const supabase = await createClient();
  const [{ data: lop }, { data: baiGiang }, { data: buoiGiang }, { data: profilesRaw }, { data: dangKyList }] =
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
      // nhom_phan_loai chi danh cho admin/quan_ly (xem khoi tao profiles ben
      // duoi) — luon fetch chung 1 lan cho gon, nhung KHONG dua thang bien co
      // truong nay vao props cua component khong duoc gate boi canManage, de
      // tranh lo du lieu noi bo ra client cua giang vien/tro giang. hoc_vi/
      // chuc_danh/chuyen_mon khong nhay cam (da hien cong khai o /nhan-su).
      supabase
        .from("profiles")
        .select("id, full_name, role, nhom_phan_loai, hoc_vi, chuc_danh, chuyen_mon")
        .eq("trang_thai_hoat_dong", true)
        .order("full_name"),
      // RLS tu loc: canManage thay tat ca, giang vien/tro giang chi thay dang
      // ky cua chinh minh (xem dang_ky_giang_day_select trong migration RLS).
      supabase
        .from("dang_ky_giang_day")
        .select("id, profile_id, vai_tro, trang_thai, buoi_giang_id, bai_giang_id, ghi_chu")
        .eq("lop_hoc_id", id)
        .order("created_at", { ascending: false }),
    ]);

  if (!lop) notFound();

  const trangThaiThucTe = await dongBoTrangThaiLop(lop, canManage);
  const profiles = (profilesRaw ?? []).map(
    ({ id, full_name, role, hoc_vi, chuc_danh, chuyen_mon }) => ({
      id,
      full_name,
      role,
      hoc_vi,
      chuc_danh,
      chuyen_mon,
    }),
  );
  const profilesForAssign = profilesRaw ?? [];
  const nguoiMap = new Map(profiles.map((p) => [p.id, p.full_name]));
  const profilesMapForDangKy = new Map(profiles.map((p) => [p.id, p]));
  const buoiTenMap = new Map((buoiGiang ?? []).map((b) => [b.id, b.ten_buoi]));
  const baiTenMap = new Map((baiGiang ?? []).map((b) => [b.id, b.ten_bai]));
  const buoiOptionsChoDangKy = (buoiGiang ?? [])
    .filter((b) => b.mo_dang_ky)
    .map((b) => ({ id: b.id, label: b.ten_buoi }));
  const baiOptionsChoDangKy = (baiGiang ?? [])
    .filter((b) => b.mo_dang_ky)
    .map((b) => ({ id: b.id, label: b.ten_bai }));
  const coTheDangKy = coTheTuDangKy(lop, current);
  const soChoDuyet = (dangKyList ?? []).filter((d) => d.trang_thai === "cho_duyet").length;

  return (
    <>
      <PageHeader
        items={[{ label: "Lớp học", href: "/lop-hoc" }, { label: lop.ten_lop }]}
        actions={canManage ? <DeleteClassButton id={lop.id} /> : null}
      />
      <div className="flex flex-col gap-6 p-4 md:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold">{lop.ten_lop}</h1>
          <Badge variant={TRANG_THAI_LOP_BADGE[trangThaiThucTe]}>
            {TRANG_THAI_LOP_LABEL[trangThaiThucTe]}
          </Badge>
        </div>

        {canManage ? (
          <LopInfoAutosaveForm
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
              giang_vien_chi_dinh_ids: lop.giang_vien_chi_dinh_ids,
              tro_giang_chi_dinh_ids: lop.tro_giang_chi_dinh_ids,
            }}
            profiles={profilesForAssign}
          />
        ) : (
          <dl className="grid max-w-2xl grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
            <dt className="text-muted-foreground">Loại lớp</dt>
            <dd className="col-span-1 sm:col-span-2">{lop.loai_lop ?? "—"}</dd>
            <dt className="text-muted-foreground">Đối tượng</dt>
            <dd className="col-span-1 sm:col-span-2">
              {lop.doi_tuong_hoc_vien ? DOI_TUONG_HOC_VIEN_LABEL[lop.doi_tuong_hoc_vien] : "—"}
            </dd>
            <dt className="text-muted-foreground">Kinh phí</dt>
            <dd className="col-span-1 sm:col-span-2">{lop.co_kinh_phi ? "Có" : "Không"}</dd>
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
              {lop.giang_vien_chi_dinh_ids && lop.giang_vien_chi_dinh_ids.length > 0
                ? lop.giang_vien_chi_dinh_ids.map((gvId) => nguoiMap.get(gvId) ?? "—").join(", ")
                : "—"}
            </dd>
            <dt className="text-muted-foreground">Chỉ định trợ giảng</dt>
            <dd className="col-span-1 sm:col-span-2">
              {lop.tro_giang_chi_dinh_ids && lop.tro_giang_chi_dinh_ids.length > 0
                ? lop.tro_giang_chi_dinh_ids.map((tgId) => nguoiMap.get(tgId) ?? "—").join(", ")
                : "—"}
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
        )}

        <section className="flex flex-col gap-4 rounded-lg border p-4">
          <h2 className="text-sm font-medium text-muted-foreground">Buổi giảng &amp; Bài giảng</h2>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">{buoiGiang?.length ?? 0} buổi giảng</h3>
            </div>
            {canManage ? <BuoiGiangQuickAdd lopHocId={lop.id} /> : null}
            <BuoiGiangList
              lopHocId={lop.id}
              items={buoiGiang ?? []}
              profiles={profiles}
              canEdit={canManage}
            />
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">{baiGiang?.length ?? 0} bài giảng</h3>
            </div>
            {canManage ? <BaiGiangQuickAdd lopHocId={lop.id} /> : null}
            <BaiGiangList
              lopHocId={lop.id}
              items={baiGiang ?? []}
              buoiList={buoiGiang ?? []}
              profiles={profiles}
              canEdit={canManage}
            />
          </div>
        </section>

        <section className="flex flex-col gap-3 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground">Đăng ký &amp; Duyệt</h2>
            {canManage && soChoDuyet > 0 ? (
              <Badge className="border-data-dang-ky/40 bg-data-dang-ky/10 text-data-dang-ky">
                {soChoDuyet} chờ duyệt
              </Badge>
            ) : null}
          </div>
          {coTheDangKy ? (
            <div className="flex justify-end">
              <DangKyDialog
                lopHocId={lop.id}
                lopMoDangKy={lop.mo_dang_ky}
                buoiOptions={buoiOptionsChoDangKy}
                baiOptions={baiOptionsChoDangKy}
              />
            </div>
          ) : null}
          <DangKyList
            lopHocId={lop.id}
            items={dangKyList ?? []}
            profiles={profilesMapForDangKy}
            buoiMap={buoiTenMap}
            baiMap={baiTenMap}
            canManage={canManage}
          />
        </section>

        <section className="flex flex-col gap-3 rounded-lg border p-4">
          <h2 className="text-sm font-medium text-muted-foreground">Lịch giảng</h2>
          <EmptyState
            title="Chưa có nội dung"
            description="Lịch giảng của lớp sẽ hoạt động ở Giai đoạn 6."
          />
        </section>
      </div>
    </>
  );
}
