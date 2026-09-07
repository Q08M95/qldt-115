import { Skeleton } from "@/components/ui/skeleton";

// Hien ngay khi chuyen trang trong khi Server Component dang fetch du lieu —
// giam cam giac "delay/khong phan hoi" so voi man hinh trang hoan toan.
export default function AppLoading() {
  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
    </div>
  );
}
