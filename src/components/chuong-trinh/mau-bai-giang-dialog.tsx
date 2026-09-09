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
  createMauBaiGiang,
  updateMauBaiGiang,
} from "@/app/(app)/cau-hinh/chuong-trinh/[id]/actions";

export type MauBaiGiang = {
  id: string;
  ten_bai: string;
  chuyen_de: string | null;
  thoi_luong_tiet: number;
  thu_tu: number;
};

export function MauBaiGiangDialog({
  chuongTrinhId,
  baiGiang,
}: {
  chuongTrinhId: string;
  baiGiang?: MauBaiGiang;
}) {
  const mode = baiGiang ? "edit" : "create";
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createMauBaiGiang(chuongTrinhId, formData)
          : await updateMauBaiGiang(baiGiang!.id, chuongTrinhId, formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setOpen(false);
        toast.success(mode === "create" ? "Đã thêm bài giảng mẫu" : "Đã lưu thay đổi");
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
        render={
          mode === "create" ? <Button size="sm" /> : <Button size="sm" variant="ghost" />
        }
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Thêm bài giảng mẫu" : "Sửa bài giảng mẫu"}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="ten_bai">Tên bài giảng</Label>
            <Input id="ten_bai" name="ten_bai" defaultValue={baiGiang?.ten_bai} required />
          </div>
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
              min={1}
              defaultValue={baiGiang?.thoi_luong_tiet ?? 1}
              required
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
