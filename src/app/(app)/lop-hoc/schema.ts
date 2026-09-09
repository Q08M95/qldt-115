import { z } from "zod";
import { HINH_THUC_VALUES } from "@/lib/constants/lop-hoc";

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

const flag = z.preprocess((v) => v === "on" || v === true, z.boolean());

export const createLopHocSchema = z.object({
  ten_lop: z.string().trim().min(1, "Vui lòng nhập tên lớp"),
  mo_ta: optionalText,
  loai_lop: optionalText,
  hinh_thuc: z.enum(HINH_THUC_VALUES),
  co_kinh_phi: flag,
  la_lop_gap: flag,
  la_gio_hiem: flag,
  la_lop_cong_dong: flag,
  ngay_khai_giang: optionalDate,
  ngay_ket_thuc: optionalDate,
  so_hoc_vien_du_kien: z.coerce.number().int().min(0).optional().nullable(),
  so_giang_vien_can: z.coerce.number().int().min(0),
  so_tro_giang_can: z.coerce.number().int().min(0),
  nguoi_phu_trach_id: optionalId,
  chuong_trinh_id: optionalId,
});

export const updateLopHocSchema = createLopHocSchema.omit({ chuong_trinh_id: true });
