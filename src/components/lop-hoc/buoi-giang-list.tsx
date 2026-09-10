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
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { BuoiGiangDialog, type BuoiGiang } from "./buoi-giang-dialog";
import type { ClassFormProfile } from "./class-form-fields";
import { deleteBuoiGiang, reorderBuoiGiang } from "@/app/(app)/lop-hoc/[id]/buoi-giang-actions";

export function BuoiGiangList({
  lopHocId,
  items,
  profiles,
  canEdit,
}: {
  lopHocId: string;
  items: BuoiGiang[];
  profiles: ClassFormProfile[];
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
  const nguoiMap = new Map(profiles.map((p) => [p.id, p.full_name]));

  function handleDelete(id: string) {
    if (!window.confirm("Xoá buổi giảng này? Bài giảng thuộc buổi sẽ về lại trạng thái chưa gom buổi."))
      return;
    startTransition(async () => {
      const result = await deleteBuoiGiang(id, lopHocId);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Đã xoá buổi giảng");
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
      const result = await reorderBuoiGiang(
        lopHocId,
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
        title="Lớp chưa có buổi giảng nào"
        description="Tạo buổi giảng để gom nhóm bài giảng và mở đăng ký/chỉ định gọn hơn theo từng buổi."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {canEdit ? <TableHead className="w-8" /> : null}
            <TableHead>Tên buổi</TableHead>
            <TableHead className="hidden md:table-cell">Chỉ tiêu GV/TG</TableHead>
            <TableHead className="hidden md:table-cell">Chỉ định</TableHead>
            <TableHead>Đăng ký</TableHead>
            {canEdit ? <TableHead className="text-right">Hành động</TableHead> : null}
          </TableRow>
        </TableHeader>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={ordered.map((b) => b.id)} strategy={verticalListSortingStrategy}>
            <TableBody>
              {ordered.map((b) => (
                <SortableBuoiGiangRow
                  key={b.id}
                  buoiGiang={b}
                  lopHocId={lopHocId}
                  profiles={profiles}
                  nguoiMap={nguoiMap}
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
  );
}

function SortableBuoiGiangRow({
  buoiGiang,
  lopHocId,
  profiles,
  nguoiMap,
  canEdit,
  isPending,
  onDelete,
}: {
  buoiGiang: BuoiGiang;
  lopHocId: string;
  profiles: ClassFormProfile[];
  nguoiMap: Map<string, string>;
  canEdit: boolean;
  isPending: boolean;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: buoiGiang.id,
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
      <TableCell className="font-medium">{buoiGiang.ten_buoi}</TableCell>
      <TableCell className="hidden md:table-cell">
        {buoiGiang.so_giang_vien_can} GV · {buoiGiang.so_tro_giang_can} TG
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {buoiGiang.giang_vien_chi_dinh_id ? (nguoiMap.get(buoiGiang.giang_vien_chi_dinh_id) ?? "—") : "—"}
        {buoiGiang.tro_giang_chi_dinh_id
          ? ` · ${nguoiMap.get(buoiGiang.tro_giang_chi_dinh_id) ?? "—"}`
          : ""}
      </TableCell>
      <TableCell>
        {buoiGiang.mo_dang_ky ? (
          <Badge className="border-data-dang-ky/40 bg-data-dang-ky/10 text-data-dang-ky">Mở</Badge>
        ) : (
          <Badge variant="secondary">Đóng</Badge>
        )}
      </TableCell>
      {canEdit ? (
        <TableCell className="flex justify-end gap-2">
          <BuoiGiangDialog lopHocId={lopHocId} buoiGiang={buoiGiang} profiles={profiles} />
          <Button size="sm" variant="ghost" disabled={isPending} onClick={() => onDelete(buoiGiang.id)}>
            Xoá
          </Button>
        </TableCell>
      ) : null}
    </TableRow>
  );
}
