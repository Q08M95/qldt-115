# KẾ HOẠCH DỰ ÁN: WebApp QUẢN LÝ ĐÀO TẠO TRUNG TÂM CẤP CỨU 115 TP.HCM
 
> Phiên bản: **Kế hoạch đầy đủ** — không cắt gọn phạm vi.
> Stack: **Next.js (TypeScript) + Supabase (Postgres/Auth/Storage/RLS) + GitHub + Vercel**, code sinh ra với Claude Code / Antigravity.
> Nguyên tắc xuyên suốt: **mỗi Giai đoạn có "Điều kiện hoàn thành" (Definition of Done) rõ ràng — chỉ khi đạt đủ điều kiện đó mới được bắt đầu Giai đoạn kế tiếp.** Không làm song song, không nhảy cóc, để tránh phải sửa lại nền móng khi đã xây phần trên.

Cấu trúc gồm **13 Giai đoạn (0 → 12)**, đi từ hạ tầng → dữ liệu → xác thực → từng module nghiệp vụ → kiểm thử → triển khai. Database được xây **hoàn chỉnh ngay từ Giai đoạn 1**, không mở rộng schema giữa chừng ở các giai đoạn sau (trừ khi phát sinh lỗi thiết kế thật sự cần sửa).

## Sub-agent phụ trách từng giai đoạn

Mỗi giai đoạn dưới đây có **1 sub-agent chịu trách nhiệm chính**, định nghĩa đầy đủ tại `.claude/agents/<ten>.md` (phạm vi, ranh giới không được làm, input phụ thuộc, điều kiện hoàn thành). Gọi đúng sub-agent tương ứng khi bắt đầu 1 giai đoạn — không nhờ agent khác làm thay để tránh chồng chéo.

| Giai đoạn | Sub-agent | Ghi chú |
|---|---|---|
| 0 — Chuẩn bị hạ tầng | `ha-tang-trien-khai` | Cũng phụ trách Giai đoạn 12 |
| 1 — Cơ sở dữ liệu | `co-so-du-lieu` | Nguồn chân lý schema — mọi agent khác không tự sửa bảng |
| 2 — Xác thực & Phân quyền | `xac-thuc-phan-quyen` | Được gọi lại xuyên suốt dự án mỗi khi cần thêm RLS policy |
| 3 — Module Nhân sự | `giao-dien-nen` (mục 1: layout) rồi `nhan-su` (mục 2-6) | `giao-dien-nen` dựng khung 1 lần, sau đó là thư viện UI dùng chung cho mọi giai đoạn sau |
| 4 — Lớp học & Bài giảng | `lop-hoc-chuong-trinh` | Scaffold sẵn khung tab cho Giai đoạn 5-6, không viết nội dung 2 tab đó |
| 5 — Đăng ký & Duyệt | `dang-ky-lich-giang` | Cũng phụ trách Giai đoạn 6 |
| 6 — Lịch giảng | `dang-ky-lich-giang` | (như trên) |
| 7 — Đánh giá & KPI | `danh-gia-kpi` | Module nhạy cảm nhất — bám sát CLAUDE.md mục 2.2 tuyệt đối, hỏi lại khi không chắc |
| 8 — Thông báo | `thong-bao-realtime` | Chỉ xây hạ tầng hiển thị/gửi — không quyết định khi nào sinh thông báo nghiệp vụ |
| 9 — Dashboard & Báo cáo | `dashboard-bao-cao` | Dùng lại chart wrapper/bảng màu từ `giao-dien-nen`, không tự vẽ màu riêng |
| 10 — Kiểm thử & Bảo mật | `kiem-thu-bao-mat` | Được sửa trực tiếp lỗi RLS; lỗi nghiệp vụ khác chỉ báo lại cho đúng agent phụ trách |
| 11 — Tối ưu UX | `toi-uu-ux` | Chỉ đánh bóng, không thêm tính năng mới |
| 12 — Triển khai chính thức | `ha-tang-trien-khai` | (như Giai đoạn 0) |

---

## GIAI ĐOẠN 0 — Chuẩn bị hạ tầng & công cụ

**Mục tiêu:** Có đầy đủ tài khoản, công cụ, repository, pipeline CI/CD sẵn sàng trước khi viết bất kỳ dòng nghiệp vụ nào.

**Công việc:**
1. Tạo tài khoản & project Supabase (chọn region gần Việt Nam, ví dụ Singapore).
2. Tạo GitHub repository riêng (private), đặt tên chuẩn (vd `qldt-115`), thêm `.gitignore` chuẩn Next.js.
3. Tạo project Vercel, liên kết với GitHub repo, thiết lập tự động deploy: `main` → Production, mọi nhánh khác/PR → Preview.
4. Cài đặt môi trường local: Node.js LTS, Git, VSCode, Claude Code / Antigravity, Supabase CLI.
5. Khởi tạo project Next.js (TypeScript, App Router, Tailwind, ESLint) trong repo, push commit đầu tiên, xác nhận Vercel build "Hello World" thành công.
6. Cài `@supabase/supabase-js`, `@supabase/ssr`, khởi tạo shadcn/ui.
7. Thiết lập biến môi trường: local (`.env.local`) và trên Vercel (Project Settings → Environment Variables) cho `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`. **Không đưa `SUPABASE_SERVICE_ROLE_KEY` vào biến `NEXT_PUBLIC_*`.**
8. Thống nhất quy ước làm việc Git: nhánh `main` bảo vệ, mỗi tính năng làm trên nhánh `feature/<ten>`, merge qua Pull Request.
9. Viết ra giấy/文档 quy chế đánh giá KPI hiện có của trung tâm (nếu có sẵn) — dùng làm căn cứ thiết kế bảng KPI ở Giai đoạn 1, tránh phải đoán nghiệp vụ.

