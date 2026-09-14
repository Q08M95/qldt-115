"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";

const createDangKySchema = z.object({
  cap: z.enum(["lop", "buoi", "bai"]),
  target_id: z
    .string()
    .trim()
    .nullish()
    .transform((v) => (v && v !== "none" ? v : null)),
});

async function requireQuanLy() {
  const current = await getCurrentProfile();
  if (current?.role !== "admin" && current?.role !== "quan_ly_dao_tao") {
    return { error: "Chỉ admin/quản lý đào tạo được thao tác trên đăng ký giảng dạy" };
  }
  return null;
}

// Tu de xuat dang ky (giang vien/tro giang tu bam) — kiem tra truoc bang RPC
// dang_ky_phu_hop_nhom de tra loi than thien, thay vi de RLS chan roi tra ve
// loi Postgres kho hieu. RLS insert van la lop chan that su (xem migration
// 20260916000000_dang_ky_giang_day.sql) — kiem tra o day chi de UX tot hon.
export async function createDangKy(
  lopHocId: string,
  formData: FormData,
): Promise<{ error?: string }> {
  const current = await getCurrentProfile();
  if (current?.role !== "giang_vien" && current?.role !== "tro_giang") {
    return { error: "Chỉ giảng viên/trợ giảng mới tự đăng ký dạy được" };
  }

  const parsed = createDangKySchema.safeParse({
    cap: formData.get("cap"),
    target_id: formData.get("target_id"),
  });
  if (!parsed.success) return { error: "Dữ liệu không hợp lệ" };

  const supabase = await createClient();

  const { data: phuHop } = await supabase.rpc("dang_ky_phu_hop_nhom", {
    p_lop_hoc_id: lopHocId,
    p_vai_tro: current.role,
    p_profile_id: current.id,
  });
  if (!phuHop) {
    return { error: "Bạn không thuộc nhóm phù hợp để đăng ký lớp này" };
  }

  const { error } = await supabase.from("dang_ky_giang_day").insert({
    profile_id: current.id,
    lop_hoc_id: lopHocId,
    vai_tro: current.role,
    buoi_giang_id: parsed.data.cap === "buoi" ? parsed.data.target_id : null,
    bai_giang_id: parsed.data.cap === "bai" ? parsed.data.target_id : null,
  });
  if (error) {
    if (error.code === "23505") {
      return { error: "Bạn đã đăng ký cho lớp/buổi/bài này rồi" };
    }
    return { error: error.message };
  }

  revalidatePath(`/lop-hoc/${lopHocId}`);
  revalidatePath("/lop-hoc");
  return {};
}

// Duyet/tu choi goi RPC gop update dang_ky_giang_day + tao lich_giang (khi
// duyet) + insert thong_bao vao 1 transaction (CLAUDE.md muc 4). Lich_giang
// tao ra chua co ngay gio cu the — xep lich thuoc Giai doan 6.
export async function duyetDangKy(id: string, lopHocId: string): Promise<{ error?: string }> {
  const denied = await requireQuanLy();
  if (denied) return denied;

  const supabase = await createClient();
  const { error } = await supabase.rpc("duyet_dang_ky", { p_id: id });
  if (error) return { error: error.message };

  revalidatePath(`/lop-hoc/${lopHocId}`);
  return {};
}

export async function tuChoiDangKy(
  id: string,
  lopHocId: string,
  ghiChu: string,
): Promise<{ error?: string }> {
  const denied = await requireQuanLy();
  if (denied) return denied;

  const supabase = await createClient();
  const { error } = await supabase.rpc("tu_choi_dang_ky", {
    p_id: id,
    p_ghi_chu: ghiChu.trim() || null,
  });
  if (error) return { error: error.message };

  revalidatePath(`/lop-hoc/${lopHocId}`);
  return {};
}
