"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createBuoiGiang } from "@/app/(app)/lop-hoc/[id]/buoi-giang-actions";

// Thay the nut mo dialog "Them buoi giang" (thiet ke lai 2026-09-14) — chi
// can nhap ten roi Enter/bam Them la co ngay 1 buoi moi (GV/TG can mac dinh
// 1/1, mo dang ky mac dinh tat). Chinh chi tiet (so GV/TG can, chi dinh, mo
// dang ky) van qua BuoiGiangDialog o che do sua (pencil icon tren dong bang)
// — tan suat sua thap hon nhieu so voi them moi nen giu dialog o do la hop ly.
export function BuoiGiangQuickAdd({ lopHocId }: { lopHocId: string }) {
  const [ten, setTen] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const tenTrimmed = ten.trim();
    if (!tenTrimmed) return;
    const fd = new FormData();
    fd.set("ten_buoi", tenTrimmed);
    fd.set("so_giang_vien_can", "1");
    fd.set("so_tro_giang_can", "1");
    startTransition(async () => {
      const result = await createBuoiGiang(lopHocId, fd);
      if (result?.error) {
        toast.error(result.error);
      } else {
        setTen("");
        toast.success("Đã thêm buổi giảng");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <Input
        placeholder="Thêm buổi giảng mới — nhập tên rồi Enter"
        value={ten}
        onChange={(e) => setTen(e.target.value)}
        className="h-9"
      />
      <Button type="submit" size="sm" disabled={isPending || !ten.trim()}>
        <Plus className="h-4 w-4" />
        Thêm
      </Button>
    </form>
  );
}
