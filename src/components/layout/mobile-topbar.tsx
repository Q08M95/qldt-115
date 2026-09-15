import { GlobalSearch } from "./global-search";
import { UserMenu } from "./user-menu";
import type { CurrentProfile } from "@/lib/auth";

// Thanh tren cung mobile — chi con logo + tim kiem + avatar (bo cum icon
// lich/tro giup/thong bao vi khong du cho tren man hinh nho, van con o
// desktop). Dieu huong chinh chuyen sang BottomTabBar (thietke-giao-dien.md
// muc 3.1).
export function MobileTopBar({ profile }: { profile: CurrentProfile }) {
  return (
    <div className="flex h-12 shrink-0 items-center gap-2 border-b border-border bg-card px-4 md:hidden">
      <span className="font-heading text-sm font-semibold">QLĐT 115</span>
      <div className="ml-auto flex items-center gap-1">
        <GlobalSearch compact />
        <UserMenu profile={profile} />
      </div>
    </div>
  );
}
