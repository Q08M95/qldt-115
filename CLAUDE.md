# CLAUDE.md — Bộ não dự án QLĐT 115

> File này là **kim chỉ nam nghiệp vụ + kỹ thuật** cho toàn bộ dự án. Claude Code / Antigravity phải đọc và tuân theo file này khi sinh code ở bất kỳ giai đoạn nào trong [tientrinh.md](tientrinh.md).
> `tientrinh.md` trả lời câu hỏi **"làm gì, theo thứ tự nào"**. File này trả lời câu hỏi **"làm đúng nghĩa là gì, theo tiêu chuẩn nào"**.

---

## 1. Dự án này là gì

WebApp nội bộ cho **Trung tâm Cấp cứu 115 TP.HCM**, quản lý toàn bộ hoạt động đào tạo nhân sự y tế (giảng viên là bác sĩ, trợ giảng là điều dưỡng...). 4 trụ cột nghiệp vụ, không được thiếu cái nào:

1. **Quản lý chất lượng nhân sự** — hồ sơ, học vị/chức danh, chứng chỉ, trạng thái hoạt động.
2. **Đăng ký / đề xuất / chỉ định giảng dạy phù hợp** — giảng viên/trợ giảng tự đăng ký dạy, hoặc được hệ thống **đề xuất/chỉ định** vào đúng lớp/bài giảng phù hợp với chuyên môn của họ.
3. **Đánh giá chất lượng giảng dạy & KPI** — chấm điểm theo kỳ, dùng để **quyết định tăng/hạ bậc nhân sự cuối năm**.
4. **Theo dõi trực quan realtime** — dashboard biểu đồ/đồ thị cập nhật realtime, có khả năng **so sánh** (giữa các kỳ, giữa các nhân sự, giữa các lớp).

Vai trò: `admin`, `quan_ly_dao_tao`, `giang_vien`, `tro_giang` (chi tiết ma trận quyền xem [tientrinh.md](tientrinh.md) Giai đoạn 2).

---

## 2. Logic nghiệp vụ cốt lõi (phần dễ làm sai nhất)

### 2.1. Thế nào là "phù hợp" khi đề xuất/chỉ định giảng dạy

Khi hệ thống gợi ý hoặc admin chỉ định giảng viên/trợ giảng cho một lớp/bài giảng, độ phù hợp phải tính dựa trên các tiêu chí sau (theo thứ tự ưu tiên):

1. **Khớp chuyên môn**: `profiles.chuyen_mon` / `hoc_vi` của người đó phải liên quan đến `bai_giang.chuyen_de` của bài giảng.
2. **Không trùng lịch**: người đó không có `lich_giang` nào khác cùng khung giờ (`ngay_gio` + `buoi`) đã ở trạng thái `da_xac_nhan` trở lên.
3. **Cân bằng tải giảng dạy**: ưu tiên người có tổng số tiết dạy trong kỳ hiện tại thấp hơn (tránh dồn việc cho một vài người), tính từ `lich_giang` đã `da_ban_giao`.
4. **Ưu tiên theo KPI**: nếu nhiều người cùng đủ điều kiện, ưu tiên người có `kpi_tong_hop.tong_diem` kỳ gần nhất cao hơn.
5. **Trạng thái hoạt động**: chỉ đề xuất người có `trang_thai_hoat_dong = true`.

Đây là logic dùng chung cho cả 2 luồng: (a) trợ lý gợi ý khi admin tạo lịch giảng, (b) validate khi giảng viên tự đăng ký (không chặn tự đăng ký, nhưng cảnh báo nếu trùng lịch hoặc không khớp chuyên môn).

### 2.2. Tiêu chí KPI → tăng/hạ bậc (đã chốt với đơn vị)

KPI tính theo kỳ (`kpi_ky`), gồm **4 nhóm tiêu chí cố định**. Trọng số dưới đây là mặc định — trọng số dùng để tính thật sự luôn đọc từ `kpi_tieu_chi_theo_ky` (cấu hình được theo từng kỳ, không hard-code trong code).

