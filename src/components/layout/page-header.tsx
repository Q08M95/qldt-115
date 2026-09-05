import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export type BreadcrumbItemDef = {
  label: string;
  href?: string;
};

/**
 * Dung o dau moi trang nghiep vu de hien breadcrumb ngu canh (CLAUDE.md muc
 * 3). Vi du: <PageHeader items={[{label: "Đào tạo"}, {label: "Cấp cứu cơ bản K12", href: "/lop-hoc/123"}, {label: "Đăng ký"}]} />
 */
export function PageHeader({
  items,
  actions,
}: {
  items: BreadcrumbItemDef[];
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-background px-4 py-3 md:px-6">
      <Breadcrumb>
        <BreadcrumbList>
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <span key={`${item.label}-${index}`} className="flex items-center gap-1.5">
                <BreadcrumbItem>
                  {isLast || !item.href ? (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </span>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
