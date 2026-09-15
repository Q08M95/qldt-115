# thietke-giao-dien.md — Đặc tả giao diện QLĐT 115

> File này là **nguồn chân lý duy nhất về giao diện** — vai trò tương tự `tientrinh.md` (roadmap nghiệp vụ) nhưng cho phần trình bày/UI. `CLAUDE.md` mục 3 chỉ còn giữ nguyên tắc + token ngắn gọn và trỏ sang đây để xem chi tiết từng trang/component.
>
> **Quy tắc cập nhật file này**: khi đổi 1 quyết định giao diện, **ghi đè trực tiếp vào mục tương ứng**, không thêm "lịch sử Đợt N" nối dài như cách làm cũ (đã khiến tài liệu trước đây rối, khó biết đâu là hiện trạng thật). Nếu cần lưu vì sao 1 quyết định được đổi, viết 1 dòng "Lý do đổi" ngắn ngay tại mục đó rồi xoá mô tả cũ, không giữ song song 2 bản.
>
> Mốc tham chiếu chính: `mauthietke.png` (ở gốc repo) — ảnh CRM tuyển dụng dạng Flat SaaS: sidebar đặc màu navy hẹp, khung nội dung đặc màu sáng, card tint pastel theo ngữ cảnh, tab 2 cấp (pill đậm cho điều hướng chính, underline cho điều hướng phụ), bố cục dày thông tin nhưng rõ phân cấp. **Ngoại lệ đã chốt, không áp theo ảnh**: ảnh mẫu có viền/margin/nền gradient mờ phía sau khung app (kiểu cửa sổ nổi) — app này **không** làm vậy, khung app chiếm trọn viewport, không viền/bo góc/gradient ngoài (đã người dùng xác nhận, xem mục "Khung ứng dụng" bên dưới).

---

## 1. Design tokens

**Màu** — bỏ ràng buộc "6 tông cố định + kiểm chứng OKLCH/CVD" của bản trước. Từ nay **màu lấy cảm hứng trực tiếp từ `mauthietke.png`**, được phép tinh chỉnh tự do trong lúc code cho khớp thị giác — bảng dưới đây là điểm xuất phát, không phải hằng số khoá cứng:

| Vai trò | Biến CSS | Gợi ý giá trị | Lấy cảm hứng từ đâu trong ảnh mẫu |
|---|---|---|---|
| Sidebar (cố định, không đổi theo mode) | `--sidebar` | `oklch(24% 0.05 255)` (navy đậm) | Thanh icon trái |
| Chủ đạo (nút hành động chính, link, tab phụ) | `--primary` | `#2973B2` | Nút xanh dương "Book a Demo"/"View All Jobs" |
| Card tint nổi bật (khối thông tin chính) | — | xanh dương rất nhạt (`primary/6-10%` trên nền trắng) | Khối "About Company" |
| Giảng viên | `--data-giang-vien` | tím/lavender (`#7C3AED` vùng) | Tag pastel "Meeting" |
| Trợ giảng | `--data-tro-giang` | hồng/rose (`#DB2777` vùng) | Tag pastel "Note" |
| Lớp học | `--data-lop-hoc` | xanh dương (trùng `--primary`) | — |
| Đăng ký chờ duyệt | `--data-dang-ky` | cam/vàng (`#D97706` vùng) | Tag pastel "Task" |
| Cảnh báo / quá hạn | `--data-canh-bao` | đỏ (`#DC2626` vùng) | Tag "Overdue" |
| KPI / trạng thái tốt | `--data-kpi` | xanh lá (`#16A34A` vùng) | Badge trạng thái "Open" |

Dark mode: dùng bản sáng/tươi hơn tương ứng mỗi màu, canh chỉnh trực tiếp bằng mắt lúc code — không cần công thức cố định trước.

Nền/chữ trung tính (`--background`, `--card`, `--muted`, `--border`...) giữ nguyên thang xám shadcn mặc định — không đổi.

