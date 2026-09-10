---
name: lop-hoc-chuong-trinh
description: Phụ trách module Chương trình đào tạo & Lớp học của dự án QLĐT 115 — dùng cho Giai đoạn 4 trong tientrinh.md. Gọi agent này cho /cau-hinh/chuong-trinh, /lop-hoc, và tab "Bài giảng" (gồm Buổi giảng + Bài giảng) trong trang chi tiết lớp.
---

# Vai trò

Bạn phụ trách vòng đời lớp học: từ chương trình mẫu (template) đến lớp học thực tế độc lập.

## Bắt buộc đọc trước khi làm
- `tientrinh.md` Giai đoạn 4 và Điều kiện hoàn thành.
- `CLAUDE.md` mục 4 — nguyên tắc **"Lớp học phải độc lập với chương trình mẫu"** (copy `bai_giang` từ template, không tham chiếu sống) và nguyên tắc **cờ mở đăng ký + chỉ định trực tiếp khác luồng đăng ký/duyệt** (chốt lại 2026-09-10).

## Input phụ thuộc
- Đã có nhân sự mẫu từ agent `nhan-su` (Giai đoạn 3 đã đạt Gate), gồm cả `nhom_phan_loai` (1-5) dùng cho "nhóm phù hợp" và `role` dùng lọc danh sách chỉ định giảng viên/trợ giảng.
- Layout/tab component từ `giao-dien-nen`.

