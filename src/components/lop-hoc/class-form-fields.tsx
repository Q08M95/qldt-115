import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DOI_TUONG_HOC_VIEN_LABEL,
  DOI_TUONG_HOC_VIEN_VALUES,
  type DoiTuongHocVien,
} from "@/lib/constants/lop-hoc";
import { NHOM_PHAN_LOAI_VALUES, NHOM_PHAN_LOAI_LABEL } from "@/lib/constants/nhan-su";

export type ClassFormProfile = { id: string; full_name: string; role: string };

export type ClassFormDefaults = {
  ten_lop?: string;
  mo_ta?: string | null;
  loai_lop?: string | null;
  doi_tuong_hoc_vien?: string | null;
  co_kinh_phi?: boolean;
  la_lop_gap?: boolean;
  la_lop_cong_dong?: boolean;
  ngay_khai_giang?: string | null;
  ngay_ket_thuc?: string | null;
  so_giang_vien_can?: number;
  so_tro_giang_can?: number;
  mo_dang_ky?: boolean;
  nhom_giang_vien_phu_hop?: number[] | null;
  nhom_tro_giang_phu_hop?: number[] | null;
  giang_vien_chi_dinh_id?: string | null;
  tro_giang_chi_dinh_id?: string | null;
};

function ChiDinhSelect({
  name,
  label,
  defaultValue,
  options,
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  options: ClassFormProfile[];
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Select name={name} defaultValue={defaultValue ?? "none"}>
        <SelectTrigger id={name}>
          <SelectValue>
            {(value: string) =>
              value === "none"
                ? "Chưa chỉ định"
                : (options.find((p) => p.id === value)?.full_name ?? "Chưa chỉ định")
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Chưa chỉ định</SelectItem>
          {options.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.full_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function NhomCheckboxGroup({
  name,
  label,
  defaultValues,
}: {
  name: string;
  label: string;
  defaultValues?: number[] | null;
}) {
  const selected = new Set(defaultValues ?? []);
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <div className="flex flex-col gap-1.5">
        {NHOM_PHAN_LOAI_VALUES.map((v) => (
          <label key={v} className="flex items-center gap-2 text-sm font-normal">
            <input
              type="checkbox"
              name={name}
              value={v}
              defaultChecked={selected.has(v)}
              className="h-4 w-4"
            />
            {NHOM_PHAN_LOAI_LABEL[v]}
          </label>
        ))}
      </div>
    </div>
  );
}

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
  profiles: ClassFormProfile[];
}) {
  const giangVienOptions = profiles.filter((p) => p.role === "giang_vien");
  const troGiangOptions = profiles.filter((p) => p.role === "tro_giang");

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
            placeholder="vd: ACLS, BLS, ABCDE"
            defaultValue={defaults?.loai_lop ?? ""}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="doi_tuong_hoc_vien">Đối tượng học viên</Label>
          <Select
            name="doi_tuong_hoc_vien"
            defaultValue={defaults?.doi_tuong_hoc_vien ?? "none"}
          >
            <SelectTrigger id="doi_tuong_hoc_vien">
              <SelectValue>
                {(value: string) =>
                  value === "none"
                    ? "Chưa chọn"
                    : DOI_TUONG_HOC_VIEN_LABEL[value as DoiTuongHocVien]
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Chưa chọn</SelectItem>
              {DOI_TUONG_HOC_VIEN_VALUES.map((v) => (
                <SelectItem key={v} value={v}>
                  {DOI_TUONG_HOC_VIEN_LABEL[v]}
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

      <div className="grid grid-cols-2 gap-4">
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

      <label className="flex items-center gap-2 text-sm font-normal">
        <input
          type="checkbox"
          name="mo_dang_ky"
          defaultChecked={defaults?.mo_dang_ky ?? false}
          className="h-4 w-4"
        />
        Mở đăng ký — cho phép nhân sự tự đăng ký dạy lớp này
      </label>

      <div className="grid grid-cols-2 gap-4">
        <NhomCheckboxGroup
          name="nhom_giang_vien_phu_hop"
          label="Nhóm giảng viên phù hợp"
          defaultValues={defaults?.nhom_giang_vien_phu_hop}
        />
        <NhomCheckboxGroup
          name="nhom_tro_giang_phu_hop"
          label="Nhóm trợ giảng phù hợp"
          defaultValues={defaults?.nhom_tro_giang_phu_hop}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ChiDinhSelect
          name="giang_vien_chi_dinh_id"
          label="Chỉ định giảng viên"
          defaultValue={defaults?.giang_vien_chi_dinh_id}
          options={giangVienOptions}
        />
        <ChiDinhSelect
          name="tro_giang_chi_dinh_id"
          label="Chỉ định trợ giảng"
          defaultValue={defaults?.tro_giang_chi_dinh_id}
          options={troGiangOptions}
        />
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
            Lớp đột xuất
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
