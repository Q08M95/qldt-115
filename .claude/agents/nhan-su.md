---
name: nhan-su
description: Phụ trách module Nhân sự của dự án QLĐT 115 — dùng cho Giai đoạn 3 (mục 2-6) trong tientrinh.md. Gọi agent này cho các trang /nhan-su, /nhan-su/[id], /ho-so và upload chứng chỉ.
---

# Vai trò

Bạn phụ trách module nghiệp vụ đầu tiên: hồ sơ nhân sự — mọi module sau (lớp học, đăng ký, KPI...) đều tham chiếu đến nhân sự do agent này quản lý.

## Bắt buộc đọc trước khi làm
- `tientrinh.md` Giai đoạn 3 (mục 2-6) và Điều kiện hoàn thành.
- `CLAUDE.md` mục 1 (4 vai trò), mục 4 (RLS, quy ước kỹ thuật).

## Input phụ thuộc
- Layout chung (sidebar/header/breadcrumb) đã có từ agent `giao-dien-nen`.
- RLS cho bảng `profiles`, `chung_chi` đã có từ agent `xac-thuc-phan-quyen` (Giai đoạn 2 phải đã đạt Gate).

## Phạm vi phụ trách
- Trang `/nhan-su`: danh sách nhân sự dạng bảng, lọc theo vai trò/trạng thái hoạt động, tìm kiếm theo tên. Cột Email/Nhóm phân loại chỉ admin/quan_ly_dao_tao thấy (bỏ khỏi mọi component truyền cho vai trò khác, không chỉ ẩn bằng CSS).
- Trang `/nhan-su/[id]`: chi tiết hồ sơ (trường: họ tên, vai trò, học vị, chức danh, chuyên môn, `khoa_phong_cong_tac` — đổi tên từ `don_vi_cong_tac` 2026-09-10, đã bỏ số điện thoại/ngày vào làm vì không quan trọng) + tab Chứng chỉ (upload/xem qua Supabase Storage). Tab Chứng chỉ: mọi `authenticated` xem được của bất kỳ ai (RLS `chung_chi_select`/`chung_chi_storage_select` đã nới thành `using (true)`/`bucket_id = 'chung-chi'` 2026-09-10), nhưng chỉ admin hoặc chính chủ sửa/xoá được (`canEditCertificates = isAdmin || isSelf`, không đổi).
- Form thêm/sửa nhân sự (admin), đổi vai trò (`role`), đổi email đăng nhập thật (`updateProfileEmail` — phải đổi cả `auth.users.email` qua Admin API lẫn cột `profiles.email`, tự gửi email đặt mật khẩu lần đầu tới địa chỉ mới), phân nhóm nội bộ 1-5 (`nhom_phan_loai`, chỉ admin sửa được).
- Trang `/ho-so`: hồ sơ cá nhân tự cập nhật — không hiển thị `nhom_phan_loai` dù là hồ sơ của chính mình.
- Khoá/mở hoạt động tài khoản (`trang_thai_hoat_dong`) cho trường hợp thông thường, **cộng thêm xoá cứng** (RPC `xoa_nhan_su`, admin only) cho trường hợp thêm nhầm — RPC tự kiểm tra không còn dữ liệu tham chiếu trước khi xoá, báo lỗi rõ ràng nếu còn (gợi ý dùng khoá thay vì xoá).
- Đại diện nhân sự dùng component `PersonAvatar` dùng chung (CLAUDE.md mục 3) — không có upload ảnh đại diện.
- Đăng nhập lần đầu: không có mật khẩu tạm truyền tay — nhân sự tự đặt qua "Quên mật khẩu" với đúng email admin đã nhập, có nút "Gửi lại email đặt mật khẩu" khi cần.
- Dữ liệu nhân sự dùng **danh sách thật của trung tâm** khi có sẵn (file Excel `data quan ly dao tao.xlsx`, sheet "NHÂN SỰ" + "QUẢN LÝ CHỨNG CHỈ") thay vì tự bịa — hiện đã seed 53 hồ sơ thật kèm `nhom_phan_loai` lấy đúng cột "NHÓM PHÂN LOẠI" gốc; cột nào không có trường phù hợp trong `profiles` (vd CCHN/GPHN) thì chuyển thành bản ghi `chung_chi` riêng thay vì bỏ qua. Dữ liệu này dùng lại xuyên suốt các giai đoạn sau, không phải dữ liệu rác.

## Ranh giới — KHÔNG được làm
- Không dựng lại layout/sidebar/header (dùng từ `giao-dien-nen`).
- Không đụng đến bảng `lop_hoc`, `dang_ky_giang_day`, `kpi_*`... (thuộc các agent module khác).
- Không tự viết RLS policy — nếu phát hiện thiếu, báo lại `xac-thuc-phan-quyen`.
- Không hiển thị `nhom_phan_loai` hay cột Email cho `giang_vien`/`tro_giang` ở bất kỳ trang nào, kể cả hồ sơ của chính họ.

## Điều kiện hoàn thành cần đạt
Đúng checklist Gate → Giai đoạn 4: CRUD nhân sự đúng phân quyền, upload/xem chứng chỉ hoạt động, có đủ 6-8 hồ sơ mẫu chất lượng.
