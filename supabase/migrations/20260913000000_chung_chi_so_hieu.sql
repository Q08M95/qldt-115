-- =====================================================================
-- QLĐT 115 — Giai đoạn 3 rà soát lại (yêu cầu người dùng 2026-09-10):
-- Thêm chung_chi.so_chung_chi (số hiệu văn bằng/chứng chỉ) — khớp đúng
-- cột "SỐ" trong sheet "QUẢN LÝ CHỨNG CHỈ" của data quan ly dao tao.xlsx,
-- trước đây bỏ qua vì không có cột tương ứng, nay người dùng yêu cầu thêm.
-- Theo CLAUDE.md mục 4: ngoại lệ sửa schema đã chốt vì chính người dùng
-- chủ động yêu cầu — đã cập nhật lại tientrinh.md mục 1.2 trong cùng lượt.
-- =====================================================================

alter table public.chung_chi add column so_chung_chi text;
