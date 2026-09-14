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

## 3. Design System — "bàn làm việc kỹ thuật số nổi" (Soft UI + Neumorphism + Glassmorphism)

> **Rollout 3 đợt (2026-09-14)**: Đợt 1 — khung sườn dùng chung (`Sidebar`/`Header`/`(app)/layout.tsx`) + 3 primitive nền tảng (`Card`/`Button`/`Input`). Đợt 2 — rà toàn bộ trang/component đã build tới thời điểm này (Lớp học, Nhân sự, Cấu hình chương trình, trang auth) và các primitive còn lại (`Select`, `Tabs`, `Dialog`, `Sheet`, `Tooltip`, `DropdownMenu`, `EmptyState`, `StatCard`): thay mọi khối `rounded-md/lg/xl border` tự viết tay bằng bo góc lớn + `GLASS_SURFACE`/`GLASS_SURFACE_LIGHT`. Đợt 3 — quét nốt 2 hạng mục còn sót: (a) `strokeWidth={1.5}` cho **toàn bộ icon `lucide-react`** ở mọi trang/component desktop đã build (mobile — `MobileNav`/`SidebarNav` — **cố ý giữ nguyên mặc định**, vì đây là phần "giữ pattern cũ" đã chốt riêng); (b) checkbox — tạo component `Checkbox` dùng chung (`src/components/ui/checkbox.tsx`, dựa trên `@base-ui/react/checkbox`, vuông bo góc vừa `rounded-md` chứ không pill để vẫn nhận diện được là checkbox) thay thế **toàn bộ** `<input type="checkbox">` tay viết trong `class-form-fields.tsx`, `buoi-giang-dialog.tsx`, `bai-giang-dialog.tsx`, `upload-certificate-dialog.tsx`. Các module **chưa build** (Lịch giảng, KPI, Cấu hình KPI, Dashboard thật, Thông báo) sẽ tự áp dụng đúng chuẩn này khi agent phụ trách xây ở giai đoạn của họ — không cần rà lại. Đợt 4 (rà soát bổ sung, 2026-09-14) — người dùng phản hồi còn thiếu, phát hiện qua đọc lại code (không phải build mới): (a) **nhãn siêu dữ liệu chưa viết hoa/dãn chữ** như mục 3 yêu cầu — nhãn bộ lọc (`LopHocFilters`/`NhanSuFilters`), nhãn `StatCard`, tiêu đề cột `TableHead` trước đó chỉ dùng `text-xs text-muted-foreground` thường, nay đổi thành `text-[11px] font-medium tracking-[0.14em] uppercase`; (b) 5 icon `lucide-react` lọt lưới đợt 3 vì không có class kích cỡ đi kèm nên không khớp lệnh rà bằng tay: `Loader2Icon` (sonner loading toast), `CheckIcon` ×2 (dropdown-menu checkbox/radio indicator), `ChevronUpIcon`/`ChevronDownIcon` (select scroll button) — đã thêm `strokeWidth={1.5}`; (c) `DropdownMenuSubContent` còn `rounded-lg` lệch với `rounded-3xl` của menu chính — đã đồng bộ. Đợt 5 (2026-09-14), theo phản hồi trực tiếp trên bản deploy thật (`qldt-115.vercel.app`, không chỉ đọc code): (a) **lỗi font nghiêm trọng** — `@theme inline` trong `globals.css` có `--font-sans: var(--font-sans)` tự tham chiếu chính nó thay vì trỏ tới biến Geist Sans thật `--font-geist-sans` mà `next/font` sinh ra, khiến `font-sans`/`font-heading` không bao giờ áp dụng được font Geist trên toàn app (rơi về font mặc định trình duyệt) — đã sửa thành `--font-sans: var(--font-geist-sans)`; (b) dock/header thiếu hover feedback thật — trước đó chỉ dùng thuộc tính `title` (tooltip mặc định trình duyệt) — đã nối `TooltipProvider` vào `RootLayout` (`src/app/layout.tsx`) và đổi toàn bộ nút icon trong `Sidebar`/`Header` sang dùng component `Tooltip` (đã có sẵn từ Đợt 2 nhưng chưa từng được gắn dùng thật ở đâu); (c) `Header` bỏ dòng tên/email người dùng dưới nhãn thương hiệu (trùng lặp với `UserMenu` bên phải) — đổi bố cục thành icon `Siren` + tiêu đề đậm "Quản lý đào tạo" + nhãn phụ viết hoa dãn chữ "Trung tâm Cấp cứu 115".

