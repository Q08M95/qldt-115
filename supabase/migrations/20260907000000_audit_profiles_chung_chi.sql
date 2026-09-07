-- Mo rong co che audit_log da co san (log_audit(), xem
-- 20260905000000_initial_schema.sql) sang bang profiles va chung_chi.
-- tientrinh.md muc 1.3.3 chi liet ke lop_hoc/dang_ky_giang_day/danh_gia_kpi/
-- kpi_tong_hop, nhung doi voi mot he thong nhan su y te that, thay doi vai
-- tro/khoa-mo hoat dong/chung chi cung nhay cam khong kem — nen ghi nhat ky
-- luon o tang trigger (bat bien tu client) thay vi insert tay tu Server
-- Action (de sot, va audit_log khong co insert policy cho client theo dung
-- thiet ke ban dau).
create trigger audit_profiles after insert or update or delete on public.profiles
  for each row execute procedure public.log_audit();

create trigger audit_chung_chi after insert or update or delete on public.chung_chi
  for each row execute procedure public.log_audit();
