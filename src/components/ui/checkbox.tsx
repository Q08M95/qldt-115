"use client"

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"
import { CheckIcon } from "lucide-react"
import { cn } from "cn"

// Checkbox tuy chinh thay checkbox trinh duyet mac dinh (CLAUDE.md muc 3,
// chot 2026-09-14) — vuong bo goc vua (khong pill, de van nhan dien duoc la
// checkbox), mau primary khi tick. CheckboxPrimitive.Root tu render 1 input
// an ben trong nen van tuong thich FormData/name/value nhu checkbox thuong.
function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "flex size-4 shrink-0 items-center justify-center rounded-md border border-input bg-background transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-checked:border-data-lop-hoc data-checked:bg-data-lop-hoc",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator data-slot="checkbox-indicator" className="flex text-white">
        <CheckIcon className="size-3" strokeWidth={2.5} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
