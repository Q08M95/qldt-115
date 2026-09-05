import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Tắt tính năng tự sinh/ghi đè CLAUDE.md của Next.js — dự án đã có CLAUDE.md
  // riêng làm nguồn chân lý nghiệp vụ + kỹ thuật, không để tool ghi đè.
  agentRules: false,
  experimental: {
    serverActions: {
      // Mac dinh Next.js chi cho 1MB/Server Action — file chung chi
      // (PDF/anh scan) thuong vuot muc nay, gay loi an (React error #441).
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
