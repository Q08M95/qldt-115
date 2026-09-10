-- =====================================================================
-- QLĐT 115 — sửa theo yêu cầu người dùng 2026-09-10 (tiếp):
-- lop_hoc.giang_vien_chi_dinh_id/tro_giang_chi_dinh_id (uuid đơn) đổi
-- thành mảng uuid[] — giao diện sẽ tự hiện N ô chỉ định tương ứng đúng
-- so_giang_vien_can/so_tro_giang_can (thay vì chỉ 1 người/vai trò).
-- Theo CLAUDE.md mục 4: ngoại lệ sửa schema đã chốt vì chính người dùng
-- chủ động yêu cầu — đã cập nhật lại tientrinh.md mục 1.2 trong cùng lượt.
-- Không đổi buoi_giang/bai_giang (không có so_*_can nhiều slot tương ứng,
-- giữ nguyên 1 người/vai trò như cũ).
-- =====================================================================

alter table public.lop_hoc add column giang_vien_chi_dinh_ids uuid[];
alter table public.lop_hoc add column tro_giang_chi_dinh_ids uuid[];

update public.lop_hoc
set giang_vien_chi_dinh_ids = case when giang_vien_chi_dinh_id is not null then array[giang_vien_chi_dinh_id] else null end,
    tro_giang_chi_dinh_ids = case when tro_giang_chi_dinh_id is not null then array[tro_giang_chi_dinh_id] else null end;

alter table public.lop_hoc drop column giang_vien_chi_dinh_id;
alter table public.lop_hoc drop column tro_giang_chi_dinh_id;

-- ---------------------------------------------------------------------
-- RPC tao_lop_hoc — 2 tham so cuoi doi tu uuid sang uuid[] (drop truoc vi
-- create or replace khong cho doi kieu tham so).
-- ---------------------------------------------------------------------
drop function if exists public.tao_lop_hoc(
  text, text, text, text, boolean, boolean, boolean,
  date, date, int, int, boolean, smallint[], smallint[], uuid, uuid, uuid
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
  p_so_giang_vien_can int,
  p_so_tro_giang_can int,
  p_mo_dang_ky boolean,
  p_nhom_giang_vien_phu_hop smallint[],
  p_nhom_tro_giang_phu_hop smallint[],
  p_giang_vien_chi_dinh_ids uuid[],
  p_tro_giang_chi_dinh_ids uuid[],
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
    la_lop_cong_dong, ngay_khai_giang, ngay_ket_thuc,
    so_giang_vien_can, so_tro_giang_can, mo_dang_ky,
    nhom_giang_vien_phu_hop, nhom_tro_giang_phu_hop,
    giang_vien_chi_dinh_ids, tro_giang_chi_dinh_ids, chuong_trinh_id, created_by
  ) values (
    p_ten_lop, p_mo_ta, p_loai_lop, p_doi_tuong_hoc_vien, p_co_kinh_phi, p_la_lop_gap,
    p_la_lop_cong_dong, p_ngay_khai_giang, p_ngay_ket_thuc,
    p_so_giang_vien_can, p_so_tro_giang_can, p_mo_dang_ky,
    p_nhom_giang_vien_phu_hop, p_nhom_tro_giang_phu_hop,
    p_giang_vien_chi_dinh_ids, p_tro_giang_chi_dinh_ids, p_chuong_trinh_id, auth.uid()
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
-- xoa_nhan_su: cap nhat dieu kien kiem tra lop_hoc sang 2 cot mang moi.
-- ---------------------------------------------------------------------
create or replace function public.xoa_nhan_su(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Chỉ admin được xoá nhân sự';
  end if;

  if p_id = auth.uid() then
    raise exception 'Không thể tự xoá chính mình';
  end if;

  if exists (
       select 1 from public.lop_hoc
       where created_by = p_id
          or p_id = any(giang_vien_chi_dinh_ids)
          or p_id = any(tro_giang_chi_dinh_ids)
     )
     or exists (select 1 from public.dang_ky_giang_day where profile_id = p_id or nguoi_duyet_id = p_id)
     or exists (select 1 from public.lich_giang where giang_vien_id = p_id or tro_giang_id = p_id)
     or exists (select 1 from public.danh_gia_kpi where profile_id = p_id or nguoi_danh_gia_id = p_id)
     or exists (select 1 from public.kpi_tong_hop where profile_id = p_id)
     or exists (select 1 from public.loi_moi_giang_day where profile_id = p_id or nguoi_moi_id = p_id)
     or exists (select 1 from public.khao_sat_hoc_vien where profile_id = p_id)
     or exists (select 1 from public.hoat_dong_hoc_thuat where profile_id = p_id)
     or exists (select 1 from public.mentor_mentee where mentor_id = p_id or mentee_id = p_id)
     or exists (select 1 from public.hoat_dong_chung where profile_id = p_id)
     or exists (select 1 from public.ky_luat_khen_thuong where profile_id = p_id or nguoi_ghi_nhan_id = p_id)
     or exists (select 1 from public.buoi_giang where giang_vien_chi_dinh_id = p_id or tro_giang_chi_dinh_id = p_id)
     or exists (select 1 from public.bai_giang where giang_vien_chi_dinh_id = p_id or tro_giang_chi_dinh_id = p_id)
  then
    raise exception 'Không thể xoá vì nhân sự này đã có dữ liệu liên quan (lớp phụ trách, đăng ký, lịch giảng, đánh giá KPI...). Hãy khoá hoạt động thay vì xoá.';
  end if;

  delete from auth.users where id = p_id;
end;
$$;