**Nhóm A — Khối lượng công việc & Cống hiến (40%)**
- Số tiết giảng dạy/trợ giảng thực tế, **quy đổi theo hệ số tính chất lớp**: lớp không kinh phí, lớp đột xuất, lớp cộng đồng đều cộng thêm hệ số (đọc từ `kpi_he_so_quy_doi`, cấu hình theo kỳ) để khuyến khích cống hiến — tính từ `lich_giang` đã `da_ban_giao`, nhân hệ số theo cờ `lop_hoc.co_kinh_phi / la_lop_gap / la_lop_cong_dong`.
- Mức độ sẵn sàng = tỷ lệ `chap_nhan` trên tổng số lời mời trong `loi_moi_giang_day` (đo được cả khi từ chối, không chỉ đếm số lớp đã dạy).
- Cả 2 thành phần chuẩn hoá theo percentile trong kỳ trước khi gộp, để công bằng giữa các kỳ có tổng khối lượng công việc chung khác nhau.

**Nhóm B — Chất lượng giảng dạy & Phản hồi (30%)**
- Điểm khảo sát ý kiến học viên trung bình trong kỳ (`khao_sat_hoc_vien`, ẩn danh).
- Tỷ lệ hoàn thành đúng hạn = 1 − (số buổi huỷ phút chót / tổng số buổi được phân công); "phút chót" = huỷ trong khoảng thời gian cấu hình được trước giờ dạy, so `lich_giang.thoi_diem_huy` với `ngay_gio`.
- Điểm nhận xét định tính, tách riêng **quản lý chấm** và **đồng nghiệp chấm** (`danh_gia_kpi.loai_nguoi_danh_gia`), lấy trung bình nếu nhiều người cùng đánh giá.

**Nhóm C — Năng lực chuyên môn & Cập nhật học thuật (20%)**
- Điểm hiệu lực chứng chỉ bắt buộc (`chung_chi.bat_buoc = true`): điểm tối đa nếu còn hạn và mới cập nhật; **có hệ số suy giảm** theo số năm kể từ `ngay_cap` nếu quá ngưỡng cấu hình mà chưa renew; 0 điểm nếu `ngay_het_han` đã qua.
- Điểm hoạt động học thuật (`hoat_dong_hoc_thuat`): biên soạn học liệu, nghiên cứu, báo cáo khoa học — quy đổi điểm theo loại, có trần điểm tối đa/kỳ để một hoạt động đơn lẻ không kéo lệch cả nhóm.

**Nhóm D — Ý thức tổ chức & Phát triển nhân sự (10%)**
- Vai trò mentor: điểm theo số quan hệ `mentor_mentee` đã `hoan_thanh` trong kỳ.
- Tham gia hoạt động chung (`hoat_dong_chung`): điểm theo số hoạt động tham gia trong kỳ.
- Chấp hành nội quy (`ky_luat_khen_thuong`): điểm khởi đầu ở mức tối đa, cộng/trừ theo `diem_anh_huong` của từng lần ghi nhận vi phạm/khen thưởng.

**Công thức tổng**: `tong_diem = Σ(diem_nhom × trong_so_nhom)` theo 4 nhóm trên. Điểm từng nhóm (`diem_nhom_a/b/c/d`) phải lưu riêng trong `kpi_tong_hop`, không chỉ lưu tổng — để tra được nhân sự yếu ở nhóm nào.

Xếp hạng cuối kỳ dùng ngưỡng phần trăm cấu hình được (mặc định đề xuất: top 20% → `tang_nhom`, bottom 20% → `ha_nhom`, còn lại → `giu_nguyen`) — **không hard-code con số 20%**, phải đọc từ cấu hình.

Một khi kỳ đã `da_chot`, điểm và xếp hạng không được sửa trực tiếp qua UI thường; chỉ admin mở lại được, và hành động mở lại phải ghi vào `audit_log`.

### 2.3. Nguyên tắc dữ liệu realtime & so sánh trực quan

