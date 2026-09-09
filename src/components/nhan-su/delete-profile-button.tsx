"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteProfile } from "@/app/(app)/nhan-su/actions";

// Xoa cung, khac voi ToggleActiveButton (khoa/mo hoat dong). RPC xoa_nhan_su
// se tu chan va tra loi ro rang neu nguoi nay da co du lieu lien quan
// (lich giang, dang ky, danh gia...) — khi do dung khoa hoat dong thay vi xoa.
export function DeleteProfileButton({
  id,
  redirectAfter,
}: {
  id: string;
  redirectAfter?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm("Xoá nhân sự này? Không thể hoàn tác.")) return;
    startTransition(async () => {
      const result = await deleteProfile(id);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Đã xoá nhân sự");
      if (redirectAfter) router.push(redirectAfter);
    });
  }

  return (
    <Button variant="outline" size="sm" disabled={isPending} onClick={handleClick}>
      <Trash2 className="h-4 w-4" />
      Xoá
    </Button>
  );
}
