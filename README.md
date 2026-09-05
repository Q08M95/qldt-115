# QLĐT 115 — Quản lý đào tạo Trung tâm Cấp cứu 115 TP.HCM

WebApp nội bộ quản lý đào tạo nhân sự y tế: hồ sơ nhân sự, đăng ký/chỉ định giảng dạy, đánh giá KPI, dashboard realtime.

- **Kiến trúc nghiệp vụ & kỹ thuật**: xem [`CLAUDE.md`](./CLAUDE.md).
- **Lộ trình triển khai theo từng giai đoạn**: xem [`tientrinh.md`](./tientrinh.md).
- **Sub-agent phụ trách từng giai đoạn**: xem bảng đầu file [`tientrinh.md`](./tientrinh.md), định nghĩa chi tiết tại [`.claude/agents/`](./.claude/agents/).

## Stack

Next.js (App Router, TypeScript) · Supabase (Postgres/Auth/Storage/Realtime) · Tailwind CSS · shadcn/ui · recharts. Deploy qua Vercel.

## Chạy local

```bash
npm install
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000). Cần file `.env.local` chứa:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Không đưa `SUPABASE_SERVICE_ROLE_KEY` vào biến `NEXT_PUBLIC_*` hoặc bất kỳ file nào commit lên git.
