-- =====================================================================
-- Fix: cac trigger kiem soat quyen (enforce_profiles_update_scope,
-- enforce_kpi_ky_locked) goi is_admin()/current_role() dua tren auth.uid(),
-- nhung trigger BEFORE UPDATE/DELETE luon chay bat ke RLS co bi bypass hay
-- khong (bypass RLS chi bo qua policy USING/WITH CHECK, khong bo qua trigger).
-- Khi Server Action dung SUPABASE_SERVICE_ROLE_KEY (vd admin tao nhan su moi
-- qua Admin API), auth.uid() = null (khong co JWT nguoi dung that) nen bi
-- chan nham voi thong bao "khong co quyen sua ho so nay". Sua: auth.uid()
-- null CHI xay ra voi ket noi service_role (client thuong luon co JWT that,
-- khong bao gio lo service role key ra ngoai server) — cho phep bo qua kiem
-- tra trong truong hop nay.
-- =====================================================================

create or replace function public.enforce_profiles_update_scope()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return new; -- ket noi service_role (backend tin cay), khong phai nguoi dung that
  end if;

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
  if auth.uid() is null then
    if tg_op = 'DELETE' then
      return old;
    end if;
    return new; -- ket noi service_role (backend tin cay)
  end if;

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
