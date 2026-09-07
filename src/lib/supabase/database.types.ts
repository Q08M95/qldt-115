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
  hoc_vi: string | null;
  chuc_danh: string | null;
  chuyen_mon: string | null;
  don_vi_cong_tac: string | null;
  so_dien_thoai: string | null;
  ngay_vao_lam: string | null;
  avatar_url: string | null;
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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
