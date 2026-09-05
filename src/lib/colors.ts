/**
 * Bang mau chinh thuc cua du an — CLAUDE.md muc 3.
 * Nguon chan ly duy nhat cho ma hex dung trong bieu do/stat card.
 * KHONG tu doi gia tri o day — neu can them mau moi phai chay lai
 * quy trinh kiem chung OKLCH/CVD (skill dataviz) va xin xac nhan nguoi dung.
 */
export const DATA_ROLE_COLORS = {
  giangVien: { light: "#6C2C8F", dark: "#AE73D2", label: "Giảng viên" },
  troGiang: { light: "#B8415A", dark: "#B8415A", label: "Trợ giảng" },
  lopHoc: { light: "#2973B2", dark: "#2973B2", label: "Lớp học" },
  dangKy: { light: "#1AA7A0", dark: "#1AA7A0", label: "Đăng ký chờ duyệt" },
  canhBao: { light: "#D9711F", dark: "#D9711F", label: "Cảnh báo / thiếu nhân sự" },
  kpi: { light: "#0A6B2A", dark: "#08722E", label: "KPI" },
} as const;

export type DataRole = keyof typeof DATA_ROLE_COLORS;
export type ColorMode = "light" | "dark";

export function dataRoleColor(role: DataRole, mode: ColorMode = "light"): string {
  return DATA_ROLE_COLORS[role][mode];
}

// Mau chu dao — dung cho bieu do sequential (mat do/khoi luong).
export const PRIMARY_HEX = "#2973B2";

// Cap mau cho bieu do diverging (tang/giam quanh 1 moc), diem giua trung tinh.
export const DIVERGING_COLORS = {
  positive: "#2973B2",
  negative: "#D9711F",
  neutral: "#9CA3AF",
} as const;

function lerpHex(from: string, to: string, t: number): string {
  const f = [1, 3, 5].map((i) => parseInt(from.slice(i, i + 2), 16));
  const g = [1, 3, 5].map((i) => parseInt(to.slice(i, i + 2), 16));
  const c = f.map((v, i) => Math.round(v + (g[i] - v) * t));
  return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/**
 * Dai mau sequential tu nhat den dam cua mau chu dao, dung cho bieu do
 * the hien do lon/mat do (vd mat do lich giang theo ngay). Noi suy sRGB
 * don gian — neu 1 bieu do cu the can buoc mau chuan OKLCH hon, chay lai
 * scripts/validate_palette.js (skill dataviz) truoc khi chot.
 */
export function sequentialScale(steps: number): string[] {
  const lightTint = "#EAF2F8";
  if (steps <= 1) return [PRIMARY_HEX];
  return Array.from({ length: steps }, (_, i) => lerpHex(lightTint, PRIMARY_HEX, i / (steps - 1)));
}