**Điều kiện hoàn thành (Gate → Giai đoạn 1):**
- [ ] Repo GitHub tồn tại, có ít nhất 1 commit, Vercel deploy Preview/Production thành công.
- [ ] Project Supabase đã tạo, lấy được `Project URL` + `anon key`.
- [ ] Next.js app chạy local (`npm run dev`) không lỗi.
- [ ] Đã có văn bản (dù sơ bộ) mô tả tiêu chí KPI thực tế của đơn vị.

---

## GIAI ĐOẠN 1 — Thiết kế & Khởi tạo Cơ sở dữ liệu (nền móng)

**Mục tiêu:** Toàn bộ schema database được thiết kế **đầy đủ, đúng ngay từ đầu** — đây là nền móng, mọi giai đoạn sau đều phụ thuộc vào đây nên không được làm ẩu hay để sau bổ sung.

### 1.1. Danh sách bảng đầy đủ

**Nhóm Nhân sự & Xác thực**
- `profiles` — hồ sơ người dùng, mở rộng từ `auth.users`
- `chung_chi` — chứng chỉ/bằng cấp đính kèm của từng nhân sự (tuỳ chọn nhưng nên có để hồ sơ hoàn chỉnh)

**Nhóm Chương trình đào tạo (khung mẫu, tái sử dụng khi mở lớp mới)**
- `chuong_trinh_dao_tao` — danh mục chương trình/khoá học chuẩn (vd "Cấp cứu cơ bản", "Hồi sức tim phổi nâng cao")
- `chuong_trinh_mau_bai_giang` — danh sách bài giảng mẫu của mỗi chương trình (số buổi chuẩn, thứ tự, số tiết chuẩn)

**Nhóm Lớp học & Bài giảng**
- `lop_hoc` — mỗi lớp có thể **tuỳ chọn** khởi tạo từ một `chuong_trinh_dao_tao`, nhưng sau đó hoàn toàn độc lập
- `bai_giang` — bài giảng thực tế của từng lớp; khi tạo lớp từ chương trình mẫu, được **copy** từ `chuong_trinh_mau_bai_giang` rồi tự do thêm/sửa/xoá riêng cho lớp đó (số buổi/nội dung có thể khác chương trình gốc và khác các lớp khác)

**Nhóm Đăng ký giảng dạy & Lịch giảng**
- `dang_ky_giang_day`
- `lich_giang`

**Nhóm Đánh giá chất lượng & KPI**
- `kpi_ky` — các kỳ đánh giá (vd Học kỳ 1/2026, Cuối năm 2026)
- `kpi_tieu_chi` — danh mục tiêu chí đánh giá, thuộc 4 nhóm cố định: Khối lượng & Cống hiến, Chất lượng & Phản hồi, Năng lực chuyên môn, Ý thức tổ chức (chi tiết công thức xem [CLAUDE.md](CLAUDE.md) mục 2.2)
- `kpi_tieu_chi_theo_ky` — trọng số của từng tiêu chí, **cấu hình lại được theo từng kỳ** (không hard-code)
- `kpi_he_so_quy_doi` — hệ số quy đổi tiết dạy theo tính chất lớp (không kinh phí/đột xuất/cộng đồng), cấu hình theo từng kỳ
- `danh_gia_kpi` — điểm chi tiết từng tiêu chí, phân biệt người đánh giá là quản lý hay đồng nghiệp
- `kpi_tong_hop` — điểm tổng hợp theo từng nhóm A/B/C/D + xếp hạng tăng/giữ/hạ nhóm theo kỳ

**Nhóm Lời mời giảng dạy & Khảo sát chất lượng**
- `loi_moi_giang_day` — lời mời dạy lớp đột xuất/cộng đồng, dùng để đo "mức độ sẵn sàng" (đo được cả khi từ chối)
- `khao_sat_hoc_vien` — điểm khảo sát ý kiến học viên (ẩn danh) cho từng giảng viên/trợ giảng theo lớp

**Nhóm Hoạt động & Phát triển nhân sự**
- `hoat_dong_hoc_thuat` — biên soạn học liệu, nghiên cứu, báo cáo khoa học
- `mentor_mentee` — quan hệ kèm cặp nhân sự mới
- `hoat_dong_chung` — tham gia hoạt động chung của đơn vị
- `ky_luat_khen_thuong` — ghi nhận vi phạm/khen thưởng ảnh hưởng ý thức tổ chức

**Nhóm hệ thống**
- `thong_bao` — thông báo trong app
- `audit_log` — nhật ký thay đổi dữ liệu (ai, khi nào, bảng nào, hành động gì)

### 1.2. Script SQL đầy đủ

