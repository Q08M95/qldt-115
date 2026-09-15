"use client";

import { useTransition } from "react";
import Link from "next/link";
import { LogOut, UserRound } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROLE_LABEL } from "@/lib/constants/roles";
import { logout } from "@/app/(app)/actions";
import type { CurrentProfile } from "@/lib/auth";

function initials(fullName: string): string {
  const words = fullName.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "??";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export function UserMenu({ profile }: { profile: CurrentProfile }) {
  const [isPending, startTransition] = useTransition();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
        <Avatar size="sm">
          <AvatarFallback className="bg-primary/10 text-primary">{initials(profile.full_name)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>
          <p className="font-medium text-foreground">{profile.full_name}</p>
          <p className="text-xs text-muted-foreground">{ROLE_LABEL[profile.role]}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/ho-so" />}>
          <UserRound className="size-4" strokeWidth={1.5} />
          Hồ sơ cá nhân
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" disabled={isPending} onClick={() => startTransition(() => logout())}>
          <LogOut className="size-4" strokeWidth={1.5} />
          Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
