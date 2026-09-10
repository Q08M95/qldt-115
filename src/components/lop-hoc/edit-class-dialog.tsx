"use client";

import { useState, useTransition } from "react";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ClassFormFields, type ClassFormDefaults, type ClassFormProfile } from "./class-form-fields";
import { updateLopHoc } from "@/app/(app)/lop-hoc/actions";

export function EditClassDialog({
  lopHocId,
  defaults,
  profiles,
}: {
  lopHocId: string;
  defaults: ClassFormDefaults;
  profiles: ClassFormProfile[];
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await updateLopHoc(lopHocId, formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setOpen(false);
        toast.success("Đã lưu thay đổi");
      }
    });
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) setError(null);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>
        <Pencil className="h-4 w-4" />
        Sửa thông tin lớp
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Sửa thông tin lớp học</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <ClassFormFields defaults={defaults} profiles={profiles} />
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
