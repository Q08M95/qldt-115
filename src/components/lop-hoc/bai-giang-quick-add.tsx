"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createBaiGiang } from "@/app/(app)/lop-hoc/[id]/bai-giang-actions";

// Thay the nut mo dialog "Them bai giang" (thiet ke lai 2026-09-14) — chi
// can nhap ten + so tiet roi Them la co ngay 1 bai moi. Chinh chi tiet
// (chuyen de, mo dang ky, chi dinh, gan buoi) van qua BaiGiangDialog o che
// do sua hoac select inline tren dong bang (gan buoi) nhu cu.
export function BaiGiangQuickAdd({ lopHocId }: { lopHocId: string }) {
  const [ten, setTen] = useState("");
  const [tiet, setTiet] = useState("1");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const tenTrimmed = ten.trim();
    if (!tenTrimmed) return;
    const fd = new FormData();
    fd.set("ten_bai", tenTrimmed);
    fd.set("thoi_luong_tiet", tiet.trim() || "1");
    startTransition(async () => {
      const result = await createBaiGiang(lopHocId, fd);
      if (result?.error) {
        toast.error(result.error);
      } else {
        setTen("");
        setTiet("1");
        toast.success("Đã thêm bài giảng");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <Input
        placeholder="Thêm bài giảng mới — nhập tên..."
        value={ten}
        onChange={(e) => setTen(e.target.value)}
        className="h-9"
      />
      <Input
        type="number"
        min={0.5}
        step={0.5}
        value={tiet}
        onChange={(e) => setTiet(e.target.value)}
        className="h-9 w-20 shrink-0"
        aria-label="Số tiết"
      />
      <Button type="submit" size="sm" disabled={isPending || !ten.trim()}>
        <Plus className="h-4 w-4" />
        Thêm
      </Button>
    </form>
  );
}
