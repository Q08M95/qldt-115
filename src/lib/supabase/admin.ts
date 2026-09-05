import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * CHI duoc goi tu Server Action/Route Handler. Dung SUPABASE_SERVICE_ROLE_KEY
 * nen bypass toan bo RLS — ly do can: tao tai khoan auth.users moi qua Admin
 * API khi admin them nhan su truc tiep tu form (khong lam duoc bang anon key
 * vi profiles.id co FK toi auth.users.id, doi hoi auth user phai ton tai
 * truoc). Package "server-only" chan viec module nay bi import nham vao
 * client bundle lam lo key.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
