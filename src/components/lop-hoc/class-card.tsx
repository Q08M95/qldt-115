import Link from "next/link";
import {
  Activity,
  Car,
  CalendarDays,
  HeartPulse,
  ListChecks,
  ShieldCheck,
  Users,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TRANG_THAI_LOP_LABEL,
  TRANG_THAI_LOP_BADGE,
  DOI_TUONG_HOC_VIEN_LABEL,
  type LoaiLop,
  type TrangThaiLop,
} from "@/lib/constants/lop-hoc";

const LOAI_LOP_ICON: Record<LoaiLop, LucideIcon> = {
  ABCDE: ListChecks,
  ACLS: HeartPulse,
  BLS: Activity,
  "SCC-CĐ": Users,
  BTXH: ShieldCheck,
  "SCC-LX": Car,
};

// Moi loai lop 1 tong mau — tai su dung dung 6 tong "data-*" da kiem chung
// OKLCH/CVD o CLAUDE.md muc 3 (thay vi bia mau moi chua kiem chung). 6 tong
// nay von gan cho vai tro nguoi (giang vien, tro giang...) nhung trang nay
// khong hien mau theo vai tro nguoi nen dung lai cho 1 chieu du lieu khac
// (loai lop) khong xung dot. Class ghi day du (khong ghep chuoi dong) vi may
// quet Tailwind can thay ten class nguyen van trong source moi sinh CSS.
const LOAI_LOP_BAND_CLASS: Record<LoaiLop, string> = {
  ABCDE: "bg-data-lop-hoc",
  ACLS: "bg-data-canh-bao",
  BLS: "bg-data-kpi",
  "SCC-CĐ": "bg-data-dang-ky",
  BTXH: "bg-data-tro-giang",
  "SCC-LX": "bg-data-giang-vien",
};

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
  giang_vien_chi_dinh_id: string | null;
  tro_giang_chi_dinh_id: string | null;
};

export function ClassCard({
  lop,
  nguoiMap,
}: {
  lop: ClassCardData;
  nguoiMap: Map<string, string>;
}) {
  const loai = lop.loai_lop as LoaiLop | null;
  const bandClass = loai ? LOAI_LOP_BAND_CLASS[loai] : "bg-data-lop-hoc";
  const Icon = loai ? LOAI_LOP_ICON[loai] : ListChecks;
  const coChiDinh = lop.giang_vien_chi_dinh_id || lop.tro_giang_chi_dinh_id;

  return (
    <div className="flex flex-col overflow-hidden rounded-xl bg-card text-sm text-card-foreground ring-1 ring-foreground/10 transition-shadow hover:shadow-md">
      <Link href={`/lop-hoc/${lop.id}`} className="flex flex-col">
        <div className={`relative flex h-16 items-center justify-center ${bandClass}`}>
          <Icon className="h-7 w-7 text-white/90" />
          <Badge
            variant={TRANG_THAI_LOP_BADGE[lop.trang_thai]}
            className="absolute top-2 left-2 shadow-sm"
          >
            {TRANG_THAI_LOP_LABEL[lop.trang_thai]}
          </Badge>
          {lop.mo_dang_ky ? (
            <Badge className="absolute top-2 right-2 border-data-dang-ky/40 bg-data-dang-ky/90 text-white shadow-sm">
              Mở đăng ký
            </Badge>
          ) : null}
          <span className="absolute bottom-2 left-2 text-xs font-semibold tracking-wide text-white/90">
            {loai ?? "Khác"}
          </span>
        </div>
        <div className="flex flex-col gap-2 p-4 pb-2">
          <h3 className="line-clamp-2 font-heading text-base leading-snug font-medium">
            {lop.ten_lop}
          </h3>
          <div className="flex flex-wrap gap-1.5">
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
        </div>
      </Link>
      <div className="px-4 pb-4">
        <Button
          size="sm"
          className="w-full"
          render={<Link href={`/lop-hoc/${lop.id}`} />}
        >
          {lop.mo_dang_ky ? "Đăng ký ngay" : "Xem chi tiết"}
        </Button>
      </div>
    </div>
  );
}
