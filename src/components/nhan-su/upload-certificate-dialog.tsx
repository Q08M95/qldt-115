"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
      const result = await uploadCertificate(profileId, formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      toast.success("Đã thêm chứng chỉ");
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <Plus className="size-4" strokeWidth={1.5} />
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
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="so_chung_chi">Số</Label>
              <Input id="so_chung_chi" name="so_chung_chi" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="ngay_cap">Ngày cấp</Label>
              <Input id="ngay_cap" name="ngay_cap" type="date" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="noi_cap">Nơi cấp</Label>
            <Input id="noi_cap" name="noi_cap" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="file">File (PDF/ảnh, tối đa 8MB)</Label>
            <Input id="file" name="file" type="file" accept=".pdf,image/*" required />
          </div>
          <Label htmlFor="bat_buoc" className="flex items-center gap-2">
            <Checkbox id="bat_buoc" name="bat_buoc" defaultChecked />
            Chứng chỉ bắt buộc (tính vào KPI Nhóm C)
          </Label>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
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