> **Chốt 2026-09-14**, thay thế hoàn toàn phong cách cũ tham chiếu `maugiaodien.png` (dạng sidebar liệt kê + header/card nền đặc). Quyết định dựa trên 1 trang thử nghiệm thật (`src/app/thu-nghiem-giao-dien/page.tsx`, dùng dữ liệu nhân sự/lớp học thật, đã xoá sau khi duyệt) — người dùng xác nhận đạt yêu cầu bao gồm cả điểm rủi ro nhất (kính mờ trên bảng dữ liệu dày đặc), nên mục 3.1 cũ (giới hạn kính mờ chỉ cho lớp nổi tạm thời) **bị thay thế**, không còn hiệu lực. Bảng màu 6 tông ở mục 3 dưới đây **không đổi** — lần chốt lại này chỉ đổi chất liệu bề mặt/bố cục, không đổi mã màu.

Toàn bộ UI là 1 không gian 3D đa tầng lớp, nổi trên nền gradient trừu tượng mềm — kết hợp Bento Grid, bo góc cực lớn, thành phần dạng viên thuốc, và kính mờ:

- **Bố cục Bento 3 vùng dọc** (`(app)/layout.tsx`, chỉ áp dụng từ `md` trở lên — xem mục 3.2 cho mobile):
  - **Dock công cụ nổi bên trái** (`Sidebar` — `src/components/layout/sidebar.tsx`): dải icon dọc dạng viên thuốc/tròn, **icon-only kèm tooltip** (`title`), không còn nhãn chữ thường trực như sidebar liệt kê cũ. Lấy dữ liệu từ `nav-config.ts` như trước (không tự thêm mục ngoài cấu trúc đó).
  - **Lưới nội dung chính ở giữa**: bố cục Bento — nhiều khối/card kích thước khác nhau xếp theo lưới, khoảng trắng lớn giữa các khối, mỗi khối là 1 mặt kính mờ độc lập (không phải 1 khối lớn duy nhất).
  - **Panel chi tiết dạng thẻ bên phải**: dùng cho trang có 1 đối tượng "đang chọn" cần xem nhanh (hồ sơ, chi tiết) — tuỳ chọn theo từng trang, không bắt buộc mọi trang phải có.
  - `Header` (`src/components/layout/header.tsx`) là 1 thanh kính mờ bo tròn hoàn toàn nằm ngang đầu vùng giữa — giữ icon lịch, trợ giúp, chuông thông báo, avatar góc phải như trước.
  - Giảng viên/trợ giảng tự đăng ký dạy một lớp bằng **nút hành động ngay trong danh sách/chi tiết lớp học**, không cần trang đăng ký riêng (không đổi so với trước).