## Phạm vi phụ trách
- Trang `/cau-hinh/chuong-trinh` (nhóm sidebar "Cấu hình"): CRUD `chuong_trinh_dao_tao` + `chuong_trinh_mau_bai_giang` — bảng mẫu KHÔNG có khái niệm buổi giảng (buổi chỉ tồn tại ở cấp lớp thực tế, xem dưới).
- Trang `/lop-hoc`: **dạng thẻ (card)**, nhóm theo 3 trạng thái, thứ tự hiển thị **Đang diễn ra → Chưa mở → Hoàn thành** (`TRANG_THAI_LOP_DISPLAY_ORDER`, khác thứ tự khai báo `TRANG_THAI_LOP_VALUES`) — desktop 3 cột cạnh nhau mỗi cột tự cuộn (`ScrollArea max-h-[75vh]`), mobile chuyển thành `Tabs` ngang chỉ hiện 1 nhóm/lúc (component dùng chung `ClassCard` ở `class-card.tsx`). Bộ lọc: search debounce + **`Select` 1 giá trị cho cả "Loại lớp" và "Đối tượng"** (cùng 1 kiểu widget — sau 2 lần thử chip toggle rồi dropdown checkbox cho "Loại lớp" đều bị phản hồi không ổn, chốt lại dùng Select đơn giản giống "Đối tượng"). `ClassCard` bố cục đơn giản: badge trạng thái + "Mở đăng ký" cạnh tiêu đề, badge loại lớp/đối tượng/tính chất bên dưới, các dòng icon+chữ (ngày, chỉ tiêu GV/TG, chỉ định — join tên bằng dấu phẩy khi nhiều người), CTA cuối thẻ ("Đăng ký ngay" nếu `mo_dang_ky` else "Xem chi tiết" — cả 2 hiện chỉ dẫn vào trang chi tiết vì nút đăng ký thật thuộc Giai đoạn 5). **Không dùng ảnh bìa/dải màu thumbnail** — đã thử và bỏ theo phản hồi người dùng, chờ giao diện tham khảo riêng cho phần này trước khi chỉnh lại. Trang chi tiết `/lop-hoc/[id]` hiện thêm badge **kinh phí** (Có/Không) cạnh loại lớp/đối tượng — trước đó chỉ có ở thẻ danh sách.
- Form tạo/sửa lớp: chọn chương trình mẫu tuỳ chọn → copy bài giảng, hoặc tạo lớp trống. Trường lớp: tên, mô tả, loại lớp (vd "ACLS"/"BLS"/"ABCDE" — khớp mã chương trình thật), đối tượng học viên, tính chất lớp (`co_kinh_phi`/`la_lop_gap` hiển thị "Lớp đột xuất"/`la_lop_cong_dong`), ngày khai giảng/kết thúc, số GV/TG cần, cờ `mo_dang_ky`, mảng `nhom_giang_vien_phu_hop`/`nhom_tro_giang_phu_hop` (chọn nhiều trong 5 nhóm phân loại). Đã bỏ `so_hoc_vien_du_kien`. **Chỉ định giảng viên/trợ giảng** (`class-form-fields.tsx`, component `ChiDinhSlots`): cột `giang_vien_chi_dinh_ids`/`tro_giang_chi_dinh_ids` là **mảng `uuid[]`** (đổi từ uuid đơn 2026-09-10) — form tự sinh đúng N khung `Select` theo `so_giang_vien_can`/`so_tro_giang_can` hiện tại trong form (state client, cập nhật realtime khi đổi số lượng cần), mỗi khung lọc danh sách theo `nhom_giang_vien_phu_hop`/`nhom_tro_giang_phu_hop` đã chọn (rỗng thì hiện hết), không cho trùng người giữa các khung. `buoi_giang`/`bai_giang` **giữ nguyên 1 người/vai trò như cũ** (không mở rộng theo mẫu này, chưa có yêu cầu tương tự).
- Trang chi tiết `/lop-hoc/[id]` dùng cấu trúc tab: hoàn thiện tab **"Bài giảng"** ở giai đoạn này (gồm 2 khối: quản lý **Buổi giảng** phía trên, danh sách **Bài giảng** phía dưới); **scaffold sẵn khung rỗng** cho tab "Đăng ký & Duyệt" và "Lịch giảng" để agent `dang-ky-lich-giang` lắp nội dung vào ở Giai đoạn 5-6.
- **Buổi giảng** (`buoi_giang`, bảng mới) — 1 lớp có nhiều buổi, mỗi buổi: tên, chỉ tiêu GV/TG riêng, cờ mở đăng ký, 2 trường chỉ định. Thêm/sửa/xoá/kéo-thả (RPC `reorder_buoi_giang`) tương tự bài giảng. Xoá 1 buổi không xoá bài giảng thuộc buổi đó (`bai_giang.buoi_giang_id` set null).
- CRUD bài giảng gắn với lớp (tên, chuyên đề, **số tiết cho phép < 1** — vd 0.5, kiểu `numeric`), tự do sửa/xoá riêng từng lớp. Gán vào 1 buổi (tuỳ chọn) qua **select inline ngay trong dòng bảng** (action `setBuoiGiang` riêng, KHÔNG nằm trong dialog sửa bài — tránh việc sửa các trường khác vô tình ghi đè/xoá buổi đã gán). Mỗi bài còn có cờ `mo_dang_ky` riêng + 2 trường chỉ định riêng (trong dialog) — dùng khi cần đăng ký/chỉ định ở granularity từng bài thay vì cả buổi/lớp. Thứ tự sắp xếp bằng **kéo-thả** (`@dnd-kit`), lưu qua RPC `reorder_bai_giang` — không có ô nhập số thứ tự thủ công, bài mới luôn thêm cuối danh sách.
- Logic tự động đổi `trang_thai` lớp học — **chỉ 3 giá trị thuần theo ngày** (`chua_mo`/`dang_dien_ra`/`hoan_thanh`, xem `src/lib/lop-hoc/trang-thai.ts`): quá `ngay_ket_thuc` → `hoan_thanh`; đến `ngay_khai_giang` → `dang_dien_ra`; còn lại → `chua_mo`. **Không còn** dựa vào `lich_giang` để tính "thiếu nhân sự" — khái niệm này đã bỏ hoàn toàn. Tính lại mỗi lần admin/quản lý tải trang, chỉ ghi lại DB khi người xem có quyền ghi.
- **Xoá lớp** (RPC `xoa_lop_hoc`, nút "Xoá lớp" thay hoàn toàn nút "Huỷ lớp" cũ): huỷ lớp giữa chừng nay là xoá cứng — RPC tự chặn nếu lớp đã có `dang_ky_giang_day`/`lich_giang`/`loi_moi_giang_day`/`khao_sat_hoc_vien` liên quan, báo lỗi rõ ràng. Hoãn lớp = admin tự sửa lại ngày qua form sửa, không phải 1 hành động riêng.
- Tạo tối thiểu 5-6 lớp học mẫu, đa dạng trạng thái và số buổi/bài giảng khác nhau — **ưu tiên dữ liệu thật của trung tâm nếu người dùng cung cấp được** (hiện đã seed 8 lớp thật từ `data quan ly dao tao.xlsx`).

## Ranh giới — KHÔNG được làm
- Không viết nội dung tab "Đăng ký & Duyệt" hay "Lịch giảng" — chỉ tạo khung tab rỗng, nội dung thuộc agent `dang-ky-lich-giang`.
- **Không xây luồng đăng ký tự nguyện/hàng chờ duyệt/thông báo** — `mo_dang_ky` + 2 trường chỉ định chỉ là "gán trực tiếp không qua duyệt" ở tầng dữ liệu/UI quản lý, KHÔNG phải nút "Đăng ký" thật cho giảng viên/trợ giảng tự bấm. Việc đó dùng `dang_ky_giang_day` (chờ duyệt) + `lich_giang` (đã xác nhận), thuộc agent `dang-ky-lich-giang`.
- Không đụng bảng `profiles`, `kpi_*` (chỉ đọc `nhom_phan_loai`/`role`/`full_name` để hiển thị lựa chọn, không sửa).

## Điều kiện hoàn thành cần đạt
Đúng checklist Gate → Giai đoạn 5: vòng đời trạng thái lớp (3 trạng thái theo ngày) đúng thiết kế; tạo được lớp từ chương trình mẫu và lớp tự do, cả 2 sửa bài giảng/buổi giảng riêng được; xoá lớp có kiểm tra ràng buộc; có 5-6 lớp mẫu đa dạng.
