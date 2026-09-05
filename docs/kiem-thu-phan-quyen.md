# Kết quả kiểm thử phân quyền — Giai đoạn 2

> Kiểm thử ngày 2026-09-05, gọi trực tiếp Supabase REST API (không qua UI) bằng access token thật của 4 tài khoản test, theo đúng yêu cầu Gate Giai đoạn 2 trong [tientrinh.md](../tientrinh.md).

## 4 tài khoản test

| Vai trò | Email |
|---|---|
| admin | `nguyenhoangtuminh08+qldtadmin@gmail.com` |
| quan_ly_dao_tao | `nguyenhoangtuminh08+qldtquanly@gmail.com` |
| giang_vien | `nguyenhoangtuminh08+qldtgv@gmail.com` |
| tro_giang | `nguyenhoangtuminh08+qldttg@gmail.com` |

Mật khẩu chung (chỉ dùng nội bộ để test, đổi lại trước khi dùng thật): `TestQldt#2026`

## Kết quả (20/20 test đạt)

| # | Test | Kỳ vọng | Kết quả |
|---|---|---|---|
| A1 | `tro_giang` đọc toàn bộ `profiles` | Cho phép | ĐẠT |
| A2 | `tro_giang` tự sửa hồ sơ chính mình (`chuyen_mon`) | Cho phép | ĐẠT |
| A3 | `tro_giang` tự nâng `role` thành `admin` | Chặn (lỗi `P0001`) | ĐẠT |
| A4 | `giang_vien` sửa hồ sơ người khác | Chặn (0 dòng) | ĐẠT |
| A5 | `quan_ly_dao_tao` sửa `trang_thai_hoat_dong` của người khác | Cho phép | ĐẠT |
| A6 | `quan_ly_dao_tao` sửa cột khác ngoài `trang_thai_hoat_dong` | Chặn (lỗi `P0001`) | ĐẠT |
| B2 | `quan_ly_dao_tao` tạo `chuong_trinh_dao_tao` | Cho phép | ĐẠT |
| B3 | `tro_giang` đọc `chuong_trinh_dao_tao` | Cho phép (đọc chung) | ĐẠT |
| B4 | `tro_giang` tạo `chuong_trinh_dao_tao` | Chặn (lỗi `42501` — RLS) | ĐẠT |
| C1 | `quan_ly_dao_tao` tạo `lop_hoc` (kích hoạt trigger audit) | Cho phép | ĐẠT |
| C2 | `admin` đọc `audit_log` | Cho phép | ĐẠT |
| C3 | `quan_ly_dao_tao` đọc `audit_log` (dù đã có dữ liệu) | Chặn (0 dòng) | ĐẠT |
| C4 | `giang_vien` đọc `audit_log` | Chặn (0 dòng) | ĐẠT |
| C5 | `giang_vien` tự đăng ký dạy lớp (của chính mình) | Cho phép | ĐẠT |
| C6 | `giang_vien` tự DUYỆT đăng ký của chính mình | **Chặn tuyệt đối** (0 dòng) | ĐẠT |
| C7 | `quan_ly_dao_tao` duyệt đăng ký | Cho phép | ĐẠT |
| D1 | `admin` tạo `kpi_ky` | Cho phép | ĐẠT |
| D3 | `quan_ly_dao_tao` chấm điểm `danh_gia_kpi` | Cho phép | ĐẠT |
| D5 | `quan_ly_dao_tao` sửa điểm sau khi kỳ `da_chot` | Chặn (lỗi `P0001`) | ĐẠT |
| D6 | `admin` vẫn sửa được điểm sau khi kỳ `da_chot` (mở lại) | Cho phép | ĐẠT |

Test C6 là điều kiện bắt buộc quan trọng nhất của Giai đoạn 5 ("Không có cách nào, kể cả gọi API trực tiếp, để một giảng viên tự duyệt đăng ký của chính mình") — đã xác nhận đạt ngay từ tầng RLS ở Giai đoạn 2, trước khi UI duyệt đăng ký được xây ở Giai đoạn 5.

Toàn bộ dữ liệu test (`chuong_trinh_dao_tao`, `lop_hoc`, `dang_ky_giang_day`, `kpi_ky`, `kpi_tieu_chi`, `danh_gia_kpi`) đã được dọn sạch sau kiểm thử — xác nhận 0 dòng còn sót ở từng bảng. 4 tài khoản test được giữ lại để dùng tiếp cho các giai đoạn sau.

## Ghi chú vận hành

- Đã tắt tạm "Confirm email" trong Supabase Auth (Authentication → Sign In / Providers → Email) để test nhanh không cần xác nhận email. **Phải bật lại trước Giai đoạn 12 (triển khai chính thức)** — ghi vào checklist Giai đoạn 12.
- Đăng nhập/Đăng ký/Quên mật khẩu/Đặt lại mật khẩu đã kiểm tra hoạt động qua middleware + Server Actions (`/login`, `/register`, `/quen-mat-khau`, `/dat-lai-mat-khau`, route xử lý `/auth/confirm`).