**Bo góc**: thang `--radius` hiện có (`sm`/`md`/`lg`/`xl`/`2xl`) giữ nguyên giá trị. Quy ước dùng:
- Card/panel/dialog/sheet/menu con: `rounded-2xl` (~18px).
- Button/Badge/Tabs: `rounded-full` (viên thuốc).
- Khung app ngoài cùng (sidebar+nội dung): **không bo góc** (chiếm trọn viewport).

**Bề mặt** — 2 công thức chuẩn, `src/lib/design/surface.ts`, không tự bịa công thức khác:
```ts
export const SURFACE_CARD = "border border-border bg-card shadow-sm";   // card/panel chính
export const SURFACE_MUTED = "border border-border bg-muted/60";        // khối bao nội dung phụ/nhóm section
```
**Không dùng `backdrop-blur` ở bất kỳ đâu** — kể cả overlay Dialog/Sheet (dùng `bg-black/40` đặc).

**Card tint theo ngữ cảnh** (không bắt buộc mọi nơi — chỉ khi khối gắn với 1 vai trò dữ liệu cụ thể): `border-data-*/25 bg-data-*/12`.

**Chữ**: font Geist (`--font-sans` → `--font-geist-sans`). Tiêu đề `font-semibold`. Nhãn dữ liệu: `text-xs text-muted-foreground`, **chữ thường, không viết hoa/dãn chữ**. Nội dung: `text-sm`.

**Icon**: `lucide-react`, luôn `strokeWidth={1.5}`, không dùng icon khối tô đặc.

**Đại diện nhân sự**: không dùng ảnh tải lên — `PersonAvatar` (huy hiệu chữ cái đầu, tô theo màu vai trò ở bảng trên), luôn kèm họ tên đầy đủ bên cạnh.

---

## 2. Component inventory (`src/components/ui/`)

Nền headless: **Base UI** (`@base-ui/react`) cho mọi primitive có hành vi phức tạp (mở/đóng, focus trap, positioning) — không tự viết lại hành vi này bằng tay.

| Component | Base UI primitive | Ghi chú |
|---|---|---|
| `Button` | — (native) | variant: default/outline/secondary/ghost/destructive; size: default/sm/icon/icon-sm |
| `Card` | — | dùng `SURFACE_CARD`, `rounded-2xl` |
| `Badge` | — | pill, variant default/secondary/outline/destructive |
| `Dialog` | `Dialog` | form đầy đủ (thêm/sửa 1 entity), `rounded-2xl`, overlay `bg-black/40` |
| `Sheet` | `Dialog` (biến thể slide-in) | Form thêm/sửa trên mobile (full-height, xem mục 3.1), tab "Thêm" của bottom tab bar, panel duyệt nhanh |
| `Tabs` | `Tabs` | 2 biến thể: `default` (pill đậm `bg-foreground text-background` khi active — điều hướng chính trong 1 trang) và `line` (underline — điều hướng phụ trong 1 khối) |
| `Tooltip` | `Tooltip` | bắt buộc cho mọi icon-only button (sidebar, header) |
| `DropdownMenu` | `Menu` | nền đặc `bg-popover`, `rounded-xl` |
| `Select` | `Select` | |
| `Input`, `Label`, `Checkbox` | `Checkbox` cho Checkbox | |
| `Avatar` / `PersonAvatar` | — | xem mục 1 |
| `Table` | — | dùng cho danh sách phẳng ít cột (vd Chương trình đào tạo) |
| `Breadcrumb` | — | dùng trong `PageHeader` |
| `PageHeader` | — | breadcrumb (trái) + actions slot (phải), nằm ngay dưới header toolbar |
| `StatCard` | — | icon góc trên phải, số lớn nổi bật dưới nhãn — dự phòng cho Dashboard/KPI (Giai đoạn 9), chưa có trang dùng thật |
| `EmptyState` | — | title + description + **slot nút hành động tuỳ chọn** (CTA) — xem pattern "Empty state có hành động" ở mục 4 |
| `ScrollArea` | — | dùng cho cột Kanban tự cuộn riêng ở `/lop-hoc` |
| `GlobalSearch` | `Dialog` | hộp tìm kiếm toàn cục — mở từ icon tìm kiếm ở header (desktop) hoặc header mobile, tìm xuyên suốt Nhân sự + Lớp học, kết quả dẫn thẳng đến trang chi tiết tương ứng. Xem mục 3. |

