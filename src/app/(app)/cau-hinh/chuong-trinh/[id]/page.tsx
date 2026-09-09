import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { ProgramDialog } from "@/components/chuong-trinh/program-dialog";
import { DeleteProgramButton } from "@/components/chuong-trinh/delete-program-button";
import { MauBaiGiangList } from "@/components/chuong-trinh/mau-bai-giang-list";
import { MauBaiGiangDialog } from "@/components/chuong-trinh/mau-bai-giang-dialog";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function ChuongTrinhDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const current = await getCurrentProfile();
  if (current?.role !== "admin" && current?.role !== "quan_ly_dao_tao") {
    redirect("/dashboard");
  }

  const supabase = await createClient();
  const [{ data: program }, { data: baiGiangMau }] = await Promise.all([
    supabase.from("chuong_trinh_dao_tao").select("*").eq("id", id).single(),
    supabase
      .from("chuong_trinh_mau_bai_giang")
      .select("id, ten_bai, chuyen_de, thoi_luong_tiet, thu_tu")
      .eq("chuong_trinh_id", id)
      .order("thu_tu"),
  ]);

  if (!program) notFound();

  return (
    <>
      <PageHeader
        items={[
          { label: "Cấu hình" },
          { label: "Chương trình đào tạo", href: "/cau-hinh/chuong-trinh" },
          { label: program.ten_chuong_trinh },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <ProgramDialog mode="edit" program={program} />
            <DeleteProgramButton id={program.id} />
          </div>
        }
      />
      <div className="flex flex-col gap-4 p-4 md:p-6">
        <div>
          <h1 className="text-xl font-semibold">{program.ten_chuong_trinh}</h1>
          {program.mo_ta ? (
            <p className="mt-1 text-sm text-muted-foreground">{program.mo_ta}</p>
          ) : null}
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">
            Danh sách bài giảng mẫu ({baiGiangMau?.length ?? 0})
          </h2>
          <MauBaiGiangDialog
            chuongTrinhId={program.id}
            nextThuTu={(baiGiangMau?.length ?? 0) + 1}
          />
        </div>

        <MauBaiGiangList chuongTrinhId={program.id} items={baiGiangMau ?? []} canEdit />
      </div>
    </>
  );
}
