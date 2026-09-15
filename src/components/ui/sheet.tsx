"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { X } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

// Sheet = Dialog voi popup neo canh + truot, khong phai primitive rieng
// (thietke-giao-dien.md muc 2). Tren mobile dung side="bottom" cao gan het
// man hinh cho form them/sua (thietke-giao-dien.md muc 3.1).
function Sheet(props: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger(props: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose(props: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="sheet-close" {...props} />
}

const sheetVariants = cva(
  "fixed z-50 flex flex-col gap-4 border-border bg-card p-6 shadow-lg transition-transform",
  {
    variants: {
      side: {
        right:
          "inset-y-0 right-0 h-full w-3/4 max-w-sm rounded-l-2xl border-l data-[ending-style]:translate-x-full data-[starting-style]:translate-x-full",
        left: "inset-y-0 left-0 h-full w-3/4 max-w-sm rounded-r-2xl border-r data-[ending-style]:-translate-x-full data-[starting-style]:-translate-x-full",
        bottom:
          "inset-x-0 bottom-0 max-h-[92vh] rounded-t-2xl border-t data-[ending-style]:translate-y-full data-[starting-style]:translate-y-full",
        top: "inset-x-0 top-0 max-h-[92vh] rounded-b-2xl border-b data-[ending-style]:-translate-y-full data-[starting-style]:-translate-y-full",
      },
    },
    defaultVariants: { side: "right" },
  },
)

function SheetContent({
  className,
  side,
  children,
  showClose = true,
  ...props
}: DialogPrimitive.Popup.Props & VariantProps<typeof sheetVariants> & { showClose?: boolean }) {
  return (
    <DialogPrimitive.Portal data-slot="sheet-portal">
      <DialogPrimitive.Backdrop
        data-slot="sheet-backdrop"
        className="fixed inset-0 z-50 bg-black/40 transition-opacity data-[ending-style]:opacity-0 data-[starting-style]:opacity-0"
      />
      <DialogPrimitive.Popup
        data-slot="sheet-content"
        className={cn(sheetVariants({ side }), className)}
        {...props}
      >
        {children}
        {showClose ? (
          <DialogPrimitive.Close className="absolute top-4 right-4 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <X className="size-4" strokeWidth={1.5} />
            <span className="sr-only">Đóng</span>
          </DialogPrimitive.Close>
        ) : null}
      </DialogPrimitive.Popup>
    </DialogPrimitive.Portal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sheet-header" className={cn("flex flex-col gap-1.5", className)} {...props} />
}

function SheetTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title data-slot="sheet-title" className={cn("text-lg font-semibold", className)} {...props} />
  )
}

function SheetDescription({ className, ...props }: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetDescription }
