"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TRANG_THAI_LOP_LABEL, DOI_TUONG_HOC_VIEN_LABEL } from "@/lib/constants/lop-hoc";

const TRANG_THAI_FILTER_LABEL: Record<string, string> = {
  all: "Tất cả trạng thái",
  ...TRANG_THAI_LOP_LABEL,
};

const DOI_TUONG_FILTER_LABEL: Record<string, string> = {
  all: "Tất cả đối tượng",
  ...DOI_TUONG_HOC_VIEN_LABEL,
};

export function LopHocFilters({
  trangThai,
  doiTuong,
}: {
  trangThai: string;
  doiTuong: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") params.set(key, value);
    else params.delete(key);
    params.delete("page");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  return (
    <div
      className="flex flex-wrap items-end gap-2 transition-opacity"
      style={{ opacity: isPending ? 0.6 : 1 }}
      aria-busy={isPending}
    >
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground" htmlFor="trang_thai">
          Trạng thái
        </label>
        <Select value={trangThai} onValueChange={(value) => updateParam("trang_thai", value)}>
          <SelectTrigger id="trang_thai" className="w-44">
            <SelectValue>{(value: string) => TRANG_THAI_FILTER_LABEL[value] ?? value}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(TRANG_THAI_FILTER_LABEL).map(([value, label]) => (
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
