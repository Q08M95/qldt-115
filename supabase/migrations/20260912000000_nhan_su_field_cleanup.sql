-- =====================================================================
-- QLĐT 115 — Giai đoạn 3 rà soát lại (yêu cầu người dùng 2026-09-10):
-- 1. Bỏ profiles.so_dien_thoai, profiles.ngay_vao_lam — không quan trọng,
--    đã kiểm tra cả 58 hồ sơ hiện có đều trống 2 cột này, không mất dữ liệu.
-- 2. Đổi tên profiles.don_vi_cong_tac -> khoa_phong_cong_tac cho đúng bản
--    chất dữ liệu (khớp tên cột "KHOA/PHÒNG CÔNG TÁC" trong file Excel gốc).
-- 3. Nới policy xem chung_chi (bảng + storage): giảng viên/trợ giảng được
--    xem chứng chỉ của người khác (đọc tất cả để biết đồng nghiệp, giống
--    profiles_select), nhưng vẫn chỉ admin hoặc chính chủ mới sửa/xoá được
--    — không đổi policy insert/update/delete.
-- Theo CLAUDE.md mục 4: ngoại lệ sửa schema đã chốt vì chính người dùng
-- chủ động yêu cầu — đã cập nhật lại tientrinh.md mục 1.2 trong cùng lượt.
-- =====================================================================

alter table public.profiles drop column if exists so_dien_thoai;
alter table public.profiles drop column if exists ngay_vao_lam;
alter table public.profiles rename column don_vi_cong_tac to khoa_phong_cong_tac;

-- ---------------------------------------------------------------------
-- Trigger chan leo thang quyen: bo 2 truong da xoa khoi danh sach kiem
-- tra, doi ten don_vi_cong_tac -> khoa_phong_cong_tac.
-- ---------------------------------------------------------------------
create or replace function public.enforce_profiles_update_scope()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return new; -- ket noi service_role (backend tin cay), xem migration 20260905040000
  end if;

  if public.is_admin() then
    return new;
  end if;

  if public.current_role() = 'quan_ly_dao_tao' then
    if (new.full_name, new.hoc_vi, new.chuc_danh, new.chuyen_mon, new.khoa_phong_cong_tac,
        new.role, new.email, new.nhom_phan_loai)
       is distinct from
       (old.full_name, old.hoc_vi, old.chuc_danh, old.chuyen_mon, old.khoa_phong_cong_tac,
        old.role, old.email, old.nhom_phan_loai)
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
-- Nhan su chi tiet: xoa 2 cot khoi ham xoa_nhan_su khong lien quan (ham
-- nay khong dong toi 2 cot vua xoa, khong can sua).
-- ---------------------------------------------------------------------

-- ---------- chung_chi: nguoi khac duoc xem, khong sua/xoa duoc ----------
drop policy if exists chung_chi_select on public.chung_chi;
create policy chung_chi_select on public.chung_chi
  for select to authenticated using (true);

drop policy if exists chung_chi_storage_select on storage.objects;
create policy chung_chi_storage_select on storage.objects
  for select to authenticated using (bucket_id = 'chung-chi');
