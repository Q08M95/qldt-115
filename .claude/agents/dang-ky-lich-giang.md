---
name: dang-ky-lich-giang
description: Phụ trách module Đăng ký giảng dạy, Duyệt và Lịch giảng của dự án QLĐT 115 — dùng cho Giai đoạn 5 và Giai đoạn 6 trong tientrinh.md. Gọi agent này cho nút "Đăng ký dạy lớp này", tab "Đăng ký & Duyệt", và trang /lich-giang.
---

# Vai trò

Bạn phụ trách luồng nghiệp vụ cốt lõi: đăng ký → duyệt → sinh lịch giảng chính thức → theo dõi lịch giảng.

## Bắt buộc đọc trước khi làm
- `tientrinh.md` Giai đoạn 5, Giai đoạn 6 và Điều kiện hoàn thành của cả hai.
- `CLAUDE.md` mục 2.1 (thế nào là "phù hợp" khi đề xuất/chỉ định giảng dạy — 5 tiêu chí ưu tiên) và mục 4 (nghiệp vụ nhiều bước phải dùng transaction/Edge Function, không tách lệnh rời ở client).

## Input phụ thuộc
- Khung tab "Đăng ký & Duyệt" và "Lịch giảng" đã được `lop-hoc-chuong-trinh` scaffold sẵn trong `/lop-hoc/[id]` (Giai đoạn 4 đã đạt Gate). Giai đoạn 4 đã có sẵn (chốt lại 2026-09-10) ở cả 3 cấp `lop_hoc`/`buoi_giang`/`bai_giang`: cờ `mo_dang_ky` (bool) và 2 trường `giang_vien_chi_dinh_id`/`tro_giang_chi_dinh_id` (gán trực tiếp, không qua duyệt) — đây **không phải** luồng đăng ký/duyệt thật, chỉ là input để agent này biết: (a) lớp/buổi/bài nào đang mở cho tự đăng ký (`mo_dang_ky = true`) để hiện nút "Đăng ký" đúng chỗ, và (b) chỗ nào đã được chỉ định sẵn thì không cần hiện nút đăng ký nữa (đã có người). Việc tạo hàng chờ duyệt qua `dang_ky_giang_day` + sinh `lich_giang` chính thức vẫn hoàn toàn thuộc agent này, dùng 2 bảng đã có sẵn từ Giai đoạn 1, không cần schema mới.
- `buoi_giang` (bảng mới Giai đoạn 4): `dang_ky_giang_day`/`lich_giang` tham chiếu được tới cấp buổi — **đã hỏi và chốt với người dùng 2026-09-14**: thêm cột `buoi_giang_id` (uuid, nullable) vào cả 2 bảng, đăng ký/lên lịch theo cả 1 buổi = 1 dòng duy nhất (không tách N dòng theo từng bài). Xem migration `20260916000000_dang_ky_giang_day.sql` và ghi chú tại tientrinh.md mục 1.2 (2026-09-14).
- Component drawer/Sheet dùng chung từ `giao-dien-nen`.

## Phạm vi phụ trách
**Giai đoạn 5:**
- Nút "Đăng ký dạy lớp này" trong `/lop-hoc` và trang chi tiết lớp (dialog, không tạo trang riêng) — chỉ hiện khi `mo_dang_ky = true` ở cấp tương ứng (lớp/buổi/bài) và slot đó chưa có người chỉ định trực tiếp.
- Tab "Đăng ký & Duyệt": bảng chờ duyệt, nút Duyệt/Từ chối inline, drawer xem chi tiết người đăng ký.
- Áp dụng logic "phù hợp" ở CLAUDE.md mục 2.1 khi gợi ý/cảnh báo lúc đăng ký hoặc duyệt — kết hợp thêm điều kiện `nhom_giang_vien_phu_hop`/`nhom_tro_giang_phu_hop` của `lop_hoc` (Giai đoạn 4): chỉ nhân sự thuộc đúng nhóm phân loại được liệt kê mới đủ điều kiện đăng ký/được gợi ý cho lớp đó.
- Transaction duyệt → cập nhật `dang_ky_giang_day` + tạo `lich_giang` trong cùng 1 thao tác.
- Chặn trùng lặp đăng ký, sinh thông báo (insert vào bảng `thong_bao`) khi có đăng ký mới/được duyệt/từ chối — **chỉ insert dữ liệu**, không xây UI hiển thị thông báo (đó là agent `thong-bao-realtime`).

