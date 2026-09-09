-- CLAUDE.md muc 4: "Nghiep vu nhieu buoc phai nhat quan du lieu (vd duyet
-- dang ky -> sinh lich giang): dung Postgres function/transaction... khong
-- tach thanh nhieu lenh roi o client." Tao lop hoc tu chuong trinh mau la
-- 2 buoc (insert lop_hoc + copy N dong bai_giang) — gop vao 1 function de
-- chay trong 1 transaction, tranh truong hop insert lop_hoc thanh cong
-- nhung copy bai_giang loi giua chung (lop mo coi khong bai giang).
create or replace function public.tao_lop_hoc(
  p_ten_lop text,
  p_mo_ta text,
  p_loai_lop text,
  p_hinh_thuc text,
  p_co_kinh_phi boolean,
  p_la_lop_gap boolean,
  p_la_gio_hiem boolean,
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
    ten_lop, mo_ta, loai_lop, hinh_thuc, co_kinh_phi, la_lop_gap, la_gio_hiem,
    la_lop_cong_dong, ngay_khai_giang, ngay_ket_thuc, so_hoc_vien_du_kien,
    so_giang_vien_can, so_tro_giang_can, nguoi_phu_trach_id, chuong_trinh_id, created_by
  ) values (
    p_ten_lop, p_mo_ta, p_loai_lop, p_hinh_thuc, p_co_kinh_phi, p_la_lop_gap, p_la_gio_hiem,
    p_la_lop_cong_dong, p_ngay_khai_giang, p_ngay_ket_thuc, p_so_hoc_vien_du_kien,
    p_so_giang_vien_can, p_so_tro_giang_can, p_nguoi_phu_trach_id, p_chuong_trinh_id, auth.uid()
  ) returning id into v_lop_id;

  -- Doc lap voi chuong trinh mau (CLAUDE.md muc 4): COPY du lieu thanh dong
  -- bai_giang rieng cua lop, khong tham chieu song den
  -- chuong_trinh_mau_bai_giang — sua/xoa bai giang cua lop sau nay khong
  -- anh huong chuong trinh mau hay cac lop khac.
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
