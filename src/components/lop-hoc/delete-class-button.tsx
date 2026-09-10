"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteLopHoc } from "@/app/(app)/lop-hoc/actions";

// Thay the hoan toan khai niem "huy lop" truoc day — nguoi dung xac nhan:
// hoan lop la sua lai ngay (dung EditClassDialog), huy lop la xoa han lop
// do. RPC xoa_lop_hoc tu chan va bao loi ro rang neu lop da co dang
// ky/lich giang/khao sat lien quan.
export function DeleteClassButton({ id }: { id: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm("Xoá lớp học này? Không thể hoàn tác.")) return;
    startTransition(async () => {
      const result = await deleteLopHoc(id);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Đã xoá lớp học");
      router.push("/lop-hoc");
    });
  }

  return (
    <Button variant="outline" size="sm" disabled={isPending} onClick={handleClick}>
      <Trash2 className="h-4 w-4" />
      Xoá lớp
    </Button>
  );
}
