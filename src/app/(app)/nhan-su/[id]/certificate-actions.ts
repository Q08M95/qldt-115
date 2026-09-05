"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function uploadCertificate(profileId: string, formData: FormData) {
  const file = formData.get("file") as File | null;
  const tenChungChi = String(formData.get("ten_chung_chi") ?? "");
  const noiCap = String(formData.get("noi_cap") ?? "") || null;
  const ngayCap = String(formData.get("ngay_cap") ?? "") || null;
  const ngayHetHan = String(formData.get("ngay_het_han") ?? "") || null;
  const batBuoc = formData.get("bat_buoc") === "on";

  if (!file || file.size === 0) {
    throw new Error("Vui lòng chọn file chứng chỉ");
  }

  const supabase = await createClient();
  const path = `${profileId}/${crypto.randomUUID()}-${file.name}`;

  const { error: uploadError } = await supabase.storage.from("chung-chi").upload(path, file);
  if (uploadError) {
    throw new Error(uploadError.message);
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
    throw new Error(insertError.message);
  }

  revalidatePath(`/nhan-su/${profileId}`);
}

export async function deleteCertificate(certId: string, fileUrl: string, profileId: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("chung_chi").delete().eq("id", certId);
  if (error) {
    throw new Error(error.message);
  }

  await supabase.storage.from("chung-chi").remove([fileUrl]);
  revalidatePath(`/nhan-su/${profileId}`);
}

export async function getCertificateSignedUrl(fileUrl: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from("chung-chi")
    .createSignedUrl(fileUrl, 60 * 5);

  if (error || !data) {
    throw new Error(error?.message ?? "Không lấy được liên kết file");
  }

  return data.signedUrl;
}
