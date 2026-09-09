import { z } from "zod";

export function firstIssueMessage(result: { success: false; error: z.ZodError }) {
  return result.error.issues[0]?.message ?? "Dữ liệu không hợp lệ";
}

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((v) => v || null);

export const programSchema = z.object({
  ten_chuong_trinh: z.string().trim().min(1, "Vui lòng nhập tên chương trình"),
  mo_ta: optionalText,
});

export const mauBaiGiangSchema = z.object({
  ten_bai: z.string().trim().min(1, "Vui lòng nhập tên bài giảng"),
  chuyen_de: optionalText,
  thoi_luong_tiet: z.coerce.number().int().min(1, "Số tiết phải >= 1"),
  thu_tu: z.coerce.number().int().min(1, "Thứ tự phải >= 1"),
});