```sql
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
  file_url text,          -- lưu trong Supabase Storage
  bat_buoc boolean default true,    -- có tính vào KPI Nhóm C (năng lực chuyên môn) hay không
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
  chuong_trinh_id uuid references chuong_trinh_dao_tao(id),  -- tuỳ chọn: lớp khởi tạo từ chương trình mẫu nào
  ten_lop text not null,
  mo_ta text,
  loai_lop text,                  -- vd: đào tạo mới, tập huấn định kỳ...
  doi_tuong_hoc_vien text check (doi_tuong_hoc_vien in ('nhan_vien_y_te','cong_dong')),
  co_kinh_phi boolean default true,       -- dùng tính hệ số quy đổi KPI Nhóm A (lớp không kinh phí hệ số cao hơn)
  la_lop_gap boolean default false,       -- lớp đột xuất, thời gian chuẩn bị ngắn
  la_lop_cong_dong boolean default false, -- lớp phục vụ cộng đồng, không thù lao
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

-- Độc lập hoàn toàn với chuong_trinh_mau_bai_giang: khi tạo lớp từ chương trình mẫu,
-- dữ liệu được COPY sang đây, sau đó mỗi lớp tự do thêm/sửa/xoá bài giảng riêng
-- (số buổi/nội dung có thể khác chương trình gốc và khác các lớp khác dùng chung chương trình).
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
  thoi_diem_huy timestamptz,      -- dùng tính "huỷ phút chót" cho KPI Nhóm B
  created_at timestamptz default now()
);

-- ========== KPI ==========
create table kpi_ky (
  id uuid primary key default gen_random_uuid(),
  ten_ky text not null,             -- vd 'Cuối năm 2026'
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
  trong_so numeric not null,        -- % trọng số áp dụng riêng cho kỳ này
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
  diem_nhom_a numeric,   -- Khối lượng công việc & Cống hiến
  diem_nhom_b numeric,   -- Chất lượng giảng dạy & Phản hồi
  diem_nhom_c numeric,   -- Năng lực chuyên môn & Cập nhật học thuật
  diem_nhom_d numeric,   -- Ý thức tổ chức & Phát triển nhân sự
  xep_hang text check (xep_hang in ('tang_nhom','giu_nguyen','ha_nhom')),
  ghi_chu text,
  created_at timestamptz default now(),
  unique (profile_id, kpi_ky_id)
);

-- Hệ số quy đổi tiết dạy theo tính chất lớp, cấu hình được theo từng kỳ (KPI Nhóm A)
create table kpi_he_so_quy_doi (
  id uuid primary key default gen_random_uuid(),
  kpi_ky_id uuid references kpi_ky(id) on delete cascade not null,
  loai_he_so text not null check (loai_he_so in ('khong_kinh_phi','lop_gap','lop_cong_dong')),
  gia_tri numeric not null,          -- hệ số cộng thêm, vd 0.3
  created_at timestamptz default now(),
  unique (kpi_ky_id, loai_he_so)
);

-- Lời mời dạy lớp đột xuất/cộng đồng — đo "mức độ sẵn sàng" kể cả khi bị từ chối (KPI Nhóm A)
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

-- Khảo sát ý kiến học viên, ẩn danh (KPI Nhóm B)
create table khao_sat_hoc_vien (
  id uuid primary key default gen_random_uuid(),
  lop_hoc_id uuid references lop_hoc(id) not null,
  profile_id uuid references profiles(id) not null,   -- giảng viên/trợ giảng được đánh giá
  diem numeric not null,
  nhan_xet text,
  created_at timestamptz default now()
);

-- Hoạt động học thuật: biên soạn học liệu, nghiên cứu... (KPI Nhóm C)
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

-- Quan hệ kèm cặp nhân sự mới (KPI Nhóm D)
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

-- Tham gia hoạt động chung của đơn vị (KPI Nhóm D)
create table hoat_dong_chung (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) not null,
  ten_hoat_dong text not null,
  ngay date,
  diem_quy_doi numeric default 0,
  created_at timestamptz default now()
);

-- Ghi nhận vi phạm/khen thưởng ảnh hưởng ý thức tổ chức (KPI Nhóm D)
create table ky_luat_khen_thuong (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) not null,
  loai text not null check (loai in ('vi_pham','khen_thuong')),
  noi_dung text not null,
  diem_anh_huong numeric not null,    -- âm với vi phạm, dương với khen thưởng
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
  duong_dan text,               -- link điều hướng khi click
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
```

### 1.3. Trigger & function nền tảng
1. Trigger tự tạo `profiles` khi có `auth.users` mới đăng ký (role mặc định thấp nhất, admin nâng quyền thủ công sau).
2. Trigger `updated_at` tự cập nhật cho các bảng có cột này.
3. Trigger ghi `audit_log` cho các bảng nghiệp vụ quan trọng (`lop_hoc`, `dang_ky_giang_day`, `danh_gia_kpi`, `kpi_tong_hop`).
4. Bật `alter table ... enable row level security` cho **tất cả** các bảng ngay từ bước này (chính sách cụ thể viết ở Giai đoạn 2, nhưng bật khoá mặc định "deny all" ngay từ đầu để không có khoảng trống bảo mật).

**Điều kiện hoàn thành (Gate → Giai đoạn 2):**
- [ ] Toàn bộ 22 bảng trên đã tạo thành công trên Supabase, không lỗi constraint.
- [ ] Tất cả bảng đã bật RLS (kể cả khi chưa có policy — nghĩa là hiện tại không ai truy cập được, đúng như dự kiến).
- [ ] Trigger tạo `profiles` tự động khi đăng ký đã test hoạt động đúng.
- [ ] Đã vẽ lại được sơ đồ ERD (tay hoặc công cụ) khớp 100% với schema đã tạo, lưu vào repo (`docs/erd.png` hoặc tương tự) để đối chiếu về sau.
- [ ] **Không chỉnh sửa cấu trúc bảng nữa sau bước này** trừ khi phát hiện lỗi thiết kế nghiêm trọng.

