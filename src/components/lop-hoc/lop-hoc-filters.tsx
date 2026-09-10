"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Filter, ListFilter, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DOI_TUONG_HOC_VIEN_LABEL, LOAI_LOP_VALUES } from "@/lib/constants/lop-hoc";

const DOI_TUONG_FILTER_LABEL: Record<string, string> = {
  all: "Tất cả đối tượng",
  ...DOI_TUONG_HOC_VIEN_LABEL,
};

// Bo filter "Trang thai" — danh sach lop hoc gio da nhom san theo 3 nhom
// trang thai (tab tren mobile / cot tren desktop, xem lop-hoc/page.tsx),
// filter rieng se trung lap. "Loai lop" gom vao 1 dropdown checkbox (thay vi
// hang chip de rot dong tren man hinh hep) va "Doi tuong" gom vao nut loc
// nang cao (icon pheu) — theo yeu cau nguoi dung 2026-09-10 ve gon gang hoa
// thanh loc.
export function LopHocFilters({
  q,
  loai,
  doiTuong,
}: {
  q: string;
  loai: string[];
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

  function toggleLoai(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    const next = loai.includes(value) ? loai.filter((v) => v !== value) : [...loai, value];
    if (next.length > 0) params.set("loai", next.join(","));
    else params.delete("loai");
    pushParams(params);
  }

  useEffect(() => {
    if (searchTerm === q) return;
    const timeout = setTimeout(() => updateParam("q", searchTerm), 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const soLuongFilterNangCao = doiTuong !== "all" ? 1 : 0;

  return (
    <div
      className="flex items-center gap-2 transition-opacity"
      style={{ opacity: isPending ? 0.6 : 1 }}
      aria-busy={isPending}
    >
      <div className="relative flex-1 min-w-0 max-w-xs">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm theo tên lớp..."
          className="pl-8"
          aria-label="Tìm theo tên lớp"
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="outline" size="default" />}
        >
          <ListFilter className="h-4 w-4" />
          Loại lớp
          {loai.length > 0 ? (
            <span className="ml-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[0.65rem] text-primary-foreground">
              {loai.length}
            </span>
          ) : null}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Lọc theo loại lớp</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {LOAI_LOP_VALUES.map((v) => (
            <DropdownMenuCheckboxItem
              key={v}
              checked={loai.includes(v)}
              onCheckedChange={() => toggleLoai(v)}
              closeOnClick={false}
            >
              {v}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="outline" size="icon" aria-label="Lọc nâng cao" className="relative" />}
        >
          <Filter className="h-4 w-4" />
          {soLuongFilterNangCao > 0 ? (
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[0.6rem] text-primary-foreground">
              {soLuongFilterNangCao}
            </span>
          ) : null}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-48">
          <DropdownMenuLabel>Đối tượng học viên</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={doiTuong}
            onValueChange={(value) => updateParam("doi_tuong", value as string)}
          >
            {Object.entries(DOI_TUONG_FILTER_LABEL).map(([value, label]) => (
              <DropdownMenuRadioItem key={value} value={value}>
                {label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {isPending ? <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" /> : null}
    </div>
  );
}
