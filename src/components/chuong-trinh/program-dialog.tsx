"use client";

import { useState, useTransition } from "react";
import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProgram, updateProgram } from "@/app/(app)/cau-hinh/chuong-trinh/actions";

type Program = { id: string; ten_chuong_trinh: string; mo_ta: string | null };

/**
 * Dung chung cho tao moi (mode="create") va sua (mode="edit", truyen
 * `program`) — cung 1 form, khac action goi va label nut (giong pattern
 * add-profile-dialog/profile-form o module Nhan su).
 */
export function ProgramDialog({
  mode,
  program,
}: {
  mode: "create" | "edit";
  program?: Program;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createProgram(formData)
          : await updateProgram(program!.id, formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setOpen(false);
        toast.success(mode === "create" ? "Đã tạo chương trình" : "Đã lưu thay đổi");
      }
    });
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) setError(null);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          mode === "create" ? (
            <Button size="sm" />
          ) : (
            <Button size="sm" variant="outline" />
          )
        }
      >
        {mode === "create" ? (
          <>
            <Plus className="h-4 w-4" />
            Thêm chương trình
          </>
        ) : (
          <>
            <Pencil className="h-4 w-4" />
            Sửa
          </>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Thêm chương trình đào tạo" : "Sửa chương trình đào tạo"}
          </DialogTitle>
          <DialogDescription>
            Chương trình mẫu chứa danh sách bài giảng dùng để copy khi mở lớp học mới.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="ten_chuong_trinh">Tên chương trình</Label>
            <Input
              id="ten_chuong_trinh"
              name="ten_chuong_trinh"
              defaultValue={program?.ten_chuong_trinh}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="mo_ta">Mô tả</Label>
            <Input id="mo_ta" name="mo_ta" defaultValue={program?.mo_ta ?? ""} />
          </div>
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Đang lưu..." : "Lưu"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