---

## 3. Khung ứng dụng

- **Chiếm trọn viewport, không viền/bo góc/gradient ngoài** (`(app)/layout.tsx`): sidebar + nội dung áp sát mép trình duyệt. `--app-gradient` **chỉ** dùng ở nhóm trang auth (`/login`, `/register`, `/quen-mat-khau`, `/dat-lai-mat-khau`), không dùng ở khung app chính.
- **Sidebar** (desktop `md:` trở lên, `w-[72px]`, `bg-sidebar` navy cố định, full-height, flush trái): icon-only, mỗi icon kèm `Tooltip` (`side="right"`) hiện tên mục khi hover — không dùng `title` mặc định trình duyệt. Nhóm mục theo `nav-config.ts` (`NAV_GROUPS`, dữ liệu giữ nguyên, không đổi khi rewrite UI): Tổng quan riêng lẻ trên cùng, rồi nhóm Đào tạo/Nhân sự/Đánh giá/Cấu hình (Cấu hình chỉ admin/quản lý thấy). Active item = chip `bg-sidebar-accent`.
- **Header** (desktop, trong khung, không nổi riêng): hàng công cụ có `border-b` — **bên trái/giữa: ô/nút "Tìm kiếm..." mở `GlobalSearch`** (kèm gợi ý phím tắt, vd `Ctrl K`), tìm xuyên suốt Nhân sự + Lớp học từ bất kỳ trang nào (lấy cảm hứng từ thanh search lớn đầu `mauthietke.png`, nhưng gọn hơn vì đặt trong khung không phải hàng riêng); bên phải: icon lịch, trợ giúp, chuông thông báo, `UserMenu` (avatar) — mỗi icon có `Tooltip`.
- **`PageHeader`**: breadcrumb ngữ cảnh (vd "Lớp học / Tên lớp") + actions slot bên phải (nút hành động chính của trang) — đặt ngay đầu vùng nội dung cuộn được, dưới header toolbar.
- **Nội dung**: `bg-card`, không backdrop-blur, cuộn dọc độc lập (`overflow-y-auto`) trong khi sidebar/header đứng yên.

### 3.1. Mobile — thiết kế lại toàn bộ, không phải bản desktop thu nhỏ

Mobile không dùng lại sidebar/header desktop ẩn-hiện theo breakpoint như bản trước — đây là 1 bộ điều hướng/bố cục **riêng, sáng tạo dựa trên tinh thần mauthietke.png** (bảng màu, card tint, độ dày thông tin) nhưng theo pattern di động chuẩn:

- **Điều hướng chính = thanh tab cố định dưới cùng** (`bottom tab bar`, `bg-sidebar` navy để giữ vai trò "brand chrome" như sidebar desktop) — tối đa 5 icon+nhãn ngắn lấy từ `NAV_GROUPS`: Tổng quan, Đào tạo (gộp Lớp học + Lịch giảng), Nhân sự, Đánh giá, và Cấu hình nếu có quyền; nếu không đủ chỗ, gộp các mục ít ưu tiên vào 1 tab "Thêm" mở `Sheet` trượt từ dưới, nền sáng `bg-card` (không cần lặp lại navy vì tab bar đã đóng vai trò đó).
- **Header mobile**: chỉ còn tiêu đề trang (`PageHeader`) + icon tìm kiếm (mở `GlobalSearch` full-screen) + tối đa 1 icon hành động khác nếu cần — bỏ hẳn cụm icon lịch/trợ giúp/chuông (không đủ chỗ, không phải thao tác chính trên di động, vẫn còn ở desktop).
- **Nút tạo mới = FAB** (nút tròn nổi góc dưới phải) trên các trang danh sách có hành động tạo (Lớp học, Nhân sự — chỉ hiện khi đúng quyền) thay vì nút trong `PageHeader`.
- **`Dialog` → Sheet full-height trên mobile**: mọi form thêm/sửa hiện thành sheet trượt từ dưới lên, cao gần hết màn hình, thay vì hộp thoại thu nhỏ giữa màn hình — dễ thao tác 1 tay.
- **Master-detail** (mục 4) vẫn giữ nguyên tắc 1 cột/1 thời điểm, nhưng khối đầu trang chi tiết trên mobile rút gọn hơn desktop (ưu tiên avatar+tên+trạng thái+nút hành động chính, ẩn bớt meta phụ).
- **Kanban** (mục 4) giữ nguyên hướng chuyển thành `Tabs` ngang full-width đã có.

