import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Đăng nhập</CardTitle>
          <CardDescription>Hệ thống Quản lý đào tạo — Trung tâm Cấp cứu 115</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={login} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
              />
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
              Đăng nhập
            </Button>
          </form>
          <div className="mt-4 flex flex-col gap-1 text-center text-sm text-muted-foreground">
            <Link href="/quen-mat-khau" className="underline underline-offset-4">
              Quên mật khẩu?
            </Link>
            <span>
              Chưa có tài khoản?{" "}
              <Link href="/register" className="underline underline-offset-4">
                Đăng ký
              </Link>
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
