"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resendInvite } from "@/app/(app)/nhan-su/actions";

// Nhan su moi chua tung dang nhap (email dat mat khau lan dau bi loi, vao
// spam...) can 1 duong lui de admin gui lai — khong co UI nay thi ho ket
// ket vinh vien vi khong ai cap mat khau tam.
export function ResendInviteButton({ profileId }: { profileId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await resendInvite(profileId);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Đã gửi lại email đặt mật khẩu");
      }
    });
  }

  return (
    <Button variant="outline" size="sm" disabled={isPending} onClick={handleClick}>
      <Mail className="h-4 w-4" />
      Gửi lại email đặt mật khẩu
    </Button>
  );
}
