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
import { BaiGiangDialog, type BaiGiang } from "./bai-giang-dialog";
import { deleteBaiGiang } from "@/app/(app)/lop-hoc/[id]/bai-giang-actions";

export function BaiGiangList({
  lopHocId,
  items,
  canEdit,
}: {
  lopHocId: string;
  items: BaiGiang[];
  canEdit: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string) {
    if (!window.confirm("Xoá bài giảng này? Không thể hoàn tác.")) return;
    startTransition(async () => {
      const result = await deleteBaiGiang(id, lopHocId);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Đã xoá bài giảng");
      }
    });
  }

  const tongTiet = items.reduce((sum, b) => sum + b.thoi_luong_tiet, 0);

  if (items.length === 0) {
    return (
      <EmptyState
        title="Lớp chưa có bài giảng nào"
        description="Thêm bài giảng thủ công, hoặc tạo lại lớp từ 1 chương trình mẫu để copy sẵn."
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
                    <BaiGiangDialog
                      lopHocId={lopHocId}
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
      <p className="text-xs text-muted-foreground">
        Tổng {items.length} bài giảng — {tongTiet} tiết.
      </p>
    </div>
  );
}
