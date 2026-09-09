"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLE_OPTIONS } from "@/lib/constants/roles";
import { NHOM_PHAN_LOAI_VALUES, NHOM_PHAN_LOAI_LABEL } from "@/lib/constants/nhan-su";

export type EditableProfile = {
  full_name: string;
  role: string;
  hoc_vi: string | null;
  chuc_danh: string | null;
  chuyen_mon: string | null;
  don_vi_cong_tac: string | null;
  so_dien_thoai: string | null;
  ngay_vao_lam: string | null;
  nhom_phan_loai?: number | null;
};

/**
 * Form sua ho so dung chung cho 2 noi: admin sua ho so nguoi khac (showRole
 * = true, goi qua onSubmit rieng) va tu sua ho so ca nhan o /ho-so (showRole
 * = false). Ca 2 noi deu truyen server action rieng qua prop `onSubmit`.
 */
export function ProfileForm({
  profile,
  showRole,
  onSubmit,
}: {
  profile: EditableProfile;
  showRole: boolean;
  onSubmit: (formData: FormData) => Promise<{ error?: string } | void>;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await onSubmit(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        toast.success("Đã lưu hồ sơ.");
      }
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4 max-w-lg">
      <div className="flex flex-col gap-2">
        <Label htmlFor="full_name">Họ và tên</Label>
        <Input id="full_name" name="full_name" defaultValue={profile.full_name} required />
      </div>

      {showRole ? (
        <div className="flex flex-col gap-2">
          <Label htmlFor="role">Vai trò</Label>
          <Select name="role" defaultValue={profile.role}>
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
      ) : null}

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="hoc_vi">Học vị</Label>
          <Input id="hoc_vi" name="hoc_vi" defaultValue={profile.hoc_vi ?? ""} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="chuc_danh">Chức danh</Label>
          <Input id="chuc_danh" name="chuc_danh" defaultValue={profile.chuc_danh ?? ""} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="chuyen_mon">Chuyên môn</Label>
        <Input id="chuyen_mon" name="chuyen_mon" defaultValue={profile.chuyen_mon ?? ""} />
      </div>

      {showRole ? (
        <div className="flex flex-col gap-2">
          <Label htmlFor="nhom_phan_loai">Nhóm phân loại nội bộ</Label>
          <Select
            name="nhom_phan_loai"
            defaultValue={profile.nhom_phan_loai ? String(profile.nhom_phan_loai) : "none"}
          >
            <SelectTrigger id="nhom_phan_loai">
              <SelectValue>
                {(value: string) =>
                  value === "none"
                    ? "Chưa phân nhóm"
                    : NHOM_PHAN_LOAI_LABEL[Number(value) as 1 | 2 | 3 | 4 | 5]
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Chưa phân nhóm</SelectItem>
              {NHOM_PHAN_LOAI_VALUES.map((v) => (
                <SelectItem key={v} value={String(v)}>
                  {NHOM_PHAN_LOAI_LABEL[v]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Chỉ admin và quản lý đào tạo nhìn thấy trường này.
          </p>
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor="don_vi_cong_tac">Đơn vị công tác</Label>
        <Input
          id="don_vi_cong_tac"
          name="don_vi_cong_tac"
          defaultValue={profile.don_vi_cong_tac ?? ""}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="so_dien_thoai">Số điện thoại</Label>
          <Input
            id="so_dien_thoai"
            name="so_dien_thoai"
            defaultValue={profile.so_dien_thoai ?? ""}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="ngay_vao_lam">Ngày vào làm</Label>
          <Input
            id="ngay_vao_lam"
            name="ngay_vao_lam"
            type="date"
            defaultValue={profile.ngay_vao_lam ?? ""}
          />
        </div>
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Đang lưu..." : "Lưu thay đổi"}
      </Button>
    </form>
  );
}