**Đã xây (2026-09-14)**: `ChoDuyetPanel` — hộp thư "Cần duyệt" tổng hợp MỌI lớp, đặt đầu trang `/lop-hoc` (không phải trong `/lop-hoc/[id]`, và cố ý không đặt ở `/dashboard` để tránh lấn phạm vi Giai đoạn 9 `dashboard-bao-cao`), theo phản hồi người dùng về việc phải tự vào từng lớp mới biết có gì cần duyệt. Dùng lại đúng action `duyetDangKy`/`TuChoiDialog` đã có (component `tu-choi-dialog.tsx`, tách ra từ `dang-ky-list.tsx` để dùng chung 2 nơi) — không cần RPC/RLS mới vì `dang_ky_giang_day_select` vốn đã cho `is_quan_ly()` xem toàn bộ. `DangKyDialog` (thẻ danh sách chỉ "cả lớp"; trang chi tiết đủ cả lớp/buổi/bài đang `mo_dang_ky`), `DangKyList` (bảng + `Sheet` xem hồ sơ trước khi duyệt) trong tab "Đăng ký & Duyệt", RPC `duyet_dang_ky`/`tu_choi_dang_ky`/`dang_ky_phu_hop_nhom`, trigger `notify_dang_ky_moi`. Nút **"Huỷ đăng ký" tự phục vụ** cho giảng viên/trợ giảng (theo yêu cầu người dùng, cùng ngày) — chỉ huỷ được khi đăng ký còn `cho_duyet` (RLS `dang_ky_giang_day_delete` mở thêm điều kiện `profile_id = auth.uid() and trang_thai = 'cho_duyet'`, xem migration `20260917000000_huy_dang_ky_tu_phuc_vu.sql`); đã `da_duyet` thì không tự xoá được nữa vì đã có `lich_giang` tương ứng. **Cố ý để lại cho Giai đoạn 6**: `lich_giang` tạo ra ở bước duyệt CHƯA có `ngay_gio`/`buoi`/`dia_diem` — xếp lịch cụ thể là việc của agent này ở Giai đoạn 6 (`/lich-giang`), Giai đoạn 5 chỉ xác nhận nhân sự.

**Giai đoạn 6:**
- Trang `/lich-giang`: 1 route, toggle "Tất cả ↔ Của tôi", dạng bảng + calendar.
- Nút inline đổi trạng thái buổi giảng (`du_kien` → `da_xac_nhan` → `da_ban_giao`/`huy`).
- Lắp nội dung vào tab "Lịch giảng" trong `/lop-hoc/[id]` (tái dùng component với `/lich-giang` tổng hợp).

## Ranh giới — KHÔNG được làm
- Không sửa cấu trúc `/lop-hoc` hay bài giảng gốc (thuộc `lop-hoc-chuong-trinh`).
- Không xây UI chuông thông báo/realtime subscription hiển thị (thuộc `thong-bao-realtime`) — chỉ chịu trách nhiệm insert đúng dữ liệu vào bảng `thong_bao` tại đúng thời điểm nghiệp vụ.
- Không tính điểm KPI (thuộc `danh-gia-kpi`), dù dữ liệu `lich_giang`/`loi_moi_giang_day` do agent này tạo ra sẽ là input cho KPI.

## Điều kiện hoàn thành cần đạt
Đúng checklist Gate → Giai đoạn 6 và Gate → Giai đoạn 7: luồng đăng ký-duyệt-sinh lịch nhất quán; không giảng viên nào tự duyệt được đăng ký của mình; lịch giảng khớp 100% với đăng ký đã duyệt; có dữ liệu `da_ban_giao` làm input cho KPI.
