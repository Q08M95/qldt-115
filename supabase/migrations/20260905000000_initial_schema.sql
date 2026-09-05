-- =====================================================================
-- QLĐT 115 — Migration khởi tạo schema (Giai đoạn 1, tientrinh.md mục 1.2-1.3)
-- Nguồn chân lý: KHÔNG chỉnh sửa tên bảng/cột ở đây khi sinh code sau này.
-- Nếu thấy thiếu, dừng lại và báo trước khi tự thêm cột/bảng (CLAUDE.md mục 4).
-- =====================================================================

-- ========== NHÂN SỰ ==========
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('admin','quan_ly_dao_tao','giang_vien','tro_giang')),
  hoc_vi text,
  chuc_danh text,
  chuyen_mon text,
  don_vi_cong_tac text,
  so_dien_thoai text,
  ngay_vao_lam date,
  avatar_url text,
  trang_thai_hoat_dong boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table chung_chi (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade not null,
  ten_chung_chi text not null,
  noi_cap text,
  ngay_cap date,
  ngay_het_han date,
  file_url text,
  bat_buoc boolean default true,
  created_at timestamptz default now()
);

-- ========== CHƯƠNG TRÌNH ĐÀO TẠO (khung mẫu, tái sử dụng) ==========
create table chuong_trinh_dao_tao (
  id uuid primary key default gen_random_uuid(),
  ten_chuong_trinh text not null,
  mo_ta text,
  created_at timestamptz default now()
);

create table chuong_trinh_mau_bai_giang (
  id uuid primary key default gen_random_uuid(),
  chuong_trinh_id uuid references chuong_trinh_dao_tao(id) on delete cascade not null,
  ten_bai text not null,
  chuyen_de text,
  thoi_luong_tiet int default 1,
  thu_tu int default 1,
  created_at timestamptz default now()
);

-- ========== LỚP HỌC & BÀI GIẢNG ==========
create table lop_hoc (
  id uuid primary key default gen_random_uuid(),
  chuong_trinh_id uuid references chuong_trinh_dao_tao(id),
  ten_lop text not null,
  mo_ta text,
  loai_lop text,
  hinh_thuc text default 'truc_tiep' check (hinh_thuc in ('truc_tiep','truc_tuyen','ket_hop')),
  co_kinh_phi boolean default true,
  la_lop_gap boolean default false,
  la_gio_hiem boolean default false,
  la_lop_cong_dong boolean default false,
  ngay_khai_giang date,
  ngay_ket_thuc date,
  so_hoc_vien_du_kien int,
  so_giang_vien_can int default 1,
  so_tro_giang_can int default 1,
  trang_thai text not null default 'cho_khai_giang'
    check (trang_thai in ('cho_khai_giang','dang_dien_ra','hoan_thanh','thieu_nhan_su','huy')),
  nguoi_phu_trach_id uuid references profiles(id),
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table bai_giang (
  id uuid primary key default gen_random_uuid(),
  lop_hoc_id uuid references lop_hoc(id) on delete cascade not null,
  ten_bai text not null,
  chuyen_de text,
  thoi_luong_tiet int default 1,
  thu_tu int default 1,
  created_at timestamptz default now()
);

-- ========== ĐĂNG KÝ GIẢNG DẠY & LỊCH GIẢNG ==========
create table dang_ky_giang_day (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) not null,
  lop_hoc_id uuid references lop_hoc(id) not null,
  bai_giang_id uuid references bai_giang(id),
  vai_tro text not null check (vai_tro in ('giang_vien','tro_giang')),
  loai_dang_ky text default 'tu_de_xuat' check (loai_dang_ky in ('tu_de_xuat','duoc_moi')),
  trang_thai text not null default 'cho_duyet'
    check (trang_thai in ('cho_duyet','da_duyet','tu_choi')),
  nguoi_duyet_id uuid references profiles(id),
  ghi_chu text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table lich_giang (
  id uuid primary key default gen_random_uuid(),
  lop_hoc_id uuid references lop_hoc(id) not null,
  bai_giang_id uuid references bai_giang(id),
  giang_vien_id uuid references profiles(id),
  tro_giang_id uuid references profiles(id),
  ngay_gio timestamptz,
  buoi text check (buoi in ('sang','chieu','toi')),
  dia_diem text,
  trang_thai text default 'du_kien'
    check (trang_thai in ('du_kien','da_xac_nhan','da_ban_giao','huy')),
  ly_do_huy text,
  thoi_diem_huy timestamptz,
  created_at timestamptz default now()
);

-- ========== KPI ==========
create table kpi_ky (
  id uuid primary key default gen_random_uuid(),
  ten_ky text not null,
  ngay_bat_dau date not null,
  ngay_ket_thuc date not null,
  trang_thai text default 'dang_mo' check (trang_thai in ('dang_mo','da_chot','da_cong_bo')),
  created_at timestamptz default now()
);

create table kpi_tieu_chi (
  id uuid primary key default gen_random_uuid(),
  ten_tieu_chi text not null,
  mo_ta text,
  thang_diem numeric default 10,
  created_at timestamptz default now()
);

create table kpi_tieu_chi_theo_ky (
  id uuid primary key default gen_random_uuid(),
  kpi_ky_id uuid references kpi_ky(id) on delete cascade not null,
  tieu_chi_id uuid references kpi_tieu_chi(id) not null,
  trong_so numeric not null,
  unique (kpi_ky_id, tieu_chi_id)
);

create table danh_gia_kpi (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) not null,
  kpi_ky_id uuid references kpi_ky(id) not null,
  tieu_chi_id uuid references kpi_tieu_chi(id) not null,
  diem numeric not null,
  nguoi_danh_gia_id uuid references profiles(id),
  loai_nguoi_danh_gia text default 'quan_ly' check (loai_nguoi_danh_gia in ('quan_ly','dong_nghiep')),
  ghi_chu text,
  created_at timestamptz default now(),
  unique (profile_id, kpi_ky_id, tieu_chi_id, nguoi_danh_gia_id)
);

