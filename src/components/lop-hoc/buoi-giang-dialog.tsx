"use client";

import { useState, useTransition } from "react";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateBuoiGiang } from "@/app/(app)/lop-hoc/[id]/buoi-giang-actions";
import type { ClassFormProfile } from "./class-form-fields";

export type BuoiGiang = {
  id: string;
  ten_buoi: string;
  thu_tu: number;
  so_giang_vien_can: number;
  so_tro_giang_can: number;
  mo_dang_ky: boolean;
  giang_vien_chi_dinh_id: string | null;
  tro_giang_chi_dinh_id: string | null;
};

function NguoiSelect({
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

// Chi con che do sua — them moi da chuyen sang BuoiGiangQuickAdd (thiet ke
// lai 2026-09-14, xem tientrinh.md muc 1.2), khong con nhanh "create" o day.
export function BuoiGiangDialog({
  lopHocId,
  buoiGiang,
  profiles,
  soBaiGiang,
}: {
  lopHocId: string;
  buoiGiang: BuoiGiang;
  profiles: ClassFormProfile[];
  // So bai giang thuoc buoi nay — chan "Mo dang ky" khi bang 0 (yeu cau
  // nguoi dung 2026-09-14: "co noi dung thi moi mo dang ky").
  soBaiGiang: number;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [moDangKy, setMoDangKy] = useState(buoiGiang.mo_dang_ky);
  const giangVienOptions = profiles.filter((p) => p.role === "giang_vien");
  const troGiangOptions = profiles.filter((p) => p.role === "tro_giang");

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await updateBuoiGiang(buoiGiang.id, lopHocId, formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setOpen(false);
        toast.success("Đã lưu thay đổi");
      }
    });
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setError(null);
      setMoDangKy(buoiGiang.mo_dang_ky);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button size="sm" variant="ghost" />}>
        <Pencil className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Sửa buổi giảng</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="ten_buoi">Tên buổi</Label>
            <Input id="ten_buoi" name="ten_buoi" defaultValue={buoiGiang.ten_buoi} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="so_giang_vien_can">Số GV cần</Label>
              <Input
                id="so_giang_vien_can"
                name="so_giang_vien_can"
                type="number"
                min={0}
                defaultValue={buoiGiang.so_giang_vien_can}
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
                defaultValue={buoiGiang.so_tro_giang_can}
                required
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm font-normal">
            <input
              type="checkbox"
              name="mo_dang_ky"
              checked={moDangKy}
              disabled={!moDangKy && soBaiGiang === 0}
              onChange={(e) => setMoDangKy(e.target.checked)}
              className="h-4 w-4"
            />
            Mở đăng ký cho buổi này
          </label>
          {!moDangKy && soBaiGiang === 0 ? (
            <p className="text-xs text-muted-foreground">
              Cần thêm ít nhất 1 bài giảng vào buổi này trước khi mở đăng ký.
            </p>
          ) : null}
          {moDangKy && soBaiGiang === 0 ? (
            <p className="text-xs text-data-canh-bao" role="alert">
              Buổi đang mở đăng ký nhưng không còn bài giảng nào — nên tắt hoặc gán lại bài.
            </p>
          ) : null}
          <div className="grid grid-cols-2 gap-4">
            <NguoiSelect
              name="giang_vien_chi_dinh_id"
              label="Chỉ định giảng viên"
              defaultValue={buoiGiang.giang_vien_chi_dinh_id}
              options={giangVienOptions}
            />
            <NguoiSelect
              name="tro_giang_chi_dinh_id"
              label="Chỉ định trợ giảng"
              defaultValue={buoiGiang.tro_giang_chi_dinh_id}
              options={troGiangOptions}
            />
          </div>
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Đang lưu..." : "Lưu"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
