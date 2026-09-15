"use client"

import * as React from "react"
import { Toaster as SonnerToaster } from "sonner"

function Toaster(props: React.ComponentProps<typeof SonnerToaster>) {
  return (
    <SonnerToaster
      toastOptions={{
        classNames: {
          toast: "rounded-2xl! border! border-border! bg-card! text-foreground! shadow-lg!",
          description: "text-muted-foreground!",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