- Dashboard và các trang thống kê phải dùng **Supabase Realtime subscription**, không polling bằng `setInterval`.
- Mọi biểu đồ so sánh (giữa kỳ, giữa người, giữa lớp) phải cho phép chọn kỳ/đối tượng để so sánh qua bộ lọc, không hard-code kỳ hiện tại.
- Số liệu trên dashboard phải luôn tính trực tiếp từ bảng gốc qua Supabase (view hoặc RPC function), **không lưu số liệu tổng hợp trùng lặp** trừ `kpi_tong_hop` (bảng này được phép lưu sẵn vì là kết quả đã chốt kỳ).

---

## 3. Design System — Flat SaaS UI hiện đại

> **Chốt lại toàn bộ 2026-09-15**, thay thế HOÀN TOÀN phong cách "bàn làm việc kỹ thuật số nổi" (Soft UI + Neumorphism + Glassmorphism, chốt 2026-09-14) sau khi người dùng phản hồi trực tiếp trên bản deploy thật: kính mờ áp dụng cho mọi khối khiến toàn bộ giao diện cùng 1 tầng thị giác, không phân cấp được, khó nhìn. Tham chiếu mới: `mauthietke.png` (đã đưa vào thư mục gốc dự án, thay cho `maugiaodien.png` cũ — file cũ đã xoá). Đây là thay đổi **không có ngoại lệ**: áp dụng cho cả mobile lẫn mọi overlay (Dialog/Sheet/Tooltip/DropdownMenu), không còn khái niệm "kính mờ hợp lệ cho lớp nổi tạm thời" như quyết định 2026-09-14 mục 3.1 cũ. Bảng màu 6 tông **không đổi** — chỉ đổi chất liệu bề mặt/bố cục.
>
> Lịch sử rút gọn các đợt trước (2026-09-14, đã hết hiệu lực về mặt bề mặt nhưng các quyết định nghiệp vụ/hành vi vẫn giữ nguyên): Đợt 1-3 dựng khung sườn kính mờ ban đầu + chuẩn hoá `strokeWidth={1.5}` cho icon + tạo `Checkbox` dùng chung thay input mặc định trình duyệt (2 việc này vẫn giữ nguyên, không bị ảnh hưởng bởi đổi bề mặt). Đợt 4-5 chỉnh nhãn/tooltip/header (phần lớn bị ghi đè bởi đợt chốt lại này).

Giao diện là 1 khung "cửa sổ app" hợp nhất (sidebar đặc + vùng nội dung đặc, chung 1 khối bo góc/viền/shadow duy nhất) — không còn nhiều mảnh kính mờ nổi rời nhau, không dùng backdrop-blur cho nội dung thường trực:

- **Khung cửa sổ hợp nhất** (`(app)/layout.tsx`, áp dụng đồng bộ cả desktop lẫn mobile — xem mục 3.2):
  - **Sidebar** (`src/components/layout/sidebar.tsx`): thanh đặc màu navy tối **cố định, không đổi theo light/dark mode** (brand chrome luôn tối, giống `mauthietke.png`), gắn liền mép trái, full-height, icon-only kèm `Tooltip` thật (không dùng `title` mặc định trình duyệt). Active item = chip nền sáng mờ (`bg-sidebar-accent`). Lấy dữ liệu từ `nav-config.ts` như trước.
  - **Vùng nội dung**: nền đặc màu sáng (`bg-card`), không backdrop-blur. Card con có thể tint màu nhẹ theo ngữ cảnh (vd khối "Thông tin lớp" tint theo màu vai trò "Lớp học") — dùng đúng 6 tông đã kiểm chứng, không tự bịa màu mới, không bắt buộc mọi card phải tint.
  - `Header` (`src/components/layout/header.tsx`) giờ là 1 hàng công cụ **nằm bên trong** khung cửa sổ (không còn là pill nổi riêng), chỉ có `border-b` phân cách — giữ icon lịch, trợ giúp, chuông thông báo, avatar góc phải, đều có `Tooltip`.
  - Giảng viên/trợ giảng tự đăng ký dạy một lớp bằng nút hành động ngay trong danh sách/chi tiết lớp học (không đổi).
