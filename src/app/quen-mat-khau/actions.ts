"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const origin = (await headers()).get("origin");

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/confirm?next=/dat-lai-mat-khau`,
  });

  if (error) {
    redirect(`/quen-mat-khau?error=${encodeURIComponent(error.message)}`);
  }

  redirect(
    "/quen-mat-khau?message=" +
      encodeURIComponent("Đã gửi email hướng dẫn đặt lại mật khẩu, vui lòng kiểm tra hộp thư."),
  );
}
