import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Route Handler dung de doi "code" (PKCE) tu link email (xac nhan dang ky,
// dat lai mat khau...) lay session that su — chi Route Handler/Server Action
// moi ghi duoc cookie, Server Component khong lam duoc viec nay.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent("Lien ket khong hop le hoac da het han.")}`,
  );
}
