"use client";
import { useState } from "react";
import {
  resetPasswordInput,
  type AccountDto,
} from "@/features/tenant-system/access-control/accounts/types";
import { client } from "@/features/tenant-system/access-control/accounts/api/client";
import { accountsChanged } from "@/features/tenant-system/access-control/accounts/hooks/use-accounts";
import { actorPlaceholder } from "@/features/tenant-system/access-control/accounts/constants";
import { useWorkspace } from "@/features/tenant-system/access-control/accounts/components/primitives/workspace";
import { Button } from "@/features/tenant-system/access-control/accounts/components/primitives/button";
import { Input } from "@/features/tenant-system/access-control/accounts/components/primitives/forms";
import {
  Field,
  fieldErrors,
  type FieldErrors,
} from "@/features/tenant-system/access-control/accounts/components/field";
export function PasswordDialog({
  record,
  onClose,
}: {
  record: AccountDto;
  onClose: () => void;
}) {
  const { notify } = useWorkspace();
  const [password, setPassword] = useState("");
  const [actorName] = useState(actorPlaceholder);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [failure, setFailure] = useState("");
  const [pending, setPending] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (pending) return;
    const parsed = resetPasswordInput.safeParse({
      password,
      actorName,
      reason: "Đặt lại mật khẩu",
    });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setFailure("");
    setPending(true);
    try {
      await client.resetPassword(record, parsed.data);
      accountsChanged();
      notify("Đã đặt lại mật khẩu.");
      onClose();
    } catch (error) {
      setFailure(
        error instanceof Error ? error.message : "Không thể đặt lại mật khẩu",
      );
    } finally {
      setPending(false);
    }
  }
  return (
    <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
      {failure && (
        <p className="error" role="alert">
          {failure}
        </p>
      )}
      <p className="text-sm text-muted-foreground">
        Mật khẩu mới áp dụng ngay và bắt buộc đổi lại ở lần đăng nhập kế tiếp.
      </p>
      <Field
        label={`Mật khẩu mới cho ${record.username}`}
        error={errors.password}
      >
        <Input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          maxLength={72}
          autoComplete="new-password"
          required
          aria-invalid={Boolean(errors.password)}
        />
      </Field>
      <footer className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Hủy
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Đang lưu…" : "Đặt lại mật khẩu"}
        </Button>
      </footer>
    </form>
  );
}