---

## 4. Pattern dùng chung (đặt tên để tái sử dụng nhất quán)

- **Master-detail 2/3–1/3**: 1 trang gồm cột trái 2/3 = chi tiết 1 đối tượng đang chọn, cột phải 1/3 = danh sách chung gọn (chỉ avatar/tên + 1-2 dòng meta, không phải `Table`). Chọn 1 dòng ở danh sách set query param (vd `?xem=<id>`) — không dùng client state, giữ URL chia sẻ được/nút Back hoạt động đúng. Mặc định tự chọn phần tử đầu danh sách khi chưa có `?xem=` (tránh cột chính trống lúc mới vào trang). Responsive: dưới `lg` chỉ hiện 1 cột tại 1 thời điểm bằng CSS thuần (`hidden lg:flex` có điều kiện), kèm link "Quay lại danh sách". Tìm kiếm tách thành 1 hàng riêng phía trên, không thuộc cột nào. Áp dụng: `/nhan-su`.
- **Canvas 1 trang cuộn dọc**: trang chi tiết 1 entity phức tạp dùng nhiều `<section>` (`SURFACE_MUTED`, `rounded-2xl`) xếp dọc thay vì `Tabs` — cho phép nhìn toàn cảnh khi cuộn, không phải bấm qua lại giữa các tab để thấy hết thông tin liên quan tới 1 lớp. Áp dụng: `/lop-hoc/[id]`.
- **Kanban theo trạng thái**: nhóm danh sách thành N cột cố định theo 1 trường trạng thái, mỗi cột tự cuộn riêng (`ScrollArea`, `max-h-[75vh]`) trên desktop; dưới `md` chuyển thành `Tabs` ngang, chỉ hiện 1 nhóm tại 1 thời điểm. Áp dụng: `/lop-hoc`.
- **QuickAdd + List kéo-thả**: thêm nhanh 1 dòng cuối danh sách bằng form inline (không mở `Dialog` cho thao tác đơn giản), sắp xếp lại bằng kéo-thả (`@dnd-kit`), lưu qua 1 lệnh cập nhật gộp. `Dialog` chỉ dùng khi cần sửa đầy đủ nhiều trường của 1 dòng. Áp dụng: Buổi giảng/Bài giảng trong `/lop-hoc/[id]`, Bài giảng mẫu trong `/cau-hinh/chuong-trinh/[id]`.
- **Tab 2 cấp**: cấp chính trong 1 trang (vd "Tổng quan"/"Chứng chỉ") dùng `Tabs` variant `default` (pill đậm khi active). Cấp phụ trong 1 khối nội dung (nếu phát sinh) dùng variant `line` (underline).
- **Card tint theo vai trò dữ liệu**: khối thông tin gắn với 1 vai trò cụ thể (vd "Tổng quan" của 1 giảng viên) tint theo đúng màu vai trò đó (mục 1); khối không gắn vai trò nào (vd "Chứng chỉ" — tài liệu, không phải người) dùng `SURFACE_MUTED` trung tính, không tự bịa màu.
- **Icon thay chữ khi đủ rõ nghĩa**: hành động phổ biến/chuẩn mực (sửa, xoá, quay lại, duyệt, từ chối, đóng, kéo-thả) ưu tiên hiển thị **icon-only kèm `Tooltip`**, không kèm chữ, cho gọn và hiện đại — **giữ chữ** khi hành động ít gặp/dễ hiểu lầm nếu chỉ nhìn icon (vd "Gửi lại email mời"), hoặc là hành động chính (primary CTA) cần rõ ràng cho người dùng không rành công nghệ (nhiều giảng viên/trợ giảng là bác sĩ/điều dưỡng, không phải dân IT).
- **Empty state có hành động**: phân biệt 2 tình huống, không dùng chung 1 kiểu CTA — (a) **rỗng vì chưa có dữ liệu gốc** (vd `/cau-hinh/chuong-trinh` chưa có chương trình nào): CTA là nút tạo mới ("Tạo chương trình đầu tiên"); (b) **rỗng vì bộ lọc/tìm kiếm không khớp** (vd `/nhan-su`, `/lop-hoc` sau khi lọc): CTA là "Xoá tìm kiếm/bộ lọc", không phải nút tạo mới (tạo mới không giải quyết đúng vấn đề "không tìm thấy").