- **Hình khối & cấu trúc**: bo góc **vừa phải** — `rounded-2xl` (~18px) cho `Card`/panel/dialog, `rounded-[24px]` cho khung cửa sổ ngoài cùng, `rounded-xl`/`rounded-lg` cho phần tử nhỏ (menu, input, textarea). **Không còn yêu cầu ≥24px cho mọi khối** như trước. `Button`, `Badge`, `Tabs` vẫn dạng **viên thuốc** (`rounded-full`) — phần này giữ nguyên vì đã khớp `mauthietke.png`.
- **Bề mặt — nền đặc, KHÔNG dùng kính mờ** (xem chi tiết mục 3.1) — áp dụng cho MỌI khối, không có ngoại lệ.
- **Nền gradient trừu tượng mềm** (`--app-gradient` trong `globals.css`): giữ nguyên công thức, nhưng giờ chỉ làm nền viền ngoài quanh khung cửa sổ hợp nhất (không còn đứng sau nhiều mảnh kính riêng lẻ). Chỉ hiện ở `md` trở lên.
- **Duyệt/thao tác nhanh dùng master-detail + drawer**: giữ nguyên pattern list + panel bên phải (`Sheet`) cho thao tác lặp lại nhiều, nút hành động inline trong dòng bảng cho thao tác đơn giản.
- **Trang chủ theo vai trò**: giữ nguyên — `/dashboard` khác nhau theo vai trò đăng nhập.
- **Kiểu chữ**: sans-serif hình học hiện đại (font Geist — `--font-sans` phải trỏ đúng `--font-geist-sans`, xem lỗi đã sửa ở lịch sử đợt 5), tiêu đề in đậm vừa phải (`font-semibold`), nội dung chữ nhỏ gọn (`text-sm`/`text-xs`). **Nhãn dữ liệu dùng chữ thường xám nhỏ** (`text-xs text-muted-foreground`) — **KHÔNG viết hoa/dãn chữ** như quyết định 2026-09-14 cũ (đảo ngược có chủ đích, theo đúng `mauthietke.png`).
- **Icon**: giữ nguyên — mọi icon `lucide-react` dùng `strokeWidth={1.5}`, không dùng icon dạng khối tô đặc. Áp dụng toàn app kể cả mobile (`MobileNav`/`SidebarNav`).
- **Bảng màu chính thức** — màu chủ đạo `#2973B2` (xanh dương). 6 tông còn lại được thiết kế hài hoà với màu chủ đạo và **đã kiểm chứng bằng OKLCH/OKLab** (đủ độ sáng, đủ độ bão hoà để không "xám hoá", đủ tách biệt dưới mô phỏng mù màu đỏ-lục/protanopia-deuteranopia, đủ tương phản với nền sáng/tối) — **không tự ý đổi các mã màu dưới đây khi sinh code**; nếu cần thêm màu mới, phải kiểm tra lại theo đúng phương pháp này (xem skill `dataviz` nếu cần chạy lại) trước khi chốt:

  | Vai trò dữ liệu | Tông màu | Light mode | Dark mode |
  |---|---|---|---|
  | Giảng viên | Tím | `#6C2C8F` | `#AE73D2` |
  | Trợ giảng | Hồng | `#B8415A` | `#B8415A` |
  | Lớp học (= màu chủ đạo) | Xanh dương | `#2973B2` | `#2973B2` |
  | Đăng ký chờ duyệt | Cyan | `#1AA7A0` | `#1AA7A0` |
  | Cảnh báo / thiếu nhân sự | Cam | `#D9711F` | `#D9711F` |
  | KPI | Xanh lá | `#0A6B2A` | `#08722E` |

  Hai cặp màu (cyan trên nền sáng; xanh lá cạnh hồng dưới mô phỏng mù màu đỏ-lục) rơi vào ngưỡng "chấp nhận được nhưng bắt buộc có kênh phụ" — hợp lệ vì stat card và biểu đồ trong hệ thống **luôn hiển thị nhãn/số liệu kèm màu**, không bao giờ dùng màu làm kênh thông tin duy nhất.
