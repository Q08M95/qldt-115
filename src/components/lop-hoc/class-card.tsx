import Link from "next/link";
import { CalendarDays, Users, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TRANG_THAI_LOP_LABEL,
  TRANG_THAI_LOP_BADGE,
  DOI_TUONG_HOC_VIEN_LABEL,
  type TrangThaiLop,
} from "@/lib/constants/lop-hoc";

export type ClassCardData = {
  id: string;
  ten_lop: string;
  loai_lop: string | null;
  doi_tuong_hoc_vien: "nhan_vien_y_te" | "cong_dong" | null;
  trang_thai: TrangThaiLop;
  ngay_khai_giang: string | null;
  ngay_ket_thuc: string | null;
  co_kinh_phi: boolean;
  la_lop_gap: boolean;
  la_lop_cong_dong: boolean;
  mo_dang_ky: boolean;
  so_giang_vien_can: number;
  so_tro_giang_can: number;
  giang_vien_chi_dinh_ids: string[] | null;
  tro_giang_chi_dinh_ids: string[] | null;
};

// Da bo thiet ke dai mau thumbnail theo loai lop (yeu cau nguoi dung
// 2026-09-10 — se thay bang giao dien tham khao rieng sau). The gio don
// gian: khong anh bia, badge trang thai/mo dang ky dat canh tieu de.
export function ClassCard({
  lop,
  nguoiMap,
}: {
  lop: ClassCardData;
  nguoiMap: Map<string, string>;
}) {
  const gvNames = (lop.giang_vien_chi_dinh_ids ?? []).map((id) => nguoiMap.get(id) ?? "—");
  const tgNames = (lop.tro_giang_chi_dinh_ids ?? []).map((id) => nguoiMap.get(id) ?? "—");
  const coChiDinh = gvNames.length > 0 || tgNames.length > 0;

  return (
    <div className="flex flex-col overflow-hidden rounded-xl bg-card text-sm text-card-foreground ring-1 ring-foreground/10 transition-shadow hover:shadow-md">
      <Link href={`/lop-hoc/${lop.id}`} className="flex flex-col">
        <div className="flex flex-col gap-2 p-4 pb-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 font-heading text-base leading-snug font-medium">
              {lop.ten_lop}
            </h3>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <Badge variant={TRANG_THAI_LOP_BADGE[lop.trang_thai]}>
                {TRANG_THAI_LOP_LABEL[lop.trang_thai]}
              </Badge>
              {lop.mo_dang_ky ? (
                <Badge className="border-data-dang-ky/40 bg-data-dang-ky/10 text-data-dang-ky">
                  Mở đăng ký
                </Badge>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {lop.loai_lop ? <Badge variant="outline">{lop.loai_lop}</Badge> : null}
            {lop.doi_tuong_hoc_vien ? (
              <Badge variant="outline">{DOI_TUONG_HOC_VIEN_LABEL[lop.doi_tuong_hoc_vien]}</Badge>
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
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4 shrink-0" />
            <span>
              Cần {lop.so_giang_vien_can} giảng viên · {lop.so_tro_giang_can} trợ giảng
            </span>
          </div>
          {coChiDinh ? (
            <div className="flex items-start gap-2 text-muted-foreground">
              <UserCheck className="h-4 w-4 shrink-0" />
              <span>
                {gvNames.length > 0 ? `GV: ${gvNames.join(", ")}` : null}
                {gvNames.length > 0 && tgNames.length > 0 ? " · " : ""}
                {tgNames.length > 0 ? `TG: ${tgNames.join(", ")}` : null}
              </span>
            </div>
          ) : null}
        </div>
      </Link>
      <div className="px-4 pb-4">
        <Button size="sm" className="w-full" render={<Link href={`/lop-hoc/${lop.id}`} />}>
          {lop.mo_dang_ky ? "Đăng ký ngay" : "Xem chi tiết"}
        </Button>
      </div>
    </div>
  );
}