---

## GIAI ĐOẠN 2 — Xác thực & Phân quyền (Auth + RLS đầy đủ)

**Mục tiêu:** Hệ thống đăng nhập hoạt động, và **mọi bảng đều có RLS policy đầy đủ, đã kiểm thử** trước khi bất kỳ module nghiệp vụ nào được xây trên đó.

**Công việc:**
1. Cấu hình Supabase Auth (email/password), trang `/login`, `/register`, `/quen-mat-khau`.
2. Middleware Next.js bảo vệ route: chưa đăng nhập → redirect `/login`; đăng nhập rồi mà vào `/login` → redirect `/dashboard`.
3. Viết đầy đủ RLS policy cho từng bảng theo ma trận quyền:

| Bảng | admin | quan_ly_dao_tao | giang_vien / tro_giang |
|---|---|---|---|
| `profiles` | Full | Đọc tất cả, sửa trạng thái hoạt động | Đọc tất cả (để biết đồng nghiệp), chỉ sửa hồ sơ của chính mình |
| `chung_chi` | Full | Đọc tất cả | Chỉ CRUD của chính mình |
| `chuong_trinh_dao_tao`, `chuong_trinh_mau_bai_giang` | Full | Full | Chỉ đọc |
| `lop_hoc`, `bai_giang` | Full | Full | Chỉ đọc |
| `dang_ky_giang_day` | Full | Đọc tất cả, sửa `trang_thai`/`nguoi_duyet_id` | Đọc/tạo của chính mình, không tự sửa `trang_thai` |
| `lich_giang` | Full | Full | Đọc toàn bộ (lịch chung toàn trung tâm, không phải dữ liệu nhạy cảm — khớp toggle "Tất cả ↔ Của tôi" ở Giai đoạn 6), không tự sửa |
| `kpi_ky`, `kpi_tieu_chi`, `kpi_tieu_chi_theo_ky` | Full | Đọc | Đọc |
| `danh_gia_kpi` | Full | Full (là người chấm điểm) | Chỉ đọc điểm của chính mình |
| `kpi_tong_hop` | Full | Full | Chỉ đọc của chính mình |
| `kpi_he_so_quy_doi` | Full | Đọc | Đọc |
| `loi_moi_giang_day` | Full | Full | Đọc/phản hồi lời mời của chính mình |
| `khao_sat_hoc_vien` | Full | Full (nhập từ phiếu khảo sát) | Chỉ đọc điểm tổng hợp của chính mình, không xem từng phiếu |
| `hoat_dong_hoc_thuat`, `hoat_dong_chung` | Full | Đọc tất cả, xác nhận điểm | Tự khai của chính mình |
| `mentor_mentee` | Full | Full | Đọc quan hệ liên quan đến chính mình |
| `ky_luat_khen_thuong` | Full | Full | Chỉ đọc của chính mình |
| `thong_bao` | Full | Đọc/tạo | Chỉ đọc của chính mình |
| `audit_log` | Chỉ đọc | Không truy cập | Không truy cập |

4. Tạo Postgres function `is_admin()`, `is_quan_ly()`, `current_role()` dùng chung trong các policy để tránh lặp code SQL.
5. Tạo 4 tài khoản test tương ứng 4 vai trò.

**Điều kiện hoàn thành (Gate → Giai đoạn 3):**
- [ ] Đăng nhập/đăng xuất/quên mật khẩu hoạt động đúng.
- [ ] Với **mỗi bảng**, đã viết policy cho đủ SELECT/INSERT/UPDATE/DELETE theo đúng ma trận trên.
- [ ] Đăng nhập lần lượt bằng 4 tài khoản test, thử gọi trực tiếp Supabase client để đọc/ghi các bảng không thuộc quyền → xác nhận bị chặn (không chỉ chặn ở UI mà chặn ở tầng DB).
- [ ] Kết quả kiểm thử phân quyền được ghi lại (bảng checklist) lưu trong repo.

---

## GIAI ĐOẠN 3 — Module Nhân sự

**Mục tiêu:** Quản lý hồ sơ nhân sự hoàn chỉnh — đây là module nghiệp vụ đầu tiên, mọi module sau đều tham chiếu đến nhân sự.

**Công việc:**
1. Layout chính: Sidebar nhóm thu gọn được (Tổng quan riêng lẻ; nhóm Đào tạo gồm Lớp học/Lịch giảng; nhóm Nhân sự; nhóm Đánh giá gồm Đánh giá & KPI; nhóm Cấu hình gồm Chương trình đào tạo/Cấu hình KPI — chỉ admin/quản lý thấy nhóm này) + Header (icon lịch, trợ giúp, chuông thông báo, avatar) + breadcrumb ngữ cảnh đầu vùng nội dung — chi tiết cấu trúc menu và các pattern điều hướng (drawer duyệt nhanh, nút inline, dashboard theo vai trò) xem [CLAUDE.md](CLAUDE.md) mục 3.
2. Trang `/nhan-su`: danh sách nhân sự dạng bảng, lọc theo vai trò/trạng thái hoạt động, tìm kiếm theo tên.
3. Trang `/nhan-su/[id]`: chi tiết hồ sơ + tab Chứng chỉ (upload/xem file qua Supabase Storage).
4. Form thêm/sửa nhân sự (admin), bao gồm đổi vai trò (`role`).
5. Trang `/ho-so`: hồ sơ cá nhân tự cập nhật (giảng viên/trợ giảng).
6. Chức năng khoá/mở hoạt động một tài khoản (`trang_thai_hoat_dong`) thay vì xoá cứng.

