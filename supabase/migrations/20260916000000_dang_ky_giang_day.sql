-- =====================================================================
-- QLĐT 115 — Giai đoạn 5: Đăng ký giảng dạy & Duyệt.
-- 1. dang_ky_giang_day/lich_giang thêm buoi_giang_id (theo yêu cầu người
--    dùng 2026-09-14 — xác nhận đăng ký/lên lịch theo buổi = 1 dòng duy
--    nhất, không tách N dòng theo từng bài trong buổi).
-- 2. Unique index chặn đăng ký trùng cùng 1 slot (lớp/buổi/bài) + vai trò,
--    bỏ qua các đăng ký đã bị từ chối (cho phép đăng ký lại sau khi bị
--    từ chối).
-- 3. Hàm dang_ky_phu_hop_nhom() dùng chung cho RLS insert VÀ UI (kiểm tra
--    trước khi hiện nút "Đăng ký") — chỉ nhân sự thuộc đúng nhóm phù hợp
--    của lớp (nhom_giang_vien_phu_hop/nhom_tro_giang_phu_hop, nếu lớp có
--    đặt) mới tự đăng ký được, theo CLAUDE.md mục 2.1 + agent
--    dang-ky-lich-giang.md.
-- 4. RPC duyet_dang_ky/tu_choi_dang_ky — gộp cập nhật dang_ky_giang_day +
--    tạo lich_giang (khi duyệt) + insert thong_bao vào 1 transaction, theo
--    CLAUDE.md mục 4 (nghiệp vụ nhiều bước không tách lệnh rời). Lịch giảng
--    tạo ra ở bước duyệt CHƯA có ngày giờ cụ thể (ngay_gio/buoi/dia_diem) —
--    đó là phạm vi Giai đoạn 6 (xếp lịch), Giai đoạn 5 chỉ xác nhận nhân sự.
--    Cả 2 hàm dùng security invoker mặc định (người gọi đã tự vượt qua
--    is_quan_ly() để bấm được nút Duyệt/Từ chối, không cần bypass RLS).
-- 5. Trigger notify_dang_ky_moi — báo admin/quản lý khi có đăng ký mới.
--    Cần security definer vì người tạo đăng ký (giảng viên/trợ giảng)
--    không có quyền insert thong_bao cho người khác theo RLS hiện có.
-- =====================================================================

alter table public.dang_ky_giang_day add column buoi_giang_id uuid references public.buoi_giang(id);
alter table public.lich_giang add column buoi_giang_id uuid references public.buoi_giang(id);

create unique index dang_ky_giang_day_unique_active
  on public.dang_ky_giang_day (
    profile_id,
    lop_hoc_id,
    coalesce(buoi_giang_id, '00000000-0000-0000-0000-000000000000'::uuid),
    coalesce(bai_giang_id, '00000000-0000-0000-0000-000000000000'::uuid),
    vai_tro
  )
  where trang_thai in ('cho_duyet', 'da_duyet');

create or replace function public.dang_ky_phu_hop_nhom(
  p_lop_hoc_id uuid,
  p_vai_tro text,
  p_profile_id uuid
)
returns boolean
language sql
stable
set search_path = public
as $$
  select case p_vai_tro
    when 'giang_vien' then coalesce(
      (select l.nhom_giang_vien_phu_hop is null
              or exists (
                select 1 from public.profiles p
                where p.id = p_profile_id and p.nhom_phan_loai = any(l.nhom_giang_vien_phu_hop)
              )
       from public.lop_hoc l where l.id = p_lop_hoc_id),
      false
    )
    when 'tro_giang' then coalesce(
      (select l.nhom_tro_giang_phu_hop is null
              or exists (
                select 1 from public.profiles p
                where p.id = p_profile_id and p.nhom_phan_loai = any(l.nhom_tro_giang_phu_hop)
              )
       from public.lop_hoc l where l.id = p_lop_hoc_id),
      false
    )
    else false
  end;
$$;