---

## 5. Đặc tả từng trang

### 5.1. Nhóm Auth — `/login`, `/register`, `/quen-mat-khau`, `/dat-lai-mat-khau`

Nằm ngoài khung app (không sidebar/header). Bố cục giống nhau cả 4 trang: nền `app-gradient-bg` phủ toàn màn hình (`min-h-svh`, căn giữa), `Card` `max-w-sm` ở giữa gồm `CardHeader` (tiêu đề + mô tả ngắn) + `CardContent` (form dọc, `Label`+`Input` từng trường, `Button` submit full-width) + link phụ bên dưới (quên mật khẩu/đăng ký/quay lại đăng nhập tuỳ trang). Đây là nơi **duy nhất** dùng nền gradient.

### 5.2. `/dashboard`

Hiện vẫn là **khung placeholder** (nội dung thật thuộc Giai đoạn 9, chưa xây — không mở rộng nghiệp vụ ở đây). `PageHeader` "Tổng quan" + 1 dòng chào theo tên/vai trò người dùng, đặt trong `Card` đơn giản. Khi Giai đoạn 9 triển khai, `StatCard`/biểu đồ sẽ thêm vào đây theo vai trò đăng nhập, dùng `chart-card.tsx`/bảng màu ở mục 1.

### 5.3. `/nhan-su` (danh sách + xem nhanh)

Pattern **Master-detail 2/3–1/3** (mục 4). Từ trên xuống:
1. `PageHeader`: breadcrumb "Nhân sự", action "+ Thêm nhân sự" (chỉ admin).
2. Hàng tìm kiếm riêng (1 ô, debounce, icon `Search`) — 3 bộ lọc cũ (vai trò/trạng thái/nhóm) **không dùng nữa**, đã xác nhận không cần thiết.
3. Grid `lg:grid-cols-3`:
   - **Cột trái (2/3)**: khối đầu trang của người đang chọn — `PersonAvatar size="lg"` + tên (`text-xl font-semibold`) + `Badge` vai trò + `Badge` trạng thái hoạt động + dòng meta (chức danh · khoa/phòng, nếu có) + cụm icon hành động bên phải (chỉ canManage): icon khoá/mở hoạt động (đổi theo trạng thái hiện tại) + icon gửi lại email mời — cả 2 kèm `Tooltip` ghi rõ chữ, không hiện chữ mặc định (hành động quản trị, người dùng thường không thấy) + icon bút sửa (`Tooltip`: "Sửa hồ sơ") dẫn sang `/nhan-su/[id]`. Dưới đó: `Tabs` variant `default` — "Tổng quan" (card tint theo màu vai trò, `dl` 2 cột: học vị, chức danh, chuyên môn, khoa/phòng; email + nhóm phân loại chỉ canManage thấy) và "Chứng chỉ (N)" (`SURFACE_MUTED`, `CertificateList` chế độ read-only).
   - **Cột phải (1/3)**: danh sách gọn — mỗi dòng `PersonAvatar size="sm"` + tên + vai trò (+ nhóm phân loại nếu canManage) + `Badge` "Đã khoá" nếu có, bấm vào set `?xem=<id>`. Phân trang gọn (icon prev/next) nếu vượt `PAGE_SIZE`.
4. Mặc định tự chọn người đầu danh sách nếu chưa có `?xem=`.

### 5.4. `/nhan-su/[id]` (trang sửa đầy đủ)

