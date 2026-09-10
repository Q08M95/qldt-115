"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { GripVertical } from "lucide-react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { BaiGiangDialog, type BaiGiang } from "./bai-giang-dialog";
import type { BuoiGiang } from "./buoi-giang-dialog";
import type { ClassFormProfile } from "./class-form-fields";
import { deleteBaiGiang, reorderBaiGiang } from "@/app/(app)/lop-hoc/[id]/bai-giang-actions";

export function BaiGiangList({
  lopHocId,
  items,
  buoiList,
  profiles,
  canEdit,
}: {
  lopHocId: string;
  items: BaiGiang[];
  buoiList: BuoiGiang[];
  profiles: ClassFormProfile[];
  canEdit: boolean;
}) {
  const [ordered, setOrdered] = useState(items);
  const [prevItems, setPrevItems] = useState(items);
  // Dong bo lai khi du lieu server thay doi that (them/sua/xoa) — theo
  // huong dan React "Adjusting state when a prop changes" thay vi useEffect.
  if (items !== prevItems) {
    setPrevItems(items);
    setOrdered(items);
  }

  const [isPending, startTransition] = useTransition();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

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

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = ordered.findIndex((b) => b.id === active.id);
    const newIndex = ordered.findIndex((b) => b.id === over.id);
    const next = [...ordered];
    const [moved] = next.splice(oldIndex, 1);
    next.splice(newIndex, 0, moved);
    setOrdered(next);

    startTransition(async () => {
      const result = await reorderBaiGiang(
        lopHocId,
        next.map((b) => b.id),
      );
      if (result?.error) {
        toast.error(result.error);
        setOrdered(items); // revert ve thu tu server dang co
      }
    });
  }

  const tongTiet = ordered.reduce((sum, b) => sum + b.thoi_luong_tiet, 0);

  if (ordered.length === 0) {
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
              {canEdit ? <TableHead className="w-8" /> : null}
              <TableHead>Tên bài giảng</TableHead>
              <TableHead className="hidden md:table-cell">Chuyên đề</TableHead>
              <TableHead className="hidden md:table-cell">Buổi</TableHead>
              <TableHead>Số tiết</TableHead>
              {canEdit ? <TableHead className="text-right">Hành động</TableHead> : null}
            </TableRow>
          </TableHeader>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={ordered.map((b) => b.id)}
              strategy={verticalListSortingStrategy}
            >
              <TableBody>
                {ordered.map((b) => (
                  <SortableBaiGiangRow
                    key={b.id}
                    baiGiang={b}
                    lopHocId={lopHocId}
                    buoiList={buoiList}
                    profiles={profiles}
                    buoiTen={buoiList.find((buoi) => buoi.id === b.buoi_giang_id)?.ten_buoi}
                    canEdit={canEdit}
                    isPending={isPending}
                    onDelete={handleDelete}
                  />
                ))}
              </TableBody>
            </SortableContext>
          </DndContext>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">
        Tổng {ordered.length} bài giảng — {tongTiet} tiết.
      </p>
    </div>
  );
}

function SortableBaiGiangRow({
  baiGiang,
  lopHocId,
  buoiList,
  profiles,
  buoiTen,
  canEdit,
  isPending,
  onDelete,
}: {
  baiGiang: BaiGiang;
  lopHocId: string;
  buoiList: BuoiGiang[];
  profiles: ClassFormProfile[];
  buoiTen?: string;
  canEdit: boolean;
  isPending: boolean;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: baiGiang.id,
  });

  return (
    <TableRow
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={isDragging ? "relative z-10 bg-muted" : undefined}
    >
      {canEdit ? (
        <TableCell className="w-8 cursor-grab touch-none text-muted-foreground active:cursor-grabbing" {...attributes} {...listeners}>
          <GripVertical className="h-4 w-4" />
        </TableCell>
      ) : null}
      <TableCell className="font-medium">{baiGiang.ten_bai}</TableCell>
      <TableCell className="hidden md:table-cell">{baiGiang.chuyen_de ?? "—"}</TableCell>
      <TableCell className="hidden md:table-cell">{buoiTen ?? "—"}</TableCell>
      <TableCell>{baiGiang.thoi_luong_tiet}</TableCell>
      {canEdit ? (
        <TableCell className="flex justify-end gap-2">
          <BaiGiangDialog lopHocId={lopHocId} baiGiang={baiGiang} buoiList={buoiList} profiles={profiles} />
          <Button size="sm" variant="ghost" disabled={isPending} onClick={() => onDelete(baiGiang.id)}>
            Xoá
          </Button>
        </TableCell>
      ) : null}
    </TableRow>
  );
}
