import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Tắt tính năng tự sinh/ghi đè CLAUDE.md của Next.js — dự án đã có CLAUDE.md
  // riêng làm nguồn chân lý nghiệp vụ + kỹ thuật, không để tool ghi đè.
  agentRules: false,
};

export default nextConfig;
