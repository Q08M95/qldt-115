import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HINH_THUC_LABEL, HINH_THUC_VALUES, type HinhThucLop } from "@/lib/constants/lop-hoc";

export type ClassFormDefaults = {
  ten_lop?: string;
  mo_ta?: string | null;
  loai_lop?: string | null;
  hinh_thuc?: string;
  co_kinh_phi?: boolean;
  la_lop_gap?: boolean;
  la_gio_hiem?: boolean;
  la_lop_cong_dong?: boolean;
  ngay_khai_giang?: string | null;
  ngay_ket_thuc?: string | null;
  so_hoc_vien_du_kien?: number | null;
  so_giang_vien_can?: number;
  so_tro_giang_can?: number;
  nguoi_phu_trach_id?: string | null;
};

/**
 * Cac truong form dung chung cho AddClassDialog va EditClassDialog — chi
 * khac o cho AddClassDialog co them 1 Select chuong trinh mau rieng (chi
 * dat luc tao, khong sua lai duoc sau — CLAUDE.md muc 4: lop doc lap voi
 * chuong trinh mau sau khi tao).
 */
export function ClassFormFields({
  defaults,
  profiles,
}: {
  defaults?: ClassFormDefaults;
  profiles: { id: string; full_name: string }[];
}) {
  return (
    <>
      <div className="flex flex-col gap-2">
        <Label htmlFor="ten_lop">Tên lớp</Label>
        <Input id="ten_lop" name="ten_lop" defaultValue={defaults?.ten_lop} required />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="mo_ta">Mô tả</Label>
        <Input id="mo_ta" name="mo_ta" defaultValue={defaults?.mo_ta ?? ""} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="loai_lop">Loại lớp</Label>
          <Input
            id="loai_lop"
            name="loai_lop"
            placeholder="vd: Đào tạo mới, Tập huấn định kỳ"
            defaultValue={defaults?.loai_lop ?? ""}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="hinh_thuc">Hình thức</Label>
          <Select name="hinh_thuc" defaultValue={defaults?.hinh_thuc ?? "truc_tiep"}>
            <SelectTrigger id="hinh_thuc">
              <SelectValue>
                {(value: string) => HINH_THUC_LABEL[value as HinhThucLop] ?? value}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {HINH_THUC_VALUES.map((v) => (
                <SelectItem key={v} value={v}>
                  {HINH_THUC_LABEL[v]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="ngay_khai_giang">Ngày khai giảng</Label>
          <Input
            id="ngay_khai_giang"
            name="ngay_khai_giang"
            type="date"
            defaultValue={defaults?.ngay_khai_giang ?? ""}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="ngay_ket_thuc">Ngày kết thúc</Label>
          <Input
            id="ngay_ket_thuc"
            name="ngay_ket_thuc"
            type="date"
            defaultValue={defaults?.ngay_ket_thuc ?? ""}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="so_hoc_vien_du_kien">Số học viên dự kiến</Label>
          <Input
            id="so_hoc_vien_du_kien"
            name="so_hoc_vien_du_kien"
            type="number"
            min={0}
            defaultValue={defaults?.so_hoc_vien_du_kien ?? ""}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="so_giang_vien_can">Số GV cần</Label>
          <Input
            id="so_giang_vien_can"
            name="so_giang_vien_can"
            type="number"
            min={0}
            defaultValue={defaults?.so_giang_vien_can ?? 1}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="so_tro_giang_can">Số TG cần</Label>
          <Input
            id="so_tro_giang_can"
            name="so_tro_giang_can"
            type="number"
            min={0}
            defaultValue={defaults?.so_tro_giang_can ?? 1}
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="nguoi_phu_trach_id">Người phụ trách</Label>
        <Select name="nguoi_phu_trach_id" defaultValue={defaults?.nguoi_phu_trach_id ?? "none"}>
          <SelectTrigger id="nguoi_phu_trach_id">
            <SelectValue>
              {(value: string) =>
                value === "none"
                  ? "Chưa chọn"
                  : (profiles.find((p) => p.id === value)?.full_name ?? "Chưa chọn")
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Chưa chọn</SelectItem>
            {profiles.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Tính chất lớp (ảnh hưởng hệ số quy đổi KPI)</Label>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm font-normal">
            <input
              type="checkbox"
              name="co_kinh_phi"
              defaultChecked={defaults?.co_kinh_phi ?? true}
              className="h-4 w-4"
            />
            Có kinh phí
          </label>
          <label className="flex items-center gap-2 text-sm font-normal">
            <input
              type="checkbox"
              name="la_lop_gap"
              defaultChecked={defaults?.la_lop_gap ?? false}
              className="h-4 w-4"
            />
            Lớp gấp
          </label>
          <label className="flex items-center gap-2 text-sm font-normal">
            <input
              type="checkbox"
              name="la_gio_hiem"
              defaultChecked={defaults?.la_gio_hiem ?? false}
              className="h-4 w-4"
            />
            Giờ hiểm
          </label>
          <label className="flex items-center gap-2 text-sm font-normal">
            <input
              type="checkbox"
              name="la_lop_cong_dong"
              defaultChecked={defaults?.la_lop_cong_dong ?? false}
              className="h-4 w-4"
            />
            Lớp cộng đồng
          </label>
        </div>
      </div>
    </>
  );
}