**Điều kiện hoàn thành (Gate → Giai đoạn 4):**
- [ ] CRUD nhân sự hoạt động đầy đủ đúng phân quyền đã kiểm thử ở Giai đoạn 2.
- [ ] Upload/xem chứng chỉ qua Storage hoạt động.
- [ ] Có tối thiểu 6-8 hồ sơ nhân sự mẫu thực tế (đa dạng vai trò/học vị) để làm dữ liệu nền cho các module sau — **không dùng dữ liệu rác** vì sẽ dùng lại đến cuối dự án.

---

## GIAI ĐOẠN 4 — Module Lớp học & Bài giảng

**Mục tiêu:** Quản lý đầy đủ vòng đời một lớp học, từ lúc tạo đến khi hoàn thành.

**Công việc:**
1. Trang `/cau-hinh/chuong-trinh` (thuộc nhóm sidebar "Cấu hình", chỉ admin/quản lý): CRUD danh mục `chuong_trinh_dao_tao` + danh sách bài giảng mẫu (`chuong_trinh_mau_bai_giang`) của mỗi chương trình — làm trước để có sẵn khung dùng lại khi mở lớp.
2. Trang `/lop-hoc` (thuộc nhóm sidebar "Đào tạo"): danh sách lớp, filter theo trạng thái/hình thức, badge màu trạng thái.
3. Form tạo lớp học: chọn **chương trình mẫu (tuỳ chọn)** — nếu chọn, hệ thống tự động **copy** toàn bộ `chuong_trinh_mau_bai_giang` thành các dòng `bai_giang` của riêng lớp này; nếu không chọn, tạo lớp trống rồi thêm bài giảng thủ công. Đầy đủ trường khác (loại lớp, hình thức, tính chất lớp, số lượng cần, người phụ trách).
4. Trang chi tiết `/lop-hoc/[id]`: dùng cấu trúc **tab con** thay vì nhiều trang rời — tab "Bài giảng" (danh sách bài giảng + tình trạng nhân sự đã gán/còn thiếu) hoàn thiện ở giai đoạn này; khung tab "Đăng ký & Duyệt" và "Lịch giảng" sẽ lắp nội dung vào cùng vị trí này ở Giai đoạn 5-6 (không tạo trang quản lý đăng ký hay lịch giảng rời cho từng lớp — xem [CLAUDE.md](CLAUDE.md) mục 3).
5. CRUD bài giảng gắn với lớp (chuyên đề, số tiết, thứ tự) — **thêm/sửa/xoá tự do cho từng lớp**, không ảnh hưởng chương trình mẫu gốc hay lớp khác, để mỗi lần mở lớp mới có thể có số buổi/nội dung khác nhau dễ dàng.
6. Logic tự động: cập nhật `trang_thai = 'thieu_nhan_su'` khi số nhân sự đã gán (qua `lich_giang`) chưa đạt `so_giang_vien_can`/`so_tro_giang_can`; tự chuyển `dang_dien_ra` khi đến `ngay_khai_giang`; `hoan_thanh` khi qua `ngay_ket_thuc` (có thể làm bằng Supabase scheduled function hoặc kiểm tra khi load trang).

**Điều kiện hoàn thành (Gate → Giai đoạn 5):**
- [ ] Toàn bộ vòng đời trạng thái lớp học hoạt động đúng như thiết kế.
- [ ] Tạo được lớp từ chương trình mẫu (copy đúng danh sách bài giảng) **và** tạo được lớp không dùng chương trình mẫu, cả 2 đều sửa bài giảng riêng được sau đó.
- [ ] Có tối thiểu 5-6 lớp học mẫu với nhiều trạng thái khác nhau, số buổi/bài giảng không giống nhau giữa các lớp — dùng làm nền cho Giai đoạn 5.

---

## GIAI ĐOẠN 5 — Module Đăng ký giảng dạy & Duyệt

**Mục tiêu:** Luồng nghiệp vụ cốt lõi: giảng viên/trợ giảng đề xuất dạy, quản lý duyệt, hệ thống tự sinh lịch giảng chính thức.

