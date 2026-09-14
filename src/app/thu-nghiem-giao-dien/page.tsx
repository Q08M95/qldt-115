import Link from "next/link";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  ClipboardCheck,
  CalendarDays,
  Search,
  Bell,
  Settings,
  Mail,
  Phone,
  MessageCircle,
  ArrowUpRight,
  MoreHorizontal,
  Sparkles,
} from "lucide-react";
import { PersonAvatar } from "@/components/nhan-su/person-avatar";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ROLE_LABEL } from "@/lib/constants/roles";

// TRANG THU NGHIEM GIAO DIEN — khong nam trong (app), khong co trong sidebar
// nav-config.ts, khong duoc lien ket tu bat ky trang that nao cua app. Dung
// rieng de nguoi dung xem thu 1 mau "ban lam viec noi" (Soft UI + Neumorphism
// + Glassmorphism, bento grid, bo goc >=24px, pill-shape, icon net manh) truoc
// khi quyet dinh co ap dung cho toan bo ung dung hay khong (xem CLAUDE.md
// muc 3 — quyet dinh 2026-09-14, dang o trang thai THU NGHIEM, chua chinh
// thuc thay the muc 3.1 hien co). Trang nay dung du lieu THAT (profiles/lop_hoc
// that) de kiem tra dung diem rui ro nhat: kinh mo tren bang du lieu day dac.
// XOA trang nay sau khi nguoi dung chot xong phong cach, du chon phuong an nao.
export default async function ThuNghiemGiaoDienPage() {
  const current = await getCurrentProfile();
  const supabase = await createClient();

  const [{ data: nhanSu }, { data: lopHoc }, { count: soGiangVien }, { count: soLopMo }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, role, chuc_danh, chuyen_mon, hoc_vi, khoa_phong_cong_tac")
        .eq("trang_thai_hoat_dong", true)
        .order("full_name")
        .limit(6),
      supabase
        .from("lop_hoc")
        .select("id, ten_lop, loai_lop, trang_thai, mo_dang_ky, ngay_khai_giang")
        .order("ngay_khai_giang", { ascending: true, nullsFirst: false })
        .limit(4),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "giang_vien")
        .eq("trang_thai_hoat_dong", true),
      supabase.from("lop_hoc").select("id", { count: "exact", head: true }).eq("mo_dang_ky", true),
    ]);

  const nguoiChiTiet = nhanSu?.[0];
  const dock = [
    { icon: LayoutDashboard, label: "Tổng quan" },
    { icon: GraduationCap, label: "Lớp học" },
    { icon: Users, label: "Nhân sự" },
    { icon: ClipboardCheck, label: "KPI" },
    { icon: CalendarDays, label: "Lịch giảng" },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[oklch(96%_0.015_240)]">
      {/* Nen gradient truu tuong mem — khong dung anh phong canh that (quyet
          dinh nguoi dung 2026-09-14), du hue voi mau chu dao #2973B2. */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(1100px circle at 12% -8%, oklch(92% 0.05 240 / 70%), transparent 60%), " +
            "radial-gradient(900px circle at 105% 15%, oklch(90% 0.06 250 / 55%), transparent 55%), " +
            "radial-gradient(800px circle at 50% 120%, oklch(88% 0.05 230 / 50%), transparent 60%), " +
            "linear-gradient(180deg, oklch(97% 0.012 240) 0%, oklch(93.5% 0.02 235) 100%)",
        }}
      />

      <div className="relative z-10 mx-auto flex max-w-[1600px] flex-col gap-4 p-4 md:p-6 lg:p-8">
        {/* Banner nhac day la trang thu nghiem, khong phai trang chinh thuc */}
        <div className="flex items-center gap-2 rounded-full border border-data-canh-bao/30 bg-data-canh-bao/10 px-4 py-2 text-xs text-data-canh-bao">
          <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
          Trang thử nghiệm phong cách giao diện mới — chưa áp dụng cho phần còn lại của app. Xem trên
          cả mobile lẫn desktop rồi phản hồi.{" "}
          <Link href="/dashboard" className="underline underline-offset-2">
            Về trang chính
          </Link>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
          {/* Dock cong cu noi ben trai — chi desktop (md+), mobile giu sidebar
              Drawer hien co (CLAUDE.md muc 3.2, quyet dinh nguoi dung 2026-09-14). */}
          <aside className="sticky top-6 hidden shrink-0 flex-col items-center gap-2 self-start rounded-[32px] border border-white/50 bg-white/55 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_20px_50px_-20px_oklch(55%_0.15_250/0.35)] backdrop-blur-2xl md:flex">
            {dock.map(({ icon: Icon, label }, i) => (
              <button
                key={label}
                type="button"
                title={label}
                className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
                  i === 0
                    ? "bg-data-lop-hoc text-white shadow-[0_8px_20px_-6px_oklch(55%_0.15_250/0.6)]"
                    : "text-foreground/60 hover:bg-white/70 hover:text-data-lop-hoc"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={1.5} />
              </button>
            ))}
            <div className="my-1 h-px w-8 bg-foreground/10" />
            <button
              type="button"
              title="Cài đặt"
              className="flex h-11 w-11 items-center justify-center rounded-full text-foreground/60 hover:bg-white/70 hover:text-data-lop-hoc"
            >
              <Settings className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </aside>

          {/* Vung noi dung chinh — Bento grid */}
          <main className="flex min-w-0 flex-1 flex-col gap-4 md:gap-6">
            {/* Header: loi chao + tim kiem + thong bao/avatar dang pill */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[28px] border border-white/50 bg-white/55 px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_20px_50px_-24px_oklch(55%_0.15_250/0.3)] backdrop-blur-2xl">
              <div>
                <p className="text-[11px] font-medium tracking-[0.18em] text-foreground/50 uppercase">
                  Chào mừng trở lại
                </p>
                <h1 className="font-heading text-xl font-semibold text-foreground md:text-2xl">
                  {current?.full_name ?? "Bạn"}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden items-center gap-2 rounded-full border border-white/60 bg-white/70 px-4 py-2 text-sm text-foreground/60 sm:flex">
                  <Search className="h-4 w-4" strokeWidth={1.5} />
                  Tìm nhanh...
                </div>
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-white/70 text-foreground/60 hover:text-data-lop-hoc"
                >
                  <Bell className="h-4.5 w-4.5" strokeWidth={1.5} />
                </button>
                <PersonAvatar
                  fullName={current?.full_name ?? "?"}
                  role={current?.role ?? "admin"}
                  size="default"
                />
              </div>
            </div>

            {/* Bento: 3 stat card pill */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatPill
                label="Giảng viên hoạt động"
                value={String(soGiangVien ?? 0)}
                icon={Users}
                tone="giang-vien"
              />
              <StatPill
                label="Lớp đang mở đăng ký"
                value={String(soLopMo ?? 0)}
                icon={GraduationCap}
                tone="lop-hoc"
              />
              <StatPill label="Điểm KPI trung bình" value="Chưa có dữ liệu" icon={ClipboardCheck} tone="kpi" />
            </div>

            {/* Bang du lieu day dac boc kinh mo — diem thu nghiem quan trong nhat */}
            <div className="rounded-[28px] border border-white/50 bg-white/55 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_20px_50px_-24px_oklch(55%_0.15_250/0.3)] backdrop-blur-2xl">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-heading text-sm font-semibold text-foreground">
                  Nhân sự đang hoạt động
                </h2>
                <button type="button" className="text-foreground/40 hover:text-foreground">
                  <MoreHorizontal className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>
              <div className="flex flex-col gap-1.5">
                {(nhanSu ?? []).map((p) => (
                  <div
                    key={p.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl px-3 py-2.5 transition-colors hover:bg-white/60"
                  >
                    <div className="flex items-center gap-3">
                      <PersonAvatar fullName={p.full_name} role={p.role} size="sm" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{p.full_name}</p>
                        <p className="text-xs text-foreground/50">{p.chuc_danh ?? p.chuyen_mon ?? "—"}</p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-medium ${
                        p.role === "giang_vien"
                          ? "bg-data-giang-vien/15 text-data-giang-vien"
                          : p.role === "tro_giang"
                            ? "bg-data-tro-giang/15 text-data-tro-giang"
                            : "bg-data-lop-hoc/15 text-data-lop-hoc"
                      }`}
                    >
                      {ROLE_LABEL[p.role]}
                    </span>
                  </div>
                ))}
                {(nhanSu ?? []).length === 0 ? (
                  <p className="p-3 text-sm text-foreground/50">Chưa có dữ liệu nhân sự.</p>
                ) : null}
              </div>
            </div>

            {/* Bento phu: mini lop hoc */}
            <div className="rounded-[28px] border border-white/50 bg-white/55 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_20px_50px_-24px_oklch(55%_0.15_250/0.3)] backdrop-blur-2xl">
              <h2 className="mb-3 font-heading text-sm font-semibold text-foreground">Lớp học sắp tới</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {(lopHoc ?? []).map((lop) => (
                  <div
                    key={lop.id}
                    className="flex flex-col gap-2 rounded-2xl border border-white/60 bg-white/50 p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="line-clamp-1 text-sm font-medium text-foreground">{lop.ten_lop}</p>
                      {lop.mo_dang_ky ? (
                        <span className="shrink-0 rounded-full bg-data-dang-ky/15 px-2.5 py-0.5 text-[10px] font-medium text-data-dang-ky">
                          Mở đăng ký
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-foreground/50">
                      {lop.loai_lop ?? "—"} · {lop.ngay_khai_giang ?? "Chưa xếp ngày"}
                    </p>
                  </div>
                ))}
                {(lopHoc ?? []).length === 0 ? (
                  <p className="text-sm text-foreground/50">Chưa có lớp học.</p>
                ) : null}
              </div>
            </div>
          </main>

          {/* Panel chi tiet ben phai — chi xl+, mobile/tablet an het (dung
              Sheet neu can xem chi tiet, giong pattern hien co). */}
          <aside className="hidden w-full shrink-0 flex-col gap-4 lg:w-80 xl:flex">
            {nguoiChiTiet ? (
              <div className="flex flex-col items-center gap-3 rounded-[28px] border border-white/50 bg-white/55 p-6 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_20px_50px_-24px_oklch(55%_0.15_250/0.3)] backdrop-blur-2xl">
                <PersonAvatar fullName={nguoiChiTiet.full_name} role={nguoiChiTiet.role} size="lg" />
                <div>
                  <p className="font-heading text-base font-semibold text-foreground">
                    {nguoiChiTiet.full_name}
                  </p>
                  <p className="text-xs text-foreground/50">
                    {nguoiChiTiet.chuc_danh ?? ROLE_LABEL[nguoiChiTiet.role]}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-white/70 text-foreground/60 hover:text-data-lop-hoc">
                    <Mail className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                  <button className="flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-white/70 text-foreground/60 hover:text-data-lop-hoc">
                    <Phone className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                  <button className="flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-white/70 text-foreground/60 hover:text-data-lop-hoc">
                    <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>
                <div className="mt-2 flex w-full flex-col gap-2 border-t border-white/60 pt-4 text-left">
                  <InfoRow label="Học vị" value={nguoiChiTiet.hoc_vi ?? "—"} />
                  <InfoRow label="Chuyên môn" value={nguoiChiTiet.chuyen_mon ?? "—"} />
                  <InfoRow label="Khoa / phòng" value={nguoiChiTiet.khoa_phong_cong_tac ?? "—"} />
                </div>
              </div>
            ) : null}

            <div className="flex flex-col gap-3 rounded-[28px] border border-white/50 bg-white/55 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_20px_50px_-24px_oklch(55%_0.15_250/0.3)] backdrop-blur-2xl">
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-sm font-semibold text-foreground">Ghi chú nhanh</h3>
                <ArrowUpRight className="h-4 w-4 text-foreground/40" strokeWidth={1.5} />
              </div>
              <p className="text-xs leading-relaxed text-foreground/60">
                Đây là khối minh hoạ cho panel chi tiết bên phải theo bố cục Bento 3 vùng — có thể thay
                bằng lịch giảng, thông báo, hoặc KPI cá nhân tuỳ trang thực tế.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function StatPill({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  tone: "giang-vien" | "lop-hoc" | "kpi";
}) {
  const toneClass = {
    "giang-vien": "bg-data-giang-vien/15 text-data-giang-vien",
    "lop-hoc": "bg-data-lop-hoc/15 text-data-lop-hoc",
    kpi: "bg-data-kpi/15 text-data-kpi",
  }[tone];

  return (
    <div className="flex flex-col gap-3 rounded-[28px] border border-white/50 bg-white/55 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_20px_50px_-24px_oklch(55%_0.15_250/0.3)] backdrop-blur-2xl">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium tracking-[0.14em] text-foreground/50 uppercase">{label}</p>
        <span className={`flex h-9 w-9 items-center justify-center rounded-full ${toneClass}`}>
          <Icon className="h-4.5 w-4.5" strokeWidth={1.5} />
        </span>
      </div>
      <p className="font-heading text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 text-xs">
      <span className="text-foreground/45">{label}</span>
      <span className="text-right font-medium text-foreground/80">{value}</span>
    </div>
  );
}
