import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { register } from "./actions";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Đăng ký tài khoản</CardTitle>
          <CardDescription>
            Tài khoản mới mặc định vai trò Trợ giảng — quản trị viên sẽ nâng quyền sau khi xác
            minh.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={register} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="full_name">Họ và tên</Label>
              <Input id="full_name" name="full_name" required autoComplete="name" />
            </div>
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
                minLength={6}
                autoComplete="new-password"
              />
            </div>
            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            <Button type="submit" className="w-full">
              Đăng ký
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Đã có tài khoản?{" "}
            <Link href="/login" className="underline underline-offset-4">
              Đăng nhập
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
