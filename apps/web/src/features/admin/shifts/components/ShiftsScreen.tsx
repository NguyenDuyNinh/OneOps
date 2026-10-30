"use client";

import { useMemo, useState, type ReactNode } from "react";

import {
  Activity,
  BarChart3,
  CalendarDays,
  Check,
  Clock3,
  Edit3,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";

import { ShiftForm } from "./ShiftForm";

import type {
  Shift,
  ShiftPayload,
  WeekDay,
} from "../types/shifts.types";

type Employee = {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  status: "ACTIVE" | "INACTIVE";
  shiftCode: string;
  weeklyHours: number[];
};

const DAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

const DAY_LABELS: Record<WeekDay, string> = {
  MON: "T2",
  TUE: "T3",
  WED: "T4",
  THU: "T5",
  FRI: "T6",
  SAT: "T7",
  SUN: "CN",
};

const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: "NV001",
    name: "Nguyễn Minh Anh",
    email: "minhanh@example.com",
    department: "Kỹ thuật",
    position: "Nhân viên kỹ thuật",
    status: "ACTIVE",
    shiftCode: "HC01",
    weeklyHours: [8, 8, 8, 8, 8, 4, 0],
  },
  {
    id: "NV002",
    name: "Trần Quốc Bảo",
    email: "quocbao@example.com",
    department: "Vận hành",
    position: "Chuyên viên vận hành",
    status: "ACTIVE",
    shiftCode: "HC01",
    weeklyHours: [8, 8, 7.5, 8, 8, 0, 0],
  },
  {
    id: "NV003",
    name: "Lê Hoàng Phúc",
    email: "hoangphuc@example.com",
    department: "Kỹ thuật",
    position: "Kỹ sư phần mềm",
    status: "ACTIVE",
    shiftCode: "HC01",
    weeklyHours: [8, 8, 8, 7, 8, 4, 0],
  },
  {
    id: "NV004",
    name: "Phạm Ngọc Hà",
    email: "ngocha@example.com",
    department: "Nhân sự",
    position: "Chuyên viên nhân sự",
    status: "ACTIVE",
    shiftCode: "HC01",
    weeklyHours: [8, 8, 8, 8, 8, 0, 0],
  },
  {
    id: "NV005",
    name: "Võ Thành Đạt",
    email: "thanhdat@example.com",
    department: "Kinh doanh",
    position: "Nhân viên kinh doanh",
    status: "ACTIVE",
    shiftCode: "HC01",
    weeklyHours: [8, 8, 8, 8, 8, 4, 0],
  },
  {
    id: "NV006",
    name: "Đặng Thu Trang",
    email: "thutrang@example.com",
    department: "Kế toán",
    position: "Kế toán viên",
    status: "ACTIVE",
    shiftCode: "HC01",
    weeklyHours: [8, 8, 8, 8, 8, 0, 0],
  },
  {
    id: "NV007",
    name: "Bùi Đức Huy",
    email: "duchuy@example.com",
    department: "Vận hành",
    position: "Nhân viên vận hành",
    status: "INACTIVE",
    shiftCode: "HC01",
    weeklyHours: [0, 0, 0, 0, 0, 0, 0],
  },
  {
    id: "NV008",
    name: "Ngô Khánh Linh",
    email: "khanhlinh@example.com",
    department: "Nhân sự",
    position: "Trợ lý nhân sự",
    status: "ACTIVE",
    shiftCode: "HC01",
    weeklyHours: [8, 8, 8, 8, 8, 0, 0],
  },
  {
    id: "NV009",
    name: "Huỳnh Gia Hưng",
    email: "giahung@example.com",
    department: "Kỹ thuật",
    position: "Kỹ thuật viên",
    status: "ACTIVE",
    shiftCode: "HC01",
    weeklyHours: [8, 8, 8, 8, 8, 4, 0],
  },
  {
    id: "NV010",
    name: "Đỗ Thảo My",
    email: "thaomy@example.com",
    department: "Kinh doanh",
    position: "Chuyên viên kinh doanh",
    status: "ACTIVE",
    shiftCode: "HC01",
    weeklyHours: [8, 8, 8, 8, 8, 0, 0],
  },
];

