"use client";

import { useMemo, useState } from "react";
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
  LOAI_LOP_VALUES,
  type DoiTuongHocVien,
} from "@/lib/constants/lop-hoc";
import { NHOM_PHAN_LOAI_VALUES, NHOM_PHAN_LOAI_LABEL } from "@/lib/constants/nhan-su";

// nhom_phan_loai la optional: chi cac noi thuc su can loc theo nhom phu hop
// (form lop hoc) moi truyen gia tri that; danh sach dung o cac dialog/list
// buoi giang, bai giang chi can id/full_name/role nen truyen mang da rut gon
// (khong co nhom_phan_loai) de tranh lo du lieu noi bo nay ra viewer khong
// phai admin/quan_ly (xem [id]/page.tsx).
export type ClassFormProfile = {
  id: string;
  full_name: string;
  role: string;
  nhom_phan_loai?: number | null;
};

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
  giang_vien_chi_dinh_ids?: string[] | null;
  tro_giang_chi_dinh_ids?: string[] | null;
};

// So khung chi dinh = dung so luong can (so_giang_vien_can/so_tro_giang_can)
// — nguoi dung 2026-09-10 yeu cau can 1 hien 1 khung, can 2 hien 2 khung...
// Danh sach chon o moi khung da loc theo nhom phu hop (neu co chon nhom),
// va loai nguoi da chon o khung khac de tranh chon trung 1 nguoi 2 lan.
function ChiDinhSlots({
  namePrefix,
  label,
  count,
  values,
  onChange,
  options,
}: {
  namePrefix: string;
  label: string;
  count: number;
  values: string[];
  onChange: (next: string[]) => void;
  options: ClassFormProfile[];
}) {
  if (count <= 0) {
    return (
      <div className="flex flex-col gap-2">
        <Label>{label}</Label>
        <p className="text-xs text-muted-foreground">
          Chưa cần — đặt số lượng cần lớn hơn 0 để chỉ định.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <div className="flex flex-col gap-2">
        {Array.from({ length: count }, (_, i) => {
          const current = values[i] ?? "none";
          const daChonNoiKhac = new Set(
            values.filter((v, j) => j !== i && v && v !== "none"),
          );
          const availableOptions = options.filter(
            (p) => p.id === current || !daChonNoiKhac.has(p.id),
          );
          return (
            <Select
              key={i}
              name={namePrefix}
              value={current}
              onValueChange={(value) => {
                const next = [...values];
                next[i] = value as string;
                onChange(next);
              }}
            >
              <SelectTrigger>
                <SelectValue>
                  {(value: string) =>
                    value === "none"
                      ? `Chưa chỉ định (${i + 1}/${count})`
                      : (options.find((p) => p.id === value)?.full_name ?? "Chưa chỉ định")
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Chưa chỉ định</SelectItem>
                {availableOptions.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        })}
      </div>
    </div>
  );
}

function NhomCheckboxGroup({
  name,
  label,
  selected,
  onChange,
}: {
  name: string;
  label: string;
  selected: Set<number>;
  onChange: (next: Set<number>) => void;
}) {
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
              checked={selected.has(v)}
              onChange={(e) => {
                const next = new Set(selected);
                if (e.target.checked) next.add(v);
                else next.delete(v);
                onChange(next);
              }}
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

  const [soGiangVien, setSoGiangVien] = useState(defaults?.so_giang_vien_can ?? 1);
  const [soTroGiang, setSoTroGiang] = useState(defaults?.so_tro_giang_can ?? 1);
  const [nhomGV, setNhomGV] = useState<Set<number>>(
    new Set(defaults?.nhom_giang_vien_phu_hop ?? []),
  );
  const [nhomTG, setNhomTG] = useState<Set<number>>(
    new Set(defaults?.nhom_tro_giang_phu_hop ?? []),
  );
  const [chiDinhGV, setChiDinhGV] = useState<string[]>(defaults?.giang_vien_chi_dinh_ids ?? []);
  const [chiDinhTG, setChiDinhTG] = useState<string[]>(defaults?.tro_giang_chi_dinh_ids ?? []);

  // Ung vien chi dinh = dung nhom phu hop da chon (neu co); luon giu lai
  // nguoi da duoc chon san du khong con thuoc nhom, de khong lam mat lua
  // chon hien co khi doi nhom sau do.
  const giangVienCandidates = useMemo(() => {
    const base =
      nhomGV.size > 0
        ? giangVienOptions.filter((p) => p.nhom_phan_loai != null && nhomGV.has(p.nhom_phan_loai))
        : giangVienOptions;
    const missing = giangVienOptions.filter(
      (p) => chiDinhGV.includes(p.id) && !base.some((b) => b.id === p.id),
    );
    return [...base, ...missing];
  }, [giangVienOptions, nhomGV, chiDinhGV]);

  const troGiangCandidates = useMemo(() => {
    const base =
      nhomTG.size > 0
        ? troGiangOptions.filter((p) => p.nhom_phan_loai != null && nhomTG.has(p.nhom_phan_loai))
        : troGiangOptions;
    const missing = troGiangOptions.filter(
      (p) => chiDinhTG.includes(p.id) && !base.some((b) => b.id === p.id),
    );
    return [...base, ...missing];
  }, [troGiangOptions, nhomTG, chiDinhTG]);

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
          <Select name="loai_lop" defaultValue={defaults?.loai_lop ?? "none"}>
            <SelectTrigger id="loai_lop">
              <SelectValue>{(value: string) => (value === "none" ? "Chưa chọn" : value)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Chưa chọn</SelectItem>
              {LOAI_LOP_VALUES.map((v) => (
                <SelectItem key={v} value={v}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            onChange={(e) => setSoGiangVien(Math.max(0, Number(e.target.value) || 0))}
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
            onChange={(e) => setSoTroGiang(Math.max(0, Number(e.target.value) || 0))}
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
          selected={nhomGV}
          onChange={setNhomGV}
        />
        <NhomCheckboxGroup
          name="nhom_tro_giang_phu_hop"
          label="Nhóm trợ giảng phù hợp"
          selected={nhomTG}
          onChange={setNhomTG}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ChiDinhSlots
          namePrefix="giang_vien_chi_dinh_ids"
          label="Chỉ định giảng viên"
          count={soGiangVien}
          values={chiDinhGV}
          onChange={setChiDinhGV}
          options={giangVienCandidates}
        />
        <ChiDinhSlots
          namePrefix="tro_giang_chi_dinh_ids"
          label="Chỉ định trợ giảng"
          count={soTroGiang}
          values={chiDinhTG}
          onChange={setChiDinhTG}
          options={troGiangCandidates}
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