- **Thẻ số liệu (stat card)**: mỗi loại số liệu dùng đúng 1 màu ở bảng trên, nhất quán xuyên suốt app. Icon đặt góc trên phải thẻ, số liệu lớn nổi bật bên dưới nhãn.
- **Biểu đồ**: dùng `recharts`, tô màu theo đúng bảng trên khi biểu diễn theo vai trò dữ liệu (categorical). Biểu đồ thể hiện **độ lớn/mật độ** (sequential, vd mật độ lịch giảng theo ngày) dùng 1 dải từ nhạt đến đậm của màu chủ đạo `#2973B2`. Biểu đồ **so sánh tăng/giảm quanh 1 mốc** (diverging, vd xu hướng điểm KPI tăng/giảm giữa các kỳ) dùng cặp `#2973B2` (tăng) ↔ `#D9711F` (giảm) với điểm giữa trung tính màu xám. **Không bắt buộc theo đúng 3 kiểu (line/bar/donut) như ảnh mẫu** — chọn loại biểu đồ phù hợp với bản chất dữ liệu cần thể hiện (xu hướng theo thời gian, so sánh giữa nhóm, phân bổ tỷ lệ, phân phối điểm số, tương quan...). Luôn có trục/chú thích rõ ràng, cho phép lọc để so sánh khi cần (giữa các kỳ, giữa các nhân sự, giữa các lớp), và có nhãn trực tiếp hoặc chú giải cho mỗi màu — không dùng màu làm kênh phân biệt duy nhất.
- **Ngôn ngữ hiển thị**: toàn bộ label, tiêu đề, trạng thái hiển thị cho người dùng bằng **Tiếng Việt có dấu**. Component/biến/hàm trong code viết bằng tiếng Anh.
- **Trạng thái rỗng**: khi chưa có dữ liệu (vd "Điểm KPI trung bình: Chưa có dữ liệu" như trong ảnh mẫu), luôn hiển thị placeholder rõ ràng, không để trống hoặc hiện lỗi.
- **Component**: dùng shadcn/ui làm nền (bao gồm `Sheet`/`Drawer` cho pattern duyệt nhanh, `Breadcrumb` cho ngữ cảnh trang, `Tabs` cho các trang gộp nhiều view), không tự tạo lại các component cơ bản (button, table, card, dialog...) đã có sẵn.
- **Đại diện nhân sự**: không dùng ảnh đại diện tải lên — mọi nơi cần thể hiện 1 người (header, danh sách nhân sự, trang chi tiết...) dùng chung component `PersonAvatar` (huy hiệu chữ cái đầu họ tên, tô nền theo đúng màu vai trò ở bảng trên: giảng viên tím, trợ giảng hồng, admin/quản lý đào tạo xanh dương) kèm hiển thị đầy đủ họ tên bên cạnh — không tự bịa màu ngẫu nhiên theo hash tên vì sẽ phá vỡ bảng màu đã kiểm chứng CVD.

### 3.1. Bề mặt — nền đặc (Flat SaaS UI), KHÔNG dùng kính mờ (chốt lại 2026-09-15)

> Thay thế hoàn toàn mục 3.1 cũ (glassmorphism áp dụng toàn app, 2026-09-14). Không còn khái niệm ngoại lệ — kể cả overlay tạm thời (Dialog/Sheet/Tooltip/DropdownMenu) cũng chuyển sang nền đặc theo yêu cầu người dùng, không còn được coi là "hợp lệ dùng backdrop-blur" như trước.

**Không dùng `backdrop-blur` ở bất kỳ đâu trong app** — kể cả overlay/scrim. 2 công thức chuẩn (`src/lib/design/surface.ts`, không tự sáng tạo giá trị riêng):
- `SURFACE_CARD` — `border border-border bg-card shadow-sm`, dùng cho `Card`/panel chính.
- `SURFACE_MUTED` — `border border-border bg-muted/60`, dùng cho khối bao bảng dữ liệu/panel phụ.
- Overlay phía sau `Dialog`/`Sheet` dùng `bg-black/40` đặc (không blur) — chỉ là lớp che nền chuẩn, không phải hiệu ứng thị giác cần giữ.
- `TooltipContent`/`DropdownMenuContent` dùng nền đặc 100% (`bg-foreground`, `bg-popover`), không còn opacity phân số.

