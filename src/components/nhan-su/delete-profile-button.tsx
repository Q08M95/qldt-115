"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { deleteProfile } from "@/app/(app)/nhan-su/actions";

export function DeleteProfileButton({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleConfirm() {
    startTransition(async () => {
      const result = await deleteProfile(id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Đã xoá nhân sự");
      setOpen(false);
      router.push("/nhan-su");
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger render={<DialogTrigger render={<Button variant="outline" size="icon-sm" />} />}>
          <Trash2 className="size-4" strokeWidth={1.5} />
        </TooltipTrigger>
        <TooltipContent>Xoá nhân sự</TooltipContent>
      </Tooltip>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xoá nhân sự?</DialogTitle>
          <DialogDescription>
            Chỉ xoá được khi nhân sự này chưa có dữ liệu liên quan (lịch giảng, đăng ký, đánh giá...).
            Nếu đã có dữ liệu, hãy dùng khoá hoạt động thay vì xoá.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Huỷ</DialogClose>
          <Button variant="destructive" disabled={isPending} onClick={handleConfirm}>
            {isPending ? "Đang xoá..." : "Xoá vĩnh viễn"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
