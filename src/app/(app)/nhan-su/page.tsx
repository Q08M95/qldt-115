import Link from "next/link";
import { Badge } from "@/components/ui/badge";
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
import { AddProfileDialog } from "@/components/nhan-su/add-profile-dialog";
import { NhanSuFilters } from "@/components/nhan-su/nhan-su-filters";
import { ToggleActiveButton } from "@/components/nhan-su/toggle-active-button";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const ROLE_LABEL: Record<string, string> = {
  admin: "Quản trị viên",
  quan_ly_dao_tao: "Quản lý đào tạo",
  giang_vien: "Giảng viên",
  tro_giang: "Trợ giảng",
};

export default async function NhanSuPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; trang_thai?: string; q?: string }>;
}) {
  const { role, trang_thai, q } = await searchParams;
  const current = await getCurrentProfile();
  const canManage = current?.role === "admin" || current?.role === "quan_ly_dao_tao";

  const supabase = await createClient();
  let query = supabase
    .from("profiles")
    .select("id, full_name, role, hoc_vi, chuyen_mon, trang_thai_hoat_dong")
    .order("full_name");

  if (role && role !== "all") query = query.eq("role", role);
  if (trang_thai && trang_thai !== "all") {
    query = query.eq("trang_thai_hoat_dong", trang_thai === "hoat_dong");
  }
  if (q) query = query.ilike("full_name", `%${q}%`);

  const { data: profiles } = await query;

  return (
    <>
      <PageHeader
        items={[{ label: "Nhân sự" }]}
        actions={current?.role === "admin" ? <AddProfileDialog /> : null}
      />
      <div className="flex flex-col gap-4 p-4 md:p-6">
        <NhanSuFilters role={role ?? "all"} trangThai={trang_thai ?? "all"} q={q ?? ""} />

        {!profiles || profiles.length === 0 ? (
          <EmptyState title="Chưa có nhân sự phù hợp bộ lọc" />
        ) : (
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Họ và tên</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Học vị</TableHead>
                  <TableHead>Chuyên môn</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">
                      <Link href={`/nhan-su/${p.id}`} className="hover:underline">
                        {p.full_name}
                      </Link>
                    </TableCell>
                    <TableCell>{ROLE_LABEL[p.role] ?? p.role}</TableCell>
                    <TableCell>{p.hoc_vi ?? "—"}</TableCell>
                    <TableCell>{p.chuyen_mon ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={p.trang_thai_hoat_dong ? "default" : "secondary"}>
                        {p.trang_thai_hoat_dong ? "Đang hoạt động" : "Đã khoá"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {canManage ? (
                        <ToggleActiveButton id={p.id} active={p.trang_thai_hoat_dong} />
                      ) : null}
                    </TableCell>
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
