"use client";

import { useTransition } from "react";
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
import { deleteCertificate, getCertificateSignedUrl } from "@/app/(app)/nhan-su/[id]/certificate-actions";

export type CertificateRow = {
  id: string;
  ten_chung_chi: string;
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
    const url = await getCertificateSignedUrl(fileUrl);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function handleDelete(id: string, fileUrl: string) {
    startTransition(() => deleteCertificate(id, fileUrl, profileId));
  }

  if (certificates.length === 0) {
    return <EmptyState title="Chưa có chứng chỉ nào" />;
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tên chứng chỉ</TableHead>
            <TableHead>Nơi cấp</TableHead>
            <TableHead>Ngày hết hạn</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-right">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {certificates.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-medium">
                {c.ten_chung_chi}
                {c.bat_buoc ? (
                  <Badge variant="outline" className="ml-2">
                    Bắt buộc
                  </Badge>
                ) : null}
              </TableCell>
              <TableCell>{c.noi_cap ?? "—"}</TableCell>
              <TableCell>{c.ngay_het_han ?? "—"}</TableCell>
              <TableCell>
                {isExpired(c.ngay_het_han) ? (
                  <Badge variant="destructive">Đã hết hạn</Badge>
                ) : (
                  <Badge>Còn hiệu lực</Badge>
                )}
              </TableCell>
              <TableCell className="flex justify-end gap-2">
                {c.file_url ? (
                  <Button size="sm" variant="outline" onClick={() => handleView(c.file_url!)}>
                    Xem file
                  </Button>
                ) : null}
                {canEdit ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={isPending}
                    onClick={() => handleDelete(c.id, c.file_url ?? "")}
                  >
                    Xoá
                  </Button>
                ) : null}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
