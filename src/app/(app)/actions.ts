"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export type GlobalSearchResult = {
  profiles: { id: string; full_name: string }[];
  classes: { id: string; ten_lop: string }[];
};

// Tim kiem toan cuc o header (thietke-giao-dien.md muc 2/3) — dung client
// Supabase thuong (khong bypass RLS), moi authenticated user deu doc duoc
// profiles/lop_hoc theo dung ma tran quyen CLAUDE.md muc 2 nen khong can
// kiem tra role rieng o day.
export async function globalSearch(query: string): Promise<GlobalSearchResult> {
  const q = query.trim();
  if (!q) return { profiles: [], classes: [] };

  const supabase = await createClient();
  const [{ data: profiles }, { data: classes }] = await Promise.all([
    supabase.from("profiles").select("id, full_name").ilike("full_name", `%${q}%`).order("full_name").limit(8),
    supabase.from("lop_hoc").select("id, ten_lop").ilike("ten_lop", `%${q}%`).order("ten_lop").limit(8),
  ]);

  return {
    profiles: profiles ?? [],
    classes: classes ?? [],
  };
}
