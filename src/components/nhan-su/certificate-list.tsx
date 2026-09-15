"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { FileText, Eye, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { deleteCertificate, getCertificateSignedUrl } from "@/app/(app)/nhan-su/[id]/certificate-actions";

export type CertificateRow = {
  id: string;
  ten_chung_chi: string;
  so_chung_chi: string | null;
  noi_cap: string | null;
  ngay_cap: string | null;
  ngay_het_han: string | null;
  bat_buoc: boolean;
  file_url: string | null;
};

function isExpired(ngayHetHan: string | null) {
  if (!ngayHetHan) return false;
  return new Date(ngayHetHan) < new Date();
}

// Danh sach dang cot doc gon (khong dung Table) — panel nay dat trong cot
// hep ben phai trang chi tiet nhan su (mauthietke.png: panel Notes & Calls/
// Tasks ben phai la danh sach item, khong phai bang nhieu cot).
export function CertificateList({
  profileId,
  certificates,
  canEdit,
}: {
  profileId: string;
  certificates: CertificateRow[];
  canEdit: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  async function handleView(fileUrl: string) {
    const result = await getCertificateSignedUrl(fileUrl);
    if (result.error || !result.url) {
      toast.error(result.error ?? "Không lấy được liên kết file");
      return;
    }
    window.open(result.url, "_blank", "noopener,noreferrer");
  }

  function handleDelete(id: string, fileUrl: string) {
    if (!window.confirm("Xoá chứng chỉ này? Không thể hoàn tác.")) return;
    startTransition(async () => {
      const result = await deleteCertificate(id, fileUrl, profileId);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Đã xoá chứng chỉ");
      }
    });
  }

  if (certificates.length === 0) {
    return <EmptyState title="Chưa có chứng chỉ nào" />;
  }

  return (
    <div className="flex flex-col gap-2">
      {certificates.map((c) => (
        <div key={c.id} className="flex items-start gap-3 rounded-xl border border-border p-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <FileText className="h-4 w-4" strokeWidth={1.5} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <p className="truncate text-sm font-medium">{c.ten_chung_chi}</p>
              {c.bat_buoc ? <Badge variant="outline">Bắt buộc</Badge> : null}
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {c.so_chung_chi ?? "—"} · {c.noi_cap ?? "—"}
            </p>
            <p className="text-xs text-muted-foreground">Cấp ngày {c.ngay_cap ?? "—"}</p>
            <div className="mt-1.5">
              {isExpired(c.ngay_het_han) ? (
                <Badge variant="destructive">Đã hết hạn</Badge>
              ) : (
                <Badge>Còn hiệu lực</Badge>
              )}
            </div>
          </div>
          <div className="flex shrink-0 flex-col gap-1">
            {c.file_url ? (
              <Button
                size="icon-sm"
                variant="ghost"
                title="Xem file"
                onClick={() => handleView(c.file_url!)}
              >
                <Eye className="h-4 w-4" strokeWidth={1.5} />
              </Button>
            ) : null}
            {canEdit ? (
              <Button
                size="icon-sm"
                variant="ghost"
                title="Xoá"
                disabled={isPending}
                onClick={() => handleDelete(c.id, c.file_url ?? "")}
              >
                <Trash2 className="h-4 w-4" strokeWidth={1.5} />
              </Button>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
