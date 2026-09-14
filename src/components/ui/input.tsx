import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "cn"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        // Bo goc lon (khong dung pill hoan toan — o giao dien day form/luoi
        // nhieu o nhap, pill lam ro rui, xem CLAUDE.md muc 3.1) + nen hoi
        // trong nhung van du tuong phan de nhap lieu.
        "h-8 w-full min-w-0 rounded-2xl border border-white/60 bg-white/70 px-3 py-1 text-base shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] backdrop-blur-md transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:border-white/10 dark:bg-white/[0.05] dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }
