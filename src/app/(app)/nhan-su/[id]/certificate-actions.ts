"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Cac loi "mong doi" (validation, RLS tu choi...) tra ve qua gia tri, KHONG
// throw — Next.js che toan bo message cua loi throw trong production
// (chi con "digest" chung chung, xem docs Handling expected errors), khien
// nguoi dung chi thay "Minified React error #441" vo nghia.
export async function uploadCertificate(
  profileId: string,
  formData: FormData,
): Promise<{ error?: string }> {
  const file = formData.get("file") as File | null;
  const tenChungChi = String(formData.get("ten_chung_chi") ?? "");
  const noiCap = String(formData.get("noi_cap") ?? "") || null;
  const ngayCap = String(formData.get("ngay_cap") ?? "") || null;
  const ngayHetHan = String(formData.get("ngay_het_han") ?? "") || null;
  const batBuoc = formData.get("bat_buoc") === "on";

  if (!tenChungChi.trim()) {
    return { error: "Vui lòng nhập tên chứng chỉ" };
  }
  if (!file || file.size === 0) {
    return { error: "Vui lòng chọn file chứng chỉ" };
  }

  const supabase = await createClient();
  const path = `${profileId}/${crypto.randomUUID()}-${file.name}`;

  const { error: uploadError } = await supabase.storage.from("chung-chi").upload(path, file);
  if (uploadError) {
    return { error: uploadError.message };
  }

  const { error: insertError } = await supabase.from("chung_chi").insert({
    profile_id: profileId,
    ten_chung_chi: tenChungChi,
    noi_cap: noiCap,
    ngay_cap: ngayCap,
    ngay_het_han: ngayHetHan,
    bat_buoc: batBuoc,
    file_url: path,
  });

  if (insertError) {
    await supabase.storage.from("chung-chi").remove([path]);
    return { error: insertError.message };
  }

  revalidatePath(`/nhan-su/${profileId}`);
  return {};
}

export async function deleteCertificate(
  certId: string,
  fileUrl: string,
  profileId: string,
): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase.from("chung_chi").delete().eq("id", certId);
  if (error) {
    return { error: error.message };
  }

  await supabase.storage.from("chung-chi").remove([fileUrl]);
  revalidatePath(`/nhan-su/${profileId}`);
  return {};
}

export async function getCertificateSignedUrl(
  fileUrl: string,
): Promise<{ url?: string; error?: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from("chung-chi")
    .createSignedUrl(fileUrl, 60 * 5);

  if (error || !data) {
    return { error: error?.message ?? "Không lấy được liên kết file" };
  }

  return { url: data.signedUrl };
}
