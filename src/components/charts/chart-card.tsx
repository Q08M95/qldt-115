import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

/**
 * Khung dung chung cho moi bieu do recharts trong app: tieu de, vung filter
 * (neu co), chieu cao co dinh cho ResponsiveContainer, va trang thai rong
 * chuan khi chua co du lieu. Ban than loai bieu do (Line/Bar/Pie...) do
 * agent nghiep vu (vd dashboard-bao-cao) tu chon theo ban chat du lieu —
 * xem CLAUDE.md muc 3. Mau sac lay tu src/lib/colors.ts, khong tu chon mau
 * ngoai bang chinh thuc.
 */
export function ChartCard({
  title,
  filters,
  isEmpty,
  emptyMessage = "Chưa có dữ liệu",
  height = 320,
  children,
}: {
  title: string;
  filters?: React.ReactNode;
  isEmpty?: boolean;
  emptyMessage?: string;
  height?: number;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-base">{title}</CardTitle>
        {filters}
      </CardHeader>
      <CardContent style={{ height }}>
        {isEmpty ? (
          <EmptyState title={emptyMessage} />
        ) : (
          <div className="h-full w-full">{children}</div>
        )}
      </CardContent>
    </Card>
  );
}
