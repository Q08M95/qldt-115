import { z } from "zod";
import { ROLE_VALUES } from "@/lib/constants/roles";

// Tra ve dung 1 thong bao tieng Viet dau tien de hien thi cho nguoi dung —
// khong can hien het toan bo loi zod cho 1 form don gian.
export function firstIssueMessage(result: { success: false; error: z.ZodError }) {
  return result.error.issues[0]?.message ?? "Dữ liệu không hợp lệ";
}

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((v) => v || null);

// nullish() (khong chi optional()) vi action truyen thang null khi nguoi
// dung chon sentinel "none" o Select — xem readUpdateFields trong actions.ts.
const optionalNhom = z
  .number()
  .int()
  .min(1)
  .max(5)
  .nullish()
  .transform((v) => v ?? null);

export const createProfileSchema = z.object({
  full_name: z.string().trim().min(1, "Vui lòng nhập họ tên"),
  email: z.email("Email không hợp lệ"),
  role: z.enum(ROLE_VALUES, { message: "Vai trò không hợp lệ" }),
  hoc_vi: optionalText,
  chuyen_mon: optionalText,
});

export const updateProfileByAdminSchema = z.object({
  full_name: z.string().trim().min(1, "Vui lòng nhập họ tên"),
  role: z.enum(ROLE_VALUES, { message: "Vai trò không hợp lệ" }),
  hoc_vi: optionalText,
  chuc_danh: optionalText,
  chuyen_mon: optionalText,
  khoa_phong_cong_tac: optionalText,
  nhom_phan_loai: optionalNhom,
});

export const updateProfileEmailSchema = z.object({
  email: z.email("Email không hợp lệ"),
});
