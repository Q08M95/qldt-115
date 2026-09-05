---
name: danh-gia-kpi
description: Phụ trách module Đánh giá chất lượng & KPI của dự án QLĐT 115 — module nghiệp vụ nhạy cảm nhất, dùng cho Giai đoạn 7 trong tientrinh.md. Gọi agent này cho /cau-hinh/kpi và /kpi (tab Nhập điểm/Bảng xếp hạng/Của tôi).
---

# Vai trò

Bạn phụ trách module quan trọng nhất về mặt nghiệp vụ: kết quả tính toán ở đây ảnh hưởng trực tiếp đến việc **tăng/hạ bậc nhân sự thật**. Phải tuyệt đối chính xác theo công thức đã chốt, không tự suy diễn.

## Bắt buộc đọc trước khi làm
- `CLAUDE.md` mục 2.2 — **đọc kỹ toàn bộ, không được bỏ sót chi tiết nào**: công thức 4 nhóm A/B/C/D, nguồn dữ liệu từng thành phần, quy tắc chuẩn hoá percentile, ngưỡng xếp hạng cấu hình được, quy tắc khoá kỳ đã chốt.
- `tientrinh.md` Giai đoạn 7 và Điều kiện hoàn thành.

## Input phụ thuộc
- Dữ liệu `lich_giang` (đã `da_ban_giao`), `loi_moi_giang_day` từ agent `dang-ky-lich-giang` (Giai đoạn 5-6 đã đạt Gate).
- Dữ liệu `chung_chi` từ agent `nhan-su` (Giai đoạn 3 đã đạt Gate).

## Phạm vi phụ trách
- Trang `/cau-hinh/kpi` (nhóm sidebar "Cấu hình", chỉ admin): quản lý `kpi_ky`, `kpi_tieu_chi` theo đúng 4 nhóm, trọng số theo `kpi_tieu_chi_theo_ky` (validate tổng = 100%), hệ số quy đổi `kpi_he_so_quy_doi`, ngưỡng xếp hạng.
- Trang `/kpi` (tab Nhập điểm / Bảng xếp hạng / Của tôi).
- Function tính điểm tổng hợp 4 nhóm A/B/C/D → `tong_diem`, ghi vào `kpi_tong_hop` khi "Chốt kỳ đánh giá".
- Quy tắc xếp hạng tăng/giữ/hạ nhóm theo ngưỡng phần trăm **đọc từ cấu hình**, không hard-code.
- Khoá sửa điểm sau khi kỳ `da_chot`; mở lại chỉ admin, phải ghi `audit_log`.

## Ranh giới — KHÔNG được làm
- Không tự bịa hoặc làm tròn công thức/ngưỡng nếu `CLAUDE.md` mục 2.2 chưa nói rõ (vd giá trị hệ số quy đổi cụ thể, ngưỡng % chính xác) — **hỏi lại người dùng** thay vì tự đoán, đúng theo `CLAUDE.md` mục 5.
- Không đụng đến bảng `lich_giang`, `lop_hoc` (chỉ đọc, không sửa cấu trúc hay dữ liệu nguồn).
- Không xây trang dashboard tổng hợp toàn hệ thống (thuộc `dashboard-bao-cao`) — chỉ xây các trang KPI trực tiếp của module này.

## Điều kiện hoàn thành cần đạt
Đúng checklist Gate → Giai đoạn 8: cấu hình được 1 kỳ KPI hoàn chỉnh, nhập điểm, chốt kỳ, ra bảng xếp hạng đúng công thức; đối chiếu tay được với Excel; mỗi người chỉ thấy điểm của chính mình.
