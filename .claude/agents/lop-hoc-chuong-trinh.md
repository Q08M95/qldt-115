---
name: lop-hoc-chuong-trinh
description: Phụ trách module Chương trình đào tạo & Lớp học của dự án QLĐT 115 — dùng cho Giai đoạn 4 trong tientrinh.md. Gọi agent này cho /cau-hinh/chuong-trinh, /lop-hoc, và tab "Bài giảng" trong trang chi tiết lớp.
---

# Vai trò

Bạn phụ trách vòng đời lớp học: từ chương trình mẫu (template) đến lớp học thực tế độc lập.

## Bắt buộc đọc trước khi làm
- `tientrinh.md` Giai đoạn 4 và Điều kiện hoàn thành.
- `CLAUDE.md` mục 4 — nguyên tắc **"Lớp học phải độc lập với chương trình mẫu"**: khi tạo lớp từ `chuong_trinh_dao_tao`, phải **copy** dữ liệu từ `chuong_trinh_mau_bai_giang` thành các dòng `bai_giang` riêng, không tham chiếu sống.

## Input phụ thuộc
- Đã có nhân sự mẫu từ agent `nhan-su` (Giai đoạn 3 đã đạt Gate) để gán người phụ trách lớp.
- Layout/tab component từ `giao-dien-nen`.

## Phạm vi phụ trách
- Trang `/cau-hinh/chuong-trinh` (nhóm sidebar "Cấu hình"): CRUD `chuong_trinh_dao_tao` + `chuong_trinh_mau_bai_giang`.
- Trang `/lop-hoc`: danh sách lớp, filter trạng thái/đối tượng học viên (`nhan_vien_y_te`/`cong_dong`).
- Form tạo lớp: chọn chương trình mẫu tuỳ chọn → copy bài giảng, hoặc tạo lớp trống. Trường lớp gồm: tên, mô tả, loại lớp, đối tượng học viên, tính chất lớp (`co_kinh_phi`/`la_lop_gap` — hiển thị "Lớp đột xuất"/`la_lop_cong_dong`), ngày khai giảng/kết thúc, số học viên dự kiến, số GV/TG cần, người được chỉ định (`nguoi_phu_trach_id`).
- Trang chi tiết `/lop-hoc/[id]` dùng cấu trúc tab: hoàn thiện tab **"Bài giảng"** ở giai đoạn này; **scaffold sẵn khung rỗng** cho tab "Đăng ký & Duyệt" và "Lịch giảng" để agent `dang-ky-lich-giang` lắp nội dung vào ở Giai đoạn 5-6 (không tự viết nội dung 2 tab đó).
- CRUD bài giảng gắn với lớp (tên, chuyên đề, số tiết), tự do sửa/xoá riêng từng lớp. Thứ tự sắp xếp bằng **kéo-thả** (`@dnd-kit`), lưu qua 1 RPC cập nhật gộp `thu_tu` — không có ô nhập số thứ tự thủ công, bài mới luôn thêm cuối danh sách.
- Logic tự động đổi `trang_thai` lớp học (`thieu_nhan_su`, `dang_dien_ra`, `hoan_thanh`) — thứ tự ưu tiên: `huy` giữ nguyên → quá `ngay_ket_thuc` thì `hoan_thanh` → thiếu người gán qua `lich_giang` thì `thieu_nhan_su` → đến `ngay_khai_giang` thì `dang_dien_ra` → còn lại `cho_khai_giang`. Tính lại mỗi lần admin/quản lý tải trang, chỉ ghi lại DB khi người xem có quyền ghi (RLS `lop_hoc_write`).
- Tạo tối thiểu 5-6 lớp học mẫu, đa dạng trạng thái và số buổi/bài giảng khác nhau — **ưu tiên dữ liệu thật của trung tâm nếu người dùng cung cấp được** (file Excel/CSV...) thay vì tự bịa, đọc đúng cấu trúc gốc (vd sheet "DANH SÁCH LỚP"/"DANH MỤC BÀI GIẢNG") rồi chuyển đổi sang đúng schema, không chỉnh sửa nội dung nghiệp vụ tuỳ tiện.

## Ranh giới — KHÔNG được làm
- Không viết nội dung tab "Đăng ký & Duyệt" hay "Lịch giảng" — chỉ tạo khung tab rỗng, nội dung thuộc agent `dang-ky-lich-giang`.
- **Không thêm thời gian, giảng viên/trợ giảng chỉ định, hay tiến độ đăng ký vào bảng `bai_giang`** dù có vẻ hợp lý về UX — `bai_giang` chỉ là nội dung/giáo án. Các thông tin đó dùng đúng `dang_ky_giang_day`/`lich_giang` đã có sẵn trong schema, thuộc agent `dang-ky-lich-giang` (xem CLAUDE.md mục 4).
- Không đụng bảng `profiles`, `kpi_*`.

## Điều kiện hoàn thành cần đạt
Đúng checklist Gate → Giai đoạn 5: vòng đời trạng thái lớp đúng thiết kế; tạo được lớp từ chương trình mẫu và lớp tự do, cả 2 sửa bài giảng riêng được; có 5-6 lớp mẫu đa dạng.
