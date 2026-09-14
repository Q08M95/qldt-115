"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
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
import { createLopHoc } from "@/app/(app)/lop-hoc/actions";

type Program = { id: string; ten_chuong_trinh: string };

// Thay the hoan toan luong wizard 2 trang (TaoLopForm + WizardBanner, da
// xoa) theo yeu cau thiet ke lai 2026-09-14: tao lop chi hoi dung 1-2 thu
// that su can quyet dinh NGAY luc tao — ten lop (bat buoc) va chuong trinh
// mau (tuy chon, vi CLAUDE.md muc 4 bat buoc copy bai giang tu template
// LUC TAO, khong the them lai sau). Moi truong khac (loai lop, doi tuong,
// ngay, so GV/TG can, chi dinh...) deu co gia tri mac dinh hop le va sua
// ngay tai canvas 1 trang cua trang chi tiet (LopInfoAutosaveForm) ngay sau
// khi tao xong — khong con trang/step rieng nao nua.
export function QuickCreateClassDialog({ programs }: { programs: Program[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    // Gia tri mac dinh cho cac truong bat buoc o schema nhung khong hien o
    // dialog rut gon nay — giu dung mac dinh cu cua ClassFormFields truoc
    // day (so GV/TG can = 1, co kinh phi = co) de hanh vi nhat quan.
    formData.set("so_giang_vien_can", "1");
    formData.set("so_tro_giang_can", "1");
    formData.set("co_kinh_phi", "on");
    startTransition(async () => {
      const result = await createLopHoc(formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      toast.success("Đã tạo lớp — sửa chi tiết ngay tại trang lớp");
      if (result.id) router.push(`/lop-hoc/${result.id}`);
    });
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) setError(null);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button size="sm" />}>
        <Plus className="h-4 w-4" />
        Thêm lớp học
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thêm lớp học mới</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="ten_lop">Tên lớp</Label>
            <Input id="ten_lop" name="ten_lop" required autoFocus />
          </div>

          {programs.length > 0 ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor="chuong_trinh_id">Chương trình mẫu (tuỳ chọn)</Label>
              <Select name="chuong_trinh_id" defaultValue="none">
                <SelectTrigger id="chuong_trinh_id">
                  <SelectValue>
                    {(value: string) =>
                      value === "none"
                        ? "Không dùng — tạo lớp trống"
                        : programs.find((p) => p.id === value)?.ten_chuong_trinh
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không dùng — tạo lớp trống</SelectItem>
                  {programs.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.ten_chuong_trinh}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Nếu chọn, bài giảng mẫu sẽ được copy thành bài giảng riêng của lớp này. Các thông
                tin còn lại (loại lớp, đối tượng, ngày, chỉ định...) sửa ngay tại trang lớp sau khi
                tạo.
              </p>
            </div>
          ) : null}

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Đang tạo..." : "Tạo lớp"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
