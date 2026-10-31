"use client";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  actionLabels,
  assignableActions,
  definition,
  groupLabels,
  groupOrder,
  messages,
  roleLabels,
  roleOrder,
} from "@/features/tenant-system/access-control/roles-permissions/constants";
import { usePermissions } from "@/features/tenant-system/access-control/roles-permissions/hooks/use-permissions";
import { client } from "@/features/tenant-system/access-control/roles-permissions/api/client";
import { Button } from "@/features/tenant-system/access-control/roles-permissions/components/primitives/button";
import {
  Input,
  Select,
} from "@/features/tenant-system/access-control/roles-permissions/components/primitives/forms";
import { Badge } from "@/features/tenant-system/access-control/roles-permissions/components/primitives/foundations";
import type {
  FeatureGroup,
  MatrixRow,
  PermissionAction,
  PermissionRole,
} from "@/features/tenant-system/access-control/roles-permissions/types";

const keyOf = (row: MatrixRow) => `${row.featureKey}|${row.role}`;
const sameActions = (left: readonly string[], right: readonly string[]) =>
  left.length === right.length &&
  left.every((value, index) => value === right[index]);
const orderActions = (actions: readonly PermissionAction[]) =>
  assignableActions.filter((action) => actions.includes(action));
const formatTime = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

interface FeatureRow {
  key: string;
  label: string;
  group: FeatureGroup;
  rows: Record<PermissionRole, MatrixRow>;
}

