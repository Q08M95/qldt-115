import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type CurrentProfile = {
  id: string;
  email: string | undefined;
  full_name: string;
  role: "admin" | "quan_ly_dao_tao" | "giang_vien" | "tro_giang";
  avatar_url: string | null;
  hoc_vi: string | null;
  chuc_danh: string | null;
  chuyen_mon: string | null;
  don_vi_cong_tac: string | null;
  so_dien_thoai: string | null;
  ngay_vao_lam: string | null;
};

/**
 * Lay user + profile hien tai o Server Component/Server Action. Tra ve null
 * neu chua dang nhap — middleware da chan hau het truong hop nay, nhung
 * ham nay van kiem tra lai de an toan khi goi truc tiep.
 *
 * Boc qua React cache(): layout.tsx VA tung page.tsx deu goi ham nay doc
 * lap trong cung 1 request — khong cache se chay 2 lan supabase.auth.getUser()
 * (round-trip xac thuc JWT) + 2 lan truy van profiles cho MOI lan tai trang.
 */
export const getCurrentProfile = cache(async (): Promise<CurrentProfile | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, full_name, role, avatar_url, hoc_vi, chuc_danh, chuyen_mon, don_vi_cong_tac, so_dien_thoai, ngay_vao_lam",
    )
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  return {
    id: profile.id,
    email: user.email,
    full_name: profile.full_name,
    role: profile.role,
    avatar_url: profile.avatar_url,
    hoc_vi: profile.hoc_vi,
    chuc_danh: profile.chuc_danh,
    chuyen_mon: profile.chuyen_mon,
    don_vi_cong_tac: profile.don_vi_cong_tac,
    so_dien_thoai: profile.so_dien_thoai,
    ngay_vao_lam: profile.ngay_vao_lam,
  };
});