const INITIAL_SHIFTS: Shift[] = [
  {
    id: "shift-1",
    name: "Ca hành chính",
    code: "HC01",
    startTime: "08:00",
    endTime: "17:00",
    breakMinutes: 60,
    workDays: ["MON", "TUE", "WED", "THU", "FRI"],
    status: "ACTIVE",
    description: "Ca làm việc giờ hành chính.",
  },
  {
    id: "shift-2",
    name: "Ca sáng",
    code: "SANG",
    startTime: "06:00",
    endTime: "14:00",
    breakMinutes: 30,
    workDays: ["MON", "TUE", "WED", "THU", "FRI", "SAT"],
    status: "ACTIVE",
    description: "Ca làm việc buổi sáng.",
  },
  {
    id: "shift-3",
    name: "Ca chiều",
    code: "CHIEU",
    startTime: "14:00",
    endTime: "22:00",
    breakMinutes: 30,
    workDays: ["MON", "TUE", "WED", "THU", "FRI", "SAT"],
    status: "INACTIVE",
    description: "Ca làm việc buổi chiều.",
  },
];

function formatHours(hours: number): string {
  return Number.isInteger(hours) ? `${hours}h` : `${hours.toFixed(1)}h`;
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function StatCard({
  label,
  value,
  description,
  icon,
}: {
  label: string;
  value: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
          {label}
        </p>

        <div className="shrink-0 rounded-lg bg-blue-50 p-1.5 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
          {icon}
        </div>
      </div>

      <p className="mt-1.5 text-xl font-bold text-slate-900 dark:text-slate-100">
        {value}
      </p>

      <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}

function WeeklyChart({ hours }: { hours: number[] }) {
  const maxHours = 10;

  return (
    <div>
      <div className="mb-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 sm:text-base">
          Biểu đồ thời gian làm việc
        </h3>

        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Số giờ làm việc theo từng ngày trong tuần
        </p>
      </div>

      <div className="relative h-40 sm:h-44">
        <div className="absolute inset-0 flex flex-col justify-between">
          {[10, 8, 6, 4, 2, 0].map((hour) => (
            <div key={hour} className="flex items-center gap-2">
              <span className="w-6 text-right text-[10px] text-slate-400">
                {hour}
              </span>

              <div className="h-px flex-1 border-t border-dashed border-slate-200 dark:border-slate-700" />
            </div>
          ))}
        </div>

        <div className="absolute inset-0 flex items-stretch pl-8">
          {DAYS.map((day, index) => {
            const hour = hours[index] ?? 0;

            return (
              <div
                key={day}
                className="flex min-w-0 flex-1 flex-col items-center"
              >
                <div className="flex h-full w-full items-end justify-center px-1">
                  <div
                    title={`${day}: ${formatHours(hour)}`}
                    className={`w-full max-w-9 rounded-t-lg transition-all duration-300 ${
                      hour > 0
                        ? "bg-gradient-to-t from-blue-600 to-sky-400"
                        : "bg-slate-100 dark:bg-slate-700"
                    }`}
                    style={{
                      height: `${Math.max((hour / maxHours) * 100, 2)}%`,
                    }}
                  />
                </div>

                <span className="mt-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                  {day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <span className="h-2.5 w-2.5 rounded-sm bg-blue-600" />
        Giờ làm trong ngày · Đơn vị: giờ
      </div>
    </div>
  );
}

function EmployeeDetail({ employee }: { employee: Employee }) {
  const totalHours = employee.weeklyHours.reduce(
    (sum, hour) => sum + hour,
    0,
  );

  const workDays = employee.weeklyHours.filter((hour) => hour > 0).length;

  return (
    <div className="space-y-3">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-base font-bold text-white">
              {getInitials(employee.name)}
            </div>

            <div className="min-w-0">
              <p className="text-[11px] text-slate-400">{employee.id}</p>

              <h2 className="mt-0.5 break-words text-base font-bold text-slate-900 dark:text-slate-100">
                {employee.name}
              </h2>

              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {employee.position}
              </p>
            </div>
          </div>

          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
              employee.status === "ACTIVE"
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            {employee.status === "ACTIVE"
              ? "Đang làm việc"
              : "Ngừng hoạt động"}
          </span>
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Email
            </p>

            <p className="mt-1 break-all text-xs font-medium text-slate-800 dark:text-slate-200">
              {employee.email}
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Phòng ban
            </p>

            <p className="mt-1 text-xs font-medium text-slate-800 dark:text-slate-200">
              {employee.department}
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3 transition-colors dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <Clock3 size={15} />
            <span className="text-[11px]">Tổng giờ làm</span>
          </div>

          <p className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100">
            {formatHours(totalHours)}
          </p>

          <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
            Trong tuần
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 transition-colors dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <CalendarDays size={15} />
            <span className="text-[11px]">Ngày làm</span>
          </div>

          <p className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100">
            {workDays}
          </p>

          <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
            Ngày có giờ làm
          </p>
        </div>

        <div className="col-span-2 rounded-xl border border-slate-200 bg-white p-3 transition-colors dark:border-slate-800 dark:bg-slate-900 sm:col-span-1">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <Activity size={15} />
            <span className="text-[11px]">Mã ca làm</span>
          </div>

          <p className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100">
            {employee.shiftCode}
          </p>

          <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
            Ca được phân công
          </p>
        </div>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
        <WeeklyChart hours={employee.weeklyHours} />
      </section>
    </div>
  );
}

export function ShiftsScreen() {
  const [employees] = useState<Employee[]>(INITIAL_EMPLOYEES);

  const [shifts, setShifts] = useState<Shift[]>(INITIAL_SHIFTS);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState(
    INITIAL_EMPLOYEES[0].id,
  );

  const [search, setSearch] = useState("");

  const [employeeStatus, setEmployeeStatus] = useState<
    "ALL" | "ACTIVE" | "INACTIVE"
  >("ALL");

  const [activeTab, setActiveTab] = useState<"employees" | "shifts">(
    "employees",
  );

  const [formOpen, setFormOpen] = useState(false);

  const [editingShift, setEditingShift] = useState<Shift | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Shift | null>(null);

  const [notice, setNotice] = useState("");

  const filteredEmployees = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase("vi");

    return employees.filter((employee) => {
      const matchesKeyword =
        !keyword ||
        [
          employee.name,
          employee.id,
          employee.email,
          employee.department,
        ].some((value) => value.toLocaleLowerCase("vi").includes(keyword));

      const matchesStatus =
        employeeStatus === "ALL" || employee.status === employeeStatus;

      return matchesKeyword && matchesStatus;
    });
  }, [employees, search, employeeStatus]);

  const selectedEmployee =
    filteredEmployees.find(
      (employee) => employee.id === selectedEmployeeId,
    ) ??
    filteredEmployees[0] ??
    null;

  const activeEmployees = employees.filter(
    (employee) => employee.status === "ACTIVE",
  ).length;

  function calculateShiftHours(shift: Shift): number {
    const [startHour, startMinute] = shift.startTime.split(":").map(Number);

    const [endHour, endMinute] = shift.endTime.split(":").map(Number);

    const start = startHour * 60 + startMinute;

    let end = endHour * 60 + endMinute;

    if (end <= start) {
      end += 24 * 60;
    }

    const duration = end - start;

    return Math.max(0, (duration - shift.breakMinutes) / 60);
  }

  async function saveShift(payload: ShiftPayload): Promise<void> {
    const name = payload.name.trim();

    const code = payload.code.trim();

    if (!name || !code) {
      throw new Error("Vui lòng nhập đầy đủ tên ca và mã ca.");
    }

    const duplicateCode = shifts.some(
      (shift) =>
        shift.code.toLowerCase() === code.toLowerCase() &&
        shift.id !== editingShift?.id,
    );

    if (duplicateCode) {
      throw new Error(`Mã ca "${code}" đã tồn tại.`);
    }

    const normalizedPayload: ShiftPayload = {
      ...payload,
      name,
      code,
      breakMinutes: Number(payload.breakMinutes),
      workDays: [...payload.workDays],
      description: payload.description?.trim() ?? "",
    };

    if (editingShift) {
      setShifts((previous) =>
        previous.map((shift) =>
          shift.id === editingShift.id
            ? {
                ...normalizedPayload,
                id: editingShift.id,
              }
            : shift,
        ),
      );

      setNotice("Đã cập nhật ca làm việc.");
    } else {
      setShifts((previous) => [
        ...previous,
        {
          ...normalizedPayload,
          id: `shift-${Date.now()}`,
        },
      ]);

      setNotice("Đã thêm ca làm việc.");
    }

    setFormOpen(false);

    setEditingShift(null);
  }

  function deleteShift(): void {
    if (!deleteTarget) return;

    const deletedName = deleteTarget.name;

    setShifts((previous) =>
      previous.filter((shift) => shift.id !== deleteTarget.id),
    );

    setNotice(`Đã xóa ca ${deletedName}.`);

    setDeleteTarget(null);
  }

  function openCreateForm(): void {
    setEditingShift(null);

    setFormOpen(true);
  }

  function openEditForm(shift: Shift): void {
    setEditingShift(shift);

    setFormOpen(true);
  }

  function closeForm(): void {
    setFormOpen(false);

    setEditingShift(null);
  }

  return (
    <div className="flex h-[calc(100dvh-48px)] min-h-0 flex-col overflow-hidden bg-slate-50 text-slate-800 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100">
      <header className="z-10 shrink-0 border-b border-slate-200 bg-white px-4 py-3 transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900 sm:px-5 lg:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              
            </div>

            <h1 className="mt-1.5 text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-xl">
              Quản lý thời gian làm việc
            </h1>

            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Theo dõi nhân viên, giờ làm và cấu hình ca làm việc.
            </p>
          </div>

          {activeTab === "shifts" && (
            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 sm:text-sm"
            >
              <Plus size={16} />

              Thêm ca
            </button>
          )}
        </div>

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("employees")}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition sm:text-sm ${
              activeTab === "employees"
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            <Users size={16} />

            Nhân viên
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("shifts")}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition sm:text-sm ${
              activeTab === "shifts"
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            <Clock3 size={16} />

            Danh sách ca
          </button>
        </div>
      </header>

      <main className="flex min-h-0 flex-1 flex-col overflow-hidden p-2.5 sm:p-3 lg:px-4 lg:py-3">
        {notice && (
          <div
            role="status"
            className="mb-2 flex shrink-0 items-center justify-between gap-3 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200"
          >
            <span>{notice}</span>

            <button
              type="button"
              onClick={() => setNotice("")}
              aria-label="Đóng thông báo"
              className="rounded-md p-1 hover:bg-blue-100 dark:hover:bg-blue-900"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {activeTab === "employees" ? (
          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
            <div className="grid shrink-0 grid-cols-2 gap-2.5 xl:grid-cols-3">
              <StatCard
                label="Tổng nhân viên"
                value={String(employees.length)}
                description="Trong danh sách hiện tại"
                icon={<Users size={17} />}
              />

              <StatCard
                label="Đang hoạt động"
                value={String(activeEmployees)}
                description="Tài khoản đang hoạt động"
                icon={<Activity size={17} />}
              />

              <div className="col-span-2 xl:col-span-1">
                <StatCard
                  label="Ca làm việc"
                  value={String(shifts.length)}
                  description="Tổng ca đã cấu hình"
                  icon={<BarChart3 size={17} />}
                />
              </div>
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-hidden lg:grid-cols-[260px_minmax(0,1fr)]">
              <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
                <div className="z-10 shrink-0 border-b border-slate-100 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        Danh sách nhân viên
                      </h2>

                      <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                        {filteredEmployees.length} nhân viên phù hợp
                      </p>
                    </div>

                    <span className="shrink-0 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      {filteredEmployees.length}
                    </span>
                  </div>

                  <div className="relative mt-3">
                    <Search
                      size={15}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Tên, mã hoặc email..."
                      className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-blue-950"
                    />
                  </div>

                  <select
                    value={employeeStatus}
                    onChange={(event) =>
                      setEmployeeStatus(
                        event.target.value as
                          | "ALL"
                          | "ACTIVE"
                          | "INACTIVE",
                      )
                    }
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-blue-950"
                  >
                    <option value="ALL">Tất cả trạng thái</option>

                    <option value="ACTIVE">Đang hoạt động</option>

                    <option value="INACTIVE">Ngừng hoạt động</option>
                  </select>
                </div>

                <div
                  className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain"
                  style={{
                    scrollbarGutter: "stable",
                    WebkitOverflowScrolling: "touch",
                  }}
                >
                  <div className="space-y-1 p-2">
                    {filteredEmployees.length === 0 ? (
                      <div className="px-3 py-8 text-center">
                        <Search
                          size={24}
                          className="mx-auto text-slate-300 dark:text-slate-600"
                        />

                        <p className="mt-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                          Không tìm thấy nhân viên
                        </p>

                        <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                          Thử đổi từ khóa hoặc trạng thái.
                        </p>
                      </div>
                    ) : (
                      filteredEmployees.map((employee) => {
                        const selected =
                          employee.id === selectedEmployee?.id;

                        const hours = employee.weeklyHours.reduce(
                          (sum, hour) => sum + hour,
                          0,
                        );

                        return (
                          <button
                            key={employee.id}
                            type="button"
                            onClick={() =>
                              setSelectedEmployeeId(employee.id)
                            }
                            aria-pressed={selected}
                            className={`flex w-full items-center gap-2.5 rounded-lg p-2.5 text-left transition ${
                              selected
                                ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                                : "text-slate-800 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                            }`}
                          >
                            <div
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                                selected
                                  ? "bg-blue-600 text-white"
                                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                              }`}
                            >
                              {getInitials(employee.name)}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-semibold">
                                {employee.name}
                              </p>

                              <p className="mt-0.5 truncate text-[10px] text-slate-500 dark:text-slate-400">
                                {employee.id} · {employee.department}
                              </p>

                              <div className="mt-1.5 flex items-center gap-1.5">
                                <span
                                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                                    employee.status === "ACTIVE"
                                      ? "bg-emerald-500"
                                      : "bg-slate-400"
                                  }`}
                                />

                                <span className="truncate text-[10px] text-slate-500 dark:text-slate-400">
                                  {employee.status === "ACTIVE"
                                    ? "Đang làm việc"
                                    : "Ngừng hoạt động"}
                                </span>

                                <span className="ml-auto shrink-0 text-[10px] font-semibold">
                                  {formatHours(hours)}
                                </span>
                              </div>
                            </div>

                            {selected && (
                              <Check
                                size={14}
                                className="shrink-0 text-blue-600 dark:text-blue-400"
                              />
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="shrink-0 border-t border-slate-100 bg-white px-3 py-2 text-[10px] text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-500">
                  Chọn nhân viên để xem biểu đồ
                </div>
              </section>

              <section
                className="min-h-0 min-w-0 overflow-x-hidden overflow-y-auto overscroll-contain"
                style={{
                  scrollbarGutter: "stable",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                {selectedEmployee ? (
                  <EmployeeDetail employee={selectedEmployee} />
                ) : (
                  <div className="flex min-h-64 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-900">
                    <div>
                      <Users
                        size={30}
                        className="mx-auto text-slate-300 dark:text-slate-600"
                      />

                      <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Chọn nhân viên
                      </p>

                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Thông tin và biểu đồ sẽ hiển thị ở đây.
                      </p>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </div>
        ) : (
          <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
            <div className="shrink-0 border-b border-slate-100 p-3 dark:border-slate-800 sm:p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                  <BarChart3 size={19} />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Danh sách ca làm việc
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    Quản lý thời gian và lịch làm việc.
                  </p>
                </div>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-auto overscroll-contain">
              <table className="w-full min-w-[760px] border-collapse text-left text-xs sm:text-sm">
                <thead className="sticky top-0 z-10 bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-300 sm:text-xs">
                  <tr>
                    <th className="px-4 py-3 font-semibold">
                      Ca làm việc
                    </th>

                    <th className="px-4 py-3 font-semibold">
                      Thời gian
                    </th>

                    <th className="px-4 py-3 font-semibold">
                      Giờ làm thực
                    </th>

                    <th className="px-4 py-3 font-semibold">
                      Ngày làm
                    </th>

                    <th className="px-4 py-3 font-semibold">
                      Trạng thái
                    </th>

                    <th className="px-4 py-3 text-right font-semibold">
                      Thao tác
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {shifts.map((shift) => (
                    <tr
                      key={shift.id}
                      className="group transition-colors duration-200 hover:bg-blue-50/40 dark:hover:bg-slate-800/70"
                    >
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                          {shift.name}
                        </p>

                        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                          Mã: {shift.code}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                          <Clock3
                            size={14}
                            className="text-slate-400"
                          />

                          {shift.startTime} – {shift.endTime}
                        </div>

                        <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                          Nghỉ {shift.breakMinutes} phút
                        </p>
                      </td>

                      <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                        {formatHours(calculateShiftHours(shift))}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex max-w-44 flex-wrap gap-1">
                          {shift.workDays.map((day) => (
                            <span
                              key={day}
                              className="rounded-md bg-slate-100 px-1.5 py-1 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                            >
                              {DAY_LABELS[day] ?? day}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-semibold sm:text-xs ${
                            shift.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                          }`}
                        >
                          {shift.status === "ACTIVE"
                            ? "Hoạt động"
                            : "Ngừng hoạt động"}
                        </span>
                      </td>

                      {/* CỘT THAO TÁC: CHỈ NÂNG CẤP GIAO DIỆN */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {/* Nút chỉnh sửa */}
                          <button
                            type="button"
                            onClick={() => openEditForm(shift)}
                            title="Chỉnh sửa ca"
                            aria-label={`Chỉnh sửa ${shift.name}`}
                            className="group/edit relative inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-blue-100 bg-blue-50 text-blue-600 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-500/25 active:translate-y-0 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-blue-900/70 dark:bg-blue-950/60 dark:text-blue-400 dark:hover:border-blue-500 dark:hover:bg-blue-600 dark:hover:text-white dark:focus-visible:ring-offset-slate-900"
                          >
                            <Edit3
                              size={16}
                              strokeWidth={2}
                              className="transition-transform duration-200 group-hover/edit:rotate-[-8deg] group-hover/edit:scale-110"
                            />
                          </button>

                          {/* Nút xóa */}
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(shift)}
                            title="Xóa ca"
                            aria-label={`Xóa ${shift.name}`}
                            className="group/delete relative inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-red-100 bg-red-50 text-red-500 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-600 hover:text-white hover:shadow-lg hover:shadow-red-500/25 active:translate-y-0 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:border-red-900/70 dark:bg-red-950/50 dark:text-red-400 dark:hover:border-red-500 dark:hover:bg-red-600 dark:hover:text-white dark:focus-visible:ring-offset-slate-900"
                          >
                            <Trash2
                              size={16}
                              strokeWidth={2}
                              className="transition-transform duration-200 group-hover/delete:scale-110 group-hover/delete:rotate-[-8deg]"
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {shifts.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-5 py-10 text-center text-slate-500 dark:text-slate-400"
                      >
                        Chưa có ca làm việc. Nhấn “Thêm ca” để tạo mới.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="shrink-0 border-t border-slate-100 px-4 py-2.5 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
              Tổng cộng {shifts.length} ca làm việc
            </div>
          </section>
        )}
      </main>

      <ShiftForm
        open={formOpen}
        initialData={editingShift}
        saving={false}
        onClose={closeForm}
        onSubmit={saveShift}
      />

      {deleteTarget && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-shift-title"
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400">
              <Trash2 size={21} />
            </div>

            <h3
              id="delete-shift-title"
              className="mt-3 text-lg font-bold text-slate-900 dark:text-slate-100"
            >
              Xóa ca làm việc?
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Bạn có chắc muốn xóa ca{" "}
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {deleteTarget.name}
              </span>
              ?
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Hủy
              </button>

              <button
                type="button"
                onClick={deleteShift}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}