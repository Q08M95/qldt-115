-- =====================================================================
-- QLĐT 115 — Migration Giai đoạn 2: Helper functions + RLS policy đầy đủ
-- Nguồn: tientrinh.md Giai đoạn 2 (ma trận quyền), CLAUDE.md mục 2.2 (khoá kỳ KPI đã chốt)
-- =====================================================================

-- ---------------------------------------------------------------------
-- Helper functions dùng chung trong mọi policy.
-- SECURITY DEFINER + search_path cố định để: (1) tránh đệ quy RLS khi
-- chính các hàm này đọc bảng profiles (bảng cũng có RLS), (2) tránh
-- lỗ hổng search_path injection.
-- ---------------------------------------------------------------------
create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- is_quan_ly(): true cho ca admin va quan_ly_dao_tao (admin la tap sieu quyen).
create or replace function public.is_quan_ly()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role in ('admin','quan_ly_dao_tao')
  );
$$;

-- ---------------------------------------------------------------------
-- Trigger: chan leo thang quyen qua profiles.role / trang_thai_hoat_dong.
-- RLS chi kiem soat duoc theo DONG, khong kiem soat duoc theo COT, nen
-- can trigger nay de dam bao dung "quan_ly chi sua trang_thai_hoat_dong,
-- tu minh khong duoc tu doi role/trang_thai cua chinh minh".
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
        new.so_dien_thoai, new.ngay_vao_lam, new.avatar_url, new.role)
       is distinct from
       (old.full_name, old.hoc_vi, old.chuc_danh, old.chuyen_mon, old.don_vi_cong_tac,
        old.so_dien_thoai, old.ngay_vao_lam, old.avatar_url, old.role)
    then
      raise exception 'quan_ly_dao_tao chi duoc sua truong trang_thai_hoat_dong cua profiles';
    end if;
    return new;
  end if;

  if new.id = auth.uid() then
    if new.role is distinct from old.role
       or new.trang_thai_hoat_dong is distinct from old.trang_thai_hoat_dong then
      raise exception 'khong duoc tu doi role hoac trang_thai_hoat_dong cua chinh minh';
    end if;
    return new;
  end if;

  raise exception 'khong co quyen sua ho so nay';
end;
$$;

drop trigger if exists enforce_profiles_update_scope on public.profiles;
create trigger enforce_profiles_update_scope
  before update on public.profiles
  for each row execute procedure public.enforce_profiles_update_scope();

-- ---------------------------------------------------------------------
-- Trigger: khoa danh_gia_kpi / kpi_tong_hop khi ky KPI da 'da_chot'.
-- Chi is_admin() moi sua/xoa duoc sau khi chot (CLAUDE.md muc 2.2).
-- Viec mo lai phai ghi audit_log o tang ung dung (Giai doan 7).
-- ---------------------------------------------------------------------
create or replace function public.enforce_kpi_ky_locked()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ky_id uuid;
  v_trang_thai text;
begin
  v_ky_id := coalesce(new.kpi_ky_id, old.kpi_ky_id);
  select trang_thai into v_trang_thai from public.kpi_ky where id = v_ky_id;

  if v_trang_thai = 'da_chot' and not public.is_admin() then
    raise exception 'ky KPI da chot, chi admin duoc mo lai va sua';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists lock_danh_gia_kpi_when_chot on public.danh_gia_kpi;
create trigger lock_danh_gia_kpi_when_chot
  before update or delete on public.danh_gia_kpi
  for each row execute procedure public.enforce_kpi_ky_locked();

drop trigger if exists lock_kpi_tong_hop_when_chot on public.kpi_tong_hop;
create trigger lock_kpi_tong_hop_when_chot
  before update or delete on public.kpi_tong_hop
  for each row execute procedure public.enforce_kpi_ky_locked();

-- =====================================================================
-- RLS POLICY — theo đúng ma trận tientrinh.md Giai đoạn 2
-- =====================================================================

-- ---------- profiles ----------
create policy profiles_select on public.profiles
  for select to authenticated using (true);
create policy profiles_insert on public.profiles
  for insert to authenticated with check (public.is_admin());
create policy profiles_update on public.profiles
  for update to authenticated
  using (public.is_quan_ly() or id = auth.uid())
  with check (public.is_quan_ly() or id = auth.uid());
create policy profiles_delete on public.profiles
  for delete to authenticated using (public.is_admin());

-- ---------- chung_chi ----------
create policy chung_chi_select on public.chung_chi
  for select to authenticated using (public.is_quan_ly() or profile_id = auth.uid());
create policy chung_chi_insert on public.chung_chi
  for insert to authenticated with check (public.is_admin() or profile_id = auth.uid());
create policy chung_chi_update on public.chung_chi
  for update to authenticated
  using (public.is_admin() or profile_id = auth.uid())
  with check (public.is_admin() or profile_id = auth.uid());
