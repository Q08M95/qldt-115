"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

// Error boundary o cap (app) group: khi 1 trang con loi, Sidebar/Header
// (dinh nghia o layout.tsx cung cap) VAN GIU NGUYEN, chi phan noi dung loi —
// dam bao nguoi dung luon con duong dang xuat/dieu huong ngay ca khi 1 trang
// cu the bi loi.
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-10 text-center">
      <p className="text-lg font-medium">Đã có lỗi xảy ra khi tải trang này</p>
      <p className="text-sm text-muted-foreground">
        Vui lòng thử lại. Nếu lỗi tiếp diễn, báo lại cho quản trị viên.
      </p>
      <Button onClick={() => reset()}>Thử lại</Button>
    </div>
  );
}
