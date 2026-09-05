import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DataRole } from "@/lib/colors";

const ROLE_TOKEN: Record<DataRole, string> = {
  giangVien: "var(--data-giang-vien)",
  troGiang: "var(--data-tro-giang)",
  lopHoc: "var(--data-lop-hoc)",
  dangKy: "var(--data-dang-ky)",
  canhBao: "var(--data-canh-bao)",
  kpi: "var(--data-kpi)",
};

/**
 * The so lieu chuan cua toan bo app (CLAUDE.md muc 3): icon goc tren phai,
 * so lieu lon noi bat duoi nhan. `role` quyet dinh mau — dung dung 1 mau
 * cho 1 loai so lieu, khong tu chon mau khac ngoai bang chinh thuc.
 */
export function StatCard({
  label,
  value,
  icon: Icon,
  role,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  role: DataRole;
  hint?: string;
}) {
  const color = ROLE_TOKEN[role];
  return (
    <Card>
      <CardContent className="flex flex-col gap-2 p-4">
        <div className="flex items-start justify-between">
          <span className="text-sm text-muted-foreground">{label}</span>
          <span
            className={cn("flex h-8 w-8 items-center justify-center rounded-md")}
            style={{ backgroundColor: `color-mix(in oklch, ${color} 16%, transparent)`, color }}
          >
            <Icon className="h-4 w-4" />
          </span>
        </div>
        <div className="text-2xl font-semibold">{value}</div>
        {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
      </CardContent>
    </Card>
  );
}
