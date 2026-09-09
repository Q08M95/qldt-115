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
import { MauBaiGiangDialog, type MauBaiGiang } from "./mau-bai-giang-dialog";
import { deleteMauBaiGiang, reorderMauBaiGiang } from "@/app/(app)/cau-hinh/chuong-trinh/[id]/actions";

export function MauBaiGiangList({
  chuongTrinhId,
  items,
  canEdit,
}: {
  chuongTrinhId: string;
  items: MauBaiGiang[];
  canEdit: boolean;
}) {
  const [ordered, setOrdered] = useState(items);
  const [prevItems, setPrevItems] = useState(items);
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
      const result = await reorderMauBaiGiang(
        chuongTrinhId,
        next.map((b) => b.id),
      );
      if (result?.error) {
        toast.error(result.error);
        setOrdered(items);
      }
    });
  }

  if (ordered.length === 0) {
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
              {canEdit ? <TableHead className="w-8" /> : null}
              <TableHead>Tên bài giảng</TableHead>
              <TableHead className="hidden md:table-cell">Chuyên đề</TableHead>
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
                  <SortableMauBaiGiangRow
                    key={b.id}
                    baiGiang={b}
                    chuongTrinhId={chuongTrinhId}
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
    </div>
  );
}

function SortableMauBaiGiangRow({
  baiGiang,
  chuongTrinhId,
  canEdit,
  isPending,
  onDelete,
}: {
  baiGiang: MauBaiGiang;
  chuongTrinhId: string;
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
      <TableCell>{baiGiang.thoi_luong_tiet}</TableCell>
      {canEdit ? (
        <TableCell className="flex justify-end gap-2">
          <MauBaiGiangDialog chuongTrinhId={chuongTrinhId} baiGiang={baiGiang} />
          <Button size="sm" variant="ghost" disabled={isPending} onClick={() => onDelete(baiGiang.id)}>
            Xoá
          </Button>
        </TableCell>
      ) : null}
    </TableRow>
  );
}