**Card con tint màu theo ngữ cảnh** (không bắt buộc mọi nơi): khi 1 khối gắn với 1 vai trò dữ liệu cụ thể (vd khối "Thông tin lớp" = vai trò "Lớp học"), có thể tint nhẹ bằng đúng màu vai trò đó ở mức opacity thấp (vd `bg-data-lop-hoc/6 border-data-lop-hoc/20`) — không tự bịa màu mới, không tint tràn lan làm mất tác dụng phân biệt.

**Chữ/badge màu vẫn phải giữ đúng 6 tông đã kiểm chứng OKLCH/CVD** — không tự làm nhạt màu thêm.

### 3.2. Responsive / Mobile-first — đồng bộ hoàn toàn với desktop (chốt lại 2026-09-15)

> Thay thế mục 3.2 cũ (2026-09-14): trước đó mobile được coi là "ngoại lệ giữ pattern cũ" khi đổi sang kính mờ. Từ đợt chốt lại này, **không còn ngoại lệ** — mobile dùng chung 1 bộ token màu/bo góc/chất liệu với desktop, chỉ khác ở bố cục (không có sidebar cố định, dùng `Sheet` làm Drawer).

- **`MobileNav`/`SidebarNav` dùng chung bảng màu navy với `Sidebar` desktop** (biến `--sidebar`/`--sidebar-foreground`/`--sidebar-accent` trong `globals.css`) — Drawer mở ra là 1 panel nền navy đặc, không blur, giống hệt chất liệu sidebar desktop.
- **Thanh header phẳng trên mobile** (`(app)/layout.tsx` phần `md:hidden`) dùng `bg-card`/`border-border` như phần còn lại của app, không còn là "thanh riêng không theo token".
- **Sidebar/khung cửa sổ hợp nhất chỉ hiện từ `md` trở lên** (mobile không có đủ chiều ngang cho sidebar cố định) — dưới `md` vẫn dùng top bar + `Sheet` Drawer, chỉ khác desktop ở bố cục, không khác ở chất liệu/màu sắc.
- **Bảng dữ liệu dài trên mobile**: ưu tiên cân nhắc dạng danh sách/card dọc thay vì bắt cuộn ngang một bảng nhiều cột, tuỳ theo số cột thực tế của từng trang (không bắt buộc cứng nếu bảng ít cột vẫn đọc được).
- **Cách người dùng xem trước giao diện mobile** (vì môi trường chạy Claude Code hiện tại không có trình duyệt thật để tự chụp responsive): dùng Chrome DevTools (phím tắt `Ctrl+Shift+M` — Toggle device toolbar) khi chạy `npm run dev`, hoặc mở thẳng URL đã deploy (`qldt-115.vercel.app`) bằng điện thoại thật — đây là cách đáng tin cậy nhất để đối chiếu.

---

## 4. Quy ước kỹ thuật bắt buộc

