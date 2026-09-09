"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
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
import { updateProfileEmail } from "@/app/(app)/nhan-su/actions";

// Sua email dang nhap that cho nhan su (vd ho so nhap tu du lieu Excel dang
// dung email noi bo tam, gio co email that cua nguoi do). Sau khi doi, he
// thong tu gui luon email "dat mat khau lan dau" toi dia chi moi.
export function EditEmailDialog({
  profileId,
  currentEmail,
}: {
  profileId: string;
  currentEmail: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await updateProfileEmail(profileId, formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setOpen(false);
        toast.success("Đã cập nhật email và gửi email đặt mật khẩu lần đầu");
      }
    });
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) setError(null);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <Pencil className="h-4 w-4" />
        Sửa email
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sửa email đăng nhập</DialogTitle>
          <DialogDescription>
            Đổi sang email thật của nhân sự này. Hệ thống sẽ tự gửi email &quot;đặt mật khẩu lần
            đầu&quot; đến địa chỉ mới ngay sau khi lưu.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email mới</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              defaultValue={currentEmail ?? ""}
            />
          </div>
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Đang lưu..." : "Lưu và gửi email"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
