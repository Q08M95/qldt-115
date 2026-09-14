"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { createDangKy, duyetDangKy, huyDangKy } from "@/app/(app)/lop-hoc/[id]/dang-ky-actions";
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

type BuoiNode = {
  id: string;
  ten_buoi: string;
  so_giang_vien_can: number;
  so_tro_giang_can: number;
  mo_dang_ky: boolean;
};

type BaiNode = {
  id: string;
  ten_bai: string;
  buoi_giang_id: string | null;
  mo_dang_ky: boolean;
  thoi_luong_tiet: number;
};

const TRANG_THAI_LABEL: Record<DangKyRow["trang_thai"], string> = {
  cho_duyet: "Chờ duyệt",
  da_duyet: "Đã duyệt",
  tu_choi: "Từ chối",
};

// Ho So dang ky da duyet, quy doi ra so nguoi (distinct) — 1 nguoi dang ky
// nhieu bai/buoi trong cung 1 lop chi tinh 1, dung y nguoi dung 2026-09-14:
// "so luong" chi la muc tieu du kien, so THAT tinh tu so nguoi da duyet.
function demSoDaDuyet(items: DangKyRow[], vaiTro: DangKyRow["vai_tro"]) {
  return new Set(
    items.filter((dk) => dk.vai_tro === vaiTro && dk.trang_thai === "da_duyet").map((dk) => dk.profile_id),
  ).size;
}

