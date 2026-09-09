// Kieu du lieu tay cho cac bang DA duoc dung trong code (profiles, chung_chi,
// audit_log) — chua phai generate tu toan bo 22 bang trong tientrinh.md.
// Ly do lam tay thay vi `supabase gen types`: CLI can `supabase login`
// (dang nhap trinh duyet) hoac SUPABASE_ACCESS_TOKEN, ca 2 deu khong co trong
// moi truong nay. Khi ban co the chay tren may minh, nen thay file nay bang:
//   npx supabase login
//   npx supabase gen types typescript --project-id <ref> --schema public > src/lib/supabase/database.types.ts
// De file nay khong bi thay the nham, cac giai doan sau MO RONG file nay
// (them bang moi khi dung toi) thay vi viet Database rieng o noi khac.

type ProfileRole = "admin" | "quan_ly_dao_tao" | "giang_vien" | "tro_giang";

type ProfileRow = {
  id: string;
  full_name: string;
  role: ProfileRole;
  email: string | null;
  hoc_vi: string | null;
  chuc_danh: string | null;
  chuyen_mon: string | null;
  don_vi_cong_tac: string | null;
  so_dien_thoai: string | null;
  ngay_vao_lam: string | null;
  nhom_phan_loai: number | null;
  trang_thai_hoat_dong: boolean;
  created_at: string;
  updated_at: string;
};

type ChungChiRow = {
  id: string;
  profile_id: string;
  ten_chung_chi: string;
  noi_cap: string | null;
  ngay_cap: string | null;
  ngay_het_han: string | null;
  file_url: string | null;
  bat_buoc: boolean;
  created_at: string;
};

type AuditLogRow = {
  id: string;
  bang: string;
  ban_ghi_id: string | null;
  hanh_dong: "create" | "update" | "delete";
  du_lieu_cu: Record<string, unknown> | null;
  du_lieu_moi: Record<string, unknown> | null;
  thuc_hien_boi: string | null;
  created_at: string;
};

type ChuongTrinhDaoTaoRow = {
  id: string;
  ten_chuong_trinh: string;
  mo_ta: string | null;
  created_at: string;
};

type ChuongTrinhMauBaiGiangRow = {
  id: string;
  chuong_trinh_id: string;
  ten_bai: string;
  chuyen_de: string | null;
  thoi_luong_tiet: number;
  thu_tu: number;
  created_at: string;
};

type LopHocTrangThai =
  | "cho_khai_giang"
  | "dang_dien_ra"
  | "hoan_thanh"
  | "thieu_nhan_su"
  | "huy";

type LopHocRow = {
  id: string;
  chuong_trinh_id: string | null;
  ten_lop: string;
  mo_ta: string | null;
  loai_lop: string | null;
  doi_tuong_hoc_vien: "nhan_vien_y_te" | "cong_dong" | null;
  co_kinh_phi: boolean;
  la_lop_gap: boolean;
  la_lop_cong_dong: boolean;
  ngay_khai_giang: string | null;
  ngay_ket_thuc: string | null;
  so_hoc_vien_du_kien: number | null;
  so_giang_vien_can: number;
  so_tro_giang_can: number;
  trang_thai: LopHocTrangThai;
  nguoi_phu_trach_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

type BaiGiangRow = {
  id: string;
  lop_hoc_id: string;
  ten_bai: string;
  chuyen_de: string | null;
  thoi_luong_tiet: number;
  thu_tu: number;
  created_at: string;
};

type LichGiangRow = {
  id: string;
  lop_hoc_id: string;
  bai_giang_id: string | null;
  giang_vien_id: string | null;
  tro_giang_id: string | null;
  ngay_gio: string | null;
  buoi: "sang" | "chieu" | "toi" | null;
  dia_diem: string | null;
  trang_thai: "du_kien" | "da_xac_nhan" | "da_ban_giao" | "huy";
  ly_do_huy: string | null;
  thoi_diem_huy: string | null;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Partial<Omit<ProfileRow, "id" | "full_name" | "role">> &
          Pick<ProfileRow, "id" | "full_name" | "role">;
        Update: Partial<ProfileRow>;
        Relationships: [];
      };
      chung_chi: {
        Row: ChungChiRow;
        Insert: Partial<Omit<ChungChiRow, "profile_id" | "ten_chung_chi">> &
          Pick<ChungChiRow, "profile_id" | "ten_chung_chi">;
        Update: Partial<ChungChiRow>;
        Relationships: [];
      };
      audit_log: {
        Row: AuditLogRow;
        Insert: never; // chi tao qua trigger log_audit(), khong insert tu app
        Update: never;
        Relationships: [];
      };
      chuong_trinh_dao_tao: {
        Row: ChuongTrinhDaoTaoRow;
        Insert: Partial<Omit<ChuongTrinhDaoTaoRow, "ten_chuong_trinh">> &
          Pick<ChuongTrinhDaoTaoRow, "ten_chuong_trinh">;
        Update: Partial<ChuongTrinhDaoTaoRow>;
        Relationships: [];
      };
      chuong_trinh_mau_bai_giang: {
        Row: ChuongTrinhMauBaiGiangRow;
        Insert: Partial<Omit<ChuongTrinhMauBaiGiangRow, "chuong_trinh_id" | "ten_bai">> &
          Pick<ChuongTrinhMauBaiGiangRow, "chuong_trinh_id" | "ten_bai">;
        Update: Partial<ChuongTrinhMauBaiGiangRow>;
        Relationships: [];
      };
      lop_hoc: {
        Row: LopHocRow;
        Insert: Partial<Omit<LopHocRow, "ten_lop">> & Pick<LopHocRow, "ten_lop">;
        Update: Partial<LopHocRow>;
        Relationships: [];
      };
      bai_giang: {
        Row: BaiGiangRow;
        Insert: Partial<Omit<BaiGiangRow, "lop_hoc_id" | "ten_bai">> &
          Pick<BaiGiangRow, "lop_hoc_id" | "ten_bai">;
        Update: Partial<BaiGiangRow>;
        Relationships: [];
      };
      lich_giang: {
        Row: LichGiangRow;
        Insert: Partial<Omit<LichGiangRow, "lop_hoc_id">> & Pick<LichGiangRow, "lop_hoc_id">;
        Update: Partial<LichGiangRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      tao_lop_hoc: {
        Args: {
          p_ten_lop: string;
          p_mo_ta: string | null;
          p_loai_lop: string | null;
          p_doi_tuong_hoc_vien: string | null;
          p_co_kinh_phi: boolean;
          p_la_lop_gap: boolean;
          p_la_lop_cong_dong: boolean;
          p_ngay_khai_giang: string | null;
          p_ngay_ket_thuc: string | null;
          p_so_hoc_vien_du_kien: number | null;
          p_so_giang_vien_can: number;
          p_so_tro_giang_can: number;
          p_nguoi_phu_trach_id: string | null;
          p_chuong_trinh_id: string | null;
        };
        Returns: string;
      };
      reorder_bai_giang: {
        Args: { p_lop_hoc_id: string; p_ids: string[] };
        Returns: undefined;
      };
      reorder_chuong_trinh_mau_bai_giang: {
        Args: { p_chuong_trinh_id: string; p_ids: string[] };
        Returns: undefined;
      };
      xoa_nhan_su: {
        Args: { p_id: string };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
