"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { tuChoiDangKy } from "@/app/(app)/lop-hoc/[id]/dang-ky-actions";

// Dung chung cho ca DangKyList (trong 1 lop) va ChoDuyetPanel (tong hop moi
// lop tren /lop-hoc) — tach rieng vi ca 2 noi deu can nut Tu choi giong het
// nhau.
export function TuChoiDialog({
  id,
  lopHocId,
  size = "sm",
  variant = "ghost",
}: {
  id: string;
  lopHocId: string;
  size?: "default" | "sm";
  variant?: "ghost" | "outline";
}) {
  const [open, setOpen] = useState(false);
  const [ghiChu, setGhiChu] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    startTransition(async () => {
      const result = await tuChoiDangKy(id, lopHocId, ghiChu);
      if (result?.error) {
        toast.error(result.error);
      } else {
        setOpen(false);
        toast.success("Đã từ chối đăng ký");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size={size} variant={variant} />}>Từ chối</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Từ chối đăng ký</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Label htmlFor="ghi_chu">Lý do (tuỳ chọn)</Label>
          <textarea
            id="ghi_chu"
            value={ghiChu}
            onChange={(e) => setGhiChu(e.target.value)}
            className="min-h-20 rounded-md border border-input bg-transparent p-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
        <DialogFooter>
          <Button variant="destructive" disabled={isPending} onClick={handleSubmit}>
            {isPending ? "Đang gửi..." : "Xác nhận từ chối"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
