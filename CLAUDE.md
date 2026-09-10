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

## 3. Design System (tham chiếu từ `maugiaodien.png` cho bố cục, tinh chỉnh chi tiết theo mục 3.1-3.2 dưới đây)

Toàn bộ UI phải nhất quán theo phong cách đã có trong ảnh mẫu, kết hợp thêm các pattern điều hướng hiện đại để **giảm số mục sidebar và giảm số lần người dùng phải nhảy qua lại giữa các trang** để hoàn thành một luồng nghiệp vụ:

- **Bố cục sidebar**: nhóm theo bản chất/tần suất sử dụng, có thể thu gọn từng nhóm (collapsible section) — không liệt kê phẳng từng chức năng con:
  - `Tổng quan` — đứng riêng, luôn hiện đầu tiên.
  - Nhóm **Đào tạo**: `Lớp học` (danh sách + trang chi tiết dùng **tab con**: Bài giảng / Đăng ký & Duyệt / Lịch giảng của lớp — duyệt đăng ký xử lý ngay tại tab này, không có trang quản lý đăng ký riêng); `Lịch giảng` (1 route tổng hợp toàn trung tâm, dạng bảng/calendar, toggle **"Tất cả ↔ Của tôi"** thay vì 2 route riêng).
  - Nhóm **Nhân sự**: `Nhân sự` (danh sách + hồ sơ + chứng chỉ).
  - Nhóm **Đánh giá**: `Đánh giá & KPI` (tab con: Nhập điểm — admin/quản lý, Bảng xếp hạng, Của tôi — cá nhân).
  - Nhóm **Cấu hình** (chỉ admin/quản lý thấy nhóm này, vì dùng ít): `Chương trình đào tạo` (chương trình mẫu), `Cấu hình KPI` (kỳ, tiêu chí, trọng số, hệ số quy đổi, ngưỡng xếp hạng).
  - Giảng viên/trợ giảng tự đăng ký dạy một lớp bằng **nút hành động ngay trong danh sách/chi tiết lớp học** ("Đăng ký dạy lớp này"), không cần trang đăng ký riêng.
- **Header**: giữ icon lịch, trợ giúp, chuông thông báo (badge đỏ), avatar góc phải — **thêm breadcrumb ngữ cảnh** ngay đầu vùng nội dung (vd `Đào tạo / Cấp cứu cơ bản K12 / Đăng ký`) để người dùng biết đang ở đâu mà không cần nhìn lại sidebar.
- **Duyệt/thao tác nhanh dùng master-detail + drawer**: các danh sách có thao tác lặp lại nhiều (đăng ký chờ duyệt, lời mời giảng dạy) dùng pattern list + panel bên phải (component `Sheet` của shadcn/ui) để xử lý ngay tại chỗ, không điều hướng sang trang khác. Các hành động đơn giản (duyệt/từ chối, đánh dấu đã đọc, đổi trạng thái buổi giảng) đặt dưới dạng **nút hành động inline ngay trong dòng bảng**; chỉ mở drawer/trang chi tiết khi cần xem đầy đủ thông tin trước khi quyết định.
- **Trang chủ theo vai trò**: `/dashboard` hiển thị nội dung khác nhau theo vai trò đăng nhập — admin/quản lý thấy số liệu vận hành (lớp thiếu nhân sự, đăng ký chờ duyệt...) trước tiên; giảng viên/trợ giảng thấy lịch giảng sắp tới + điểm KPI cá nhân trước tiên, rồi mới đến các thẻ số liệu chung.
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

### 3.1. Hiệu ứng kính mờ (glassmorphism) — dùng CÓ CHỌN LỌC

Quyết định chốt ngày 2026-09-09 sau khi tham khảo 1 ảnh mẫu dashboard phong cách kính mờ/pastel do người dùng cung cấp: **không áp dụng kính mờ toàn app**, chỉ dùng cho lớp nổi tạm thời, vì 2 lý do kỹ thuật:
1. Nền bán trong suốt làm giảm độ tương phản của bảng màu 6 tông đã kiểm chứng OKLCH/CVD ở trên — rủi ro nhất trên các trang bảng/form dữ liệu dày đặc (Nhân sự, Lớp học, KPI...), vốn chiếm phần lớn diện tích màn hình của app này (khác ảnh mẫu tham khảo, vốn toàn card + chart).
2. `backdrop-filter: blur()` tốn GPU; lặp lại ở nhiều phần tử cùng lúc (nhiều dòng bảng, nhiều card xếp chồng) gây giật/tụt pin trên mobile — đi ngược nguyên tắc "mượt" của app.

**Được áp dụng kính mờ** (lớp nổi, số lượng ít, hiển thị tạm thời):
- Dropdown thông báo, tooltip, popover.
- Nền overlay phía sau `Dialog`/`Sheet`/`Drawer` khi mở.
- Header khi cuộn trang (sticky header nền mờ nhẹ thay vì nền đặc cứng).

**KHÔNG áp dụng kính mờ** (nội dung chính, hiển thị liên tục, nhiều phần tử lặp lại):
- Nền bảng dữ liệu, từng dòng bảng, form nhập liệu, danh sách dài, stat card chính — giữ nền đặc theo token màu hiện có (`--card`, `--popover`...).

**Thông số thống nhất khi áp dụng**: dựa trên token nền hiện có (`--popover`/`--card`), không tạo màu mới — thêm opacity ~80-90% (light mode) / ~75-85% (dark mode) + `backdrop-blur-md` (8-12px) + viền 1px mờ (trắng/đen ~10-20% opacity) + bóng đổ mềm. Mọi agent khi cần thêm 1 phần tử kính mờ mới đều dùng đúng công thức này, không tự sáng tạo giá trị riêng.

### 3.2. Responsive / Mobile-first — bắt buộc từ MỌI giai đoạn, không chỉ Giai đoạn 11

Trước đây responsive chỉ được xử lý gộp ở Giai đoạn 11. Từ 2026-09-09, mỗi giai đoạn (kể cả các giai đoạn module nghiệp vụ 3-9) phải tự đảm bảo **responsive cơ bản trên mobile** (≥375px) trước khi coi là đạt Gate của giai đoạn đó — Giai đoạn 11 chỉ còn là đợt rà soát toàn diện lần cuối, xử lý phần còn sót, không phải lần đầu tiên nghĩ đến mobile.

- **Sidebar trên mobile** (dưới breakpoint `md`, ~768px): không hiển thị cố định như desktop — chuyển thành `Sheet`/`Drawer` trượt ra khi bấm icon hamburger ở Header.
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
