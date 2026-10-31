"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { useSession } from "@/features/tenant-system/access-control/tenant-auth/hooks/session";
import { roleLabels } from "@/features/tenant-system/access-control/tenant-auth/constants";
import { Input } from "@/features/tenant-system/access-control/tenant-auth/components/primitives/forms";
import { Field } from "@/features/tenant-system/access-control/tenant-auth/components/primitives/field";
import { Button } from "@/features/tenant-system/access-control/tenant-auth/components/primitives/button";
import {
  firstAdminSchema,
  credentialSchema,
  passwordChangeSchema,
} from "@/features/tenant-system/access-control/tenant-auth/types";

const messageOf = (error: unknown) =>
  error instanceof Error ? error.message : "Không thể kết nối máy chủ.";

export function ModulePage() {
  const router = useRouter();
  const {
    status,
    actor,
    needsSetup,
    idleMinutes,
    signIn,
    createFirstAdmin,
    changePassword,
    signOut,
  } = useSession();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const step = actor?.mustChangePassword
    ? "password"
    : needsSetup && !actor
      ? "setup"
      : "login";
  const enter = () => router.replace("/");
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    try {
      if (step === "password") {
        if (newPassword !== confirmPassword) {
          setError("Mật khẩu nhập lại không khớp.");
          return;
        }
        const parsed = passwordChangeSchema.safeParse({
          currentPassword,
          newPassword,
        });
        if (!parsed.success) {
          setError(parsed.error.issues[0]?.message ?? "Dữ liệu chưa hợp lệ.");
          return;
        }
        setPending(true);
        await changePassword(parsed.data);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        enter();
        return;
      }
      const credential = credentialSchema.safeParse({ username, password });
      if (!credential.success) {
        setError(credential.error.issues[0]?.message ?? "Dữ liệu chưa hợp lệ.");
        return;
      }
      setPending(true);
      if (step === "setup") {
        const parsed = firstAdminSchema.safeParse({
          displayName,
          username,
          password,
        });
        if (!parsed.success) {
          setError(parsed.error.issues[0]?.message ?? "Dữ liệu chưa hợp lệ.");
          return;
        }
        await createFirstAdmin(parsed.data);
      } else {
        const signed = await signIn(
          credential.data.username,
          credential.data.password,
        );
        if (!signed.mustChangePassword) enter();
      }
      setPassword("");
    } catch (caught) {
      setError(messageOf(caught));
    } finally {
      setPending(false);
    }
  };
  return (
    <div className="grid min-h-dvh place-items-center bg-muted px-4 py-10">
      <main className="w-full max-w-md">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-control bg-primary text-primary-foreground">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-lg font-bold tracking-tight">OneOps</p>
            <p className="text-xs text-muted-foreground">Không gian làm việc</p>
          </div>
        </div>
        <section className="rounded-panel border border-border bg-surface p-6 shadow-panel">
          {step === "login" && actor ? (
            <>
              <h1 className="text-xl font-semibold text-foreground">
                Đang đăng nhập
              </h1>
              <p className="mt-1 mb-5 text-sm text-muted-foreground">
                {actor.displayName} · {roleLabels[actor.role]}
                {actor.isSystemAdmin ? " · Quản trị hệ thống" : ""}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button size="lg" onClick={enter}>
                  Vào không gian làm việc
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={async () => {
                    await signOut();
                  }}
                >
                  Đăng xuất
                </Button>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-xl font-semibold text-foreground">
                {step === "setup"
                  ? "Tạo quản trị đầu tiên"
                  : step === "password"
                    ? "Đổi mật khẩu lần đầu"
                    : "Đăng nhập OneOps"}
              </h1>
              <p className="mt-1 mb-5 text-sm text-muted-foreground">
                {step === "setup"
                  ? "Hệ thống chưa có tài khoản. Tài khoản đầu tiên phải là Quản lý kèm quyền quản trị hệ thống."
                  : step === "password"
                    ? `Tài khoản ${actor?.username ?? ""} cần đổi mật khẩu trước khi tiếp tục.`
                    : status === "loading"
                      ? "Đang kiểm tra phiên đăng nhập…"
                      : `Phiên làm việc tự khóa sau ${idleMinutes} phút không hoạt động.`}
              </p>
              <form
                className="flex flex-col gap-4"
                onSubmit={submit}
                noValidate
              >
                {step === "setup" && (
                  <Field label="Tên hiển thị">
                    <Input
                      value={displayName}
                      onChange={(event) => setDisplayName(event.target.value)}
                      autoComplete="name"
                      required
                    />
                  </Field>
                )}
                {step !== "password" && (
                  <>
                    <Field label="Tên đăng nhập">
                      <Input
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        autoComplete="username"
                        autoFocus
                        required
                      />
                    </Field>
                    <Field
                      label="Mật khẩu"
                      hint={step === "setup" ? "Tối thiểu 8 ký tự." : undefined}
                    >
                      <Input
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        autoComplete={
                          step === "setup" ? "new-password" : "current-password"
                        }
                        required
                      />
                    </Field>
                  </>
                )}
                {step === "password" && (
                  <>
                    <Field label="Mật khẩu hiện tại">
                      <Input
                        type="password"
                        value={currentPassword}
                        onChange={(event) =>
                          setCurrentPassword(event.target.value)
                        }
                        autoComplete="current-password"
                        autoFocus
                        required
                      />
                    </Field>
                    <Field
                      label="Mật khẩu mới"
                      hint="Tối thiểu 8 ký tự, khác mật khẩu hiện tại."
                    >
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        autoComplete="new-password"
                        required
                      />
                    </Field>
                    <Field label="Nhập lại mật khẩu mới">
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(event) =>
                          setConfirmPassword(event.target.value)
                        }
                        autoComplete="new-password"
                        required
                      />
                    </Field>
                  </>
                )}
                {error && (
                  <p className="text-sm text-destructive" role="alert">
                    {error}
                  </p>
                )}
                <Button type="submit" loading={pending} size="lg">
                  {step === "setup"
                    ? "Tạo tài khoản quản trị"
                    : step === "password"
                      ? "Lưu mật khẩu mới"
                      : "Đăng nhập"}
                </Button>
              </form>
            </>
          )}
        </section>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Chức danh không cấp quyền; quyền chỉ đến từ vai trò và cờ quản trị hệ
          thống.
        </p>
      </main>
    </div>
  );
}
