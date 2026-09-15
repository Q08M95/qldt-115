import * as React from "react"
import { ChevronRight } from "lucide-react"
import { useRender } from "@base-ui/react/use-render"
import { cn } from "cn"

function Breadcrumb({ className, ...props }: React.ComponentProps<"nav">) {
  return <nav aria-label="breadcrumb" data-slot="breadcrumb" className={cn(className)} {...props} />
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn("flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li data-slot="breadcrumb-item" className={cn("flex items-center gap-1.5", className)} {...props} />
}

// Ho tro `render` de compose voi next/link, giong quy uoc dung chung cua
// du an (vd `Button render={<Link href=".."/>}`) — xem thietke-giao-dien.md.
function BreadcrumbLink({
  className,
  render = <a />,
  ...props
}: useRender.ComponentProps<"a">) {
  return useRender({
    render,
    props: {
      ...props,
      "data-slot": "breadcrumb-link",
      className: cn("transition-colors hover:text-foreground", className),
    },
  })
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-page"
      aria-current="page"
      className={cn("font-medium text-foreground", className)}
      {...props}
    />
  )
}

function BreadcrumbSeparator({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li data-slot="breadcrumb-separator" role="presentation" className={cn("[&>svg]:size-3.5", className)} {...props}>
      <ChevronRight strokeWidth={1.5} />
    </li>
  )
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
}
