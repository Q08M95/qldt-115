"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ROLE_LABEL: Record<string, string> = {
  all: "Tất cả vai trò",
  admin: "Quản trị viên",
  quan_ly_dao_tao: "Quản lý đào tạo",
  giang_vien: "Giảng viên",
  tro_giang: "Trợ giảng",
};

const TRANG_THAI_LABEL: Record<string, string> = {
  all: "Tất cả",
  hoat_dong: "Đang hoạt động",
  khoa: "Đã khoá",
};

// Loc tu dong khi doi Select/go chu — khong can bam nut "Loc" rieng, tao
// cam giac phan hoi nhanh hon. Search box debounce 400ms de tranh push URL
// lien tuc theo tung phim go.
export function NhanSuFilters({
  role,
  trangThai,
  q,
}: {
  role: string;
  trangThai: string;
  q: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState(q);

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  useEffect(() => {
    if (searchTerm === q) return;
    const timeout = setTimeout(() => updateParam("q", searchTerm), 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground" htmlFor="q">
          Tìm theo tên
        </label>
        <Input
          id="q"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Nhập tên..."
          className="w-48"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground" htmlFor="role">
          Vai trò
        </label>
        <Select value={role} onValueChange={(value) => updateParam("role", value)}>
          <SelectTrigger id="role" className="w-44">
            <SelectValue>{(value: string) => ROLE_LABEL[value] ?? value}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(ROLE_LABEL).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground" htmlFor="trang_thai">
          Trạng thái
        </label>
        <Select value={trangThai} onValueChange={(value) => updateParam("trang_thai", value)}>
          <SelectTrigger id="trang_thai" className="w-40">
            <SelectValue>{(value: string) => TRANG_THAI_LABEL[value] ?? value}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(TRANG_THAI_LABEL).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