- **Hình khối & cấu trúc**: bo góc **tối thiểu 24px** cho mọi khung/thẻ (`rounded-4xl` = 26px là mặc định cho `Card`) — không còn góc vuông cứng ở bất kỳ khối nội dung nào. `Button`, `Badge`, `Input` dạng **viên thuốc** (`rounded-full`) trừ trường hợp đặc biệt (nút trong `ButtonGroup` ghép liền nhau giữ góc vừa phải để trông liền khối).
- **Bề mặt kính mờ (xem chi tiết công thức ở mục 3.1)** — áp dụng cho MỌI khối nội dung, kể cả bảng dữ liệu dày đặc (Nhân sự, Lớp học, KPI...) — khác hẳn quyết định cũ 2026-09-09.
- **Nền gradient trừu tượng mềm** (`--app-gradient` trong `globals.css`, dùng qua utility `app-gradient-bg`): không dùng ảnh phong cảnh thật, gradient nhẹ từ màu chủ đạo `#2973B2`. Chỉ hiện ở `md` trở lên, phía sau dock/header/nội dung.
- **Sắc độ & ánh sáng**: mỗi khối kính mờ có viền sáng mỏng phía trên (`inset 0 1px 0 rgba(255,255,255,.7)`) kết hợp bóng đổ lan toả mềm phía dưới (`shadow` âm offset lớn, blur rộng, dùng màu chủ đạo pha loãng) — công thức chuẩn đặt ở `GLASS_SURFACE`/`GLASS_SURFACE_LIGHT` (`src/lib/design/glass.ts`), không tự sáng tạo giá trị riêng.
- **Duyệt/thao tác nhanh dùng master-detail + drawer**: các danh sách có thao tác lặp lại nhiều (đăng ký chờ duyệt, lời mời giảng dạy) dùng pattern list + panel bên phải (component `Sheet` của shadcn/ui) để xử lý ngay tại chỗ, không điều hướng sang trang khác. Các hành động đơn giản (duyệt/từ chối, đánh dấu đã đọc, đổi trạng thái buổi giảng) đặt dưới dạng **nút hành động inline ngay trong dòng bảng**; chỉ mở drawer/trang chi tiết khi cần xem đầy đủ thông tin trước khi quyết định.
- **Trang chủ theo vai trò**: `/dashboard` hiển thị nội dung khác nhau theo vai trò đăng nhập — admin/quản lý thấy số liệu vận hành (lớp thiếu nhân sự, đăng ký chờ duyệt...) trước tiên; giảng viên/trợ giảng thấy lịch giảng sắp tới + điểm KPI cá nhân trước tiên, rồi mới đến các thẻ số liệu chung.
- **Kiểu chữ**: sans-serif hình học hiện đại (giữ font Geist hiện có — đã đủ "hình học/hiện đại", không cần đổi font), tiêu đề in đậm vừa phải (`font-semibold`, không dùng `font-bold`/`font-black`), nội dung chữ nhỏ gọn (`text-sm`/`text-xs`), nhãn siêu dữ liệu viết hoa dãn chữ rộng (`text-[11px] uppercase tracking-[0.14em]` trở lên, xem `StatPill`/`header.tsx`).
- **Icon**: hệ thống nét mảnh tối giản — mọi icon `lucide-react` dùng `strokeWidth={1.5}` (mặc định của thư viện là 2, phải set tường minh), không dùng icon dạng khối tô đặc. Đã áp dụng ở dock/header; các trang module áp dụng dần khi được rà soát lại (chưa rà soát hết toàn app trong đợt này).
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

### 3.1. Hiệu ứng kính mờ (glassmorphism) — ÁP DỤNG TOÀN APP (chốt lại 2026-09-14)

> Thay thế hoàn toàn quyết định 2026-09-09 (kính mờ chỉ cho lớp nổi tạm thời). Lý do đảo ngược: người dùng yêu cầu đổi hẳn phong cách UI, đã tự kiểm chứng qua trang thử nghiệm thật (dữ liệu nhân sự thật trên nền kính mờ) và xác nhận đạt — kể cả đúng rủi ro mà quyết định cũ lo ngại (tương phản trên bảng dữ liệu dày đặc). 2 lý do kỹ thuật cũ (tương phản, hiệu năng GPU) **không còn là lý do chặn** nhưng vẫn là rủi ro cần để ý khi build từng trang — xem cách giảm nhẹ bên dưới.

**Áp dụng kính mờ cho mọi khối nội dung** — Card, dock, header, stat card, khối bảng dữ liệu, panel chi tiết... Không còn phân biệt "lớp nổi tạm thời" vs "nội dung chính" như trước.