create policy chung_chi_delete on public.chung_chi
  for delete to authenticated using (public.is_admin() or profile_id = auth.uid());

-- ---------- chuong_trinh_dao_tao ----------
create policy chuong_trinh_dao_tao_select on public.chuong_trinh_dao_tao
  for select to authenticated using (true);
create policy chuong_trinh_dao_tao_write on public.chuong_trinh_dao_tao
  for all to authenticated using (public.is_quan_ly()) with check (public.is_quan_ly());

-- ---------- chuong_trinh_mau_bai_giang ----------
create policy chuong_trinh_mau_bai_giang_select on public.chuong_trinh_mau_bai_giang
  for select to authenticated using (true);
create policy chuong_trinh_mau_bai_giang_write on public.chuong_trinh_mau_bai_giang
  for all to authenticated using (public.is_quan_ly()) with check (public.is_quan_ly());

-- ---------- lop_hoc ----------
create policy lop_hoc_select on public.lop_hoc
  for select to authenticated using (true);
create policy lop_hoc_write on public.lop_hoc
  for all to authenticated using (public.is_quan_ly()) with check (public.is_quan_ly());

-- ---------- bai_giang ----------
create policy bai_giang_select on public.bai_giang
  for select to authenticated using (true);
create policy bai_giang_write on public.bai_giang
  for all to authenticated using (public.is_quan_ly()) with check (public.is_quan_ly());

-- ---------- dang_ky_giang_day ----------
-- Quan trong: giang_vien/tro_giang KHONG co policy UPDATE nao ca (kha nang
-- tu duyet dang ky cua chinh minh phai la ZERO, kha nang thap nhat qua API truc tiep).
create policy dang_ky_giang_day_select on public.dang_ky_giang_day
  for select to authenticated using (public.is_quan_ly() or profile_id = auth.uid());
create policy dang_ky_giang_day_insert on public.dang_ky_giang_day
  for insert to authenticated with check (public.is_quan_ly() or profile_id = auth.uid());
create policy dang_ky_giang_day_update on public.dang_ky_giang_day
  for update to authenticated using (public.is_quan_ly()) with check (public.is_quan_ly());
create policy dang_ky_giang_day_delete on public.dang_ky_giang_day
  for delete to authenticated using (public.is_admin());

-- ---------- lich_giang ----------
-- Quyet dinh nghiep vu (2026-09-05): lich giang la du lieu chung, moi vai
-- tro da dang nhap deu xem duoc toan bo (khop toggle "Tat ca / Cua toi" o
-- Giai doan 6), khong phai du lieu nhay cam nhu KPI/luong.
create policy lich_giang_select on public.lich_giang
  for select to authenticated using (true);
create policy lich_giang_write on public.lich_giang
  for all to authenticated using (public.is_quan_ly()) with check (public.is_quan_ly());

-- ---------- kpi_ky ----------
create policy kpi_ky_select on public.kpi_ky
  for select to authenticated using (true);
create policy kpi_ky_write on public.kpi_ky
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------- kpi_tieu_chi ----------
create policy kpi_tieu_chi_select on public.kpi_tieu_chi
  for select to authenticated using (true);
create policy kpi_tieu_chi_write on public.kpi_tieu_chi
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------- kpi_tieu_chi_theo_ky ----------
create policy kpi_tieu_chi_theo_ky_select on public.kpi_tieu_chi_theo_ky
  for select to authenticated using (true);
create policy kpi_tieu_chi_theo_ky_write on public.kpi_tieu_chi_theo_ky
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------- danh_gia_kpi ----------
create policy danh_gia_kpi_select on public.danh_gia_kpi
  for select to authenticated using (public.is_quan_ly() or profile_id = auth.uid());
create policy danh_gia_kpi_insert on public.danh_gia_kpi
  for insert to authenticated with check (public.is_quan_ly());
create policy danh_gia_kpi_update on public.danh_gia_kpi
  for update to authenticated using (public.is_quan_ly()) with check (public.is_quan_ly());
create policy danh_gia_kpi_delete on public.danh_gia_kpi
  for delete to authenticated using (public.is_quan_ly());

-- ---------- kpi_tong_hop ----------
create policy kpi_tong_hop_select on public.kpi_tong_hop
  for select to authenticated using (public.is_quan_ly() or profile_id = auth.uid());
create policy kpi_tong_hop_insert on public.kpi_tong_hop
  for insert to authenticated with check (public.is_quan_ly());
create policy kpi_tong_hop_update on public.kpi_tong_hop
  for update to authenticated using (public.is_quan_ly()) with check (public.is_quan_ly());
create policy kpi_tong_hop_delete on public.kpi_tong_hop
  for delete to authenticated using (public.is_quan_ly());

