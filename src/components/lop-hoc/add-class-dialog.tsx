"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClassFormFields } from "./class-form-fields";
import { createLopHoc } from "@/app/(app)/lop-hoc/actions";

type Program = { id: string; ten_chuong_trinh: string };
type Profile = { id: string; full_name: string };

export function AddClassDialog({
  programs,
  profiles,
}: {
  programs: Program[];
  profiles: Profile[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createLopHoc(formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      toast.success("Đã tạo lớp học");
      if (result.id) router.push(`/lop-hoc/${result.id}`);
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
        Thêm lớp học
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Thêm lớp học mới</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          {programs.length > 0 ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor="chuong_trinh_id">Chương trình mẫu (tuỳ chọn)</Label>
              <Select name="chuong_trinh_id" defaultValue="none">
                <SelectTrigger id="chuong_trinh_id">
                  <SelectValue>
                    {(value: string) =>
                      value === "none"
                        ? "Không dùng — tạo lớp trống"
                        : programs.find((p) => p.id === value)?.ten_chuong_trinh
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không dùng — tạo lớp trống</SelectItem>
                  {programs.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.ten_chuong_trinh}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Nếu chọn, toàn bộ bài giảng mẫu sẽ được copy thành bài giảng riêng của lớp này —
                sửa/xoá sau đó không ảnh hưởng chương trình mẫu.
              </p>
            </div>
          ) : null}

          <ClassFormFields profiles={profiles} />

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Đang tạo..." : "Tạo lớp học"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