create table kpi_tong_hop (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) not null,
  kpi_ky_id uuid references kpi_ky(id) not null,
  tong_diem numeric,
  diem_nhom_a numeric,
  diem_nhom_b numeric,
  diem_nhom_c numeric,
  diem_nhom_d numeric,
  xep_hang text check (xep_hang in ('tang_nhom','giu_nguyen','ha_nhom')),
  ghi_chu text,
  created_at timestamptz default now(),
  unique (profile_id, kpi_ky_id)
);

create table kpi_he_so_quy_doi (
  id uuid primary key default gen_random_uuid(),
  kpi_ky_id uuid references kpi_ky(id) on delete cascade not null,
  loai_he_so text not null check (loai_he_so in ('khong_kinh_phi','lop_gap','gio_hiem','lop_cong_dong')),
  gia_tri numeric not null,
  created_at timestamptz default now(),
  unique (kpi_ky_id, loai_he_so)
);

create table loi_moi_giang_day (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) not null,
  lop_hoc_id uuid references lop_hoc(id) not null,
  nguoi_moi_id uuid references profiles(id),
  phan_hoi text default 'cho_phan_hoi' check (phan_hoi in ('cho_phan_hoi','chap_nhan','tu_choi')),
  thoi_han_phan_hoi timestamptz,
  ghi_chu text,
  created_at timestamptz default now()
);

create table khao_sat_hoc_vien (
  id uuid primary key default gen_random_uuid(),
  lop_hoc_id uuid references lop_hoc(id) not null,
  profile_id uuid references profiles(id) not null,
  diem numeric not null,
  nhan_xet text,
  created_at timestamptz default now()
);

create table hoat_dong_hoc_thuat (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) not null,
  loai text not null check (loai in ('bien_soan_hoc_lieu','nghien_cuu','bao_cao_khoa_hoc','khac')),
  ten_hoat_dong text not null,
  ngay date,
  diem_quy_doi numeric default 0,
  minh_chung_url text,
  created_at timestamptz default now()
);

create table mentor_mentee (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid references profiles(id) not null,
  mentee_id uuid references profiles(id) not null,
  ngay_bat_dau date,
  ngay_ket_thuc date,
  trang_thai text default 'dang_thuc_hien' check (trang_thai in ('dang_thuc_hien','hoan_thanh','huy')),
  ghi_chu text,
  created_at timestamptz default now()
);

create table hoat_dong_chung (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) not null,
  ten_hoat_dong text not null,
  ngay date,
  diem_quy_doi numeric default 0,
  created_at timestamptz default now()
);

