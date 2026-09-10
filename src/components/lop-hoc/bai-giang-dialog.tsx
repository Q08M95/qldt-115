"use client";

import { useState, useTransition } from "react";
import { Pencil, Plus } from "lucide-react";
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
import { createBaiGiang, updateBaiGiang } from "@/app/(app)/lop-hoc/[id]/bai-giang-actions";
import type { ClassFormProfile } from "./class-form-fields";

export type BaiGiang = {
  id: string;
  ten_bai: string;
  chuyen_de: string | null;
  thoi_luong_tiet: number;
  thu_tu: number;
  buoi_giang_id: string | null;
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

export function BaiGiangDialog({
  lopHocId,
  baiGiang,
  profiles,
}: {
  lopHocId: string;
  baiGiang?: BaiGiang;
  profiles: ClassFormProfile[];
}) {
  const mode = baiGiang ? "edit" : "create";
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const giangVienOptions = profiles.filter((p) => p.role === "giang_vien");
  const troGiangOptions = profiles.filter((p) => p.role === "tro_giang");

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createBaiGiang(lopHocId, formData)
          : await updateBaiGiang(baiGiang!.id, lopHocId, formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setOpen(false);
        toast.success(mode === "create" ? "Đã thêm bài giảng" : "Đã lưu thay đổi");
      }
    });
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) setError(null);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={mode === "create" ? <Button size="sm" /> : <Button size="sm" variant="ghost" />}
      >
        {mode === "create" ? (
          <>
            <Plus className="h-4 w-4" />
            Thêm bài giảng
          </>
        ) : (
          <Pencil className="h-4 w-4" />
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Thêm bài giảng" : "Sửa bài giảng"}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="ten_bai">Tên bài giảng</Label>
            <Input id="ten_bai" name="ten_bai" defaultValue={baiGiang?.ten_bai} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="chuyen_de">Chuyên đề</Label>
              <Input id="chuyen_de" name="chuyen_de" defaultValue={baiGiang?.chuyen_de ?? ""} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="thoi_luong_tiet">Số tiết</Label>
              <Input
                id="thoi_luong_tiet"
                name="thoi_luong_tiet"
                type="number"
                min={0.5}
                step={0.5}
                defaultValue={baiGiang?.thoi_luong_tiet ?? 1}
                required
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm font-normal">
            <input
              type="checkbox"
              name="mo_dang_ky"
              defaultChecked={baiGiang?.mo_dang_ky ?? false}
              className="h-4 w-4"
            />
            Mở đăng ký riêng cho bài này
          </label>

          <div className="grid grid-cols-2 gap-4">
            <NguoiSelect
              name="giang_vien_chi_dinh_id"
              label="Chỉ định giảng viên"
              defaultValue={baiGiang?.giang_vien_chi_dinh_id}
              options={giangVienOptions}
            />
            <NguoiSelect
              name="tro_giang_chi_dinh_id"
              label="Chỉ định trợ giảng"
              defaultValue={baiGiang?.tro_giang_chi_dinh_id}
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
