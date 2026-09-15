import * as React from "react"
import { cn } from "cn"

// action: dung CTA "Tao moi" khi rong vi chua co du lieu goc, hoac "Xoa bo
// loc" khi rong vi tim kiem/loc khong khop — khong dung chung 1 kieu
// (thietke-giao-dien.md muc 4, pattern "Empty state co hanh dong").
export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border p-10 text-center",
        className,
      )}
    >
      <p className="text-sm font-medium">{title}</p>
      {description ? <p className="max-w-sm text-sm text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  )
}
