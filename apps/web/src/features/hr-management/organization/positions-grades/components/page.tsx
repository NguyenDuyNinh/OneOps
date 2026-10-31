"use client";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type {
  GradeDto,
  PositionDto,
  Status,
} from "@/features/hr-management/organization/positions-grades/types";
import {
  definition,
  statusLabels,
} from "@/features/hr-management/organization/positions-grades/constants";
import { client } from "@/features/hr-management/organization/positions-grades/api/client";
import {
  useGrades,
  usePositions,
} from "@/features/hr-management/organization/positions-grades/hooks/use-positions";
import {
  Modal,
  useWorkspace,
} from "@/features/hr-management/organization/positions-grades/components/primitives/workspace";
import { Button } from "@/features/hr-management/organization/positions-grades/components/primitives/button";
import {
  Input,
  Select,
} from "@/features/hr-management/organization/positions-grades/components/primitives/forms";
import { Badge } from "@/features/hr-management/organization/positions-grades/components/primitives/foundations";
import {
  GradeForm,
  PositionForm,
} from "@/features/hr-management/organization/positions-grades/components/position-form";
type Target =
  | { kind: "position"; record: PositionDto }
  | { kind: "grade"; record: GradeDto };
type Scope = "POSITION" | "ALL";
const isActive = (status: Status) => status === "ACTIVE";
function StatusBadge({ status }: { status: Status }) {
  return (
    <Badge variant={isActive(status) ? "success" : "neutral"} dot>
      {statusLabels[status]}
    </Badge>
  );
}
export function ModulePage() {
  const params = useSearchParams();
  const { notify } = useWorkspace();
  const { positions, loading, error, reload } = usePositions();
  const [chosenId, setChosenId] = useState("");
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<Scope>("POSITION");
  const [status, setStatus] = useState<Status | "ALL">(
    params.get("status") === "ACTIVE" || params.get("status") === "INACTIVE"
      ? (params.get("status") as Status)
      : "ALL",
  );
  const [creating, setCreating] = useState<"position" | "grade" | null>(null);
  const [editingPosition, setEditingPosition] = useState<PositionDto | null>(
    null,
  );
  const [editingGrade, setEditingGrade] = useState<GradeDto | null>(null);
  const [target, setTarget] = useState<Target | null>(null);
  const [actionError, setActionError] = useState("");
  const [pending, setPending] = useState(false);
  const term = query.trim().toLocaleLowerCase("vi");
  const filteredPositions = useMemo(
    () =>
      positions.filter(
        (item) =>
          (status === "ALL" || item.status === status) &&
          (!term ||
            `${item.code} ${item.name} ${item.description}`
              .toLocaleLowerCase("vi")
              .includes(term)),
      ),
    [positions, status, term],
  );
  const selectedId = useMemo(() => {
    if (chosenId && positions.some((item) => item.id === chosenId)) {
      return chosenId;
    }
    return filteredPositions[0]?.id ?? "";
  }, [chosenId, positions, filteredPositions]);
  const selected = positions.find((item) => item.id === selectedId) ?? null;
  const gradesState = useGrades(
    scope === "ALL" ? null : (selected?.id ?? null),
  );
  const positionNames = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of positions) map.set(item.id, item.name);
    return map;
  }, [positions]);
  const visibleGrades = useMemo(
    () =>
      gradesState.grades.filter(
        (item) =>
          (status === "ALL" || item.status === status) &&
          (!term ||
            `${item.code} ${item.name} ${item.description}`
              .toLocaleLowerCase("vi")
              .includes(term)),
      ),
    [gradesState.grades, status, term],
  );
  async function confirmToggle() {
    if (!target || pending) return;
    setPending(true);
    setActionError("");
    try {
      const next: Status = isActive(target.record.status)
        ? "INACTIVE"
        : "ACTIVE";
      if (target.kind === "position")
        await client.updatePosition(target.record, { status: next });
      else await client.updateGrade(target.record, { status: next });
      setTarget(null);
      notify(
        next === "ACTIVE"
          ? "Đã kích hoạt lại danh mục."
          : "Đã ngừng sử dụng danh mục.",
      );
      reload();
      gradesState.reload();
    } catch (cause) {
      setActionError(
        cause instanceof Error ? cause.message : "Không thể đổi trạng thái",
      );
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="module-view">
      <section className="records-panel">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1>{definition.title}</h1>
            <p>
              Danh mục chức danh và cấp bậc dùng để phân loại nhân sự và bộ lọc
              công việc; không cấp bất kỳ quyền truy cập nào.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setCreating("position")}>
              Tạo chức danh
            </Button>
            <Button variant="secondary" onClick={() => setCreating("grade")}>
              Tạo cấp bậc
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Input
            aria-label="Tìm chức danh hoặc cấp bậc"
            placeholder="Tìm theo mã, tên, mô tả…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Select
            aria-label="Lọc trạng thái"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as Status | "ALL")
            }
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">{statusLabels.ACTIVE}</option>
            <option value="INACTIVE">{statusLabels.INACTIVE}</option>
          </Select>
          <Select
            aria-label="Phạm vi cấp bậc"
            value={scope}
            onChange={(event) => setScope(event.target.value as Scope)}
          >
            <option value="POSITION">Cấp bậc của chức danh đang chọn</option>
            <option value="ALL">Tất cả cấp bậc</option>
          </Select>
          <span className="text-sm text-muted-foreground">
            {filteredPositions.length} chức danh · {visibleGrades.length} cấp
            bậc
          </span>
        </div>

        {(error || actionError) && (
          <div role="alert" className="error">
            {error || actionError}
            <Button variant="ghost" onClick={reload}>
              Thử lại
            </Button>
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          <section
            aria-labelledby="positions-heading"
            className="flex flex-col gap-2"
          >
            <h2 id="positions-heading" className="text-sm font-semibold">
              Chức danh
            </h2>
            {loading ? (
              <p role="status" className="text-sm text-muted-foreground">
                Đang tải chức danh…
              </p>
            ) : !filteredPositions.length ? (
              <div className="rounded-panel border border-border bg-surface p-4">
                <h3 className="text-sm font-semibold">
                  {positions.length
                    ? "Không có chức danh phù hợp"
                    : "Chưa có chức danh"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {positions.length
                    ? "Xóa hoặc đổi điều kiện lọc để xem lại."
                    : "Tạo chức danh đầu tiên để phân loại nhân sự."}
                </p>
                <Button size="sm" onClick={() => setCreating("position")}>
                  Tạo chức danh
                </Button>
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {filteredPositions.map((item) => (
                  <li key={item.id}>
                    <div
                      className={`flex flex-col gap-2 rounded-panel border p-3 ${
                        item.id === selectedId
                          ? "border-primary bg-accent"
                          : "border-border bg-surface"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <button
                          type="button"
                          className="text-left"
                          aria-current={item.id === selectedId}
                          onClick={() => setChosenId(item.id)}
                        >
                          <span className="block text-sm font-semibold text-foreground">
                            {item.name}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {item.code} · {item.gradeCount} cấp bậc
                          </span>
                        </button>
                        <StatusBadge status={item.status} />
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="truncate text-xs text-muted-foreground">
                          {item.description || "Chưa có mô tả"}
                        </span>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingPosition(item)}
                          >
                            Sửa
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setTarget({ kind: "position", record: item })
                            }
                          >
                            {isActive(item.status) ? "Ngừng" : "Kích hoạt"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section
            aria-labelledby="grades-heading"
            className="flex flex-col gap-2"
          >
            <h2 id="grades-heading" className="text-sm font-semibold">
              Cấp bậc
              {scope === "POSITION" && selected
                ? ` của ${selected.name}`
                : " (toàn bộ)"}
            </h2>
            {scope === "POSITION" && !selected ? (
              <p className="text-sm text-muted-foreground">
                Chọn một chức danh hoặc chuyển phạm vi sang “Tất cả cấp bậc”.
              </p>
            ) : gradesState.loading ? (
              <p role="status" className="text-sm text-muted-foreground">
                Đang tải cấp bậc…
              </p>
            ) : gradesState.error ? (
              <div role="alert" className="error">
                {gradesState.error}
                <Button variant="ghost" onClick={gradesState.reload}>
                  Thử lại
                </Button>
              </div>
            ) : !visibleGrades.length ? (
              <div className="rounded-panel border border-border bg-surface p-4">
                <h3 className="text-sm font-semibold">
                  {gradesState.grades.length
                    ? "Không có cấp bậc phù hợp"
                    : "Chưa có cấp bậc"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {gradesState.grades.length
                    ? "Xóa hoặc đổi điều kiện lọc để xem lại."
                    : "Cấp bậc giúp nhóm nhân sự theo thứ tự hiển thị."}
                </p>
                <Button size="sm" onClick={() => setCreating("grade")}>
                  Tạo cấp bậc
                </Button>
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {visibleGrades.map((item) => (
                  <li key={item.id}>
                    <div className="flex flex-col gap-2 rounded-panel border border-border bg-surface p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="block text-sm font-semibold text-foreground">
                            {item.name}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {item.code}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="brand">Bậc {item.rank}</Badge>
                          <StatusBadge status={item.status} />
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="truncate text-xs text-muted-foreground">
                          {item.positionId
                            ? (positionNames.get(item.positionId) ??
                              "Chức danh không còn trong danh sách")
                            : "Chưa gắn chức danh"}
                        </span>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingGrade(item)}
                          >
                            Sửa
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setTarget({ kind: "grade", record: item })
                            }
                          >
                            {isActive(item.status) ? "Ngừng" : "Kích hoạt"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <p className="text-xs text-muted-foreground">
          Danh mục đã được dùng không bị xóa cứng; trạng thái “Ngừng hoạt động”
          chỉ chặn gán mới và giữ nguyên dữ liệu nhân sự hiện có.
        </p>
      </section>

      {creating === "position" && (
        <Modal title="Tạo chức danh" onClose={() => setCreating(null)}>
          <PositionForm onClose={() => setCreating(null)} />
        </Modal>
      )}
      {creating === "grade" && (
        <Modal title="Tạo cấp bậc" onClose={() => setCreating(null)}>
          <GradeForm
            positions={positions}
            defaultPositionId={scope === "POSITION" ? selected?.id : undefined}
            onClose={() => setCreating(null)}
          />
        </Modal>
      )}
      {editingPosition && (
        <Modal
          title={`Chỉnh sửa ${editingPosition.name}`}
          onClose={() => setEditingPosition(null)}
        >
          <PositionForm
            record={editingPosition}
            onClose={() => setEditingPosition(null)}
          />
        </Modal>
      )}
      {editingGrade && (
        <Modal
          title={`Chỉnh sửa ${editingGrade.name}`}
          onClose={() => setEditingGrade(null)}
        >
          <GradeForm
            positions={positions}
            record={editingGrade}
            onClose={() => setEditingGrade(null)}
          />
        </Modal>
      )}
      {target && (
        <Modal
          title={
            isActive(target.record.status) ? "Ngừng sử dụng" : "Kích hoạt lại"
          }
          onClose={() => setTarget(null)}
        >
          <div className="flex flex-col gap-3">
            <p className="text-sm">
              {isActive(target.record.status)
                ? `“${target.record.name}” sẽ không còn trong danh sách chọn khi gán mới; nhân sự đã gán vẫn giữ nguyên.`
                : `“${target.record.name}” sẽ hoạt động trở lại cho việc gán mới.`}
            </p>
            {actionError && (
              <p className="error" role="alert">
                {actionError}
              </p>
            )}
          </div>
          <footer className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setTarget(null)}>
              Hủy
            </Button>
            <Button
              variant={
                isActive(target.record.status) ? "destructive" : "primary"
              }
              disabled={pending}
              onClick={() => void confirmToggle()}
            >
              {pending
                ? "Đang lưu…"
                : isActive(target.record.status)
                  ? "Ngừng sử dụng"
                  : "Kích hoạt"}
            </Button>
          </footer>
        </Modal>
      )}
    </div>
  );
}
