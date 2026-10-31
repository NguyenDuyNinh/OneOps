"use client";
import { useState } from "react";
import type { z } from "zod";
import {
  departmentInput,
  teamInput,
  type DepartmentDto,
  type Status,
  type TeamDto,
} from "@/features/hr-management/organization/departments-teams/types";
import { client } from "@/features/hr-management/organization/departments-teams/api/client";
import { organizationChanged } from "@/features/hr-management/organization/departments-teams/hooks/use-org";
import { statusLabels } from "@/features/hr-management/organization/departments-teams/constants";
import { useWorkspace } from "@/features/hr-management/organization/departments-teams/components/primitives/workspace";
import { Button } from "@/features/hr-management/organization/departments-teams/components/primitives/button";
import {
  Input,
  Select,
  Textarea,
} from "@/features/hr-management/organization/departments-teams/components/primitives/forms";
type FieldErrors = Record<string, string>;
function fieldErrors(error: z.ZodError): FieldErrors {
  const result: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    result[key] ??= issue.message;
  }
  return result;
}
function Field({
  label,
  error,
  children,
  hint,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium">{label}</span>
      {children}
      {hint && !error && (
        <span className="text-xs text-muted-foreground">{hint}</span>
      )}
      {error && (
        <span className="text-xs text-destructive" role="alert">
          {error}
        </span>
      )}
    </label>
  );
}
function StatusSelect({
  value,
  onChange,
}: {
  value: Status;
  onChange: (value: Status) => void;
}) {
  return (
    <Select
      value={value}
      onChange={(event) => onChange(event.target.value as Status)}
    >
      {Object.entries(statusLabels).map(([key, label]) => (
        <option key={key} value={key}>
          {label}
        </option>
      ))}
    </Select>
  );
}
export function DepartmentForm({
  record,
  onClose,
}: {
  record?: DepartmentDto;
  onClose: () => void;
}) {
  const { notify } = useWorkspace();
  const [values, setValues] = useState({
    code: record?.code ?? "",
    name: record?.name ?? "",
    managerName: record?.managerName ?? "",
    description: record?.description ?? "",
    status: (record?.status ?? "ACTIVE") as Status,
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [failure, setFailure] = useState("");
  const [pending, setPending] = useState(false);
  const set = (key: keyof typeof values) => (value: string) =>
    setValues((current) => ({ ...current, [key]: value }));
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (pending) return;
    const parsed = departmentInput.safeParse(values);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setFailure("");
    setPending(true);
    try {
      if (record) await client.updateDepartment(record, parsed.data);
      else await client.createDepartment(parsed.data);
      organizationChanged();
      notify(record ? "Đã cập nhật phòng ban." : "Đã tạo phòng ban.");
      onClose();
    } catch (error) {
      setFailure(
        error instanceof Error ? error.message : "Không thể lưu phòng ban",
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
      <Field label="Mã phòng ban" error={errors.code}>
        <Input
          value={values.code}
          onChange={(event) => set("code")(event.target.value)}
          maxLength={50}
          required
          aria-invalid={Boolean(errors.code)}
        />
      </Field>
      <Field label="Tên phòng ban" error={errors.name}>
        <Input
          value={values.name}
          onChange={(event) => set("name")(event.target.value)}
          maxLength={200}
          required
          aria-invalid={Boolean(errors.name)}
        />
      </Field>
      <Field
        label="Trưởng phòng"
        error={errors.managerName}
        hint="Nhập tên người phụ trách; liên kết tài khoản sẽ có ở giai đoạn Employee."
      >
        <Input
          value={values.managerName}
          onChange={(event) => set("managerName")(event.target.value)}
          maxLength={150}
        />
      </Field>
      <Field label="Trạng thái">
        <StatusSelect
          value={values.status}
          onChange={(value) =>
            setValues((current) => ({ ...current, status: value }))
          }
        />
      </Field>
      <Field label="Mô tả" error={errors.description}>
        <Textarea
          value={values.description}
          onChange={(event) => set("description")(event.target.value)}
          rows={3}
          maxLength={2000}
        />
      </Field>
      <footer className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Hủy
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Đang lưu…" : record ? "Lưu thay đổi" : "Tạo phòng ban"}
        </Button>
      </footer>
    </form>
  );
}
export function TeamForm({
  departmentId,
  record,
  onClose,
}: {
  departmentId: string;
  record?: TeamDto;
  onClose: () => void;
}) {
  const { notify } = useWorkspace();
  const [values, setValues] = useState({
    departmentId: record?.departmentId ?? departmentId,
    code: record?.code ?? "",
    name: record?.name ?? "",
    managerName: record?.managerName ?? "",
    description: record?.description ?? "",
    status: (record?.status ?? "ACTIVE") as Status,
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [failure, setFailure] = useState("");
  const [pending, setPending] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (pending) return;
    const parsed = teamInput.safeParse(values);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setFailure("");
    setPending(true);
    try {
      if (record) await client.updateTeam(record, parsed.data);
      else await client.createTeam(parsed.data);
      organizationChanged();
      notify(record ? "Đã cập nhật nhóm." : "Đã tạo nhóm.");
      onClose();
    } catch (error) {
      setFailure(error instanceof Error ? error.message : "Không thể lưu nhóm");
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
      <Field label="Mã nhóm" error={errors.code}>
        <Input
          value={values.code}
          onChange={(event) =>
            setValues((current) => ({ ...current, code: event.target.value }))
          }
          maxLength={50}
          required
          aria-invalid={Boolean(errors.code)}
        />
      </Field>
      <Field label="Tên nhóm" error={errors.name}>
        <Input
          value={values.name}
          onChange={(event) =>
            setValues((current) => ({ ...current, name: event.target.value }))
          }
          maxLength={200}
          required
          aria-invalid={Boolean(errors.name)}
        />
      </Field>
      <Field label="Trưởng nhóm" error={errors.managerName}>
        <Input
          value={values.managerName}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              managerName: event.target.value,
            }))
          }
          maxLength={150}
        />
      </Field>
      <Field label="Trạng thái">
        <StatusSelect
          value={values.status}
          onChange={(value) =>
            setValues((current) => ({ ...current, status: value }))
          }
        />
      </Field>
      <Field label="Mô tả" error={errors.description}>
        <Textarea
          value={values.description}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              description: event.target.value,
            }))
          }
          rows={3}
          maxLength={2000}
        />
      </Field>
      <footer className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Hủy
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Đang lưu…" : record ? "Lưu thay đổi" : "Tạo nhóm"}
        </Button>
      </footer>
    </form>
  );
}
