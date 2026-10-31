"use client";
import { useState } from "react";
import type { z } from "zod";
import {
  gradeInput,
  positionInput,
  type GradeDto,
  type PositionDto,
  type Status,
} from "@/features/hr-management/organization/positions-grades/types";
import { client } from "@/features/hr-management/organization/positions-grades/api/client";
import { positionsChanged } from "@/features/hr-management/organization/positions-grades/hooks/use-positions";
import { statusLabels } from "@/features/hr-management/organization/positions-grades/constants";
import { useWorkspace } from "@/features/hr-management/organization/positions-grades/components/primitives/workspace";
import { Button } from "@/features/hr-management/organization/positions-grades/components/primitives/button";
import {
  Input,
  Select,
  Textarea,
} from "@/features/hr-management/organization/positions-grades/components/primitives/forms";
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
export function PositionForm({
  record,
  onClose,
}: {
  record?: PositionDto;
  onClose: () => void;
}) {
  const { notify } = useWorkspace();
  const [values, setValues] = useState({
    code: record?.code ?? "",
    name: record?.name ?? "",
    description: record?.description ?? "",
    status: (record?.status ?? "ACTIVE") as Status,
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [failure, setFailure] = useState("");
  const [pending, setPending] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (pending) return;
    const parsed = positionInput.safeParse(values);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setFailure("");
    setPending(true);
    try {
      if (record) await client.updatePosition(record, parsed.data);
      else await client.createPosition(parsed.data);
      positionsChanged();
      notify(record ? "Đã cập nhật chức danh." : "Đã tạo chức danh.");
      onClose();
    } catch (error) {
      setFailure(
        error instanceof Error ? error.message : "Không thể lưu chức danh",
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
      <Field label="Mã chức danh" error={errors.code}>
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
      <Field label="Tên chức danh" error={errors.name}>
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
      <Field
        label="Trạng thái"
        hint="Chức danh không tham gia bất kỳ điều kiện cấp quyền nào."
      >
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
          {pending ? "Đang lưu…" : record ? "Lưu thay đổi" : "Tạo chức danh"}
        </Button>
      </footer>
    </form>
  );
}
export function GradeForm({
  positions,
  defaultPositionId,
  record,
  onClose,
}: {
  positions: PositionDto[];
  defaultPositionId?: string;
  record?: GradeDto;
  onClose: () => void;
}) {
  const { notify } = useWorkspace();
  const [values, setValues] = useState({
    code: record?.code ?? "",
    name: record?.name ?? "",
    rank: record?.rank ?? 1,
    description: record?.description ?? "",
    status: (record?.status ?? "ACTIVE") as Status,
    positionId: record?.positionId ?? defaultPositionId ?? "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [failure, setFailure] = useState("");
  const [pending, setPending] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (pending) return;
    const parsed = gradeInput.safeParse({
      ...values,
      positionId: values.positionId || null,
    });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setFailure("");
    setPending(true);
    try {
      if (record) await client.updateGrade(record, parsed.data);
      else await client.createGrade(parsed.data);
      positionsChanged();
      notify(record ? "Đã cập nhật cấp bậc." : "Đã tạo cấp bậc.");
      onClose();
    } catch (error) {
      setFailure(
        error instanceof Error ? error.message : "Không thể lưu cấp bậc",
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
      <Field label="Mã cấp bậc" error={errors.code}>
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
      <Field label="Tên cấp bậc" error={errors.name}>
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
      <Field
        label="Thứ tự"
        error={errors.rank}
        hint="Số nhỏ hơn đứng trước trong danh sách."
      >
        <Input
          type="number"
          min={1}
          max={99}
          value={values.rank}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              rank: Number(event.target.value),
            }))
          }
          aria-invalid={Boolean(errors.rank)}
        />
      </Field>
      <Field
        label="Chức danh"
        error={errors.positionId}
        hint="Cấp bậc chỉ phân loại hiển thị; có thể để trống."
      >
        <Select
          value={values.positionId}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              positionId: event.target.value,
            }))
          }
        >
          <option value="">Không gắn chức danh</option>
          {positions.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </Select>
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
          {pending ? "Đang lưu…" : record ? "Lưu thay đổi" : "Tạo cấp bậc"}
        </Button>
      </footer>
    </form>
  );
}
