"use client";
import { useState } from "react";
import {
  accountInput,
  accountPatch,
  type AccountDto,
  type AccountRole,
} from "@/features/tenant-system/access-control/accounts/types";
import { client } from "@/features/tenant-system/access-control/accounts/api/client";
import { accountsChanged } from "@/features/tenant-system/access-control/accounts/hooks/use-accounts";
import {
  actorPlaceholder,
  roleLabels,
} from "@/features/tenant-system/access-control/accounts/constants";
import { useWorkspace } from "@/features/tenant-system/access-control/accounts/components/primitives/workspace";
import { Button } from "@/features/tenant-system/access-control/accounts/components/primitives/button";
import {
  Input,
  Select,
} from "@/features/tenant-system/access-control/accounts/components/primitives/forms";
import {
  Field,
  fieldErrors,
  type FieldErrors,
} from "@/features/tenant-system/access-control/accounts/components/field";
export function AccountForm({
  record,
  onClose,
}: {
  record?: AccountDto;
  onClose: () => void;
}) {
  const { notify } = useWorkspace();
  const [values, setValues] = useState({
    username: record?.username ?? "",
    displayName: record?.displayName ?? "",
    email: record?.email ?? "",
    employeeCode: record?.employeeCode ?? "",
    password: "",
    role: (record?.role ?? "EMPLOYEE") as AccountRole,
    isSystemAdmin: record?.isSystemAdmin ?? false,
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [failure, setFailure] = useState("");
  const [pending, setPending] = useState(false);
  const set = (key: keyof typeof values) => (value: string) =>
    setValues((current) => ({ ...current, [key]: value }));
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (pending) return;
    if (record) {
      const parsed = accountPatch.safeParse({
        username: values.username,
        displayName: values.displayName,
        email: values.email,
        employeeCode: values.employeeCode,
        actorName: actorPlaceholder,
      });
      if (!parsed.success) {
        setErrors(fieldErrors(parsed.error));
        return;
      }
      setErrors({});
      setFailure("");
      setPending(true);
      try {
        await client.update(record, parsed.data);
        accountsChanged();
        notify("Đã cập nhật tài khoản.");
        onClose();
      } catch (error) {
        setFailure(
          error instanceof Error ? error.message : "Không thể lưu tài khoản",
        );
      } finally {
        setPending(false);
      }
      return;
    }
    const parsed = accountInput.safeParse({
      ...values,
      role: values.role,
      isSystemAdmin: values.isSystemAdmin,
      actorName: actorPlaceholder,
    });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setFailure("");
    setPending(true);
    try {
      await client.create(parsed.data);
      accountsChanged();
      notify("Đã tạo tài khoản.");
      onClose();
    } catch (error) {
      setFailure(
        error instanceof Error ? error.message : "Không thể tạo tài khoản",
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
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tên đăng nhập" error={errors.username}>
          <Input
            value={values.username}
            onChange={(event) => set("username")(event.target.value)}
            maxLength={80}
            required
            autoComplete="off"
            aria-invalid={Boolean(errors.username)}
          />
        </Field>
        <Field label="Tên hiển thị" error={errors.displayName}>
          <Input
            value={values.displayName}
            onChange={(event) => set("displayName")(event.target.value)}
            maxLength={200}
            required
            aria-invalid={Boolean(errors.displayName)}
          />
        </Field>
        <Field label="Email" error={errors.email}>
          <Input
            type="email"
            value={values.email}
            onChange={(event) => set("email")(event.target.value)}
            maxLength={200}
            aria-invalid={Boolean(errors.email)}
          />
        </Field>
        <Field
          label="Mã nhân viên"
          error={errors.employeeCode}
          hint="Liên kết hồ sơ nhân sự bằng mã, không tạo khóa ngoại."
        >
          <Input
            value={values.employeeCode}
            onChange={(event) => set("employeeCode")(event.target.value)}
            maxLength={50}
          />
        </Field>
        {!record && (
          <>
            <Field label="Mật khẩu ban đầu" error={errors.password}>
              <Input
                type="password"
                value={values.password}
                onChange={(event) => set("password")(event.target.value)}
                maxLength={72}
                autoComplete="new-password"
                required
                aria-invalid={Boolean(errors.password)}
              />
            </Field>
            <Field
              label="Vai trò"
              hint="Chỉ có Nhân viên và Quản lý. Quản trị cấp cao là Quản lý kèm quyền quản trị hệ thống."
            >
              <Select
                value={values.role}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    role: event.target.value as AccountRole,
                    isSystemAdmin:
                      event.target.value === "MANAGER"
                        ? current.isSystemAdmin
                        : false,
                  }))
                }
              >
                {Object.entries(roleLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input
                type="checkbox"
                className="size-4 rounded-sm border border-input"
                checked={values.isSystemAdmin}
                disabled={values.role !== "MANAGER"}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    isSystemAdmin: event.target.checked,
                  }))
                }
              />
              <span>
                Quản trị hệ thống
                {values.role !== "MANAGER" && (
                  <span className="text-xs text-muted-foreground">
                    {" "}
                    — chỉ bật được cho vai trò Quản lý
                  </span>
                )}
              </span>
            </label>
          </>
        )}
      </div>
      <footer className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Hủy
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Đang lưu…" : record ? "Lưu thay đổi" : "Tạo tài khoản"}
        </Button>
      </footer>
    </form>
  );
}
