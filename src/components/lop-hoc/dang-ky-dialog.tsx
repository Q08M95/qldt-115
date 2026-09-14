"use client";

import { useState, useTransition } from "react";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createDangKy } from "@/app/(app)/lop-hoc/[id]/dang-ky-actions";

type Option = { id: string; label: string };

// 1 dialog dung chung cho ca the danh sach (chi truyen lopMoDangKy, khong co
// buoiOptions/baiOptions — chi dang ky duoc "ca lop") lan trang chi tiet lop
// (truyen them buoi/bai dang mo dang ky rieng de chon granularity cu the).
export function DangKyDialog({
  lopHocId,
  lopMoDangKy,
  buoiOptions = [],
  baiOptions = [],
  label = "Đăng ký dạy lớp này",
  size = "default",
  className,
}: {
  lopHocId: string;
  lopMoDangKy: boolean;
  buoiOptions?: Option[];
  baiOptions?: Option[];
  label?: string;
  size?: "default" | "sm";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const options: { value: string; label: string }[] = [
    ...(lopMoDangKy ? [{ value: "lop:none", label: "Cả lớp" }] : []),
    ...buoiOptions.map((b) => ({ value: `buoi:${b.id}`, label: `Buổi: ${b.label}` })),
    ...baiOptions.map((b) => ({ value: `bai:${b.id}`, label: `Bài: ${b.label}` })),
  ];

  if (options.length === 0) return null;

  function handleSubmit(formData: FormData) {
    setError(null);
    const chon = String(formData.get("chon") ?? "");
    const [cap, targetId] = chon.split(":");
    const payload = new FormData();
    payload.set("cap", cap);
    payload.set("target_id", targetId ?? "none");
    startTransition(async () => {
      const result = await createDangKy(lopHocId, payload);
      if (result?.error) {
        setError(result.error);
      } else {
        setOpen(false);
        toast.success("Đã gửi đăng ký, chờ quản lý duyệt");
      }
    });
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) setError(null);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button size={size} className={className} />}>{label}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Đăng ký dạy lớp này</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="chon">Đăng ký cho</Label>
            <Select name="chon" defaultValue={options[0]?.value}>
              <SelectTrigger id="chon">
                <SelectValue>
                  {(value: string) => options.find((o) => o.value === value)?.label ?? value}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {options.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Đang gửi..." : "Gửi đăng ký"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
