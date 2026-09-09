-- Sua schema lop_hoc theo yeu cau nghiep vu cua nguoi dung (2026-09-10) —
-- KHONG phai Claude tu y mo rong schema da chot o Giai doan 1 (CLAUDE.md
-- muc 4), day la quyet dinh chu dong cua nguoi dung sau khi da dua vao du
-- lieu that. tientrinh.md da duoc cap nhat lai de khop voi thay doi nay.
--
-- - Bo hinh_thuc: khong dung toi trong thuc te, moi lop deu truc tiep.
-- - Bo la_gio_hiem: gop chung vao khai niem "lop dot xuat" (la_lop_gap,
--   chi doi nhan hien thi, khong doi ten cot) cho don gian.
-- - Them doi_tuong_hoc_vien: phan biet lop danh cho nhan vien y te hay
--   cong dong — truoc day chi ghi tay trong mo_ta, gio thanh truong co cau
--   truc de loc/thong ke duoc.

alter table public.lop_hoc drop column if exists hinh_thuc;
alter table public.lop_hoc drop column if exists la_gio_hiem;

alter table public.lop_hoc
  add column doi_tuong_hoc_vien text
  check (doi_tuong_hoc_vien in ('nhan_vien_y_te', 'cong_dong'));

-- KPI Nhom A (CLAUDE.md muc 2.2) truoc day quy doi theo 4 co tinh chat lop
-- (khong_kinh_phi/lop_gap/gio_hiem/lop_cong_dong) — bo "gio_hiem" cho khop
-- voi viec xoa la_gio_hiem o tren, con lai 3 co. Bang nay chua co du lieu
-- (Giai doan 7 chua xay) nen sua constraint an toan, khong mat du lieu.
alter table public.kpi_he_so_quy_doi
  drop constraint if exists kpi_he_so_quy_doi_loai_he_so_check;
alter table public.kpi_he_so_quy_doi
  add constraint kpi_he_so_quy_doi_loai_he_so_check
  check (loai_he_so in ('khong_kinh_phi', 'lop_gap', 'lop_cong_dong'));

-- RPC tao_lop_hoc (20260909000000_rpc_tao_lop_hoc.sql) tham chieu truc tiep
-- p_hinh_thuc/p_la_gio_hiem — phai doi lai chu ky ham cho khop cot moi.
-- Signature cu (15 tham so) co the chua ton tai neu ban chua kip chay
-- migration truoc, "if exists" giu an toan trong ca 2 truong hop.
drop function if exists public.tao_lop_hoc(
  text, text, text, text, boolean, boolean, boolean, boolean,
  date, date, int, int, int, uuid, uuid
);

create or replace function public.tao_lop_hoc(
  p_ten_lop text,
  p_mo_ta text,
  p_loai_lop text,
  p_doi_tuong_hoc_vien text,
  p_co_kinh_phi boolean,
  p_la_lop_gap boolean,
  p_la_lop_cong_dong boolean,
  p_ngay_khai_giang date,
  p_ngay_ket_thuc date,
  p_so_hoc_vien_du_kien int,
  p_so_giang_vien_can int,
  p_so_tro_giang_can int,
  p_nguoi_phu_trach_id uuid,
  p_chuong_trinh_id uuid
)
returns uuid
language plpgsql
set search_path = public
as $$
declare
  v_lop_id uuid;
begin
  if not public.is_quan_ly() then
    raise exception 'khong co quyen tao lop hoc';
  end if;

  insert into public.lop_hoc (
    ten_lop, mo_ta, loai_lop, doi_tuong_hoc_vien, co_kinh_phi, la_lop_gap,
    la_lop_cong_dong, ngay_khai_giang, ngay_ket_thuc, so_hoc_vien_du_kien,
    so_giang_vien_can, so_tro_giang_can, nguoi_phu_trach_id, chuong_trinh_id, created_by
  ) values (
    p_ten_lop, p_mo_ta, p_loai_lop, p_doi_tuong_hoc_vien, p_co_kinh_phi, p_la_lop_gap,
    p_la_lop_cong_dong, p_ngay_khai_giang, p_ngay_ket_thuc, p_so_hoc_vien_du_kien,
    p_so_giang_vien_can, p_so_tro_giang_can, p_nguoi_phu_trach_id, p_chuong_trinh_id, auth.uid()
  ) returning id into v_lop_id;

  if p_chuong_trinh_id is not null then
    insert into public.bai_giang (lop_hoc_id, ten_bai, chuyen_de, thoi_luong_tiet, thu_tu)
    select v_lop_id, ten_bai, chuyen_de, thoi_luong_tiet, thu_tu
    from public.chuong_trinh_mau_bai_giang
    where chuong_trinh_id = p_chuong_trinh_id
    order by thu_tu;
  end if;

  return v_lop_id;
end;
$$;

-- ---------------------------------------------------------------------
-- Sap xep lai bai giang bang keo-tha (thay the o nhap "thu tu" thu cong).
-- Cap nhat thu_tu theo dung vi tri trong mang p_ids, gop thanh 1 cau lenh
-- set-based thay vi N lan UPDATE roi rac tu client (CLAUDE.md muc 4).
-- ---------------------------------------------------------------------
create or replace function public.reorder_bai_giang(p_lop_hoc_id uuid, p_ids uuid[])
returns void
language sql
set search_path = public
as $$
  update public.bai_giang
  set thu_tu = t.idx
  from unnest(p_ids) with ordinality as t(id, idx)
  where bai_giang.id = t.id and bai_giang.lop_hoc_id = p_lop_hoc_id;
$$;

create or replace function public.reorder_chuong_trinh_mau_bai_giang(p_chuong_trinh_id uuid, p_ids uuid[])
returns void
language sql
set search_path = public
as $$
  update public.chuong_trinh_mau_bai_giang
  set thu_tu = t.idx
  from unnest(p_ids) with ordinality as t(id, idx)
  where chuong_trinh_mau_bai_giang.id = t.id
    and chuong_trinh_mau_bai_giang.chuong_trinh_id = p_chuong_trinh_id;
$$;
