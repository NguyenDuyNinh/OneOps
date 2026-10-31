/**
 * Approved task state machine (spec mục 9.1, bảng 9.1b). Every legal move is
 * declared here; anything missing from this table must be rejected by the API.
 */
export const TASK_STATUSES = [
  "Cần làm",
  "Đang làm",
  "Làm lại",
  "Chờ kiểm tra",
  "Hoãn lại",
  "Hoàn thành",
  "Đã hủy",
] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TERMINAL_STATUSES: readonly TaskStatus[] = [
  "Hoàn thành",
  "Đã hủy",
];

export const HOLD_STATUS: TaskStatus = "Hoãn lại";

/** Statuses a held task may return to (BR-ST-09 / TR-07). */
export const RESTORE_STATUSES: readonly TaskStatus[] = [
  "Cần làm",
  "Đang làm",
  "Làm lại",
  "Chờ kiểm tra",
];

/** Statuses that still carry deadline warnings (BR-ST-08). */
export const WARNING_STATUSES: readonly TaskStatus[] = [
  "Cần làm",
  "Đang làm",
  "Làm lại",
];

export type ActorKind = "ASSIGNEE" | "REVIEWER" | "MANAGER";

export interface TransitionRule {
  code: string;
  from: readonly TaskStatus[];
  to: TaskStatus | "RESTORE";
  actor: ActorKind;
  reasonRequired: boolean;
}

export const TRANSITIONS: readonly TransitionRule[] = [
  {
    code: "TR-02",
    from: ["Cần làm"],
    to: "Đang làm",
    actor: "ASSIGNEE",
    reasonRequired: false,
  },
  {
    code: "TR-03",
    from: ["Đang làm"],
    to: "Chờ kiểm tra",
    actor: "ASSIGNEE",
    reasonRequired: false,
  },
  {
    code: "TR-04",
    from: ["Chờ kiểm tra"],
    to: "Hoàn thành",
    actor: "REVIEWER",
    reasonRequired: false,
  },
  {
    code: "TR-05",
    from: ["Chờ kiểm tra"],
    to: "Làm lại",
    actor: "REVIEWER",
    reasonRequired: true,
  },
  {
    code: "TR-06",
    from: ["Cần làm", "Đang làm", "Làm lại", "Chờ kiểm tra"],
    to: "Hoãn lại",
    actor: "MANAGER",
    reasonRequired: true,
  },
  {
    code: "TR-07",
    from: ["Hoãn lại"],
    to: "RESTORE",
    actor: "ASSIGNEE",
    reasonRequired: false,
  },
  {
    code: "TR-08",
    from: ["Cần làm", "Đang làm", "Làm lại", "Chờ kiểm tra", "Hoãn lại"],
    to: "Đã hủy",
    actor: "MANAGER",
    reasonRequired: true,
  },
  {
    code: "TR-09",
    from: ["Làm lại"],
    to: "Chờ kiểm tra",
    actor: "ASSIGNEE",
    reasonRequired: false,
  },
];

export const isTaskStatus = (value: string): value is TaskStatus =>
  (TASK_STATUSES as readonly string[]).includes(value);

export const isTerminal = (status: string) =>
  (TERMINAL_STATUSES as readonly string[]).includes(status);

export const isHeld = (status: string) => status === HOLD_STATUS;

export const carriesDeadlineWarning = (status: string) =>
  (WARNING_STATUSES as readonly string[]).includes(status);

/** Rules that start from the given status. */
export const rulesFrom = (status: string) =>
  TRANSITIONS.filter((rule) => rule.from.some((item) => item === status));

/** Office-time "today" so deadline comparisons match the Vietnamese workday. */
export function officeToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** Deadline passed when the stored date is strictly before today. */
export const deadlinePassed = (date: string) => date < officeToday();

const normalizeName = (value: string) =>
  value.normalize("NFKC").trim().toLocaleLowerCase("vi");

/**
 * Legacy display values are compared against the actor identity until the
 * aggregate stores account IDs (contract §6 keeps legacy values on purpose).
 */
export function matchesActor(
  value: string,
  actor: { accountId: string; employeeId: string; displayName: string },
): boolean {
  const target = normalizeName(value);
  if (!target) return false;
  return [actor.accountId, actor.employeeId, actor.displayName].some(
    (candidate) => normalizeName(candidate) === target,
  );
}