**Công việc:**
1. Nút hành động **"Đăng ký dạy lớp này"** đặt ngay trong danh sách `/lop-hoc` và trang chi tiết lớp (không tạo trang đăng ký riêng): giảng viên/trợ giảng chọn (tuỳ chọn) bài giảng cụ thể → gửi đăng ký ngay tại chỗ qua dialog. Đăng ký của chính mình xem lại được ở tab "Đăng ký & Duyệt" trong trang chi tiết lớp, kèm trạng thái theo thời gian thực.
2. Tab **"Đăng ký & Duyệt"** trong trang chi tiết `/lop-hoc/[id]` (admin/quản lý thấy đủ quyền duyệt, giảng viên/trợ giảng chỉ thấy đăng ký của mình): danh sách chờ duyệt hiển thị dạng bảng với nút **Duyệt/Từ chối inline ngay trong dòng bảng** kèm ghi chú lý do; khi cần xem thêm hồ sơ/chuyên môn trước khi duyệt thì mở **drawer (component `Sheet`)** hiện chi tiết người đăng ký mà không rời trang.
3. Khi Duyệt: transaction cập nhật `dang_ky_giang_day.trang_thai = 'da_duyet'` **và** tạo/cập nhật dòng `lich_giang` tương ứng trong cùng 1 thao tác (đảm bảo tính nhất quán dữ liệu — dùng Postgres function hoặc Supabase Edge Function, không tách 2 lệnh riêng ở client).
4. Chặn trùng lặp: không cho đăng ký 2 lần vào cùng 1 lớp/bài giảng với cùng vai trò (unique constraint hoặc kiểm tra logic).
5. Sinh thông báo (`thong_bao`) khi: có đăng ký mới (báo quản lý), đăng ký được duyệt/từ chối (báo người đăng ký).

**Điều kiện hoàn thành (Gate → Giai đoạn 6):**
- [ ] Luồng đăng ký → duyệt → sinh lịch giảng chạy đúng, nhất quán dữ liệu (test cả trường hợp duyệt và từ chối).
- [ ] Thông báo được tạo đúng thời điểm trong bảng `thong_bao`.
- [ ] Không có cách nào (kể cả gọi API trực tiếp) để một giảng viên tự duyệt đăng ký của chính mình.

---

## GIAI ĐOẠN 6 — Module Lịch giảng

**Mục tiêu:** Xem và quản lý lịch giảng đã được xác nhận.

**Công việc:**
1. Trang `/lich-giang` (thuộc nhóm sidebar "Đào tạo", tổng hợp toàn trung tâm) — **1 route duy nhất** với toggle **"Tất cả ↔ Của tôi"** (không tách route lịch cá nhân riêng): dạng bảng, filter theo lớp/nhân sự/khoảng thời gian.
2. Cùng trang `/lich-giang`, chuyển đổi được sang dạng lịch (calendar view) theo tuần/tháng — hiển thị các buổi giảng, tôn trọng bộ lọc "Tất cả/Của tôi" đang chọn.
3. Cho phép admin/quản lý cập nhật trạng thái buổi giảng (`du_kien` → `da_xac_nhan` → `da_ban_giao`, hoặc `huy`) bằng **nút hành động inline** ngay trong dòng bảng/ô lịch, không mở trang riêng.
4. Tab "Lịch giảng" trong `/lop-hoc/[id]` (đã scaffold khung tab từ Giai đoạn 4) chỉ hiện các buổi của lớp đó, tái dùng chung component với `/lich-giang` tổng hợp — khác nhau ở điều kiện lọc.

**Điều kiện hoàn thành (Gate → Giai đoạn 7):**
- [ ] Lịch giảng phản ánh đúng 100% dữ liệu từ các đăng ký đã duyệt ở Giai đoạn 5.
- [ ] Có đủ dữ liệu lịch giảng đã "đã ban giao" cho một vài buổi — đây sẽ là input tính KPI (số tiết dạy hoàn thành) ở Giai đoạn 7.

---

## GIAI ĐOẠN 7 — Module Đánh giá chất lượng & KPI

**Mục tiêu:** Module quan trọng nhất về mặt nghiệp vụ — đánh giá KPI đầy đủ, có thể cấu hình, dùng để xếp hạng tăng/hạ nhóm cuối năm.

**Công việc:**
1. Trang `/cau-hinh/kpi` (thuộc nhóm sidebar "Cấu hình", chỉ admin): quản lý `kpi_ky` (tạo kỳ đánh giá mới, mở/chốt kỳ), quản lý `kpi_tieu_chi` theo đúng 4 nhóm đã chốt ở [CLAUDE.md](CLAUDE.md) mục 2.2 (Khối lượng & Cống hiến 40%, Chất lượng & Phản hồi 30%, Năng lực chuyên môn 20%, Ý thức tổ chức 10%), gán trọng số theo từng kỳ qua `kpi_tieu_chi_theo_ky` (validate tổng trọng số = 100%), cấu hình hệ số quy đổi qua `kpi_he_so_quy_doi` và ngưỡng xếp hạng.
2. Trang `/kpi` (thuộc nhóm sidebar "Đánh giá") dùng **tab con** thay vì nhiều route rời:
   - Tab "Nhập điểm" (admin/quản lý): chỉ cần nhập tay các tiêu chí định tính (nhận xét quản lý/đồng nghiệp, ý thức tổ chức); các tiêu chí định lượng **tự động tính từ dữ liệu hệ thống**, không nhập tay:
     - Nhóm A: `lich_giang` (đã `da_ban_giao`) nhân hệ số theo `lop_hoc.co_kinh_phi/la_lop_gap/la_lop_cong_dong` qua `kpi_he_so_quy_doi`, cộng tỷ lệ chấp nhận từ `loi_moi_giang_day`.
     - Nhóm B: điểm trung bình `khao_sat_hoc_vien`, tỷ lệ huỷ phút chót từ `lich_giang.thoi_diem_huy` so với `ngay_gio`.
     - Nhóm C: hiệu lực `chung_chi` (có hệ số suy giảm theo `ngay_cap`) cộng điểm `hoat_dong_hoc_thuat`.
     - Nhóm D: `mentor_mentee` đã hoàn thành, `hoat_dong_chung`, `ky_luat_khen_thuong`.
   - Tab "Bảng xếp hạng" (admin/quản lý): sort theo điểm, xuất được biểu đồ phân bố điểm.
   - Tab "Của tôi" (mọi vai trò, mỗi người chỉ thấy dữ liệu chính mình): lịch sử điểm KPI các kỳ, biểu đồ xu hướng qua các kỳ.
