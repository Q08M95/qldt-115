import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { ProgramDialog } from "@/components/chuong-trinh/program-dialog";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function ChuongTrinhPage() {
  const current = await getCurrentProfile();
  if (current?.role !== "admin" && current?.role !== "quan_ly_dao_tao") {
    redirect("/dashboard");
  }

  const supabase = await createClient();
  const { data: programs } = await supabase
    .from("chuong_trinh_dao_tao")
    .select("id, ten_chuong_trinh, mo_ta")
    .order("ten_chuong_trinh");

  return (
    <>
      <PageHeader
        items={[{ label: "Cấu hình" }, { label: "Chương trình đào tạo" }]}
        actions={<ProgramDialog mode="create" />}
      />
      <div className="flex flex-col gap-4 p-4 md:p-6">
        {!programs || programs.length === 0 ? (
          <EmptyState
            title="Chưa có chương trình đào tạo nào"
            description="Tạo chương trình mẫu để tái sử dụng khi mở lớp học mới."
          />
        ) : (
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên chương trình</TableHead>
                  <TableHead>Mô tả</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {programs.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">
                      <Link href={`/cau-hinh/chuong-trinh/${p.id}`} className="hover:underline">
                        {p.ten_chuong_trinh}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{p.mo_ta ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </>
  );
}
