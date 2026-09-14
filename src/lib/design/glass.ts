// Cong thuc "kinh mo" dung chung toan app — CLAUDE.md muc 3.1 (chot chinh
// thuc 2026-09-14, sau khi duyet trang thu nghiem /thu-nghiem-giao-dien).
// Dat thanh 1 hang so string thay vi lap lai o tung component, de doi cong
// thuc 1 cho duy nhat neu can chinh sau nay. Nen gradient (khong dung anh
// phong canh that) dat qua CSS var --app-gradient trong globals.css de tu
// doi theo light/dark, khong can hang so JS rieng o day.
export const GLASS_SURFACE =
  "border border-white/50 bg-white/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_20px_50px_-24px_oklch(55%_0.15_250/0.3)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.06] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_20px_50px_-24px_rgba(0,0,0,0.55)]";

// Ban nhe hon, dung cho phan tu nho lap lai nhieu (hang trong bang, chip) —
// giam blur/shadow de do ganh nang GPU khi co nhieu phan tu cung luc, van
// giu cam giac trong suot.
export const GLASS_SURFACE_LIGHT =
  "border border-white/40 bg-white/40 backdrop-blur-md dark:border-white/10 dark:bg-white/[0.04]";
