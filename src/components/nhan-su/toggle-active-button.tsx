"use client";

import { useTransition } from "react";
import { Lock, LockOpen } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toggleActive } from "@/app/(app)/nhan-su/actions";

export function ToggleActiveButton({ id, active }: { id: string; active: boolean }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await toggleActive(id, !active);
      if (result.error) toast.error(result.error);
      else toast.success(active ? "Đã khoá hoạt động" : "Đã mở hoạt động");
    });
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={<Button variant="outline" size="icon-sm" onClick={handleClick} disabled={isPending} />}
      >
        {active ? <Lock className="size-4" strokeWidth={1.5} /> : <LockOpen className="size-4" strokeWidth={1.5} />}
      </TooltipTrigger>
      <TooltipContent>{active ? "Khoá hoạt động" : "Mở hoạt động"}</TooltipContent>
    </Tooltip>
  );
}
