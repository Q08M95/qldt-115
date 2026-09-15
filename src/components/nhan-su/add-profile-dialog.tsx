"use client";

import { useState, useTransition } from "react";
import { UserPlus } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROLE_OPTIONS, type Role } from "@/lib/constants/roles";
import { createProfile } from "@/app/(app)/nhan-su/actions";

// 2 trigger cung tro vao 1 Dialog: nut chu tren desktop (trong PageHeader),
// FAB tron o mobile (thietke-giao-dien.md muc 3.1 — hanh dong tao moi = FAB
// tren man hinh danh sach).
export function AddProfileDialog() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<Role>("tro_giang");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createProfile(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      toast.success("Đã thêm nhân sự");
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" className="hidden md:inline-flex" />}>
        <UserPlus className="size-4" strokeWidth={1.5} />
        Thêm nhân sự
      </DialogTrigger>
      <DialogTrigger
        render={
          <button
            type="button"
            aria-label="Thêm nhân sự"
            className="fixed right-4 bottom-20 z-30 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg md:hidden"
          />
        }
      >
        <UserPlus className="size-5" strokeWidth={1.5} />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thêm nhân sự mới</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="full_name">Họ và tên</Label>
            <Input id="full_name" name="full_name" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email đăng nhập</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="role">Vai trò</Label>
            <input type="hidden" name="role" value={role} />
            <Select value={role} onValueChange={(v) => v && setRole(v as Role)}>
              <SelectTrigger id="role">
                <SelectValue />
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
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Đang tạo..." : "Tạo nhân sự"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