create table ky_luat_khen_thuong (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) not null,
  loai text not null check (loai in ('vi_pham','khen_thuong')),
  noi_dung text not null,
  diem_anh_huong numeric not null,
  ngay date,
  nguoi_ghi_nhan_id uuid references profiles(id),
  created_at timestamptz default now()
);

-- ========== HỆ THỐNG ==========
create table thong_bao (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) not null,
  tieu_de text not null,
  noi_dung text,
  duong_dan text,
  da_doc boolean default false,
  created_at timestamptz default now()
);

create table audit_log (
  id uuid primary key default gen_random_uuid(),
  bang text not null,
  ban_ghi_id uuid,
  hanh_dong text not null check (hanh_dong in ('create','update','delete')),
  du_lieu_cu jsonb,
  du_lieu_moi jsonb,
  thuc_hien_boi uuid references profiles(id),
  created_at timestamptz default now()
);

-- =====================================================================
-- 1.3.1 — Trigger tự tạo profiles khi có auth.users mới
-- Role mặc định thấp nhất (tro_giang), admin nâng quyền thủ công sau.
-- =====================================================================
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    'tro_giang'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =====================================================================
-- 1.3.2 — Trigger tự cập nhật updated_at
-- =====================================================================
create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.lop_hoc
  for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.dang_ky_giang_day
  for each row execute procedure public.set_updated_at();

-- =====================================================================
-- 1.3.3 — Trigger ghi audit_log cho các bảng nghiệp vụ quan trọng
-- =====================================================================
create function public.log_audit()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if (tg_op = 'INSERT') then
    insert into public.audit_log (bang, ban_ghi_id, hanh_dong, du_lieu_moi, thuc_hien_boi)
    values (tg_table_name, new.id, 'create', to_jsonb(new), auth.uid());
    return new;
  elsif (tg_op = 'UPDATE') then
    insert into public.audit_log (bang, ban_ghi_id, hanh_dong, du_lieu_cu, du_lieu_moi, thuc_hien_boi)
    values (tg_table_name, new.id, 'update', to_jsonb(old), to_jsonb(new), auth.uid());
    return new;
  elsif (tg_op = 'DELETE') then
    insert into public.audit_log (bang, ban_ghi_id, hanh_dong, du_lieu_cu, thuc_hien_boi)
    values (tg_table_name, old.id, 'delete', to_jsonb(old), auth.uid());
    return old;
  end if;
  return null;
end;
$$;

create trigger audit_lop_hoc after insert or update or delete on public.lop_hoc
  for each row execute procedure public.log_audit();
create trigger audit_dang_ky_giang_day after insert or update or delete on public.dang_ky_giang_day
  for each row execute procedure public.log_audit();
create trigger audit_danh_gia_kpi after insert or update or delete on public.danh_gia_kpi
  for each row execute procedure public.log_audit();
create trigger audit_kpi_tong_hop after insert or update or delete on public.kpi_tong_hop
  for each row execute procedure public.log_audit();

-- =====================================================================
-- 1.3.4 — Bật RLS mặc định "deny all" trên TẤT CẢ các bảng.
-- Policy cụ thể sẽ viết ở Giai đoạn 2 (sub-agent xac-thuc-phan-quyen).
-- =====================================================================
alter table profiles enable row level security;
alter table chung_chi enable row level security;
alter table chuong_trinh_dao_tao enable row level security;
alter table chuong_trinh_mau_bai_giang enable row level security;
alter table lop_hoc enable row level security;
alter table bai_giang enable row level security;
alter table dang_ky_giang_day enable row level security;
alter table lich_giang enable row level security;
alter table kpi_ky enable row level security;
alter table kpi_tieu_chi enable row level security;
alter table kpi_tieu_chi_theo_ky enable row level security;
alter table danh_gia_kpi enable row level security;
alter table kpi_tong_hop enable row level security;
alter table kpi_he_so_quy_doi enable row level security;
alter table loi_moi_giang_day enable row level security;
alter table khao_sat_hoc_vien enable row level security;
alter table hoat_dong_hoc_thuat enable row level security;
alter table mentor_mentee enable row level security;
alter table hoat_dong_chung enable row level security;
alter table ky_luat_khen_thuong enable row level security;
alter table thong_bao enable row level security;
alter table audit_log enable row level security;
