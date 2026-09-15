"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Loader2, Search } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { globalSearch, type GlobalSearchResult } from "@/app/(app)/actions";

// Tim kiem toan cuc o header — mo tu bat ky trang nao (icon/nut header
// hoac phim tat Ctrl/Cmd K), tim xuyen Nhan su + Lop hoc, dan thang den
// trang chi tiet tuong ung (thietke-giao-dien.md muc 2/3).
export function GlobalSearch({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<GlobalSearchResult | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    // Khong setState dong bo o day khi rong — man hinh rong da tu che bang
    // dieu kien !q.trim() trong JSX ben duoi, khong can dat lai `results`.
    if (!open || !q.trim()) return;
    const timeout = setTimeout(() => {
      startTransition(async () => {
        setResults(await globalSearch(q));
      });
    }, 300);
    return () => clearTimeout(timeout);
  }, [q, open]);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQ("");
      }}
    >
      <DialogTrigger
        render={
          compact ? (
            <button
              type="button"
              className="flex size-9 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-muted"
            />
          ) : (
            <button
              type="button"
              className="flex h-9 w-56 items-center gap-2 rounded-full border border-input bg-transparent px-3 text-sm text-muted-foreground transition-colors hover:bg-muted lg:w-72"
            />
          )
        }
      >
        {compact ? (
          <Search className="size-[18px]" strokeWidth={1.5} />
        ) : (
          <>
            <Search className="size-4" strokeWidth={1.5} />
            Tìm kiếm...
            <kbd className="ml-auto rounded border border-border px-1.5 py-0.5 text-[10px]">Ctrl K</kbd>
          </>
        )}
      </DialogTrigger>
      <DialogContent className="top-[18%] max-w-lg translate-y-0 gap-0 p-0" showClose={false}>
        <DialogTitle className="sr-only">Tìm kiếm</DialogTitle>
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Search className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
          <Input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm nhân sự, lớp học..."
            className="h-8 border-none px-0 shadow-none focus-visible:ring-0"
          />
          {isPending ? <Loader2 className="size-4 animate-spin text-muted-foreground" strokeWidth={1.5} /> : null}
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {!q.trim() ? (
            <p className="p-4 text-center text-sm text-muted-foreground">Nhập tên nhân sự hoặc lớp học...</p>
          ) : results && results.profiles.length === 0 && results.classes.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">Không tìm thấy kết quả</p>
          ) : (
            <>
              {results && results.profiles.length > 0 ? (
                <div className="flex flex-col gap-0.5">
                  <p className="px-2 py-1 text-xs text-muted-foreground">Nhân sự</p>
                  {results.profiles.map((p) => (
                    <Link
                      key={p.id}
                      href={`/nhan-su?xem=${p.id}`}
                      onClick={() => setOpen(false)}
                      className="rounded-xl px-2 py-1.5 text-sm hover:bg-muted"
                    >
                      {p.full_name}
                    </Link>
                  ))}
                </div>
              ) : null}
              {results && results.classes.length > 0 ? (
                <div className="flex flex-col gap-0.5">
                  <p className="px-2 py-1 text-xs text-muted-foreground">Lớp học</p>
                  {results.classes.map((c) => (
                    <Link
                      key={c.id}
                      href={`/lop-hoc/${c.id}`}
                      onClick={() => setOpen(false)}
                      className="rounded-xl px-2 py-1.5 text-sm hover:bg-muted"
                    >
                      {c.ten_lop}
                    </Link>
                  ))}
                </div>
              ) : null}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