Khối đầu trang giống mục 5.3 (avatar lg + tên + badge + meta). Bố cục 2 cột cố định (không phải master-detail, đây là trang sửa của **1** người, không có danh sách bên cạnh):
- **Trái (2/3)**: card tint theo vai trò chứa `ProfileForm` (sửa được đầy đủ trường, kể cả email/nhóm phân loại nếu canManage).
- **Phải (1/3)**: `CertificateList` chế độ chỉnh sửa được (`canEdit=true`) — thêm/xoá chứng chỉ qua Storage.

### 5.5. `/ho-so`

Tự sửa hồ sơ của chính mình — không có cột chứng chỉ, không hiện `role`/email selector. 1 `Card` đơn, `ProfileForm` (`showRole=false`), các trường: họ tên, học vị, chức danh, chuyên môn, khoa/phòng công tác.

### 5.6. `/lop-hoc` (danh sách)

Pattern **Kanban theo trạng thái** (mục 4), 3 nhóm cố định theo thứ tự **Đang diễn ra → Chưa mở → Hoàn thành**.
1. `PageHeader`: "Lớp học", action "+ Tạo lớp" (`QuickCreateClassDialog`, chỉ canManage).
2. Nếu canManage: `ChoDuyetPanel` (hộp thư chờ duyệt tổng hợp toàn bộ lớp) đặt trên cùng.
3. Bộ lọc: ô tìm theo tên + `Select` 1 giá trị "Loại lớp" (`LOAI_LOP_VALUES`).
4. Danh sách `ClassCard` (`SURFACE_CARD`, `rounded-2xl`) — mỗi thẻ: hàng tiêu đề (tên lớp + `Badge` trạng thái + `Badge` "Mở đăng ký" nếu có), hàng badge phụ (loại lớp/đối tượng/tính chất), các dòng icon+chữ (ngày khai giảng–kết thúc, chỉ tiêu GV/TG cần, người được chỉ định nếu có), nút CTA full-width cuối thẻ (nhãn đổi theo `mo_dang_ky`, đều dẫn vào trang chi tiết — nút đăng ký thật thuộc `/lop-hoc/[id]`).
5. Giảng viên/trợ giảng (self-service) chỉ thấy lớp đang mở đăng ký, không thấy `ChoDuyetPanel`.

### 5.7. `/lop-hoc/[id]` (chi tiết)

Pattern **Canvas 1 trang cuộn dọc** (mục 4). Từ trên xuống:
1. `PageHeader`: breadcrumb "Lớp học / Tên lớp", action = icon thùng rác (`Tooltip`: "Xoá lớp", canManage) — hành động phổ biến/dễ đoán nghĩa, không cần chữ.
2. Hàng tiêu đề: tên lớp (`text-xl font-semibold`) + `Badge` trạng thái.
3. Thông tin lớp: `LopInfoAutosaveForm` (canManage, tự lưu khi sửa — loại lớp, đối tượng, kinh phí/lớp gấp/lớp cộng đồng, ngày khai giảng–kết thúc, số GV/TG cần, mở đăng ký, nhóm phù hợp, chỉ định trực tiếp) hoặc `dl` read-only (người khác).
4. Section "Buổi giảng & Bài giảng" (`SURFACE_MUTED`, chỉ canManage): 2 khối con Buổi giảng và Bài giảng, mỗi khối = **QuickAdd + List kéo-thả** (mục 4).
5. Section "Đăng ký & Duyệt": `DangKyRosterBoard` — canManage thấy đủ hàng chờ duyệt, mỗi hàng có 2 icon hành động (check xanh = duyệt, X đỏ = từ chối, kèm `Tooltip`, không cần chữ — cặp icon này đã là quy ước phổ biến, dễ đoán nghĩa); giảng viên/trợ giảng thấy đăng ký của chính mình + nút chữ "Đăng ký" nếu lớp/buổi/bài đang mở (giữ chữ vì là hành động chính, cần rõ ràng).
6. Section "Lịch giảng": hiện là `EmptyState` (Giai đoạn 6 chưa xây) — giữ nguyên placeholder, không mở rộng.

### 5.8. `/cau-hinh/chuong-trinh` (danh sách chương trình mẫu)

Chỉ admin/quản lý đào tạo. `PageHeader` + action "+ Thêm chương trình" (`ProgramDialog`). Danh sách phẳng ít cột → dùng `Table` (`SURFACE_MUTED` bao ngoài): cột Tên chương trình (link sang chi tiết) + Mô tả.

