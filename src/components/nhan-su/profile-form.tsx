"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROLE_OPTIONS, type Role } from "@/lib/constants/roles";
import { NHOM_PHAN_LOAI_LABEL, NHOM_PHAN_LOAI_VALUES } from "@/lib/constants/nhan-su";

export type ProfileFormValues = {
  full_name: string;
  role: Role;
  email?: string | null;
  hoc_vi: string | null;
  chuc_danh: string | null;
  chuyen_mon: string | null;
  khoa_phong_cong_tac: string | null;
  nhom_phan_loai?: number | null;
};

// Dung chung cho ca 2 ngu canh: tu sua ho so (/ho-so, showRole=false) va
// admin sua nhan su khac (/nhan-su/[id], showRole + showAdminFields=true —
// them email dang nhap + nhom phan loai noi bo).
export function ProfileForm({
  profile,
  showRole = true,
  showAdminFields = false,
  onSubmit,
}: {
  profile: ProfileFormValues;
  showRole?: boolean;
  showAdminFields?: boolean;
  onSubmit: (formData: FormData) => Promise<{ error?: string }>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [role, setRole] = useState<Role>(profile.role);
  const [nhom, setNhom] = useState<string>(profile.nhom_phan_loai ? String(profile.nhom_phan_loai) : "none");

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await onSubmit(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        toast.success("Đã lưu thay đổi");
      }
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="full_name">Họ và tên</Label>
          <Input id="full_name" name="full_name" defaultValue={profile.full_name} required />
        </div>
        {showAdminFields ? (
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email đăng nhập</Label>
            <Input id="email" name="email" type="email" defaultValue={profile.email ?? ""} required />
          </div>
        ) : null}
        {showRole ? (
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
        ) : null}
        <div className="flex flex-col gap-2">
          <Label htmlFor="hoc_vi">Học vị</Label>
          <Input id="hoc_vi" name="hoc_vi" defaultValue={profile.hoc_vi ?? ""} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="chuc_danh">Chức danh</Label>
          <Input id="chuc_danh" name="chuc_danh" defaultValue={profile.chuc_danh ?? ""} />
        </div>
        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="chuyen_mon">Chuyên môn</Label>
          <Input id="chuyen_mon" name="chuyen_mon" defaultValue={profile.chuyen_mon ?? ""} />
        </div>
        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="khoa_phong_cong_tac">Khoa/Phòng công tác</Label>
          <Input
            id="khoa_phong_cong_tac"
            name="khoa_phong_cong_tac"
            defaultValue={profile.khoa_phong_cong_tac ?? ""}
          />
        </div>
        {showAdminFields ? (
          <div className="flex flex-col gap-2">
            <Label htmlFor="nhom_phan_loai">Nhóm phân loại</Label>
            <input type="hidden" name="nhom_phan_loai" value={nhom} />
            <Select value={nhom} onValueChange={(v) => setNhom(v ?? "none")}>
              <SelectTrigger id="nhom_phan_loai">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Chưa phân nhóm</SelectItem>
                {NHOM_PHAN_LOAI_VALUES.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {NHOM_PHAN_LOAI_LABEL[n]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </div>
    </form>
  );
}
