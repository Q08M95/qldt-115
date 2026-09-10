"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DOI_TUONG_HOC_VIEN_LABEL, LOAI_LOP_VALUES } from "@/lib/constants/lop-hoc";

const DOI_TUONG_FILTER_LABEL: Record<string, string> = {
  all: "Tất cả đối tượng",
  ...DOI_TUONG_HOC_VIEN_LABEL,
};

const LOAI_LOP_FILTER_LABEL: Record<string, string> = {
  all: "Tất cả loại lớp",
  ...Object.fromEntries(LOAI_LOP_VALUES.map((v) => [v, v])),
};

// Bo filter "Trang thai" — danh sach lop hoc gio da nhom san theo 3 cot
// trang thai (xem lop-hoc/page.tsx), filter rieng se trung lap. "Loai lop"
// dung Select 1 gia tri, cung kieu voi "Doi tuong" (theo yeu cau nguoi dung
// 2026-09-10 — truoc do thu qua toggle chip roi dropdown checkbox, ca 2 deu
// bi phan hoi khong on, quay ve dang Select don gian nhu "Doi tuong").
export function LopHocFilters({
  q,
  loai,
  doiTuong,
}: {
  q: string;
  loai: string;
  doiTuong: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState(q);

  function pushParams(params: URLSearchParams) {
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") params.set(key, value);
    else params.delete(key);
    pushParams(params);
  }

  useEffect(() => {
    if (searchTerm === q) return;
    const timeout = setTimeout(() => updateParam("q", searchTerm), 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  return (
    <div
      className="flex flex-wrap items-end gap-2 transition-opacity"
      style={{ opacity: isPending ? 0.6 : 1 }}
      aria-busy={isPending}
    >
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground" htmlFor="q">
          Tìm theo tên
        </label>
        <Input
          id="q"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Nhập tên lớp..."
          className="w-56"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground" htmlFor="loai_lop">
          Loại lớp
        </label>
        <Select value={loai} onValueChange={(value) => updateParam("loai", value)}>
          <SelectTrigger id="loai_lop" className="w-44">
            <SelectValue>{(value: string) => LOAI_LOP_FILTER_LABEL[value] ?? value}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(LOAI_LOP_FILTER_LABEL).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground" htmlFor="doi_tuong">
          Đối tượng
        </label>
        <Select value={doiTuong} onValueChange={(value) => updateParam("doi_tuong", value)}>
          <SelectTrigger id="doi_tuong" className="w-44">
            <SelectValue>{(value: string) => DOI_TUONG_FILTER_LABEL[value] ?? value}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(DOI_TUONG_FILTER_LABEL).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {isPending ? <Loader2 className="mb-2 h-4 w-4 animate-spin text-muted-foreground" /> : null}
    </div>
  );
}
