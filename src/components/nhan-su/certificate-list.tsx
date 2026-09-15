"use client";

import { useTransition } from "react";
import { ExternalLink, FileText, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { deleteCertificate, getCertificateSignedUrl } from "@/app/(app)/nhan-su/[id]/certificate-actions";

export type Certificate = {
  id: string;
  ten_chung_chi: string;
  so_chung_chi: string | null;
  noi_cap: string | null;
  ngay_cap: string | null;
  ngay_het_han: string | null;
  bat_buoc: boolean;
  file_url: string | null;
};

// Danh sach doc gon (icon + tieu de + dong meta + badge trang thai) thay vi
// Table nhieu cot — khong hop trong cot hep (thietke-giao-dien.md muc 5.4).
export function CertificateList({
  profileId,
  certificates,
  canEdit,
}: {
  profileId: string;
  certificates: Certificate[];
  canEdit: boolean;
}) {
  if (certificates.length === 0) {
    return <EmptyState title="Chưa có chứng chỉ nào" />;
  }

  return (
    <div className="flex flex-col gap-2">
      {certificates.map((cert) => (
        <CertificateRow key={cert.id} certificate={cert} profileId={profileId} canEdit={canEdit} />
      ))}
    </div>
  );
}

function CertificateRow({
  certificate,
  profileId,
  canEdit,
}: {
  certificate: Certificate;
  profileId: string;
  canEdit: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleView() {
    if (!certificate.file_url) return;
    startTransition(async () => {
      const result = await getCertificateSignedUrl(certificate.file_url!);
      if (result.error || !result.url) {
        toast.error(result.error ?? "Không mở được file");
        return;
      }
      window.open(result.url, "_blank", "noopener,noreferrer");
    });
  }

  function handleDelete() {
    if (!certificate.file_url) return;
    startTransition(async () => {
      const result = await deleteCertificate(certificate.id, certificate.file_url!, profileId);
      if (result.error) toast.error(result.error);
      else toast.success("Đã xoá chứng chỉ");
    });
  }

  const metaLine = [
    certificate.so_chung_chi && `Số ${certificate.so_chung_chi}`,
    certificate.noi_cap,
    certificate.ngay_cap && `Cấp ${certificate.ngay_cap}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
        <FileText className="size-4 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{certificate.ten_chung_chi}</p>
        <p className="truncate text-xs text-muted-foreground">{metaLine || "—"}</p>
        {certificate.bat_buoc ? (
          <Badge variant="outline" className="mt-1">
            Bắt buộc
          </Badge>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {isPending ? (
          <Loader2 className="size-4 animate-spin text-muted-foreground" strokeWidth={1.5} />
        ) : (
          <>
            {certificate.file_url ? (
              <Button variant="ghost" size="icon-sm" onClick={handleView}>
                <ExternalLink className="size-4" strokeWidth={1.5} />
              </Button>
            ) : null}
            {canEdit ? (
              <Button variant="ghost" size="icon-sm" onClick={handleDelete}>
                <Trash2 className="size-4" strokeWidth={1.5} />
              </Button>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
