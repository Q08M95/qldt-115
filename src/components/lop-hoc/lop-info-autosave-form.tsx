"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  ClassFormFields,
  type ClassFormDefaults,
  type ClassFormProfile,
} from "./class-form-fields";
import { updateLopHoc } from "@/app/(app)/lop-hoc/actions";

// Thay the EditClassDialog — thong tin lop giờ sua truc tiep tai cho tren
// trang canvas 1 trang (thiet ke lai 2026-09-14, xem tientrinh.md muc 1.2),
// khong con dialog rieng. Moi thay doi "hoan tat" (blur o input text, ngay
// khi doi o Select/checkbox — xem onDirty trong class-form-fields.tsx) gom
// lai qua 1 debounce 500ms roi doc lai TOAN BO form (new FormData(form)) va
// goi lai action updateLopHoc san co, khong tao action moi. Debounce (thay
// vi luu ngay khi nhan su kien) vua tranh spam request, vua tranh doc
// FormData truoc khi React kip commit gia tri moi cua cac control co
// kiem soat (ChiDinhSlots/NhomCheckboxGroup).
function SaveStatus({ status }: { status: "idle" | "pending" | "saving" | "saved" | "error" }) {
  if (status === "idle") return null;
  if (status === "pending" || status === "saving") {
    return <span className="text-xs text-muted-foreground">Đang lưu...</span>;
  }
  if (status === "error") {
    return <span className="text-xs text-destructive">Lỗi lưu — thử lại</span>;
  }
  return <span className="text-xs text-data-dang-ky">✓ Đã lưu</span>;
}

export function LopInfoAutosaveForm({
  lopHocId,
  defaults,
  profiles,
  soBaiGiang,
}: {
  lopHocId: string;
  defaults: ClassFormDefaults;
  profiles: ClassFormProfile[];
  soBaiGiang: number;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [status, setStatus] = useState<"idle" | "pending" | "saving" | "saved" | "error">("idle");
  const [isPending, startTransition] = useTransition();

  function doSave() {
    const form = formRef.current;
    if (!form) return;
    const fd = new FormData(form);
    setStatus("saving");
    startTransition(async () => {
      const result = await updateLopHoc(lopHocId, fd);
      if (result?.error) {
        setStatus("error");
        toast.error(result.error);
      } else {
        setStatus("saved");
      }
    });
  }

  function scheduleSave() {
    setStatus("pending");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(doSave, 500);
  }

  return (
    // Card con tint mau theo ngu canh (nhu "About Company" trong mauthietke.png)
    // — dung dung mau vai tro "Lop hoc" (CLAUDE.md muc 3), khong tu bia mau moi.
    <div className="flex flex-col gap-4 rounded-2xl border border-data-lop-hoc/20 bg-data-lop-hoc/6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">Thông tin lớp</h2>
        <SaveStatus status={isPending ? "saving" : status} />
      </div>
      <form
        ref={formRef}
        onSubmit={(e) => e.preventDefault()}
        className="flex flex-col gap-4"
      >
        <ClassFormFields
          defaults={defaults}
          profiles={profiles}
          onDirty={scheduleSave}
          soBaiGiang={soBaiGiang}
        />
      </form>
    </div>
  );
}
