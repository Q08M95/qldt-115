"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
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
import { uploadCertificate } from "@/app/(app)/nhan-su/[id]/certificate-actions";

export function UploadCertificateDialog({ profileId }: { profileId: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await uploadCertificate(profileId, formData);
        setOpen(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Có lỗi xảy ra");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>
        <Plus className="h-4 w-4" />
        Thêm chứng chỉ
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thêm chứng chỉ</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="ten_chung_chi">Tên chứng chỉ</Label>
            <Input id="ten_chung_chi" name="ten_chung_chi" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="noi_cap">Nơi cấp</Label>
            <Input id="noi_cap" name="noi_cap" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="ngay_cap">Ngày cấp</Label>
              <Input id="ngay_cap" name="ngay_cap" type="date" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="ngay_het_han">Ngày hết hạn</Label>
              <Input id="ngay_het_han" name="ngay_het_han" type="date" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="file">File chứng chỉ (PDF/ảnh)</Label>
            <Input id="file" name="file" type="file" accept=".pdf,image/*" required />
          </div>
          <div className="flex items-center gap-2">
            <input id="bat_buoc" name="bat_buoc" type="checkbox" defaultChecked className="h-4 w-4" />
            <Label htmlFor="bat_buoc" className="font-normal">
              Chứng chỉ bắt buộc (tính vào KPI Nhóm C)
            </Label>
          </div>
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Đang tải lên..." : "Lưu"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
