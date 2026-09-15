"use client";

import { useTransition } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { resendInvite } from "@/app/(app)/nhan-su/actions";

export function ResendInviteButton({ profileId }: { profileId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await resendInvite(profileId);
      if (result.error) toast.error(result.error);
      else toast.success("Đã gửi lại email đặt mật khẩu");
    });
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={<Button variant="outline" size="icon-sm" onClick={handleClick} disabled={isPending} />}
      >
        <Send className="size-4" strokeWidth={1.5} />
      </TooltipTrigger>
      <TooltipContent>Gửi lại email mời</TooltipContent>
    </Tooltip>
  );
}
