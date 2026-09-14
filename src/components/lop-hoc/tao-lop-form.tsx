"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClassFormFields, type ClassFormProfile } from "./class-form-fields";
import { createLopHoc } from "@/app/(app)/lop-hoc/actions";

type Program = { id: string; ten_chuong_trinh: string };

// Buoc 1/2 cua luong tao lop hoc (theo phan hoi nguoi dung 2026-09-14: tao
// lop truoc day la 1 dialog roi ep nguoi dung tu di tim nut them buoi/bai o
// trang khac, gay cam giac "nhay qua nhay lai"). Sau khi tao xong, dieu
// huong sang trang chi tiet lop voi ?wizard=step2 de hien WizardBanner —
// buoc 2 tai su dung nguyen ven tab "Bai giang" da co san (BuoiGiangList/
// BaiGiangDialog...), khong dung lai tu dau.
function StepIndicator() {
  return (
    <ol className="flex items-center gap-2 text-sm">
      <li className="flex items-center gap-2 font-medium text-data-lop-hoc">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-data-lop-hoc text-xs text-white">
          1
        </span>
        Thông tin lớp
      </li>
      <li className="h-px w-8 bg-border" />
      <li className="flex items-center gap-2 text-muted-foreground">
        <span className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-xs">
          2
        </span>
        Buổi & bài giảng
      </li>
    </ol>
  );
}

export function TaoLopForm({
  programs,
  profiles,
}: {
  programs: Program[];
  profiles: ClassFormProfile[];
}) {
  const router = useRouter();
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
      toast.success("Đã tạo lớp — tiếp tục thêm buổi/bài giảng");
      if (result.id) router.push(`/lop-hoc/${result.id}?wizard=step2`);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <StepIndicator />

      <form action={handleSubmit} className="flex max-w-lg flex-col gap-4">
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
              sửa/xoá sau đó không ảnh hưởng chương trình mẫu. Bạn vẫn có thể thêm/sửa bài giảng ở
              bước tiếp theo.
            </p>
          </div>
        ) : null}

        <ClassFormFields profiles={profiles} />

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <Button type="submit" disabled={isPending} className="self-start">
          {isPending ? "Đang tạo..." : "Tiếp tục"}
        </Button>
      </form>
    </div>
  );
}
