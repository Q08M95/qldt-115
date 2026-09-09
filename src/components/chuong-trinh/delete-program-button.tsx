"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteProgram } from "@/app/(app)/cau-hinh/chuong-trinh/actions";

export function DeleteProgramButton({ id }: { id: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm("Xoá chương trình đào tạo này? Không thể hoàn tác.")) return;
    startTransition(async () => {
      const result = await deleteProgram(id);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Đã xoá chương trình");
      router.push("/cau-hinh/chuong-trinh");
    });
  }

  return (
    <Button variant="outline" size="sm" disabled={isPending} onClick={handleClick}>
      <Trash2 className="h-4 w-4" />
      Xoá chương trình
    </Button>
  );
}