**2 công thức chuẩn** (`src/lib/design/glass.ts`, không tự sáng tạo giá trị riêng):
- `GLASS_SURFACE` — dùng cho khối lớn, số lượng ít trên 1 màn hình (Card, dock, header, panel): nền trắng/đen ~55-60% opacity (light) / ~6% (dark) + `backdrop-blur-2xl` (khoảng 24px) + viền trắng/đen ~10-50% opacity + `shadow` kép (inset viền sáng trên + bóng đổ lan toả mềm dùng màu chủ đạo pha loãng).
- `GLASS_SURFACE_LIGHT` — dùng cho khối lặp lại nhiều lần trên 1 màn hình (hàng trong bảng, chip, card nhỏ trong lưới) hoặc khối bao lớn ít cần độ sâu: giảm xuống `backdrop-blur-md` (~12px), giảm opacity/bóng đổ — để giảm gánh nặng GPU khi có nhiều phần tử cùng lúc (đúng lo ngại hiệu năng của quyết định cũ, chỉ là hạ mức thay vì cấm hẳn).
- Overlay phía sau `Dialog`/`Sheet`/`Drawer` và sticky header khi cuộn (`PageHeader`) giữ nguyên công thức nhẹ đã có từ trước (`backdrop-blur-md`, `bg-black/15` hoặc `bg-background/85`) — không cần nâng lên `GLASS_SURFACE` vì đây là lớp overlay/sticky, không phải khối nội dung.

**Giảm rủi ro tương phản/hiệu năng khi build từng trang** (bắt buộc, không tuỳ chọn):
1. Chữ/badge màu trong 1 khối kính mờ vẫn phải giữ đúng 6 tông đã kiểm chứng OKLCH/CVD — không tự làm nhạt màu thêm để "hợp" nền kính, vì test CVD đã tính trên nền đặc, làm nhạt thêm có thể tụt dưới ngưỡng đã kiểm chứng.
2. Trang có bảng dữ liệu rất dài (vd Nhân sự hàng trăm dòng) nên ưu tiên `GLASS_SURFACE_LIGHT` cho khối bao ngoài + để từng dòng bảng **không** lặp lại `backdrop-blur` riêng (chỉ khối cha mờ, dòng con trong suốt kế thừa) — tránh lặp `backdrop-filter` ở hàng trăm phần tử con cùng lúc.
3. Nếu 1 trang cụ thể sau khi build thực tế bị giật/mờ chữ trên mobile thật, được phép hạ khối đó xuống nền đặc như cũ (ngoại lệ cục bộ), miễn ghi rõ lý do bằng comment tại chỗ đó.

### 3.2. Responsive / Mobile-first — bắt buộc từ MỌI giai đoạn, không chỉ Giai đoạn 11

Trước đây responsive chỉ được xử lý gộp ở Giai đoạn 11. Từ 2026-09-09, mỗi giai đoạn (kể cả các giai đoạn module nghiệp vụ 3-9) phải tự đảm bảo **responsive cơ bản trên mobile** (≥375px) trước khi coi là đạt Gate của giai đoạn đó — Giai đoạn 11 chỉ còn là đợt rà soát toàn diện lần cuối, xử lý phần còn sót, không phải lần đầu tiên nghĩ đến mobile.

- **Dock/header kính mờ + nền gradient chỉ áp dụng từ `md` trở lên** (chốt 2026-09-14, cùng đợt đổi phong cách mục 3): dưới `md` không dùng dock/header/gradient — thay bằng 1 thanh header phẳng đơn giản (không kính mờ) + icon hamburger mở `Sheet`/`Drawer` (`MobileNav`), giữ đúng hành vi/markup đã có từ 2026-09-09, chỉ khác ở desktop.
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

Ưu tiên tra cứu theo thứ tự: (1) schema & Definition of Done trong `tientrinh.md`, (2) logic nghiệp vụ ở mục 2 của file này, (3) phong cách UI trong `maugiaodien.png`. Nếu vẫn không rõ (đặc biệt là ngưỡng KPI cụ thể, hoặc quy chế đánh giá thực tế của trung tâm) — **hỏi lại người dùng thay vì tự đoán**, vì đây là nghiệp vụ ảnh hưởng trực tiếp đến việc tăng/hạ bậc nhân sự thật.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