3. Function tính điểm tổng hợp theo từng nhóm A/B/C/D rồi gộp: `tong_diem = Σ(diem_nhom × trong_so_nhom)`, chạy khi quản lý bấm "Chốt kỳ đánh giá" (ở tab "Nhập điểm"), ghi cả điểm từng nhóm (`diem_nhom_a/b/c/d`) và điểm tổng vào `kpi_tong_hop`.
4. Quy tắc xếp hạng tăng/giữ/hạ nhóm: cấu hình được ngưỡng (vd top X% → `tang_nhom`, bottom Y% → `ha_nhom`) thay vì hard-code, đọc từ `/cau-hinh/kpi`.
5. Khi kỳ đã "đã chốt" (`trang_thai = 'da_chot'`), khoá không cho sửa điểm nữa (trừ admin mở lại có ghi log).

**Điều kiện hoàn thành (Gate → Giai đoạn 8):**
- [ ] Cấu hình được một kỳ KPI hoàn chỉnh, nhập điểm, chốt kỳ, ra bảng xếp hạng đúng công thức.
- [ ] Kiểm thử với dữ liệu thật (nhân sự + lịch giảng đã tạo ở giai đoạn trước) cho ra kết quả hợp lý, đối chiếu tay được với Excel để xác nhận công thức đúng.
- [ ] Giảng viên/trợ giảng đăng nhập chỉ thấy điểm của chính mình, không thấy điểm người khác.

---

## GIAI ĐOẠN 8 — Thông báo (in-app + email)

**Mục tiêu:** Người dùng được thông báo kịp thời về các sự kiện quan trọng, không phải tự vào hệ thống kiểm tra.

**Công việc:**
1. Component chuông thông báo (badge số lượng chưa đọc), dropdown danh sách, đánh dấu đã đọc.
2. Realtime: dùng Supabase Realtime subscription để thông báo mới hiện ngay không cần tải lại trang.
3. Email: tích hợp Supabase Edge Function + dịch vụ gửi mail (vd Resend) cho các sự kiện quan trọng (đăng ký được duyệt/từ chối, kỳ KPI được công bố).

**Điều kiện hoàn thành (Gate → Giai đoạn 9):**
- [ ] Thông báo trong app hoạt động realtime, đúng người đúng nội dung.
- [ ] Email gửi thử nghiệm thành công cho ít nhất 2 loại sự kiện.

---

## GIAI ĐOẠN 9 — Dashboard & Báo cáo

**Mục tiêu:** Tổng hợp trực quan toàn bộ dữ liệu đã có từ các module trước — đây là lý do dashboard làm **sau cùng** trong các module nghiệp vụ, vì nó phụ thuộc dữ liệu từ tất cả module kia.

**Công việc:**
1. Trang `/dashboard` — **nội dung khác nhau theo vai trò đăng nhập** (xem [CLAUDE.md](CLAUDE.md) mục 3): admin/quản lý thấy 6 thẻ số liệu vận hành trước tiên (giảng viên/trợ giảng hoạt động, lớp đang diễn ra, lớp thiếu nhân sự, đăng ký chờ duyệt, KPI trung bình kỳ gần nhất); giảng viên/trợ giảng thấy lịch giảng sắp tới của mình + điểm KPI cá nhân kỳ gần nhất trước, rồi mới đến các thẻ số liệu chung.
2. Biểu đồ: chọn loại biểu đồ phù hợp với từng loại dữ liệu (không bắt buộc đúng 3 kiểu như ảnh mẫu — xem [CLAUDE.md](CLAUDE.md) mục 3), tối thiểu gồm: xu hướng số lớp khai giảng theo tháng, so sánh trình độ giảng viên vs trợ giảng, phân bổ nhân sự theo học vị/chức danh, top nhân sự theo số tiết dạy, xu hướng điểm KPI trung bình qua các kỳ (có bộ lọc so sánh giữa các kỳ/nhân sự/lớp).
3. Trang báo cáo riêng `/bao-cao`: bộ lọc theo khoảng thời gian/lớp/nhân sự, xuất Excel/PDF (dùng thư viện `exceljs`/`jspdf` hoặc Edge Function tạo file).

**Điều kiện hoàn thành (Gate → Giai đoạn 10):**
- [ ] Toàn bộ số liệu dashboard khớp chính xác với dữ liệu gốc trong database (đối chiếu tay một vài chỉ số).
- [ ] Xuất báo cáo Excel/PDF hoạt động, mở file không lỗi định dạng.

---

## GIAI ĐOẠN 10 — Kiểm thử toàn diện & Bảo mật

**Mục tiêu:** Đảm bảo hệ thống đúng và an toàn trước khi triển khai thật — đây là gate quan trọng nhất trước go-live.

