"use client";
import { useState } from "react";
import {
  changeAccessInput,
  type AccountRole,
  type AccountStatus,
  type AccountDto,
} from "@/features/tenant-system/access-control/accounts/types";
import { client } from "@/features/tenant-system/access-control/accounts/api/client";
import { accountsChanged } from "@/features/tenant-system/access-control/accounts/hooks/use-accounts";
import {
  actorPlaceholder,
  roleLabels,
  statusLabels,
} from "@/features/tenant-system/access-control/accounts/constants";
import { useWorkspace } from "@/features/tenant-system/access-control/accounts/components/primitives/workspace";
import { Button } from "@/features/tenant-system/access-control/accounts/components/primitives/button";
import {
  Input,
  Select,
  Textarea,
} from "@/features/tenant-system/access-control/accounts/components/primitives/forms";
import {
  Field,
  fieldErrors,
  type FieldErrors,
} from "@/features/tenant-system/access-control/accounts/components/field";
export function AccessDialog({
  record,
  onClose,
}: {
  record: AccountDto;
  onClose: () => void;
}) {
  const { notify } = useWorkspace();
  const [values, setValues] = useState({
    role: record.role as AccountRole,
    isSystemAdmin: record.isSystemAdmin,
    status: record.status as AccountStatus,
    lockedReason: record.lockedReason,
    actorName: actorPlaceholder,
    reason: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [failure, setFailure] = useState("");
  const [pending, setPending] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (pending) return;
    const parsed = changeAccessInput.safeParse(values);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setFailure("");
    setPending(true);
    try {
      await client.changeAccess(record, parsed.data);
      accountsChanged();
      notify("Đã cập nhật quyền truy cập.");
      onClose();
    } catch (error) {
      setFailure(
        error instanceof Error ? error.message : "Không thể cập nhật quyền",
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
        Mọi thay đổi vai trò, quyền quản trị và trạng thái đều được ghi vào lịch
        sử của tài khoản.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Vai trò">
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
        <Field label="Trạng thái">
          <Select
            value={values.status}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                status: event.target.value as AccountStatus,
              }))
            }
          >
            {Object.entries(statusLabels).map(([key, label]) => (
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
            <span className="text-xs text-muted-foreground">
              {" "}
              — không thể bỏ quyền của quản trị viên cuối cùng
            </span>
          </span>
        </label>
        {values.status === "LOCKED" && (
          <Field label="Lý do khóa" error={errors.lockedReason}>
            <Input
              value={values.lockedReason}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  lockedReason: event.target.value,
                }))
              }
              maxLength={500}
            />
          </Field>
        )}
        <Field label="Người thực hiện" error={errors.actorName}>
          <Input
            value={values.actorName}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                actorName: event.target.value,
              }))
            }
            maxLength={200}
            required
            aria-invalid={Boolean(errors.actorName)}
          />
        </Field>
        <Field label="Lý do thay đổi" error={errors.reason}>
          <Textarea
            value={values.reason}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                reason: event.target.value,
              }))
            }
            rows={2}
            maxLength={500}
          />
        </Field>
      </div>
      <footer className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Hủy
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Đang lưu…" : "Lưu quyền truy cập"}
        </Button>
      </footer>
    </form>
  );
}