-- ---------- kpi_he_so_quy_doi ----------
create policy kpi_he_so_quy_doi_select on public.kpi_he_so_quy_doi
  for select to authenticated using (true);
create policy kpi_he_so_quy_doi_write on public.kpi_he_so_quy_doi
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------- loi_moi_giang_day ----------
create policy loi_moi_giang_day_select on public.loi_moi_giang_day
  for select to authenticated using (public.is_quan_ly() or profile_id = auth.uid());
create policy loi_moi_giang_day_insert on public.loi_moi_giang_day
  for insert to authenticated with check (public.is_quan_ly());
create policy loi_moi_giang_day_update on public.loi_moi_giang_day
  for update to authenticated
  using (public.is_quan_ly() or profile_id = auth.uid())
  with check (public.is_quan_ly() or profile_id = auth.uid());
create policy loi_moi_giang_day_delete on public.loi_moi_giang_day
  for delete to authenticated using (public.is_admin());

-- ---------- khao_sat_hoc_vien ----------
-- Khao sat an danh: giang_vien/tro_giang KHONG duoc doc tung phieu tho.
-- Diem tong hop cho ho xem se lay qua view/RPC (SECURITY DEFINER) o Giai doan 9.
create policy khao_sat_hoc_vien_select on public.khao_sat_hoc_vien
  for select to authenticated using (public.is_quan_ly());
create policy khao_sat_hoc_vien_write on public.khao_sat_hoc_vien
  for all to authenticated using (public.is_quan_ly()) with check (public.is_quan_ly());

-- ---------- hoat_dong_hoc_thuat ----------
create policy hoat_dong_hoc_thuat_select on public.hoat_dong_hoc_thuat
  for select to authenticated using (public.is_quan_ly() or profile_id = auth.uid());
create policy hoat_dong_hoc_thuat_insert on public.hoat_dong_hoc_thuat
  for insert to authenticated with check (public.is_quan_ly() or profile_id = auth.uid());
create policy hoat_dong_hoc_thuat_update on public.hoat_dong_hoc_thuat
  for update to authenticated
  using (public.is_quan_ly() or profile_id = auth.uid())
  with check (public.is_quan_ly() or profile_id = auth.uid());
create policy hoat_dong_hoc_thuat_delete on public.hoat_dong_hoc_thuat
  for delete to authenticated using (public.is_admin());

-- ---------- mentor_mentee ----------
create policy mentor_mentee_select on public.mentor_mentee
  for select to authenticated
  using (public.is_quan_ly() or mentor_id = auth.uid() or mentee_id = auth.uid());
create policy mentor_mentee_write on public.mentor_mentee
  for all to authenticated using (public.is_quan_ly()) with check (public.is_quan_ly());

-- ---------- hoat_dong_chung ----------
create policy hoat_dong_chung_select on public.hoat_dong_chung
  for select to authenticated using (public.is_quan_ly() or profile_id = auth.uid());
create policy hoat_dong_chung_insert on public.hoat_dong_chung
  for insert to authenticated with check (public.is_quan_ly() or profile_id = auth.uid());
create policy hoat_dong_chung_update on public.hoat_dong_chung
  for update to authenticated
  using (public.is_quan_ly() or profile_id = auth.uid())
  with check (public.is_quan_ly() or profile_id = auth.uid());
create policy hoat_dong_chung_delete on public.hoat_dong_chung
  for delete to authenticated using (public.is_admin());

-- ---------- ky_luat_khen_thuong ----------
create policy ky_luat_khen_thuong_select on public.ky_luat_khen_thuong
  for select to authenticated using (public.is_quan_ly() or profile_id = auth.uid());
create policy ky_luat_khen_thuong_write on public.ky_luat_khen_thuong
  for all to authenticated using (public.is_quan_ly()) with check (public.is_quan_ly());

-- ---------- thong_bao ----------
create policy thong_bao_select on public.thong_bao
  for select to authenticated using (public.is_admin() or profile_id = auth.uid());
create policy thong_bao_insert on public.thong_bao
  for insert to authenticated with check (public.is_quan_ly());
create policy thong_bao_update on public.thong_bao
  for update to authenticated
  using (public.is_admin() or profile_id = auth.uid())
  with check (public.is_admin() or profile_id = auth.uid());
create policy thong_bao_delete on public.thong_bao
  for delete to authenticated using (public.is_admin());

-- ---------- audit_log ----------
-- Chi doc, chi admin. KHONG co policy insert/update/delete cho bat ky role
-- nao qua API — ban ghi audit chi duoc tao qua trigger log_audit() (chay
-- voi quyen postgres, bypass RLS), dam bao nhat ky bat bien tu phia client.
create policy audit_log_select on public.audit_log
  for select to authenticated using (public.is_admin());