- **Stack**: Next.js (App Router, TypeScript strict) + Supabase (Postgres/Auth/Storage/Realtime) + Tailwind + shadcn/ui + recharts. Deploy qua Vercel, source qua GitHub.
- **Database**: schema là **nguồn chân lý duy nhất**, lấy nguyên văn từ [tientrinh.md](tientrinh.md) Giai đoạn 1. Tên bảng/cột giữ tiếng Việt không dấu, `snake_case`, đúng như đã định nghĩa — không tự đổi tên khi sinh code.
- **RLS là bắt buộc trên mọi bảng**, không có ngoại lệ "tạm thời tắt để test cho nhanh". Không xử lý phân quyền chỉ ở tầng frontend.
- **Không đưa `SUPABASE_SERVICE_ROLE_KEY` vào bất kỳ biến `NEXT_PUBLIC_*` hoặc code chạy ở client.** Chỉ dùng trong Server Action/Route Handler khi thật sự cần bypass RLS (vd job hệ thống), và phải ghi rõ lý do bằng comment.
- **Nghiệp vụ nhiều bước phải nhất quán dữ liệu** (vd duyệt đăng ký → sinh lịch giảng): dùng Postgres function/transaction hoặc Supabase Edge Function, không tách thành nhiều lệnh rời ở client.
- **Lớp học phải độc lập với chương trình mẫu**: khi tạo lớp mới từ `chuong_trinh_dao_tao`, hệ thống **copy** dữ liệu từ `chuong_trinh_mau_bai_giang` thành các dòng `bai_giang` riêng của lớp đó (không tham chiếu sống đến template). Nhờ vậy mỗi lớp tự do có số buổi/nội dung bài giảng khác nhau mà không ảnh hưởng chương trình mẫu hay các lớp khác đã mở trước đó.
- **`lop_hoc`/`buoi_giang`/`bai_giang` chứa cờ mở đăng ký + người chỉ định trực tiếp, nhưng KHÔNG chứa luồng đăng ký/duyệt tự nguyện** (chốt lại 2026-09-10, đảo ngược 1 phần quyết định cùng ngày trước đó theo yêu cầu người dùng — xem tientrinh.md Giai đoạn 4 mục 8): cả 3 bảng đều có `mo_dang_ky` (bool) + `giang_vien_chi_dinh_id`/`tro_giang_chi_dinh_id` — dùng khi admin/quản lý **gán trực tiếp, không qua duyệt**. Việc **tự nguyện đăng ký → chờ duyệt** vẫn phải đi qua `dang_ky_giang_day`, và **lịch giảng chính thức đã xác nhận** vẫn qua `lich_giang` — 2 bảng này thuộc đúng Giai đoạn 5-6, không được thay thế bằng 2 trường chỉ định nói trên. Nói cách khác: "chỉ định" (assignment trực tiếp) và "đăng ký/duyệt" (workflow có hàng chờ) là 2 cơ chế song song, không trộn lẫn.
- **Sắp xếp thứ tự bằng kéo-thả**: khi 1 danh sách có cột `thu_tu` cần người dùng tự sắp xếp lại (bài giảng, bài giảng mẫu...), không dùng ô nhập số thứ tự thủ công — dùng kéo-thả (`@dnd-kit`) và lưu lại qua **1 Postgres function cập nhật gộp** (set-based update theo mảng id đã sắp xếp), không tách thành N lệnh UPDATE rời ở client, theo đúng nguyên tắc "nghiệp vụ nhiều bước" ở trên. Bản ghi mới luôn thêm vào cuối danh sách (không cho chọn vị trí lúc tạo).
- **Không tự ý mở rộng/sửa schema** ngoài kế hoạch đã chốt ở Giai đoạn 1 của tientrinh.md khi đang làm các giai đoạn sau — nếu thấy thiếu, dừng lại và báo trước khi tự thêm cột/bảng. Ngoại lệ: nếu **chính người dùng** chủ động yêu cầu đổi schema đã chốt (không phải Claude tự phát hiện rồi tự sửa), được phép thực hiện — nhưng phải cập nhật lại `tientrinh.md` mục 1.2 ngay trong cùng lượt để bảng schema luôn phản ánh đúng DB thật, và rà soát ảnh hưởng dây chuyền sang các mục khác tham chiếu cột đó (đã xảy ra 1 lần: bỏ `lop_hoc.la_gio_hiem` kéo theo phải sửa cả mục 2.2 và `kpi_he_so_quy_doi` dù Giai đoạn 7 chưa xây).
- Code tiếng Anh chuẩn (biến, hàm, tên file, tên component), commit message ngắn gọn rõ ràng, mỗi Giai đoạn trong tientrinh.md làm trên 1 nhánh `feature/giai-doan-<so>-<ten>` riêng.

---

## 5. Khi Claude Code không chắc điều gì đó

Ưu tiên tra cứu theo thứ tự: (1) schema & Definition of Done trong `tientrinh.md`, (2) logic nghiệp vụ ở mục 2 của file này, (3) phong cách UI trong `mauthietke.png` (đã thay thế `maugiaodien.png` cũ, xem mục 3). Nếu vẫn không rõ (đặc biệt là ngưỡng KPI cụ thể, hoặc quy chế đánh giá thực tế của trung tâm) — **hỏi lại người dùng thay vì tự đoán**, vì đây là nghiệp vụ ảnh hưởng trực tiếp đến việc tăng/hạ bậc nhân sự thật.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
