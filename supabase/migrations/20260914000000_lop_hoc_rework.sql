-- =====================================================================
-- QLĐT 115 — Giai đoạn 4 rà soát lại (yêu cầu người dùng 2026-09-10):
-- 1. Trạng thái lớp chỉ còn 3 giá trị thuần theo ngày: chua_mo, dang_dien_ra,
--    hoan_thanh. Bỏ hẳn 'thieu_nhan_su' và 'huy' — huỷ lớp giữa chừng nay
--    là XOÁ CỨNG lớp đó (RPC xoa_lop_hoc), hoãn lớp là sửa lại ngày.
-- 2. Bỏ so_hoc_vien_du_kien (không quan trọng).
-- 3. Bỏ nguoi_phu_trach_id (1 người phụ trách chung chung), thay bằng 2
--    trường chỉ định chi tiết hơn: giang_vien_chi_dinh_id, tro_giang_chi_dinh_id.
-- 4. Thêm mo_dang_ky (cho phép nhân sự tự đăng ký) + nhom_giang_vien_phu_hop/
--    nhom_tro_giang_phu_hop (smallint[], dùng đúng nhom_phan_loai 1-5 của
--    profiles) để giới hạn ai được đăng ký/chỉ định phù hợp.
-- 5. Bảng buoi_giang mới — khớp cấu trúc thật (sheet "DANH MỤC BUỔI GIẢNG"),
--    1 buổi gồm nhiều bài giảng, có quota GV/TG + mở đăng ký/chỉ định riêng
--    (đăng ký có thể theo lớp, theo buổi, hoặc theo từng bài).
-- 6. bai_giang: cho phép số tiết < 1 (numeric thay int), gắn buoi_giang_id
--    (tuỳ chọn), thêm mo_dang_ky + 2 trường chỉ định như buổi/lớp.
-- Theo CLAUDE.md mục 4: ngoại lệ sửa schema đã chốt vì chính người dùng chủ
-- động yêu cầu — đã cập nhật lại tientrinh.md mục 1.2 trong cùng lượt. Đây
-- cũng đảo ngược 1 phần ranh giới đã chốt 2026-09-10 (bai_giang không chứa
-- người chỉ định) — người dùng chủ động yêu cầu mở lại ranh giới này.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Trạng thái lớp: phải BỎ constraint cũ truoc, roi moi duoc phep ghi
-- gia tri 'chua_mo' (constraint cu chua cho phep gia tri nay).
-- ---------------------------------------------------------------------
alter table public.lop_hoc drop constraint if exists lop_hoc_trang_thai_check;

update public.lop_hoc set trang_thai = case
  when ngay_ket_thuc is not null and ngay_ket_thuc < current_date then 'hoan_thanh'
  when ngay_khai_giang is not null and ngay_khai_giang <= current_date then 'dang_dien_ra'
  else 'chua_mo'
end
where trang_thai in ('thieu_nhan_su', 'huy', 'cho_khai_giang');

alter table public.lop_hoc alter column trang_thai drop default;
alter table public.lop_hoc alter column trang_thai set default 'chua_mo';

alter table public.lop_hoc
  add constraint lop_hoc_trang_thai_check
  check (trang_thai in ('chua_mo', 'dang_dien_ra', 'hoan_thanh'));

-- ---------------------------------------------------------------------
-- 2-4. Cột lop_hoc.
-- ---------------------------------------------------------------------
alter table public.lop_hoc drop column if exists so_hoc_vien_du_kien;
alter table public.lop_hoc drop column if exists nguoi_phu_trach_id;

alter table public.lop_hoc add column mo_dang_ky boolean default false;
alter table public.lop_hoc add column nhom_giang_vien_phu_hop smallint[];
alter table public.lop_hoc add column nhom_tro_giang_phu_hop smallint[];
alter table public.lop_hoc add column giang_vien_chi_dinh_id uuid references public.profiles(id);
alter table public.lop_hoc add column tro_giang_chi_dinh_id uuid references public.profiles(id);

-- ---------------------------------------------------------------------
-- 5. Bảng buổi giảng.
-- ---------------------------------------------------------------------
create table public.buoi_giang (
  id uuid primary key default gen_random_uuid(),
  lop_hoc_id uuid references public.lop_hoc(id) on delete cascade not null,
  ten_buoi text not null,
  thu_tu int default 1,
  so_giang_vien_can int default 1,
  so_tro_giang_can int default 1,
  mo_dang_ky boolean default false,
  giang_vien_chi_dinh_id uuid references public.profiles(id),
  tro_giang_chi_dinh_id uuid references public.profiles(id),
  created_at timestamptz default now()
);

