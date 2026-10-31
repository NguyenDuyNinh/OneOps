"use client";
import { useState } from "react";
import type {
  MilestoneDto,
  Reference,
} from "@/features/work-management/projects/milestones-qa/types";
import {
  createSchema,
  INITIAL_MILESTONE_STATUSES,
  MILESTONE_MOVES,
  updateSchema,
} from "@/features/work-management/projects/milestones-qa/types";
import {
  officeToday,
  statusLabel,
} from "@/features/work-management/projects/milestones-qa/constants";
import { client } from "@/features/work-management/projects/milestones-qa/api/client";
import { recordsChanged } from "@/features/work-management/projects/milestones-qa/hooks/use-records";
import { useWorkspace } from "@/features/work-management/projects/milestones-qa/components/primitives/workspace";
import { Button } from "@/features/work-management/projects/milestones-qa/components/primitives/button";
import {
  Input,
  Select,
  Textarea,
} from "@/features/work-management/projects/milestones-qa/components/primitives/forms";
import styles from "@/features/work-management/projects/milestones-qa/components/styles.module.css";

const firstIssue = (issues: { message: string }[]) =>
  issues[0]?.message ?? "Dữ liệu chưa hợp lệ.";

export function RecordForm({
  record,
  projects,
  onClose,
}: {
  record?: MilestoneDto;
  projects: readonly Reference[];
  onClose: () => void;
}) {
  const { notify } = useWorkspace();
  const [values, setValues] = useState({
    projectId: record?.projectId ?? projects[0]?.id ?? "",
    name: record?.name ?? "",
    targetDate: record?.targetDate ?? officeToday(),
    contractRef: record?.contractRef ?? "",
    description: record?.description ?? "",
    status: record?.status ?? INITIAL_MILESTONE_STATUSES[0],
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const statusOptions = record
    ? [record.status, ...MILESTONE_MOVES[record.status]]
    : INITIAL_MILESTONE_STATUSES;

  function set<K extends keyof typeof values>(
    key: K,
    value: (typeof values)[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setError("");
    const payload = {
      name: values.name,
      description: values.description,
      targetDate: values.targetDate,
      contractRef: values.contractRef,
      status: values.status,
    };
    const parsed = record
      ? updateSchema.safeParse({ ...payload, version: record.version })
      : createSchema.safeParse({ ...payload, projectId: values.projectId });
    if (!parsed.success) {
      setError(firstIssue(parsed.error.issues));
      return;
    }
    setPending(true);
    try {
      if (record) await client.update(record, payload);
      else
        await client.create(
          createSchema.parse({ ...payload, projectId: values.projectId }),
        );
      recordsChanged();
      notify(record ? "Đã cập nhật mốc." : "Đã tạo mốc mới.");
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể lưu mốc");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="form-body" onSubmit={submit} noValidate>
      {!record && (
        <label className="w-full">
          Dự án
          <Select
            name="projectId"
            required
            value={values.projectId}
            onChange={(event) => set("projectId", event.target.value)}
          >
            <option value="">Chọn dự án…</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.code} · {project.name}
              </option>
            ))}
          </Select>
        </label>
      )}
      <label className="w-full">
        Tên mốc
        <Input
          name="name"
          required
          maxLength={300}
          value={values.name}
          onChange={(event) => set("name", event.target.value)}
        />
      </label>
      <div className={styles.formRow}>
        <label>
          Ngày đích
          <Input
            name="targetDate"
            type="date"
            required
            value={values.targetDate}
            onChange={(event) => set("targetDate", event.target.value)}
          />
        </label>
        <label>
          Trạng thái
          <Select
            name="status"
            value={values.status}
            onChange={(event) =>
              set("status", event.target.value as typeof values.status)
            }
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {statusLabel[option]}
              </option>
            ))}
          </Select>
        </label>
      </div>
      <label className="w-full">
        Tham chiếu hợp đồng
        <Input
          name="contractRef"
          maxLength={200}
          value={values.contractRef}
          onChange={(event) => set("contractRef", event.target.value)}
        />
      </label>
      <label className="w-full">
        Mô tả
        <Textarea
          name="description"
          maxLength={2000}
          value={values.description}
          onChange={(event) => set("description", event.target.value)}
        />
      </label>
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
      <footer>
        <Button variant="secondary" onClick={onClose} disabled={pending}>
          Hủy
        </Button>
        <Button type="submit" loading={pending}>
          {record ? "Lưu thay đổi" : "Tạo mốc"}
        </Button>
      </footer>
    </form>
  );
}
