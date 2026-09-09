-- =====================================================================
-- QLĐT 115 — Giai đoạn 3 rà soát lại (yêu cầu người dùng 2026-09-11):
-- 1. Thêm profiles.email (mirror auth.users.email — chỉ hiển thị cho
--    admin/quản lý, đọc trực tiếp từ profiles vì client thường không
--    truy vấn được schema auth qua PostgREST).
-- 2. Thêm profiles.nhom_phan_loai (1-5, phân tầng nội bộ) — chỉ
--    admin/quản lý thấy, không phải phân quyền role.
-- 3. Bỏ profiles.avatar_url — thay avatar ảnh bằng huy hiệu chữ cái đầu
--    theo màu vai trò (không cần upload ảnh).
-- Theo CLAUDE.md mục 4: ngoại lệ sửa schema đã chốt vì chính người dùng
-- chủ động yêu cầu — đã cập nhật lại tientrinh.md mục 1.2 trong cùng lượt.
-- =====================================================================

alter table public.profiles add column email text;
alter table public.profiles add column nhom_phan_loai smallint check (nhom_phan_loai between 1 and 5);
alter table public.profiles drop column if exists avatar_url;

-- ---------------------------------------------------------------------
-- Trigger tạo profiles: giờ set thêm email = auth.users.email ngay từ đầu.
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.email,
    'tro_giang'
  );
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- Trigger chan leo thang quyen: them email/nhom_phan_loai vao danh sach
-- truong quan_ly khong duoc sua va tu minh khong duoc tu sua. Bo
-- avatar_url (da xoa cot).
-- ---------------------------------------------------------------------
create or replace function public.enforce_profiles_update_scope()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    return new;
  end if;

  if public.current_role() = 'quan_ly_dao_tao' then
    if (new.full_name, new.hoc_vi, new.chuc_danh, new.chuyen_mon, new.don_vi_cong_tac,
        new.so_dien_thoai, new.ngay_vao_lam, new.role, new.email, new.nhom_phan_loai)
       is distinct from
       (old.full_name, old.hoc_vi, old.chuc_danh, old.chuyen_mon, old.don_vi_cong_tac,
        old.so_dien_thoai, old.ngay_vao_lam, old.role, old.email, old.nhom_phan_loai)
    then
      raise exception 'quan_ly_dao_tao chi duoc sua truong trang_thai_hoat_dong cua profiles';
    end if;
    return new;
  end if;

  if new.id = auth.uid() then
    if new.role is distinct from old.role
       or new.trang_thai_hoat_dong is distinct from old.trang_thai_hoat_dong
       or new.email is distinct from old.email
       or new.nhom_phan_loai is distinct from old.nhom_phan_loai then
      raise exception 'khong duoc tu doi role, trang_thai_hoat_dong, email hoac nhom phan loai cua chinh minh';
    end if;
    return new;
  end if;

  raise exception 'khong co quyen sua ho so nay';
end;
$$;

-- ---------------------------------------------------------------------
-- RPC xoa cung 1 nhan su — kiem tra du lieu lien quan truoc, tra ve loi
-- ro rang thay vi de GoTrue Admin API tra loi chung chung khong doan
-- truoc duoc. Chi admin (kiem tra qua is_admin(), khong dua vao RLS vi
-- ham chay security definer) va chi khi khong con du lieu tham chieu o
-- cac bang chua co "on delete cascade" toi profiles.
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

  if exists (select 1 from public.lop_hoc where nguoi_phu_trach_id = p_id or created_by = p_id)
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
  then
    raise exception 'Không thể xoá vì nhân sự này đã có dữ liệu liên quan (lớp phụ trách, đăng ký, lịch giảng, đánh giá KPI...). Hãy khoá hoạt động thay vì xoá.';
  end if;

  delete from auth.users where id = p_id;
end;
$$;
