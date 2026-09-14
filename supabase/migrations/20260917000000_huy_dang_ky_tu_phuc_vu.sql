-- =====================================================================
-- QLĐT 115 — Giai đoạn 5 (tiếp), theo yêu cầu người dùng 2026-09-14:
-- Cho phép giảng viên/trợ giảng tự huỷ đăng ký của chính mình, NHƯNG chỉ
-- khi còn ở trạng thái 'cho_duyet' — đăng ký đã 'da_duyet' đã có lich_giang
-- tương ứng (tạo bởi RPC duyet_dang_ky), tự xoá sẽ để lại lich_giang mồ côi
-- không rõ nguồn gốc; đã 'tu_choi' thì không còn ý nghĩa để huỷ. Nếu cần
-- rút lui sau khi đã được duyệt, phải nhờ quản lý xử lý qua lịch giảng
-- (Giai đoạn 6), không phải tự xoá đăng ký gốc.
-- =====================================================================

drop policy if exists dang_ky_giang_day_delete on public.dang_ky_giang_day;
create policy dang_ky_giang_day_delete on public.dang_ky_giang_day
  for delete to authenticated
  using (
    public.is_admin()
    or (profile_id = auth.uid() and trang_thai = 'cho_duyet')
  );