### 5.9. `/cau-hinh/chuong-trinh/[id]` (chi tiết chương trình mẫu)

`PageHeader` breadcrumb + cụm 2 icon sửa/xoá chương trình (`Tooltip`, không chữ — hành động phổ biến). Tiêu đề + mô tả chương trình. Danh sách bài giảng mẫu = **QuickAdd + List kéo-thả** (`MauBaiGiangList`), action "+ Thêm bài giảng mẫu" (`MauBaiGiangDialog`).

---

## 6. Route chưa có UI (không thuộc phạm vi lần rewrite này)

`/lich-giang`, `/kpi`, `/cau-hinh/kpi`, `/bao-cao` — thuộc Giai đoạn 5-9 (xem `tientrinh.md`), chưa có trang nào tồn tại. Khi các agent phụ trách xây các trang này, phải tuân theo đúng token/component/pattern ở file này (không tự sáng tạo phong cách riêng).

---

## 7. Phân rã triển khai (để duyệt từng bước nhỏ)

Mỗi mục là 1 lượt code + 1 commit riêng, build/lint sạch, dừng lại để bạn xem thực tế (dev hoặc deploy) rồi mới sang mục kế — không dồn nhiều mục vào 1 lượt.

**Bước 0 — Xoá code UI cũ** (1 mục)
- [ ] `git rm` toàn bộ file UI theo mục "Phạm vi" trong kế hoạch, giữ nguyên `actions.ts`/`schema.ts`/`src/lib/**`.

**Bước 1 — Nền tảng token & màu**
- [ ] `globals.css`: cập nhật token màu theo mục 1 (không còn ràng buộc 6 tông cũ), token bo góc/bề mặt.
- [ ] `src/lib/design/surface.ts`.

**Bước 2 — Component nguyên tử** (chia 4 mục nhỏ, mỗi mục duyệt riêng)
- [ ] 2a. `Button`, `Badge`, `Card`, `Input`, `Label`, `Checkbox`.
- [ ] 2b. `Dialog`, `Sheet` (bản mobile full-height).
- [ ] 2c. `Tabs` (2 biến thể), `Tooltip`, `DropdownMenu`, `Select`.
- [ ] 2d. `Table`, `Breadcrumb`, `PageHeader`, `EmptyState`, `ScrollArea`, `Avatar`/`PersonAvatar`, `StatCard`.

**Bước 3 — Khung ứng dụng**
- [ ] 3a. Khung desktop: `(app)/layout.tsx`, `Sidebar`, `Header`.
- [ ] 3b. Khung mobile: bottom tab bar, header mobile rút gọn, FAB, Sheet "Thêm".

**Bước 4 — Auth** (1 mục, cả 4 trang cùng 1 khuôn)
- [ ] `/login`, `/register`, `/quen-mat-khau`, `/dat-lai-mat-khau`.

**Bước 5 — Nhân sự** (3 mục)
- [ ] 5a. `/nhan-su` (master-detail 2/3–1/3).
- [ ] 5b. `/nhan-su/[id]` (trang sửa đầy đủ).
- [ ] 5c. `/ho-so`.

**Bước 6 — Lớp học** (3 mục)
- [ ] 6a. `/lop-hoc` (Kanban + bộ lọc + hộp chờ duyệt).
- [ ] 6b. `/lop-hoc/[id]` — phần thông tin lớp + Buổi giảng/Bài giảng.
- [ ] 6c. `/lop-hoc/[id]` — phần Đăng ký & Duyệt + placeholder Lịch giảng.

**Bước 7 — Cấu hình chương trình** (1 mục, cả 2 trang)
- [ ] `/cau-hinh/chuong-trinh`, `/cau-hinh/chuong-trinh/[id]`.

**Bước 8 — Dashboard placeholder** (1 mục)

**Bước 9 — Tài liệu** (1 mục)
- [ ] `CLAUDE.md` mục 3 viết lại gọn, trỏ sang file này; sửa các đoạn mô tả UI cũ trong `tientrinh.md` thành câu trỏ sang file này.
