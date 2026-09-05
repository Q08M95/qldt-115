import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

/**
 * Trang thai rong chuan cua toan bo app (CLAUDE.md muc 3) — dung khi 1
 * bang/danh sach chua co du lieu, thay vi de trong hoac hien loi.
 */
export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed p-10 text-center">
      <Icon className="h-8 w-8 text-muted-foreground" />
      <p className="text-sm font-medium">{title}</p>
      {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
