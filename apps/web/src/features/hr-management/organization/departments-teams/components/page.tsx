"use client";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type {
  DepartmentDto,
  Status,
  TeamDto,
} from "@/features/hr-management/organization/departments-teams/types";
import {
  definition,
  statusLabels,
} from "@/features/hr-management/organization/departments-teams/constants";
import { client } from "@/features/hr-management/organization/departments-teams/api/client";
import {
  useOrganization,
  useTeams,
} from "@/features/hr-management/organization/departments-teams/hooks/use-org";
import {
  Modal,
  useWorkspace,
} from "@/features/hr-management/organization/departments-teams/components/primitives/workspace";
import { Button } from "@/features/hr-management/organization/departments-teams/components/primitives/button";
import {
  Input,
  Select,
} from "@/features/hr-management/organization/departments-teams/components/primitives/forms";
import { Badge } from "@/features/hr-management/organization/departments-teams/components/primitives/foundations";
import {
  DepartmentForm,
  TeamForm,
} from "@/features/hr-management/organization/departments-teams/components/org-form";
type Target = { kind: "department" | "team"; record: DepartmentDto | TeamDto };
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
  const { departments, loading, error, reload } = useOrganization();
  const [chosenId, setChosenId] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<Status | "ALL">(
    params.get("status") === "ACTIVE" || params.get("status") === "INACTIVE"
      ? (params.get("status") as Status)
      : "ALL",
  );
  const [creating, setCreating] = useState<"department" | "team" | null>(null);
  const [editingDepartment, setEditingDepartment] =
    useState<DepartmentDto | null>(null);
  const [editingTeam, setEditingTeam] = useState<TeamDto | null>(null);
  const [target, setTarget] = useState<Target | null>(null);
  const [actionError, setActionError] = useState("");
  const [pending, setPending] = useState(false);
  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("vi");
    return departments.filter(
      (item) =>
        (status === "ALL" || item.status === status) &&
        (!term ||
          `${item.code} ${item.name} ${item.managerName} ${item.description}`
            .toLocaleLowerCase("vi")
            .includes(term)),
    );
  }, [departments, query, status]);
  const selectedId = useMemo(() => {
    if (chosenId && departments.some((item) => item.id === chosenId)) {
      return chosenId;
    }
    return filtered[0]?.id ?? "";
  }, [chosenId, departments, filtered]);
  const selected = departments.find((item) => item.id === selectedId) ?? null;
  const teamsState = useTeams(selectedId);
  const visibleTeams = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("vi");
    return teamsState.teams.filter(
      (item) =>
        (status === "ALL" || item.status === status) &&
        (!term ||
          `${item.code} ${item.name} ${item.managerName} ${item.description}`
            .toLocaleLowerCase("vi")
            .includes(term)),
    );
  }, [teamsState.teams, query, status]);
  const blockingTeams =
    target?.kind === "department" &&
    isActive((target.record as DepartmentDto).status) &&
    (target.record as DepartmentDto).activeTeamCount > 0;
  async function confirmToggle() {
    if (!target || pending) return;
    setPending(true);
    setActionError("");
    try {
      const next: Status = isActive(target.record.status)
        ? "INACTIVE"
        : "ACTIVE";
      if (target.kind === "department")
        await client.updateDepartment(target.record as DepartmentDto, {
          status: next,
        });
      else await client.updateTeam(target.record as TeamDto, { status: next });
      setTarget(null);
      notify(
        next === "ACTIVE"
          ? "Đã kích hoạt lại đơn vị."
          : "Đã ngừng hoạt động đơn vị.",
      );
      reload();
      teamsState.reload();
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
              Quản lý phòng ban và nhóm làm việc; phạm vi quản lý của mỗi đơn vị
              được dùng cho phân công công việc.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setCreating("department")}>
              Tạo phòng ban
            </Button>
            <Button
              variant="secondary"
              disabled={!selected}
              onClick={() => setCreating("team")}
            >
              Tạo nhóm
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Input
            aria-label="Tìm phòng ban hoặc nhóm"
            placeholder="Tìm theo mã, tên, người phụ trách…"
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
          <span className="text-sm text-muted-foreground">
            {filtered.length} phòng ban
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
            aria-labelledby="departments-heading"
            className="flex flex-col gap-2"
          >
            <h2 id="departments-heading" className="text-sm font-semibold">
              Phòng ban
            </h2>
            {loading ? (
              <p role="status" className="text-sm text-muted-foreground">
                Đang tải cơ cấu tổ chức…
              </p>
            ) : !filtered.length ? (
              <div className="rounded-panel border border-border bg-surface p-4">
                <h3 className="text-sm font-semibold">
                  {departments.length
                    ? "Không có phòng ban phù hợp"
                    : "Chưa có phòng ban"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {departments.length
                    ? "Xóa hoặc đổi điều kiện lọc để xem lại."
                    : "Tạo phòng ban đầu tiên để bắt đầu tổ chức nhân sự."}
                </p>
                <Button size="sm" onClick={() => setCreating("department")}>
                  Tạo phòng ban
                </Button>
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {filtered.map((item) => (
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
                            {item.code} · {item.teamCount} nhóm
                          </span>
                        </button>
                        <StatusBadge status={item.status} />
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs text-muted-foreground">
                          {item.managerName || "Chưa có trưởng phòng"}
                        </span>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingDepartment(item)}
                          >
                            Sửa
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setTarget({ kind: "department", record: item })
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
            aria-labelledby="teams-heading"
            className="flex flex-col gap-2"
          >
            <h2 id="teams-heading" className="text-sm font-semibold">
              Nhóm {selected ? `trong ${selected.name}` : ""}
            </h2>
            {!selected ? (
              <p className="text-sm text-muted-foreground">
                Chọn một phòng ban để xem nhóm.
              </p>
            ) : teamsState.loading ? (
              <p role="status" className="text-sm text-muted-foreground">
                Đang tải nhóm…
              </p>
            ) : teamsState.error ? (
              <div role="alert" className="error">
                {teamsState.error}
                <Button variant="ghost" onClick={teamsState.reload}>
                  Thử lại
                </Button>
              </div>
            ) : !visibleTeams.length ? (
              <div className="rounded-panel border border-border bg-surface p-4">
                <h3 className="text-sm font-semibold">
                  {teamsState.teams.length
                    ? "Không có nhóm phù hợp"
                    : "Phòng ban chưa có nhóm"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {teamsState.teams.length
                    ? "Xóa hoặc đổi điều kiện lọc để xem lại."
                    : "Tạo nhóm để gán thành viên và phạm vi công việc."}
                </p>
                <Button size="sm" onClick={() => setCreating("team")}>
                  Tạo nhóm
                </Button>
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {visibleTeams.map((item) => (
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
                        <StatusBadge status={item.status} />
                      </div>
                      {item.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs text-muted-foreground">
                          {item.managerName || "Chưa có trưởng nhóm"}
                        </span>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingTeam(item)}
                          >
                            Sửa
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setTarget({ kind: "team", record: item })
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
          Đơn vị đã phát sinh dữ liệu không bị xóa cứng; dùng trạng thái “Ngừng
          hoạt động” để giữ lịch sử.
        </p>
      </section>

      {creating === "department" && (
        <Modal title="Tạo phòng ban" onClose={() => setCreating(null)}>
          <DepartmentForm onClose={() => setCreating(null)} />
        </Modal>
      )}
      {creating === "team" && selected && (
        <Modal
          title={`Tạo nhóm trong ${selected.name}`}
          onClose={() => setCreating(null)}
        >
          <TeamForm
            departmentId={selected.id}
            onClose={() => setCreating(null)}
          />
        </Modal>
      )}
      {editingDepartment && (
        <Modal
          title={`Chỉnh sửa ${editingDepartment.name}`}
          onClose={() => setEditingDepartment(null)}
        >
          <DepartmentForm
            record={editingDepartment}
            onClose={() => setEditingDepartment(null)}
          />
        </Modal>
      )}
      {editingTeam && (
        <Modal
          title={`Chỉnh sửa ${editingTeam.name}`}
          onClose={() => setEditingTeam(null)}
        >
          <TeamForm
            departmentId={editingTeam.departmentId}
            record={editingTeam}
            onClose={() => setEditingTeam(null)}
          />
        </Modal>
      )}
      {target && (
        <Modal
          title={
            isActive(target.record.status) ? "Ngừng hoạt động" : "Kích hoạt lại"
          }
          onClose={() => setTarget(null)}
        >
          <div className="flex flex-col gap-3">
            <p className="text-sm">
              {isActive(target.record.status)
                ? `Đơn vị “${target.record.name}” sẽ không xuất hiện khi tạo mới, dữ liệu cũ vẫn tra cứu được.`
                : `Đơn vị “${target.record.name}” sẽ hoạt động trở lại.`}
            </p>
            {blockingTeams && target.kind === "department" && (
              <p className="error" role="alert">
                {`Phòng ban còn ${(target.record as DepartmentDto).activeTeamCount} nhóm đang hoạt động. Hãy ngừng các nhóm trước.`}
              </p>
            )}
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
              disabled={pending || blockingTeams}
              onClick={() => void confirmToggle()}
            >
              {pending
                ? "Đang lưu…"
                : isActive(target.record.status)
                  ? "Ngừng hoạt động"
                  : "Kích hoạt"}
            </Button>
          </footer>
        </Modal>
      )}
    </div>
  );
}
