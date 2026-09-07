"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createProfile } from "@/app/(app)/nhan-su/actions";

const ROLE_OPTIONS = [
  { value: "giang_vien", label: "Giảng viên" },
  { value: "tro_giang", label: "Trợ giảng" },
  { value: "quan_ly_dao_tao", label: "Quản lý đào tạo" },
  { value: "admin", label: "Quản trị viên" },
];

export function AddProfileDialog() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createProfile(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setOpen(false);
      }
    });
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) setError(null);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button size="sm" />}>
        <Plus className="h-4 w-4" />
        Thêm nhân sự
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thêm nhân sự mới</DialogTitle>
          <DialogDescription>
            Tài khoản được tạo ngay lập tức. Nhân sự dùng &quot;Quên mật khẩu&quot; ở trang đăng
            nhập với đúng email này để tự đặt mật khẩu lần đầu.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="full_name">Họ và tên</Label>
            <Input id="full_name" name="full_name" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="role">Vai trò</Label>
            <Select name="role" defaultValue="tro_giang">
              <SelectTrigger id="role">
                <SelectValue>
                  {(value: string) => ROLE_OPTIONS.find((r) => r.value === value)?.label ?? value}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="hoc_vi">Học vị</Label>
            <Input id="hoc_vi" name="hoc_vi" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="chuyen_mon">Chuyên môn</Label>
            <Input id="chuyen_mon" name="chuyen_mon" />
          </div>
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Đang tạo..." : "Tạo tài khoản"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