**Công việc:**
1. Kiểm thử chức năng: đi lại toàn bộ luồng nghiệp vụ chính (tạo lớp → đăng ký → duyệt → lịch giảng → chốt KPI → dashboard) bằng cả 4 vai trò.
2. Kiểm thử bảo mật: rà lại toàn bộ RLS policy một lần cuối, thử truy cập trái phép bằng URL trực tiếp và bằng gọi API trực tiếp (không qua UI).
3. Kiểm thử dữ liệu biên: lớp không có bài giảng, nhân sự chưa có điểm KPI, kỳ KPI trống dữ liệu...
4. Viết test tự động (tối thiểu cho các function tính điểm KPI và logic trạng thái lớp học — đây là phần nghiệp vụ dễ sai nhất).
5. Kiểm tra hiệu năng cơ bản (thời gian tải trang dashboard với dữ liệu lớn hơn thực tế).

**Điều kiện hoàn thành (Gate → Giai đoạn 11):**
- [ ] Danh sách lỗi phát hiện được lập ra và **toàn bộ lỗi mức nghiêm trọng (bảo mật, sai dữ liệu) đã được sửa**.
- [ ] Test tự động cho phần tính KPI pass.

---

## GIAI ĐOẠN 11 — Tối ưu & Hoàn thiện UX

**Mục tiêu:** Đánh bóng sản phẩm trước khi đưa vào sử dụng thật.

**Công việc:**
1. Rà soát responsive lần cuối trên toàn bộ trang (mobile/tablet/desktop) — theo [CLAUDE.md](CLAUDE.md) mục 3.2, mỗi giai đoạn trước đã tự đảm bảo responsive cơ bản, ở đây chỉ xử lý các trường hợp còn sót và kiểm tra tổng thể xuyên suốt app.
2. Trạng thái loading/empty/error nhất quán trên toàn bộ trang.
3. Tối ưu truy vấn (index cho các cột hay filter: `trang_thai`, `profile_id`, `lop_hoc_id`...).
4. Rà soát UI đồng bộ theo đúng phong cách đã thiết kế (spacing, icon, phạm vi dùng kính mờ đúng mục 3.1, và đúng bảng màu đã chốt ở [CLAUDE.md](CLAUDE.md) mục 3 — không tự đặt màu mới ngoài bảng đó).

**Điều kiện hoàn thành (Gate → Giai đoạn 12):**
- [ ] Không còn màn hình "vỡ layout" trên các kích thước màn hình phổ biến.
- [ ] Các trang có dữ liệu lớn tải trong thời gian chấp nhận được.

---

## GIAI ĐOẠN 12 — Triển khai chính thức & Vận hành

**Mục tiêu:** Đưa hệ thống vào sử dụng thật, có tài liệu vận hành đi kèm.

**Công việc:**
0. Bật lại "Confirm email" trong Supabase Auth (đã tắt tạm ở Giai đoạn 2 để test nhanh 4 tài khoản mẫu — xem [docs/kiem-thu-phan-quyen.md](docs/kiem-thu-phan-quyen.md)).
1. Kiểm tra lại toàn bộ biến môi trường production trên Vercel.
2. Merge nhánh cuối cùng vào `main`, xác nhận deploy production ổn định.
3. Gắn domain riêng nếu có, cấu hình HTTPS (Vercel tự động).
4. Viết tài liệu vận hành: README kỹ thuật (cài đặt, biến môi trường), hướng dẫn sử dụng cho từng vai trò người dùng.
5. Tạo dữ liệu thật ban đầu (nhân sự thật, xoá hết dữ liệu test/mẫu).
6. Đào tạo/hướng dẫn nhanh cho người dùng thật đầu tiên, thu thập phản hồi.
7. Thiết lập theo dõi lỗi cơ bản (Vercel Analytics/Logs, hoặc Sentry nếu cần).

**Điều kiện hoàn thành (kết thúc dự án Version 1):**
- [ ] Hệ thống chạy ổn định trên production với dữ liệu thật.
- [ ] Người dùng thật đầu tiên sử dụng được không cần hỗ trợ trực tiếp liên tục.
- [ ] Tài liệu vận hành đầy đủ trong repo.

---

## Nguyên tắc quản lý tiến độ

- **Không bắt đầu Giai đoạn N+1 khi Giai đoạn N chưa đạt đủ "Điều kiện hoàn thành".** Nếu phát hiện thiếu sót ở giai đoạn trước trong lúc làm giai đoạn sau, dừng lại, quay về sửa tận gốc trước khi tiếp tục — không vá tạm ở lớp trên.
- Mỗi Giai đoạn nên merge vào `main` qua một Pull Request riêng, tên nhánh theo dạng `feature/giai-doan-<số>-<ten>`, để lịch sử Git phản ánh đúng trình tự đã lên kế hoạch.
- Schema database chốt ở Giai đoạn 1 — nếu Giai đoạn 3 trở đi phát hiện cần thêm cột/bảng, đó là dấu hiệu cần xem lại thiết kế tổng thể, không nên "thêm đại cho xong việc".
- **Responsive mobile là điều kiện của MỌI giai đoạn có UI (3 trở đi), không riêng Giai đoạn 11** (xem [CLAUDE.md](CLAUDE.md) mục 3.2) — mỗi giai đoạn tự kiểm tra không vỡ layout ở khổ mobile (≥375px) trước khi coi là đạt Gate; Giai đoạn 11 chỉ rà soát toàn diện lần cuối.
