import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

  if (role) query = query.eq("role", role);
  if (trang_thai) query = query.eq("trang_thai_hoat_dong", trang_thai === "hoat_dong");
  if (q) query = query.ilike("full_name", `%${q}%`);

  const { data: profiles } = await query;

  return (
    <>
      <PageHeader
        items={[{ label: "Nhân sự" }]}
        actions={current?.role === "admin" ? <AddProfileDialog /> : null}
      />
      <div className="flex flex-col gap-4 p-4 md:p-6">
        <form className="flex flex-wrap items-end gap-2" method="get">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground" htmlFor="q">
              Tìm theo tên
            </label>
            <Input id="q" name="q" defaultValue={q} placeholder="Nhập tên..." className="w-48" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground" htmlFor="role">
              Vai trò
            </label>
            <Select name="role" defaultValue={role ?? "all"}>
              <SelectTrigger id="role" className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả vai trò</SelectItem>
                {Object.entries(ROLE_LABEL).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground" htmlFor="trang_thai">
              Trạng thái
            </label>
            <Select name="trang_thai" defaultValue={trang_thai ?? "all"}>
              <SelectTrigger id="trang_thai" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="hoat_dong">Đang hoạt động</SelectItem>
                <SelectItem value="khoa">Đã khoá</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" variant="outline">
            Lọc
          </Button>
        </form>

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
