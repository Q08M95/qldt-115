// Kiem tra "hop le tu dang ky" o phia UI (chi de quyet dinh co hien nut
// "Dang ky" hay khong) — lop chan bao mat that su la RLS + RPC
// dang_ky_phu_hop_nhom trong migration 20260916000000_dang_ky_giang_day.sql,
// ham nay chi la ban sao logic o client/server component de tranh hien nut
// chac chan se bi tu choi. Nhom phu hop chi dat o cap lop (Giai doan 4) nen
// dung chung 1 dieu kien cho ca dang ky theo lop/buoi/bai.
export function coTheTuDangKy(
  lop: {
    mo_dang_ky: boolean;
    nhom_giang_vien_phu_hop: number[] | null;
    nhom_tro_giang_phu_hop: number[] | null;
  },
  current: { role: string; nhom_phan_loai: number | null } | null,
): boolean {
  if (!current) return false;
  if (current.role !== "giang_vien" && current.role !== "tro_giang") return false;
  if (!lop.mo_dang_ky) return false;

  const nhomPhuHop =
    current.role === "giang_vien" ? lop.nhom_giang_vien_phu_hop : lop.nhom_tro_giang_phu_hop;
  if (!nhomPhuHop || nhomPhuHop.length === 0) return true;
  return current.nhom_phan_loai != null && nhomPhuHop.includes(current.nhom_phan_loai);
}
