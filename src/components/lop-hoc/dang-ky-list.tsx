"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
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
import { PersonAvatar } from "@/components/nhan-su/person-avatar";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { TuChoiDialog } from "@/components/lop-hoc/tu-choi-dialog";
import { duyetDangKy, huyDangKy } from "@/app/(app)/lop-hoc/[id]/dang-ky-actions";
import { ROLE_LABEL, type Role } from "@/lib/constants/roles";

export type DangKyRow = {
  id: string;
  profile_id: string;
  vai_tro: "giang_vien" | "tro_giang";
  trang_thai: "cho_duyet" | "da_duyet" | "tu_choi";
  buoi_giang_id: string | null;
  bai_giang_id: string | null;
  ghi_chu: string | null;
};

export type DangKyPersonInfo = {
  id: string;
  full_name: string;
  role: Role;
  hoc_vi: string | null;
  chuc_danh: string | null;
  chuyen_mon: string | null;
};

const TRANG_THAI_LABEL: Record<DangKyRow["trang_thai"], string> = {
  cho_duyet: "Chờ duyệt",
  da_duyet: "Đã duyệt",
  tu_choi: "Từ chối",
};

const TRANG_THAI_BADGE: Record<DangKyRow["trang_thai"], "default" | "secondary" | "outline"> = {
  cho_duyet: "outline",
  da_duyet: "default",
  tu_choi: "secondary",
};

function dangKyChoLabel(dk: DangKyRow, buoiMap: Map<string, string>, baiMap: Map<string, string>) {
  if (dk.buoi_giang_id) return `Buổi: ${buoiMap.get(dk.buoi_giang_id) ?? "—"}`;
  if (dk.bai_giang_id) return `Bài: ${baiMap.get(dk.bai_giang_id) ?? "—"}`;
  return "Cả lớp";
}

