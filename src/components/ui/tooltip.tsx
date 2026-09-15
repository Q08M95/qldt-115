"use client"

import * as React from "react"
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"
import { cn } from "cn"

function TooltipProvider(props: TooltipPrimitive.Provider.Props) {
  return <TooltipPrimitive.Provider delay={200} {...props} />
}

// TooltipProvider duoc bao 1 lan duy nhat o RootLayout (khong tu boc rieng o
// day) de dung chung 1 nhom delay cho toan app.
function Tooltip(props: TooltipPrimitive.Root.Props) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />
}

function TooltipTrigger(props: TooltipPrimitive.Trigger.Props) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

function TooltipContent({
  className,
  sideOffset = 8,
  side,
  align,
  children,
}: {
  className?: string
  sideOffset?: number
  side?: TooltipPrimitive.Positioner.Props["side"]
  align?: TooltipPrimitive.Positioner.Props["align"]
  children?: React.ReactNode
}) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner sideOffset={sideOffset} side={side} align={align}>
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cn(
            "z-50 w-fit rounded-xl bg-foreground px-3 py-1.5 text-xs text-background shadow-md transition-opacity data-[ending-style]:opacity-0 data-[starting-style]:opacity-0",
            className,
          )}
        >
          {children}
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
