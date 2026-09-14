"use client";

import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PersonAvatar } from "@/components/nhan-su/person-avatar";
import { TuChoiDialog } from "@/components/lop-hoc/tu-choi-dialog";
import { duyetDangKy } from "@/app/(app)/lop-hoc/[id]/dang-ky-actions";
import { ROLE_LABEL, type Role } from "@/lib/constants/roles";

export type ChoDuyetItem = {
  id: string;
  lop_hoc_id: string;
  profile_id: string;
  vai_tro: "giang_vien" | "tro_giang";
};

// Hop thu cho duyet tong hop MOI lop hoc, dat tren dau /lop-hoc — theo phan
// hoi nguoi dung 2026-09-14: quan ly truoc do phai tu vao tung lop rieng le
// moi biet co dang ky nao cho duyet, gay cam giac "nhay qua nhay lai". O day
// chi hien gon (ten, vai tro, lop nao) + Duyet/Tu choi ngay, xem day du hon
// (hoc vi/chuyen mon qua Sheet) thi bam "Xem lop" sang tab Dang ky & Duyet.
export function ChoDuyetPanel({
  items,
  lopTenMap,
  profileMap,
}: {
  items: ChoDuyetItem[];
  lopTenMap: Map<string, string>;
  profileMap: Map<string, { full_name: string; role: Role }>;
}) {
  const [isPending, startTransition] = useTransition();

  function handleDuyet(id: string, lopHocId: string) {
    startTransition(async () => {
      const result = await duyetDangKy(id, lopHocId);
      if (result?.error) toast.error(result.error);
      else toast.success("Đã duyệt đăng ký");
    });
  }

  if (items.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-[28px] border border-dashed border-foreground/15 p-3 text-sm text-muted-foreground">
        Không có đăng ký giảng dạy nào đang chờ duyệt.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-4xl border border-data-canh-bao/30 bg-data-canh-bao/8 p-4 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-data-canh-bao" />
        <h2 className="text-sm font-medium">Cần duyệt ({items.length})</h2>
      </div>
      <div className="flex flex-col divide-y">
        {items.map((item) => {
          const nguoi = profileMap.get(item.profile_id);
          const tenLop = lopTenMap.get(item.lop_hoc_id) ?? "—";
          return (
            <div
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-2 py-2 first:pt-0 last:pb-0"
            >
              <div className="flex items-center gap-2">
                <PersonAvatar
                  fullName={nguoi?.full_name ?? "?"}
                  role={nguoi?.role ?? item.vai_tro}
                  size="sm"
                />
                <span className="text-sm">
                  <span className="font-medium">{nguoi?.full_name ?? "—"}</span>{" "}
                  <span className="text-muted-foreground">
                    ({ROLE_LABEL[nguoi?.role ?? item.vai_tro]})
                  </span>{" "}
                  muốn dạy{" "}
                  <Link href={`/lop-hoc/${item.lop_hoc_id}`} className="font-medium hover:underline">
                    {tenLop}
                  </Link>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" disabled={isPending} onClick={() => handleDuyet(item.id, item.lop_hoc_id)}>
                  Duyệt
                </Button>
                <TuChoiDialog id={item.id} lopHocId={item.lop_hoc_id} />
                <Button size="sm" variant="outline" render={<Link href={`/lop-hoc/${item.lop_hoc_id}`} />}>
                  Xem lớp
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
