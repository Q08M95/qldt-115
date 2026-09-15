import * as React from "react"
import { cn } from "cn"
import { SURFACE_CARD } from "@/lib/design/surface"

// Du phong cho Dashboard/KPI (Giai doan 9, chua co trang dung that) —
// thietke-giao-dien.md muc 5.2.
export function StatCard({
  label,
  value,
  icon: Icon,
  tintClassName,
  className,
}: {
  label: string
  value: React.ReactNode
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>
  tintClassName?: string
  className?: string
}) {
  return (
    <div className={cn("relative flex flex-col gap-1 rounded-2xl p-4", SURFACE_CARD, tintClassName, className)}>
      {Icon ? <Icon className="absolute top-4 right-4 size-5 text-muted-foreground" strokeWidth={1.5} /> : null}
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-2xl font-semibold">{value}</span>
    </div>
  )
}
