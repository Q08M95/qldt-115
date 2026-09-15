"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

// Chi con 1 o tim kiem duy nhat (bo Vai tro/Trang thai/Nhom phan loai theo
// yeu cau nguoi dung 2026-09-15 — cac o loc rieng khong can thiet nua,
// mauthietke.png cung chi dung 1 o search). Debounce 400ms tranh push URL
// lien tuc theo tung phim go.
export function NhanSuFilters({ q }: { q: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState(q);

  useEffect(() => {
    if (searchTerm === q) return;
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchTerm) params.set("q", searchTerm);
      else params.delete("q");
      params.delete("page");
      params.delete("xem");
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    }, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  return (
    <div className="relative flex-1" aria-busy={isPending}>
      <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
      <Input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Tìm theo tên..."
        className="pl-9"
      />
      {isPending ? (
        <Loader2 className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" strokeWidth={1.5} />
      ) : null}
    </div>
  );
}
