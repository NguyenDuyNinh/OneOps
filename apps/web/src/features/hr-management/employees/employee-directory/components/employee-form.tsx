"use client";
import { useState } from "react";
import type { z } from "zod";
import {
  employeeInput,
  type EmployeeDto,
  type Status,
} from "@/features/hr-management/employees/employee-directory/types";
import { client } from "@/features/hr-management/employees/employee-directory/api/client";
import { employeesChanged } from "@/features/hr-management/employees/employee-directory/hooks/use-employees";
import { statusLabels } from "@/features/hr-management/employees/employee-directory/constants";
import { useWorkspace } from "@/features/hr-management/employees/employee-directory/components/primitives/workspace";
import { Button } from "@/features/hr-management/employees/employee-directory/components/primitives/button";
import {
  Input,
  Select,
  Textarea,
} from "@/features/hr-management/employees/employee-directory/components/primitives/forms";
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
  hint,
  children,
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
export function EmployeeForm({
  record,
  onClose,
}: {
  record?: EmployeeDto;
  onClose: () => void;
}) {
  const { notify } = useWorkspace();
  const [values, setValues] = useState({
    code: record?.code ?? "",
    fullName: record?.fullName ?? "",
    email: record?.email ?? "",
    phone: record?.phone ?? "",
    jobTitle: record?.jobTitle ?? "",
    departmentName: record?.departmentName ?? "",
    teamName: record?.teamName ?? "",
    managerName: record?.managerName ?? "",
    startDate: record?.startDate ?? "",
    status: (record?.status ?? "ACTIVE") as Status,
    note: record?.note ?? "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [failure, setFailure] = useState("");
  const [pending, setPending] = useState(false);
  const set = (key: keyof typeof values) => (value: string) =>
    setValues((current) => ({ ...current, [key]: value }));
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (pending) return;
    const parsed = employeeInput.safeParse({
      ...values,
      startDate: values.startDate || null,
    });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setFailure("");
    setPending(true);
    try {
      if (record) await client.update(record, parsed.data);
      else await client.create(parsed.data);
      employeesChanged();
      notify(record ? "Đã cập nhật nhân viên." : "Đã thêm nhân viên.");
      onClose();
    } catch (error) {
      setFailure(
        error instanceof Error ? error.message : "Không thể lưu nhân viên",
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
        <Field label="Mã nhân viên" error={errors.code}>
          <Input
            value={values.code}
            onChange={(event) => set("code")(event.target.value)}
            maxLength={50}
            required
            aria-invalid={Boolean(errors.code)}
          />
        </Field>
        <Field label="Họ và tên" error={errors.fullName}>
          <Input
            value={values.fullName}
            onChange={(event) => set("fullName")(event.target.value)}
            maxLength={200}
            required
            aria-invalid={Boolean(errors.fullName)}
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
        <Field label="Điện thoại" error={errors.phone}>
          <Input
            value={values.phone}
            onChange={(event) => set("phone")(event.target.value)}
            maxLength={40}
          />
        </Field>
        <Field
          label="Chức danh"
          error={errors.jobTitle}
          hint="Chức danh chỉ dùng để lọc và phân công, không cấp quyền."
        >
          <Input
            value={values.jobTitle}
            onChange={(event) => set("jobTitle")(event.target.value)}
            maxLength={150}
          />
        </Field>
        <Field
          label="Quản lý trực tiếp"
          error={errors.managerName}
          hint="Liên kết tài khoản sẽ có ở giai đoạn Access Control."
        >
          <Input
            value={values.managerName}
            onChange={(event) => set("managerName")(event.target.value)}
            maxLength={150}
          />
        </Field>
        <Field label="Phòng ban" error={errors.departmentName}>
          <Input
            value={values.departmentName}
            onChange={(event) => set("departmentName")(event.target.value)}
            maxLength={200}
          />
        </Field>
        <Field label="Nhóm" error={errors.teamName}>
          <Input
            value={values.teamName}
            onChange={(event) => set("teamName")(event.target.value)}
            maxLength={200}
          />
        </Field>
        <Field label="Ngày vào làm" error={errors.startDate}>
          <Input
            type="date"
            value={values.startDate}
            onChange={(event) => set("startDate")(event.target.value)}
            aria-invalid={Boolean(errors.startDate)}
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
      </div>
      <Field label="Ghi chú" error={errors.note}>
        <Textarea
          value={values.note}
          onChange={(event) => set("note")(event.target.value)}
          rows={3}
          maxLength={2000}
        />
      </Field>
      <footer className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Hủy
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Đang lưu…" : record ? "Lưu thay đổi" : "Thêm nhân viên"}
        </Button>
      </footer>
    </form>
  );
}
