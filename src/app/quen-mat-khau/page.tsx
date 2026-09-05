import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordReset } from "./actions";

export default async function QuenMatKhauPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Quên mật khẩu</CardTitle>
          <CardDescription>Nhập email đã đăng ký để nhận liên kết đặt lại mật khẩu.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={requestPasswordReset} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </div>
            {message ? (
              <p className="text-sm text-muted-foreground" role="status">
                {message}
              </p>
            ) : null}
            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            <Button type="submit" className="w-full">
              Gửi liên kết đặt lại mật khẩu
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <Link href="/login" className="underline underline-offset-4">
              Quay lại đăng nhập
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
