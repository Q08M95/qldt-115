"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toggleActive } from "@/app/(app)/nhan-su/actions";

export function ToggleActiveButton({ id, active }: { id: string; active: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={() => startTransition(() => toggleActive(id, !active))}
    >
      {active ? "Khoá hoạt động" : "Mở hoạt động"}
    </Button>
  );
}
