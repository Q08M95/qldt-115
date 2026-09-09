"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { MauBaiGiangDialog, type MauBaiGiang } from "./mau-bai-giang-dialog";
import { deleteMauBaiGiang } from "@/app/(app)/cau-hinh/chuong-trinh/[id]/actions";

export function MauBaiGiangList({
  chuongTrinhId,
  items,
  canEdit,
}: {
  chuongTrinhId: string;
  items: MauBaiGiang[];
  canEdit: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string) {
    if (!window.confirm("Xoá bài giảng mẫu này? Không thể hoàn tác.")) return;
    startTransition(async () => {
      const result = await deleteMauBaiGiang(id, chuongTrinhId);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Đã xoá bài giảng mẫu");
      }
    });
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="Chưa có bài giảng mẫu nào"
        description="Thêm bài giảng để có sẵn nội dung copy khi mở lớp học mới — dùng nút Thêm bài giảng ở trên."
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14">TT</TableHead>
              <TableHead>Tên bài giảng</TableHead>
              <TableHead className="hidden md:table-cell">Chuyên đề</TableHead>
              <TableHead>Số tiết</TableHead>
              {canEdit ? <TableHead className="text-right">Hành động</TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="text-muted-foreground">{b.thu_tu}</TableCell>
                <TableCell className="font-medium">{b.ten_bai}</TableCell>
                <TableCell className="hidden md:table-cell">{b.chuyen_de ?? "—"}</TableCell>
                <TableCell>{b.thoi_luong_tiet}</TableCell>
                {canEdit ? (
                  <TableCell className="flex justify-end gap-2">
                    <MauBaiGiangDialog
                      chuongTrinhId={chuongTrinhId}
                      baiGiang={b}
                      nextThuTu={items.length + 1}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={isPending}
                      onClick={() => handleDelete(b.id)}
                    >
                      Xoá
                    </Button>
                  </TableCell>
                ) : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