export function DangKyList({
  lopHocId,
  items,
  profiles,
  buoiMap,
  baiMap,
  canManage,
}: {
  lopHocId: string;
  items: DangKyRow[];
  profiles: Map<string, DangKyPersonInfo>;
  buoiMap: Map<string, string>;
  baiMap: Map<string, string>;
  canManage: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleDuyet(id: string) {
    startTransition(async () => {
      const result = await duyetDangKy(id, lopHocId);
      if (result?.error) toast.error(result.error);
      else toast.success("Đã duyệt đăng ký");
    });
  }

  // Tu phuc vu: giang vien/tro giang tu huy dang ky "cho_duyet" cua chinh
  // minh. Khong gate them theo profile_id o day vi RLS select cua
  // dang_ky_giang_day da chi tra ve dung dang ky cua ho khi khong canManage
  // (xem migration RLS) — moi dong khong-canManage nhin thay chac chan la
  // cua chinh nguoi dang xem.
  function handleHuy(id: string) {
    if (!window.confirm("Huỷ đăng ký này? Không thể hoàn tác.")) return;
    startTransition(async () => {
      const result = await huyDangKy(id, lopHocId);
      if (result?.error) toast.error(result.error);
      else toast.success("Đã huỷ đăng ký");
    });
  }

  // Hien cot Hanh dong khi: canManage (Duyet/Tu choi), hoac nguoi xem tu
  // dang ky (khong canManage) va co it nhat 1 dong dang cho_duyet de huy.
  const showActionColumn = canManage || items.some((dk) => dk.trang_thai === "cho_duyet");

  if (items.length === 0) {
    return (
      <EmptyState
        title="Chưa có đăng ký nào"
        description="Đăng ký giảng dạy cho lớp này sẽ hiện ở đây."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Người đăng ký</TableHead>
            <TableHead className="hidden md:table-cell">Vai trò</TableHead>
            <TableHead className="hidden md:table-cell">Đăng ký cho</TableHead>
            <TableHead>Trạng thái</TableHead>
            {showActionColumn ? <TableHead className="text-right">Hành động</TableHead> : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((dk) => {
            const nguoi = profiles.get(dk.profile_id);
            const vaiTroLabel = ROLE_LABEL[nguoi?.role ?? dk.vai_tro];
            const dangKyCho = dangKyChoLabel(dk, buoiMap, baiMap);
            const coTheDuyet = canManage && dk.trang_thai === "cho_duyet";
            const coTheHuy = !canManage && dk.trang_thai === "cho_duyet";

            return (
              <TableRow key={dk.id}>
                <TableCell>
                  <Sheet>
                    <SheetTrigger
                      render={
                        <button
                          type="button"
                          className="flex items-center gap-2 text-left hover:underline"
                        />
                      }
                    >
                      <PersonAvatar
                        fullName={nguoi?.full_name ?? "?"}
                        role={nguoi?.role ?? dk.vai_tro}
                        size="sm"
                      />
                      <span className="font-medium">{nguoi?.full_name ?? "—"}</span>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>{nguoi?.full_name ?? "—"}</SheetTitle>
                      </SheetHeader>
                      <div className="flex flex-col gap-2 px-4 text-sm">
                        <p>
                          <span className="text-muted-foreground">Vai trò: </span>
                          {vaiTroLabel}
                        </p>
                        {nguoi?.hoc_vi ? (
                          <p>
                            <span className="text-muted-foreground">Học vị: </span>
                            {nguoi.hoc_vi}
                          </p>
                        ) : null}
                        {nguoi?.chuc_danh ? (
                          <p>
                            <span className="text-muted-foreground">Chức danh: </span>
                            {nguoi.chuc_danh}
                          </p>
                        ) : null}
                        {nguoi?.chuyen_mon ? (
                          <p>
                            <span className="text-muted-foreground">Chuyên môn: </span>
                            {nguoi.chuyen_mon}
                          </p>
                        ) : null}
                        <p>
                          <span className="text-muted-foreground">Đăng ký cho: </span>
                          {dangKyCho}
                        </p>
                        {dk.ghi_chu ? (
                          <p>
                            <span className="text-muted-foreground">Ghi chú: </span>
                            {dk.ghi_chu}
                          </p>
                        ) : null}
                      </div>
                      {coTheDuyet ? (
                        <SheetFooter className="flex-row gap-2">
                          <Button
                            className="flex-1"
                            disabled={isPending}
                            onClick={() => handleDuyet(dk.id)}
                          >
                            Duyệt
                          </Button>
                          <TuChoiDialog id={dk.id} lopHocId={lopHocId} />
                        </SheetFooter>
                      ) : null}
                      {coTheHuy ? (
                        <SheetFooter>
                          <Button
                            variant="destructive"
                            disabled={isPending}
                            onClick={() => handleHuy(dk.id)}
                          >
                            Huỷ đăng ký
                          </Button>
                        </SheetFooter>
                      ) : null}
                    </SheetContent>
                  </Sheet>
                </TableCell>
                <TableCell className="hidden md:table-cell">{vaiTroLabel}</TableCell>
                <TableCell className="hidden md:table-cell">{dangKyCho}</TableCell>
                <TableCell>
                  <Badge variant={TRANG_THAI_BADGE[dk.trang_thai]}>
                    {TRANG_THAI_LABEL[dk.trang_thai]}
                  </Badge>
                </TableCell>
                {showActionColumn ? (
                  <TableCell className="text-right">
                    {coTheDuyet ? (
                      <div className="flex justify-end gap-2">
                        <Button size="sm" disabled={isPending} onClick={() => handleDuyet(dk.id)}>
                          Duyệt
                        </Button>
                        <TuChoiDialog id={dk.id} lopHocId={lopHocId} />
                      </div>
                    ) : null}
                    {coTheHuy ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={isPending}
                        onClick={() => handleHuy(dk.id)}
                      >
                        Huỷ đăng ký
                      </Button>
                    ) : null}
                  </TableCell>
                ) : null}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