export function ModulePage() {
  const params = useSearchParams();
  const { me, matrix, history, loading, denied, error, reload, apply } =
    usePermissions();
  const initialGroup = params.get("group");
  const [group, setGroup] = useState<FeatureGroup | "ALL">(
    groupOrder.includes(initialGroup as FeatureGroup)
      ? (initialGroup as FeatureGroup)
      : "ALL",
  );
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<Record<string, PermissionAction[]>>({});
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [saveError, setSaveError] = useState("");
  const editable = Boolean(me?.canManage);
  const features = useMemo(() => {
    const map = new Map<string, FeatureRow>();
    for (const row of matrix?.items ?? []) {
      const entry = map.get(row.featureKey) ?? {
        key: row.featureKey,
        label: row.label,
        group: row.group,
        rows: {} as Record<PermissionRole, MatrixRow>,
      };
      entry.rows[row.role] = row;
      map.set(row.featureKey, entry);
    }
    const term = query.trim().toLocaleLowerCase("vi");
    return [...map.values()].filter(
      (feature) =>
        (group === "ALL" || feature.group === group) &&
        (!term ||
          `${feature.label} ${feature.key}`
            .toLocaleLowerCase("vi")
            .includes(term)),
    );
  }, [matrix, group, query]);
  const changed = (matrix?.items ?? []).filter((row) => {
    const next = draft[keyOf(row)];
    return next && !sameActions(next, row.actions);
  });
  const customCells = (matrix?.items ?? []).filter(
    (row) => !row.isDefault,
  ).length;
  const actionsOf = (row: MatrixRow) =>
    draft[keyOf(row)] ?? orderActions(row.actions);
  const toggle = (row: MatrixRow, action: PermissionAction) => {
    const current = actionsOf(row);
    const next = current.includes(action)
      ? current.filter((value) => value !== action)
      : [...current, action];
    setDraft({ ...draft, [keyOf(row)]: orderActions(next) });
    setNotice("");
  };
  const discard = () => {
    setDraft({});
    setReason("");
    setNotice("");
    setSaveError("");
  };
  const save = async () => {
    if (!changed.length) {
      setNotice(messages.noChange);
      return;
    }
    setSaving(true);
    setSaveError("");
    setNotice("");
    try {
      const saved = await client.save({
        items: changed.map((row) => ({
          featureKey: row.featureKey,
          role: row.role,
          actions: actionsOf(row),
          version: row.version,
        })),
        reason,
      });
      apply(saved);
      setDraft({});
      setReason("");
      setNotice(messages.saved);
      reload();
    } catch (failure) {
      setSaveError(
        failure instanceof Error
          ? failure.message
          : `${messages.save}. Vui lòng thử lại.`,
      );
    } finally {
      setSaving(false);
    }
  };
  const cell = (row: MatrixRow) => (
    <div
      role="group"
      aria-label={`${row.label} của ${roleLabels[row.role]}`}
      className="flex flex-wrap items-center gap-x-3 gap-y-1"
    >
      {assignableActions.map((action) => {
        const checked = actionsOf(row).includes(action);
        return (
          <label
            key={action}
            className={`flex items-center gap-1 text-xs ${editable ? "cursor-pointer" : "text-muted-foreground"}`}
          >
            <input
              type="checkbox"
              className="size-4 accent-primary"
              checked={checked}
              disabled={!editable}
              aria-label={`${actionLabels[action]} ${row.label} của ${roleLabels[row.role]}`}
              onChange={() => toggle(row, action)}
            />
            {actionLabels[action]}
          </label>
        );
      })}
    </div>
  );
  const customTag = (feature: FeatureRow) => {
    const rows = roleOrder.map((role) => feature.rows[role]).filter(Boolean);
    const custom = rows.some((row) => !row.isDefault || draft[keyOf(row)]);
    return (
      <Badge variant={custom ? "brand" : "neutral"}>
        {custom ? "Tùy chỉnh" : "Mặc định"}
      </Badge>
    );
  };
  if (denied)
    return (
      <div className="module-view">
        <section className="records-panel">
          <h1>{definition.title}</h1>
          <div role="alert" className="error">
            {messages.denied}
          </div>
          <p className="text-sm text-muted-foreground">
            Vai trò hiện tại: {me ? roleLabels[me.role] : "—"}. Liên hệ quản trị
            hệ thống nếu bạn cần xem ma trận quyền.
          </p>
        </section>
      </div>
    );
  return (
    <div className="module-view">
      <section className="records-panel">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1>{definition.title}</h1>
            <p>
              Chỉ có hai vai trò Nhân viên và Quản lý. Quyền quản trị ma trận
              thuộc quản trị hệ thống và không thể gán qua ma trận.
            </p>
          </div>
          <Badge variant={editable ? "success" : "warning"} dot>
            {editable ? "Có thể sửa" : "Chỉ xem"}
          </Badge>
        </div>

        {me && !editable && (
          <p role="status" className="text-sm text-muted-foreground">
            {messages.readOnly}
          </p>
        )}

        <div className="grid gap-2 sm:grid-cols-3">
          <div className="rounded-panel border border-border bg-surface p-3">
            <p className="text-xs text-muted-foreground">Chức năng</p>
            <p className="text-2xl font-semibold">
              {(matrix?.items.length ?? 0) / roleOrder.length || 0}
            </p>
          </div>
          <div className="rounded-panel border border-border bg-surface p-3">
            <p className="text-xs text-muted-foreground">Ô đã tùy chỉnh</p>
            <p className="text-2xl font-semibold">{customCells}</p>
          </div>
          <div className="rounded-panel border border-border bg-surface p-3">
            <p className="text-xs text-muted-foreground">Thay đổi chưa lưu</p>
            <p className="text-2xl font-semibold">{changed.length}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Input
            aria-label="Tìm chức năng"
            placeholder="Tìm theo tên chức năng hoặc đường dẫn…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Select
            aria-label="Lọc nhóm chức năng"
            value={group}
            onChange={(event) =>
              setGroup(event.target.value as FeatureGroup | "ALL")
            }
          >
            <option value="ALL">Tất cả nhóm</option>
            {groupOrder.map((value) => (
              <option key={value} value={value}>
                {groupLabels[value]}
              </option>
            ))}
          </Select>
          <span className="text-sm text-muted-foreground">
            {features.length} chức năng
          </span>
        </div>

        {error && (
          <div role="alert" className="error">
            {error}
            <Button variant="ghost" onClick={reload}>
              Thử lại
            </Button>
          </div>
        )}

        {loading ? (
          <p role="status" className="text-sm text-muted-foreground">
            Đang tải ma trận quyền…
          </p>
        ) : !features.length ? (
          <div className="rounded-panel border border-border bg-surface p-4">
            <h2 className="text-sm font-semibold">
              {matrix?.items.length
                ? "Không có chức năng phù hợp"
                : messages.empty}
            </h2>
            <p className="text-sm text-muted-foreground">
              {matrix?.items.length
                ? "Xóa hoặc đổi điều kiện lọc để xem lại."
                : "Danh mục quyền được đồng bộ với cấu trúc chức năng đã duyệt."}
            </p>
          </div>
        ) : (
          <>
            <ul className="flex flex-col gap-2 sm:hidden">
              {features.map((feature) => (
                <li
                  key={feature.key}
                  className="flex flex-col gap-2 rounded-panel border border-border bg-surface p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground">
                        {feature.label}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {feature.key}
                      </p>
                    </div>
                    {customTag(feature)}
                  </div>
                  {roleOrder.map((role) => (
                    <div key={role} className="flex flex-col gap-1">
                      <p className="text-xs font-semibold text-foreground">
                        {roleLabels[role]}
                      </p>
                      {feature.rows[role] && cell(feature.rows[role])}
                    </div>
                  ))}
                </li>
              ))}
            </ul>
            <div className="relative hidden overflow-x-auto sm:block">
              <table className="w-full border-collapse text-sm">
                <caption className="sr-only">
                  Ma trận quyền theo chức năng và vai trò
                </caption>
                <thead>
                  <tr className="text-left text-xs uppercase text-muted-foreground">
                    <th scope="col" className="px-2 py-2 font-medium">
                      Chức năng
                    </th>
                    <th scope="col" className="px-2 py-2 font-medium">
                      {roleLabels.EMPLOYEE}
                    </th>
                    <th scope="col" className="px-2 py-2 font-medium">
                      {roleLabels.MANAGER}
                    </th>
                    <th scope="col" className="px-2 py-2 font-medium">
                      Nguồn
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {features.map((feature) => (
                    <tr key={feature.key} className="border-t border-border">
                      <th scope="row" className="px-2 py-3 text-left align-top">
                        <span className="block font-semibold text-foreground">
                          {feature.label}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {feature.key}
                        </span>
                        <span className="mt-1 block text-xs text-muted-foreground">
                          {groupLabels[feature.group]}
                        </span>
                      </th>
                      {roleOrder.map((role) => (
                        <td key={role} className="px-2 py-3 align-top">
                          {feature.rows[role] && cell(feature.rows[role])}
                        </td>
                      ))}
                      <td className="px-2 py-3 align-top">
                        {customTag(feature)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <div className="flex flex-wrap items-end gap-2 rounded-panel border border-border bg-surface p-3">
          <div className="min-w-0 flex-1">
            <label
              htmlFor="permission-reason"
              className="mb-1 block text-xs text-muted-foreground"
            >
              Lý do thay đổi
            </label>
            <Input
              id="permission-reason"
              aria-label="Lý do thay đổi"
              placeholder="Ví dụ: thu hẹp quyền tạo đề xuất cho nhân viên"
              value={reason}
              maxLength={500}
              disabled={!editable || !changed.length}
              onChange={(event) => setReason(event.target.value)}
            />
          </div>
          <Button
            onClick={() => void save()}
            loading={saving}
            disabled={!editable || !changed.length}
          >
            Lưu thay đổi
          </Button>
          <Button
            variant="secondary"
            onClick={discard}
            disabled={!changed.length && !reason}
          >
            Bỏ thay đổi
          </Button>
        </div>
        {notice && (
          <p role="status" className="text-sm text-muted-foreground">
            {notice}
          </p>
        )}
        {saveError && (
          <p role="alert" className="error">
            {saveError}
          </p>
        )}

        <details className="rounded-panel border border-border bg-surface p-3">
          <summary className="cursor-pointer text-sm font-semibold">
            Lịch sử thay đổi
          </summary>
          {history.length ? (
            <ul className="mt-2 flex flex-col gap-2 text-sm">
              {history.slice(0, 20).map((item) => (
                <li key={item.id} className="border-t border-border pt-2">
                  <p className="font-medium text-foreground">
                    {item.featureKey} · {roleLabels[item.role]}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatTime(item.createdAt)} · {item.actorName} ·{" "}
                    {item.reason}
                  </p>
                  <p className="text-xs">
                    {item.fromActions.join(", ") || "(không quyền)"} →{" "}
                    {item.toActions.join(", ") || "(không quyền)"}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              {messages.history}
            </p>
          )}
        </details>

        <p className="text-xs text-muted-foreground">
          Ma trận là mặc định của hệ thống cho tới khi được tùy chỉnh; quản trị
          hệ thống luôn có đủ quyền và mọi thay đổi đều được ghi lịch sử.
        </p>
      </section>
    </div>
  );
}
