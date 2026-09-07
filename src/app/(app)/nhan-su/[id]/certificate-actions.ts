"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024; // 8MB — con du bien do voi gioi han body 10MB da cau hinh o next.config.ts

// input type="file" accept=".pdf,image/*" o client chi la goi y UI, ai cung
// bypass duoc bang cach doi ten file/gui request thang toi action nay — bat
// buoc kiem tra lai loai va dung luong file o server.
function validateFile(file: File): string | null {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return "Chỉ chấp nhận file PDF hoặc ảnh (JPEG/PNG/WEBP)";
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return "File vượt quá 8MB, vui lòng chọn file nhỏ hơn";
  }
  return null;
}

// Supabase Storage tu choi key co dau tieng Viet/khoang trang ("Invalid
// key"). Bo dau (theo ma Unicode, khong dung ky tu dau nao truc tiep trong
// nguon de tranh loi encoding) + thay ky tu khong an toan bang "_" truoc
// khi dung lam ten file luu tru (ten hien thi that van luu nguyen ven o
// cot ten_chung_chi).
function sanitizeFileName(name: string): string {
  const decomposed = name.normalize("NFD");
  let stripped = "";
  for (const ch of decomposed) {
    const code = ch.codePointAt(0) ?? 0;
    if (code >= 0x0300 && code <= 0x036f) continue; // dau to hop (combining diacritical marks)
    stripped += ch;
  }
  return stripped
    .replace(/đ/g, "d") // đ
    .replace(/Đ/g, "D") // Đ
    .replace(/[^a-zA-Z0-9.-]/g, "_");
}

// Cac loi "mong doi" (validation, RLS tu choi...) tra ve qua gia tri, KHONG
// throw — Next.js che toan bo message cua loi throw trong production
// (chi con "digest" chung chung, xem docs Handling expected errors), khien
// nguoi dung chi thay "Minified React error #441" vo nghia.
export async function uploadCertificate(
  profileId: string,
  formData: FormData,
): Promise<{ error?: string }> {
  const current = await getCurrentProfile();
  if (!current || (current.role !== "admin" && current.id !== profileId)) {
    return { error: "Bạn không có quyền thêm chứng chỉ cho hồ sơ này" };
  }

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
  const fileError = validateFile(file);
  if (fileError) {
    return { error: fileError };
  }

  const supabase = await createClient();
  const path = `${profileId}/${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;

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
  const current = await getCurrentProfile();
  if (!current || (current.role !== "admin" && current.id !== profileId)) {
    return { error: "Bạn không có quyền xoá chứng chỉ này" };
  }

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
