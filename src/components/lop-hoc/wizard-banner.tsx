"use client";

import { useRouter, usePathname } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Buoc 2/2 cua luong tao lop (xem tao-lop-form.tsx) — hien tren dau trang
// chi tiet lop khi den tu ?wizard=step2, dan dat nguoi dung them buoi/bai
// giang ngay tai tab "Bai giang" (da la tab mac dinh, khong can doi gi
// them) roi bam Hoan tat de thoat che do wizard (chi la bo query param,
// khong xoa/khoa gi ca — van sua lai binh thuong sau do).
export function WizardBanner({ tenLop }: { tenLop: string }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-data-lop-hoc/30 bg-data-lop-hoc/5 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-data-lop-hoc text-sm font-semibold text-white">
          2
        </span>
        <div>
          <p className="text-sm font-medium">
            Bước 2/2 — Thêm buổi giảng &amp; bài giảng cho &quot;{tenLop}&quot;
          </p>
          <p className="text-xs text-muted-foreground">
            Dùng các nút bên dưới để thêm — bấm &quot;Hoàn tất&quot; khi xong, vẫn có thể quay lại
            chỉnh sửa bất kỳ lúc nào sau đó.
          </p>
        </div>
      </div>
      <Button size="sm" className="shrink-0" onClick={() => router.push(pathname)}>
        <CheckCircle2 className="h-4 w-4" />
        Hoàn tất thiết lập
      </Button>
    </div>
  );
}