// Bang phan cong (roster board) — thay the DangKyDialog (dropdown gop
// lop/buoi/bai) + DangKyList (bang phang) o trang chi tiet lop, theo yeu cau
// nguoi dung 2026-09-14: GV/TG thay dung cau truc buoi/bai de chon dang ky,
// so GV/TG can chi la "muc tieu du kien" (hien X da duyet / Y muc tieu),
// quan ly thay het moi luot dang ky de duyet. Khong doi schema/action nao —
// chi to chuc lai UI tren cung du lieu dang_ky_giang_day da co.
export function DangKyRosterBoard({
  lopHocId,
  lop,
  buoiGiang,
  baiGiang,
  items,
  profiles,
  canManage,
  coTheDangKy,
}: {
  lopHocId: string;
  lop: { mo_dang_ky: boolean; so_giang_vien_can: number; so_tro_giang_can: number };
  buoiGiang: BuoiNode[];
  baiGiang: BaiNode[];
  items: DangKyRow[];
  profiles: Map<string, DangKyPersonInfo>;
  canManage: boolean;
  coTheDangKy: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleDangKy(cap: "lop" | "buoi" | "bai", targetId: string | null) {
    const fd = new FormData();
    fd.set("cap", cap);
    fd.set("target_id", targetId ?? "none");
    startTransition(async () => {
      const result = await createDangKy(lopHocId, fd);
      if (result?.error) toast.error(result.error);
      else toast.success("Đã gửi đăng ký, chờ quản lý duyệt");
    });
  }

  function handleDuyet(id: string) {
    startTransition(async () => {
      const result = await duyetDangKy(id, lopHocId);
      if (result?.error) toast.error(result.error);
      else toast.success("Đã duyệt đăng ký");
    });
  }

  function handleHuy(id: string) {
    if (!window.confirm("Huỷ đăng ký này? Không thể hoàn tác.")) return;
    startTransition(async () => {
      const result = await huyDangKy(id, lopHocId);
      if (result?.error) toast.error(result.error);
      else toast.success("Đã huỷ đăng ký");
    });
  }

  const baiTheoBuoi = new Map<string | null, BaiNode[]>();
  for (const bai of baiGiang) {
    const key = bai.buoi_giang_id;
    baiTheoBuoi.set(key, [...(baiTheoBuoi.get(key) ?? []), bai]);
  }
  const baiLe = baiTheoBuoi.get(null) ?? [];

  const showLop = lop.mo_dang_ky || items.some((dk) => !dk.buoi_giang_id && !dk.bai_giang_id);
  const buoiIds = new Set(buoiGiang.map((b) => b.id));
  const baiTrongBuoiIdsCua = (buoiId: string) =>
    new Set((baiTheoBuoi.get(buoiId) ?? []).map((b) => b.id));

  return (
    <div className="flex flex-col gap-4">
      {buoiIds.size + baiGiang.length > 0 ? (
        <div className="text-xs text-muted-foreground">
          {canManage ? (
            <span>
              Toàn lớp: {demSoDaDuyet(items, "giang_vien")}/{lop.so_giang_vien_can} GV ·{" "}
              {demSoDaDuyet(items, "tro_giang")}/{lop.so_tro_giang_can} TG đã duyệt
            </span>
          ) : (
            <span>
              Chỉ tiêu chung: {lop.so_giang_vien_can} giảng viên · {lop.so_tro_giang_can} trợ giảng
            </span>
          )}
        </div>
      ) : null}

      {showLop ? (
        <RegistrationRow
          label="Cả lớp"
          moDangKy={lop.mo_dang_ky}
          itemsHere={items.filter((dk) => !dk.buoi_giang_id && !dk.bai_giang_id)}
          lopHocId={lopHocId}
          profiles={profiles}
          canManage={canManage}
          coTheDangKy={coTheDangKy}
          isPending={isPending}
          onDangKy={() => handleDangKy("lop", null)}
          onDuyet={handleDuyet}
          onHuy={handleHuy}
        />
      ) : null}

      {buoiGiang.map((buoi) => {
        const baiCuaBuoi = baiTheoBuoi.get(buoi.id) ?? [];
        const idsTrongBuoi = baiTrongBuoiIdsCua(buoi.id);
        const itemsCaBuoi = items.filter((dk) => dk.buoi_giang_id === buoi.id && !dk.bai_giang_id);
        const itemsThuocBuoi = items.filter(
          (dk) => dk.buoi_giang_id === buoi.id || (dk.bai_giang_id != null && idsTrongBuoi.has(dk.bai_giang_id)),
        );
        const showCaBuoi = buoi.mo_dang_ky || itemsCaBuoi.length > 0;

        return (
          <div key={buoi.id} className="flex flex-col gap-2 rounded-md border p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-sm font-medium">{buoi.ten_buoi}</h4>
              <span className="text-xs text-muted-foreground">
                {canManage
                  ? `${demSoDaDuyet(itemsThuocBuoi, "giang_vien")}/${buoi.so_giang_vien_can} GV · ${demSoDaDuyet(itemsThuocBuoi, "tro_giang")}/${buoi.so_tro_giang_can} TG`
                  : `Cần ${buoi.so_giang_vien_can} GV · ${buoi.so_tro_giang_can} TG`}
              </span>
            </div>
            {showCaBuoi ? (
              <RegistrationRow
                label="Cả buổi"
                moDangKy={buoi.mo_dang_ky}
                itemsHere={itemsCaBuoi}
                lopHocId={lopHocId}
                profiles={profiles}
                canManage={canManage}
                coTheDangKy={coTheDangKy}
                isPending={isPending}
                onDangKy={() => handleDangKy("buoi", buoi.id)}
                onDuyet={handleDuyet}
                onHuy={handleHuy}
              />
            ) : null}
            {baiCuaBuoi.map((bai) => {
              const itemsBai = items.filter((dk) => dk.bai_giang_id === bai.id);
              // Quan ly chi thay dong lien quan dang ky (van co "Buoi giang &
              // Bai giang" rieng de xem het chuong trinh); GV/TG luon thay du
              // moi bai — khung nay gio kiem luon vai tro hien thi "chuong
              // trinh lop" cho ho (yeu cau nguoi dung 2026-09-14).
              if (canManage && !bai.mo_dang_ky && itemsBai.length === 0) return null;
              return (
                <RegistrationRow
                  key={bai.id}
                  label={`${bai.ten_bai} · ${bai.thoi_luong_tiet} tiết`}
                  moDangKy={bai.mo_dang_ky}
                  itemsHere={itemsBai}
                  lopHocId={lopHocId}
                  profiles={profiles}
                  canManage={canManage}
                  coTheDangKy={coTheDangKy}
                  isPending={isPending}
                  onDangKy={() => handleDangKy("bai", bai.id)}
                  onDuyet={handleDuyet}
                  onHuy={handleHuy}
                />
              );
            })}
            {canManage &&
            !showCaBuoi &&
            baiCuaBuoi.every((b) => !b.mo_dang_ky && !items.some((dk) => dk.bai_giang_id === b.id)) ? (
              <p className="text-xs text-muted-foreground">Chưa mở đăng ký ở buổi này.</p>
            ) : null}
            {!canManage && baiCuaBuoi.length === 0 && !showCaBuoi ? (
              <p className="text-xs text-muted-foreground">Chưa có bài giảng.</p>
            ) : null}
          </div>
        );
      })}

      {baiLe.length > 0 ? (
        <div className="flex flex-col gap-2 rounded-md border p-3">
          <h4 className="text-sm font-medium">Bài chưa gom buổi</h4>
          {baiLe.map((bai) => {
            const itemsBai = items.filter((dk) => dk.bai_giang_id === bai.id);
            if (canManage && !bai.mo_dang_ky && itemsBai.length === 0) return null;
            return (
              <RegistrationRow
                key={bai.id}
                label={`${bai.ten_bai} · ${bai.thoi_luong_tiet} tiết`}
                moDangKy={bai.mo_dang_ky}
                itemsHere={itemsBai}
                lopHocId={lopHocId}
                profiles={profiles}
                canManage={canManage}
                coTheDangKy={coTheDangKy}
                isPending={isPending}
                onDangKy={() => handleDangKy("bai", bai.id)}
                onDuyet={handleDuyet}
                onHuy={handleHuy}
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function RegistrationRow({
  label,
  moDangKy,
  itemsHere,
  lopHocId,
  profiles,
  canManage,
  coTheDangKy,
  isPending,
  onDangKy,
  onDuyet,
  onHuy,
}: {
  label: string;
  moDangKy: boolean;
  itemsHere: DangKyRow[];
  lopHocId: string;
  profiles: Map<string, DangKyPersonInfo>;
  canManage: boolean;
  coTheDangKy: boolean;
  isPending: boolean;
  onDangKy: () => void;
  onDuyet: (id: string) => void;
  onHuy: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-2 first:border-t-0 first:pt-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex flex-wrap items-center gap-1.5">
        {canManage
          ? itemsHere.map((dk) => (
              <RegistrantChip
                key={dk.id}
                dk={dk}
                nguoi={profiles.get(dk.profile_id)}
                lopHocId={lopHocId}
                isPending={isPending}
                onDuyet={onDuyet}
              />
            ))
          : itemsHere.map((dk) => (
              <SelfStatus key={dk.id} dk={dk} isPending={isPending} onHuy={onHuy} />
            ))}
        {!canManage && moDangKy && itemsHere.every((dk) => dk.trang_thai === "tu_choi") ? (
          <Button
            size="sm"
            variant="outline"
            disabled={isPending || !coTheDangKy}
            title={!coTheDangKy ? "Bạn không thuộc nhóm được phân công cho lớp này" : undefined}
            onClick={onDangKy}
          >
            {itemsHere.length > 0 ? "Đăng ký lại" : "Đăng ký"}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function SelfStatus({
  dk,
  isPending,
  onHuy,
}: {
  dk: DangKyRow;
  isPending: boolean;
  onHuy: (id: string) => void;
}) {
  if (dk.trang_thai === "tu_choi") {
    return (
      <span className="text-xs text-muted-foreground" title={dk.ghi_chu ?? undefined}>
        Đã bị từ chối{dk.ghi_chu ? ` — ${dk.ghi_chu}` : ""}
      </span>
    );
  }
  return (
    <div className="flex items-center gap-1.5">
      <Badge variant={dk.trang_thai === "da_duyet" ? "default" : "outline"}>
        {TRANG_THAI_LABEL[dk.trang_thai]}
      </Badge>
      {dk.trang_thai === "cho_duyet" ? (
        <Button size="sm" variant="ghost" disabled={isPending} onClick={() => onHuy(dk.id)}>
          Huỷ
        </Button>
      ) : null}
    </div>
  );
}

function RegistrantChip({
  dk,
  nguoi,
  lopHocId,
  isPending,
  onDuyet,
}: {
  dk: DangKyRow;
  nguoi: DangKyPersonInfo | undefined;
  lopHocId: string;
  isPending: boolean;
  onDuyet: (id: string) => void;
}) {
  const toneClass =
    dk.trang_thai === "da_duyet"
      ? "border-data-dang-ky/40 bg-data-dang-ky/10"
      : dk.trang_thai === "tu_choi"
        ? "border-border bg-muted opacity-60"
        : "border-data-canh-bao/40 bg-data-canh-bao/10";

  return (
    <Sheet>
      <SheetTrigger
        render={
          <button
            type="button"
            className={`flex items-center gap-1.5 rounded-full border py-0.5 pr-2.5 pl-0.5 text-xs hover:shadow-sm ${toneClass}`}
          />
        }
      >
        <PersonAvatar fullName={nguoi?.full_name ?? "?"} role={nguoi?.role ?? dk.vai_tro} size="sm" />
        <span className="font-medium">{nguoi?.full_name ?? "—"}</span>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{nguoi?.full_name ?? "—"}</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-2 px-4 text-sm">
          <p>
            <span className="text-muted-foreground">Vai trò: </span>
            {ROLE_LABEL[nguoi?.role ?? dk.vai_tro]}
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
            <span className="text-muted-foreground">Trạng thái: </span>
            {TRANG_THAI_LABEL[dk.trang_thai]}
          </p>
          {dk.ghi_chu ? (
            <p>
              <span className="text-muted-foreground">Ghi chú: </span>
              {dk.ghi_chu}
            </p>
          ) : null}
        </div>
        {dk.trang_thai === "cho_duyet" ? (
          <SheetFooter className="flex-row gap-2">
            <Button className="flex-1" disabled={isPending} onClick={() => onDuyet(dk.id)}>
              Duyệt
            </Button>
            <TuChoiDialog id={dk.id} lopHocId={lopHocId} />
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