drop policy if exists dang_ky_giang_day_insert on public.dang_ky_giang_day;
create policy dang_ky_giang_day_insert on public.dang_ky_giang_day
  for insert to authenticated with check (
    public.is_quan_ly()
    or (profile_id = auth.uid() and public.dang_ky_phu_hop_nhom(lop_hoc_id, vai_tro, auth.uid()))
  );

create or replace function public.duyet_dang_ky(p_id uuid)
returns void
language plpgsql
set search_path = public
as $$
declare
  v_dk record;
begin
  if not public.is_quan_ly() then
    raise exception 'Không có quyền duyệt đăng ký';
  end if;

  select * into v_dk from public.dang_ky_giang_day where id = p_id;
  if v_dk is null then
    raise exception 'Không tìm thấy đăng ký';
  end if;
  if v_dk.trang_thai <> 'cho_duyet' then
    raise exception 'Đăng ký này đã được xử lý trước đó';
  end if;

  update public.dang_ky_giang_day
  set trang_thai = 'da_duyet', nguoi_duyet_id = auth.uid(), updated_at = now()
  where id = p_id;

  insert into public.lich_giang (
    lop_hoc_id, bai_giang_id, buoi_giang_id, giang_vien_id, tro_giang_id, trang_thai
  ) values (
    v_dk.lop_hoc_id, v_dk.bai_giang_id, v_dk.buoi_giang_id,
    case when v_dk.vai_tro = 'giang_vien' then v_dk.profile_id else null end,
    case when v_dk.vai_tro = 'tro_giang' then v_dk.profile_id else null end,
    'du_kien'
  );

  insert into public.thong_bao (profile_id, tieu_de, noi_dung, duong_dan)
  values (
    v_dk.profile_id,
    'Đăng ký giảng dạy đã được duyệt',
    'Đăng ký dạy lớp của bạn đã được duyệt. Lịch giảng cụ thể sẽ được cập nhật sau.',
    '/lop-hoc/' || v_dk.lop_hoc_id
  );
end;
$$;

create or replace function public.tu_choi_dang_ky(p_id uuid, p_ghi_chu text)
returns void
language plpgsql
set search_path = public
as $$
declare
  v_dk record;
begin
  if not public.is_quan_ly() then
    raise exception 'Không có quyền từ chối đăng ký';
  end if;

  select * into v_dk from public.dang_ky_giang_day where id = p_id;
  if v_dk is null then
    raise exception 'Không tìm thấy đăng ký';
  end if;
  if v_dk.trang_thai <> 'cho_duyet' then
    raise exception 'Đăng ký này đã được xử lý trước đó';
  end if;

  update public.dang_ky_giang_day
  set trang_thai = 'tu_choi', nguoi_duyet_id = auth.uid(), ghi_chu = p_ghi_chu, updated_at = now()
  where id = p_id;

  insert into public.thong_bao (profile_id, tieu_de, noi_dung, duong_dan)
  values (
    v_dk.profile_id,
    'Đăng ký giảng dạy bị từ chối',
    coalesce(p_ghi_chu, 'Đăng ký dạy lớp của bạn đã bị từ chối.'),
    '/lop-hoc/' || v_dk.lop_hoc_id
  );
end;
$$;

create or replace function public.notify_dang_ky_moi()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.thong_bao (profile_id, tieu_de, noi_dung, duong_dan)
  select p.id,
    'Có đăng ký giảng dạy mới cần duyệt',
    (select full_name from public.profiles where id = new.profile_id) || ' vừa đăng ký dạy 1 lớp học.',
    '/lop-hoc/' || new.lop_hoc_id
  from public.profiles p
  where p.role in ('admin', 'quan_ly_dao_tao') and p.trang_thai_hoat_dong = true;
  return new;
end;
$$;

drop trigger if exists trg_notify_dang_ky_moi on public.dang_ky_giang_day;
create trigger trg_notify_dang_ky_moi
  after insert on public.dang_ky_giang_day
  for each row execute function public.notify_dang_ky_moi();
