import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type CurrentProfile = {
  id: string;
  email: string | undefined;
  full_name: string;
  role: "admin" | "quan_ly_dao_tao" | "giang_vien" | "tro_giang";
  hoc_vi: string | null;
  chuc_danh: string | null;
  chuyen_mon: string | null;
  khoa_phong_cong_tac: string | null;
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
    .select("id, full_name, role, hoc_vi, chuc_danh, chuyen_mon, khoa_phong_cong_tac")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  return {
    id: profile.id,
    email: user.email,
    full_name: profile.full_name,
    role: profile.role,
    hoc_vi: profile.hoc_vi,
    chuc_danh: profile.chuc_danh,
    chuyen_mon: profile.chuyen_mon,
    khoa_phong_cong_tac: profile.khoa_phong_cong_tac,
  };
});