alter table public.buoi_giang enable row level security;

create policy buoi_giang_select on public.buoi_giang
  for select to authenticated using (true);
create policy buoi_giang_write on public.buoi_giang
  for all to authenticated using (public.is_quan_ly()) with check (public.is_quan_ly());

-- ---------------------------------------------------------------------
-- 6. Cột bai_giang.
-- ---------------------------------------------------------------------
alter table public.bai_giang alter column thoi_luong_tiet type numeric using thoi_luong_tiet::numeric;
alter table public.bai_giang alter column thoi_luong_tiet set default 1;

alter table public.bai_giang add column buoi_giang_id uuid references public.buoi_giang(id) on delete set null;
alter table public.bai_giang add column mo_dang_ky boolean default false;
alter table public.bai_giang add column giang_vien_chi_dinh_id uuid references public.profiles(id);
alter table public.bai_giang add column tro_giang_chi_dinh_id uuid references public.profiles(id);

-- ---------------------------------------------------------------------
-- RPC tao_lop_hoc — chữ ký mới (bỏ so_hoc_vien_du_kien/nguoi_phu_trach_id,
-- thêm mo_dang_ky/nhom_giang_vien_phu_hop/nhom_tro_giang_phu_hop/2 truong
-- chi dinh). Xoa chu ky cu 14 tham so truoc khi tao lai.
-- ---------------------------------------------------------------------
drop function if exists public.tao_lop_hoc(
  text, text, text, text, boolean, boolean, boolean,
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
  p_so_giang_vien_can int,
  p_so_tro_giang_can int,
  p_mo_dang_ky boolean,
  p_nhom_giang_vien_phu_hop smallint[],
  p_nhom_tro_giang_phu_hop smallint[],
  p_giang_vien_chi_dinh_id uuid,
  p_tro_giang_chi_dinh_id uuid,
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
    giang_vien_chi_dinh_id, tro_giang_chi_dinh_id, chuong_trinh_id, created_by
  ) values (
    p_ten_lop, p_mo_ta, p_loai_lop, p_doi_tuong_hoc_vien, p_co_kinh_phi, p_la_lop_gap,
    p_la_lop_cong_dong, p_ngay_khai_giang, p_ngay_ket_thuc,
    p_so_giang_vien_can, p_so_tro_giang_can, p_mo_dang_ky,
    p_nhom_giang_vien_phu_hop, p_nhom_tro_giang_phu_hop,
    p_giang_vien_chi_dinh_id, p_tro_giang_chi_dinh_id, p_chuong_trinh_id, auth.uid()
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
-- RPC sap xep lai buoi giang bang keo-tha, cung mo hinh voi reorder_bai_giang.
-- ---------------------------------------------------------------------
create or replace function public.reorder_buoi_giang(p_lop_hoc_id uuid, p_ids uuid[])
returns void
language sql
set search_path = public
as $$
  update public.buoi_giang
  set thu_tu = t.idx
  from unnest(p_ids) with ordinality as t(id, idx)
  where buoi_giang.id = t.id and buoi_giang.lop_hoc_id = p_lop_hoc_id;
$$;

-- ---------------------------------------------------------------------
-- RPC xoa cung 1 lop hoc — "huy" lop gio dong nghia voi xoa han (theo yeu
-- cau nguoi dung), kiem tra rang buoc du lieu truoc de tra loi ro rang.
-- Dung is_quan_ly() (khong phai is_admin()) vi lop_hoc von da la "Full/Full"
-- cho ca admin lan quan_ly_dao_tao trong ma tran quyen Giai doan 2.
-- ---------------------------------------------------------------------
create or replace function public.xoa_lop_hoc(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_quan_ly() then
    raise exception 'Không có quyền xoá lớp học';
  end if;

  if exists (select 1 from public.dang_ky_giang_day where lop_hoc_id = p_id)
     or exists (select 1 from public.lich_giang where lop_hoc_id = p_id)
     or exists (select 1 from public.loi_moi_giang_day where lop_hoc_id = p_id)
     or exists (select 1 from public.khao_sat_hoc_vien where lop_hoc_id = p_id)
  then
    raise exception 'Không thể xoá vì lớp học này đã có đăng ký/lịch giảng/khảo sát liên quan.';
  end if;

  delete from public.lop_hoc where id = p_id;
end;
$$;

-- ---------------------------------------------------------------------
-- xoa_nhan_su tham chieu nguoi_phu_trach_id (da xoa cot) — cap nhat lai
-- dieu kien kiem tra sang 2 cot chi dinh moi.
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
          or giang_vien_chi_dinh_id = p_id
          or tro_giang_chi_dinh_id = p_id
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
