"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { setHuyLop } from "@/app/(app)/lop-hoc/actions";

// Huy/mo lai lop hoc — cung tinh than "khoa/mo" khong xoa cung da ap dung
// cho nhan su (nut nay chi doi trang_thai sang 'huy' hoac 'cho_khai_giang',
// lan load trang tiep theo se tu tinh lai trang thai thuc te).
export function ClassStatusButton({ id, daHuy }: { id: string; daHuy: boolean }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (daHuy) {
      startTransition(async () => {
        const result = await setHuyLop(id, false);
        if (result?.error) toast.error(result.error);
        else toast.success("Đã mở lại lớp học");
      });
      return;
    }
    if (!window.confirm("Huỷ lớp học này? Lớp sẽ chuyển sang trạng thái Đã huỷ.")) return;
    startTransition(async () => {
      const result = await setHuyLop(id, true);
      if (result?.error) toast.error(result.error);
      else toast.success("Đã huỷ lớp học");
    });
  }

  return (
    <Button variant="outline" size="sm" disabled={isPending} onClick={handleClick}>
      {daHuy ? "Mở lại lớp" : "Huỷ lớp"}
    </Button>
  );
}
