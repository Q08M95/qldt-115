"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { toggleActive } from "@/app/(app)/nhan-su/actions";

export function ToggleActiveButton({ id, active }: { id: string; active: boolean }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await toggleActive(id, !active);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(active ? "Đã khoá hoạt động" : "Đã mở hoạt động");
      }
    });
  }

  return (
    <Button variant="outline" size="sm" disabled={isPending} onClick={handleClick}>
      {active ? "Khoá hoạt động" : "Mở hoạt động"}
    </Button>
  );
}
