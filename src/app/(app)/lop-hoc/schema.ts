import { z } from "zod";
import { DOI_TUONG_HOC_VIEN_VALUES } from "@/lib/constants/lop-hoc";

export function firstIssueMessage(result: { success: false; error: z.ZodError }) {
  return result.error.issues[0]?.message ?? "Dữ liệu không hợp lệ";
}

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((v) => v || null);

const optionalDate = z
  .string()
  .trim()
  .optional()
  .transform((v) => v || null);

// nullish() (khong chi optional()) vi action co the truyen thang null khi
// nguoi dung chon sentinel "none" o Select (xem readLopHocFields).
const optionalId = z
  .string()
  .trim()
  .nullish()
  .transform((v) => v || null);

const optionalDoiTuong = z
  .enum(DOI_TUONG_HOC_VIEN_VALUES)
  .nullish()
  .transform((v) => v || null);

const flag = z.preprocess((v) => v === "on" || v === true, z.boolean());

// Mang nhom_phan_loai (1-5) chon qua checkbox — formData tra ve string[]
// (getAll) hoac undefined neu khong tick gi ca.
const nhomArray = z
  .array(z.coerce.number().int().min(1).max(5))
  .optional()
  .transform((v) => (v && v.length > 0 ? v : null));

export const createLopHocSchema = z.object({
  ten_lop: z.string().trim().min(1, "Vui lòng nhập tên lớp"),
  mo_ta: optionalText,
  loai_lop: optionalId,
  doi_tuong_hoc_vien: optionalDoiTuong,
  co_kinh_phi: flag,
  la_lop_gap: flag,
  la_lop_cong_dong: flag,
  ngay_khai_giang: optionalDate,
  ngay_ket_thuc: optionalDate,
  so_giang_vien_can: z.coerce.number().int().min(0),
  so_tro_giang_can: z.coerce.number().int().min(0),
  mo_dang_ky: flag,
  nhom_giang_vien_phu_hop: nhomArray,
  nhom_tro_giang_phu_hop: nhomArray,
  giang_vien_chi_dinh_id: optionalId,
  tro_giang_chi_dinh_id: optionalId,
  chuong_trinh_id: optionalId,
});

export const updateLopHocSchema = createLopHocSchema.omit({ chuong_trinh_id: true });
