"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Users,
} from "lucide-react";

import type {
  Employee,
  Shift,
  WeekDay,
} from "../types/shifts.types";

type ViewMode = "day" | "week" | "month" | "year";

type WorkScheduleProps = {
  employees: Employee[];
  shifts: Shift[];
  selectedEmployeeId?: string | null;
  onSelectEmployee?: (employee: Employee) => void;
};

const WEEKDAYS: { key: WeekDay; label: string }[] = [
  { key: "MON", label: "T2" },
  { key: "TUE", label: "T3" },
  { key: "WED", label: "T4" },
  { key: "THU", label: "T5" },
  { key: "FRI", label: "T6" },
  { key: "SAT", label: "T7" },
  { key: "SUN", label: "CN" },
];

const VIEW_OPTIONS: { value: ViewMode; label: string }[] = [
  { value: "day", label: "Ngày" },
  { value: "week", label: "Tuần" },
  { value: "month", label: "Tháng" },
  { value: "year", label: "Năm" },
];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function startOfWeek(date: Date) {
  const result = new Date(date);
  const day = result.getDay();
  result.setDate(result.getDate() + (day === 0 ? -6 : 1 - day));
  result.setHours(0, 0, 0, 0);
  return result;
}

function addDays(date: Date, amount: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatMonth(date: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function sameDay(a: Date, b: Date) {
  return dateKey(a) === dateKey(b);
}

function isWorkingDay(shift: Shift, date: Date) {
  const weekday = date.getDay();
  const key = WEEKDAYS[weekday === 0 ? 6 : weekday - 1].key;

  return shift.workDays.includes(key);
}

function getShiftHours(shift: Shift) {
  const [startHour, startMinute] = shift.startTime.split(":").map(Number);
  const [endHour, endMinute] = shift.endTime.split(":").map(Number);

  let minutes =
    endHour * 60 +
    endMinute -
    startHour * 60 -
    startMinute;

  if (minutes <= 0) minutes += 24 * 60;

  return Math.max(0, minutes - shift.breakMinutes) / 60;
}

function getEmployeesForShift(
  employees: Employee[],
  shift: Shift,
  selectedEmployeeId?: string | null,
) {
  return employees.filter((employee) => {
    if (employee.status !== "ACTIVE") return false;
    if (employee.shiftCode !== shift.code) return false;

    if (
      selectedEmployeeId &&
      employee.id !== selectedEmployeeId
    ) {
      return false;
    }

    return true;
  });
}

function ShiftPill({
  shift,
  employees,
  compact = false,
}: {
  shift: Shift;
  employees: Employee[];
  compact?: boolean;
}) {
  if (shift.status !== "ACTIVE") return null;

  return (
    <div
      className={`min-w-0 rounded-lg border border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-200 ${
        compact ? "px-2 py-1.5" : "p-3"
      }`}
    >
      <div className="flex items-center gap-1.5">
        <Clock3 size={compact ? 12 : 14} className="shrink-0" />
        <span className="truncate text-xs font-bold">
          {shift.name}
        </span>
      </div>

      <p className="mt-1 text-[11px] opacity-80">
        {shift.startTime} – {shift.endTime}
      </p>

      {!compact && (
        <p className="mt-2 flex items-center gap-1 text-xs">
          <Users size={12} />
          {employees.length} nhân viên
        </p>
      )}
    </div>
  );
}

export function WorkSchedule({
  employees,
  shifts,
  selectedEmployeeId = null,
  onSelectEmployee,
}: WorkScheduleProps) {
  const [view, setView] = useState<ViewMode>("week");
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState(() => new Date());

  const activeEmployees = useMemo(
    () => employees.filter((employee) => employee.status === "ACTIVE"),
    [employees],
  );

  const activeShifts = useMemo(
    () => shifts.filter((shift) => shift.status === "ACTIVE"),
    [shifts],
  );

  const visibleShifts = useMemo(
    () =>
      activeShifts.filter((shift) =>
        getEmployeesForShift(
          activeEmployees,
          shift,
          selectedEmployeeId,
        ).length > 0,
      ),
    [activeShifts, activeEmployees, selectedEmployeeId],
  );

  const assignedEmployeeCount = useMemo(
    () =>
      activeEmployees.filter(
        (employee) =>
          (!selectedEmployeeId || employee.id === selectedEmployeeId) &&
          activeShifts.some(
            (shift) => shift.code === employee.shiftCode,
          ),
      ).length,
    [activeEmployees, activeShifts, selectedEmployeeId],
  );

  const navigate = (direction: -1 | 1) => {
    setCurrentDate((previous) => {
      const next = new Date(previous);

      switch (view) {
        case "day":
          next.setDate(next.getDate() + direction);
          break;
        case "week":
          next.setDate(next.getDate() + direction * 7);
          break;
        case "month":
          next.setMonth(next.getMonth() + direction);
          break;
        case "year":
          next.setFullYear(next.getFullYear() + direction);
          break;
      }

      return next;
    });
  };

  const rangeLabel = useMemo(() => {
    if (view === "day") {
      return formatDate(currentDate);
    }

    if (view === "week") {
      const start = startOfWeek(currentDate);
      const end = addDays(start, 6);

      return `${formatDate(start)} – ${formatDate(end)}`;
    }

    if (view === "month") {
      return formatMonth(currentDate);
    }

    return `Năm ${currentDate.getFullYear()}`;
  }, [currentDate, view]);

  const daysInWeek = useMemo(() => {
    const start = startOfWeek(currentDate);

    return Array.from({ length: 7 }, (_, index) =>
      addDays(start, index),
    );
  }, [currentDate]);

  const monthDays = useMemo(() => {
    const first = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    );

    const mondayOffset = first.getDay() === 0 ? 6 : first.getDay() - 1;
    const gridStart = addDays(first, -mondayOffset);

    return Array.from({ length: 42 }, (_, index) =>
      addDays(gridStart, index),
    );
  }, [currentDate]);

  const yearMonths = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => {
        const first = new Date(currentDate.getFullYear(), index, 1);
        const days = Array.from(
          { length: new Date(currentDate.getFullYear(), index + 1, 0).getDate() },
          (_, day) => new Date(currentDate.getFullYear(), index, day + 1),
        );

        return { first, days };
      }),
    [currentDate],
  );

  const getDayShifts = (date: Date) =>
    visibleShifts.filter((shift) => isWorkingDay(shift, date));

  const getDayEmployeeCount = (date: Date) =>
    getDayShifts(date).reduce(
      (total, shift) =>
        total +
        getEmployeesForShift(
          activeEmployees,
          shift,
          selectedEmployeeId,
        ).length,
      0,
    );

  const totalWeeklyHours = useMemo(
    () =>
      visibleShifts.reduce((total, shift) => {
        const assigned = getEmployeesForShift(
          activeEmployees,
          shift,
          selectedEmployeeId,
        ).length;

        return (
          total +
          getShiftHours(shift) *
            shift.workDays.length *
            assigned
        );
      }, 0),
    [visibleShifts, activeEmployees, selectedEmployeeId],
  );

  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="shrink-0 border-b border-slate-200 p-4 dark:border-slate-800">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
                <CalendarDays size={20} />
              </div>

              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Lịch làm việc
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Theo dõi và quản lý lịch ca nhân viên
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
              {VIEW_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setView(option.value)}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                    view === option.value
                      ? "bg-white text-blue-700 shadow-sm dark:bg-slate-700 dark:text-blue-300"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                const today = new Date();
                setCurrentDate(today);
                setSelectedDay(today);
              }}
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Hôm nay
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Kỳ trước"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ChevronLeft size={17} />
            </button>

            <button
              type="button"
              onClick={() => navigate(1)}
              aria-label="Kỳ tiếp theo"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ChevronRight size={17} />
            </button>

            <h3 className="ml-1 text-sm font-bold capitalize text-slate-900 dark:text-white">
              {rangeLabel}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              Ca làm việc
            </span>
            <span className="flex items-center gap-1.5">
              <Users size={13} />
              {assignedEmployeeCount} nhân viên có ca
            </span>
            <span className="flex items-center gap-1.5">
              <Clock3 size={13} />
              {Math.round(totalWeeklyHours)} giờ/tuần ước tính
            </span>
          </div>
        </div>
      </div>

      <div className="min-h-[360px] flex-1 overflow-auto">
        {view === "day" && (
          <div className="p-4">
            <div className="mb-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
              <p className="text-xs text-slate-500">Ngày đang xem</p>
              <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                {new Intl.DateTimeFormat("vi-VN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }).format(currentDate)}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {getDayEmployeeCount(currentDate)} lượt nhân viên theo ca
              </p>
            </div>

            {getDayShifts(currentDate).length ? (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {getDayShifts(currentDate).map((shift) => {
                  const assigned = getEmployeesForShift(
                    activeEmployees,
                    shift,
                    selectedEmployeeId,
                  );

                  return (
                    <article
                      key={shift.id}
                      className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"
                    >
                      <ShiftPill
                        shift={shift}
                        employees={assigned}
                      />

                      <div className="mt-4 space-y-2">
                        {assigned.map((employee) => (
                          <button
                            key={employee.id}
                            type="button"
                            onClick={() => onSelectEmployee?.(employee)}
                            className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800"
                          >
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                              {employee.name
                                .split(" ")
                                .slice(-2)
                                .map((part) => part[0])
                                .join("")
                                .toUpperCase()}
                            </span>

                            <span className="min-w-0">
                              <span className="block truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                                {employee.name}
                              </span>
                              <span className="block truncate text-xs text-slate-500">
                                {employee.position}
                              </span>
                            </span>
                          </button>
                        ))}
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <EmptySchedule />
            )}
          </div>
        )}

        {view === "week" && (
          <div className="min-w-[760px]">
            <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800">
              {daysInWeek.map((date, index) => (
                <button
                  key={dateKey(date)}
                  type="button"
                  onClick={() => {
                    setSelectedDay(date);
                    setCurrentDate(date);
                    setView("day");
                  }}
                  className={`border-r border-slate-100 px-2 py-3 text-center transition last:border-r-0 dark:border-slate-800 ${
                    sameDay(date, new Date())
                      ? "bg-blue-50 dark:bg-blue-950/30"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <span className="block text-xs text-slate-500">
                    {WEEKDAYS[index].label}
                  </span>
                  <span
                    className={`mx-auto mt-1 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                      sameDay(date, new Date())
                        ? "bg-blue-600 text-white"
                        : "text-slate-800 dark:text-slate-100"
                    }`}
                  >
                    {date.getDate()}
                  </span>
                  <span className="mt-1 block text-[10px] text-slate-400">
                    {getDayEmployeeCount(date)} lượt
                  </span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {daysInWeek.map((date) => {
                const dayShifts = getDayShifts(date);

                return (
                  <div
                    key={dateKey(date)}
                    className={`min-h-[260px] space-y-2 border-r border-slate-100 p-2 last:border-r-0 dark:border-slate-800 ${
                      sameDay(date, new Date())
                        ? "bg-blue-50/40 dark:bg-blue-950/10"
                        : ""
                    }`}
                  >
                    {dayShifts.length ? (
                      dayShifts.map((shift) => (
                        <ShiftPill
                          key={shift.id}
                          shift={shift}
                          employees={getEmployeesForShift(
                            activeEmployees,
                            shift,
                            selectedEmployeeId,
                          )}
                          compact
                        />
                      ))
                    ) : (
                      <div className="py-8 text-center text-[11px] text-slate-400">
                        Không có ca
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {view === "month" && (
          <div className="min-w-[760px]">
            <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800">
              {WEEKDAYS.map((day) => (
                <div
                  key={day.key}
                  className="px-3 py-3 text-center text-xs font-semibold text-slate-500"
                >
                  {day.label}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {monthDays.map((date) => {
                const inMonth =
                  date.getMonth() === currentDate.getMonth();

                const dayShifts = getDayShifts(date);

                return (
                  <button
                    key={dateKey(date)}
                    type="button"
                    onClick={() => {
                      setSelectedDay(date);
                      setCurrentDate(date);
                      setView("day");
                    }}
                    className={`min-h-[105px] border-b border-r border-slate-100 p-2 text-left transition dark:border-slate-800 ${
                      !inMonth
                        ? "bg-slate-50/70 dark:bg-slate-950/30"
                        : "bg-white dark:bg-slate-900"
                    } ${
                      sameDay(date, new Date())
                        ? "ring-1 ring-inset ring-blue-500"
                        : "hover:bg-blue-50/50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                        sameDay(date, new Date())
                          ? "bg-blue-600 text-white"
                          : inMonth
                            ? "text-slate-800 dark:text-slate-100"
                            : "text-slate-400"
                      }`}
                    >
                      {date.getDate()}
                    </span>

                    <div className="mt-2 space-y-1">
                      {dayShifts.slice(0, 2).map((shift) => (
                        <div
                          key={shift.id}
                          className="truncate rounded bg-blue-50 px-1.5 py-1 text-[10px] font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                        >
                          {shift.name}
                        </div>
                      ))}

                      {dayShifts.length > 2 && (
                        <p className="text-[10px] text-slate-500">
                          +{dayShifts.length - 2} ca khác
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {view === "year" && (
          <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
            {yearMonths.map(({ first, days }) => {
              const monthShiftCount = days.reduce(
                (total, date) => total + getDayShifts(date).length,
                0,
              );

              return (
                <button
                  key={first.getMonth()}
                  type="button"
                  onClick={() => {
                    setCurrentDate(first);
                    setView("month");
                  }}
                  className="rounded-xl border border-slate-200 p-4 text-left transition hover:border-blue-300 hover:bg-blue-50/40 dark:border-slate-800 dark:hover:border-blue-800 dark:hover:bg-blue-950/20"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold capitalize text-slate-900 dark:text-white">
                      {formatMonth(first)}
                    </h3>
                    <ChevronRight
                      size={16}
                      className="text-slate-400"
                    />
                  </div>

                  <div className="mt-3 grid grid-cols-7 gap-1">
                    {days.map((date) => {
                      const count = getDayShifts(date).length;

                      return (
                        <span
                          key={dateKey(date)}
                          title={`${formatDate(date)}: ${count} ca`}
                          className={`flex h-7 items-center justify-center rounded-md text-[10px] ${
                            count
                              ? "bg-blue-100 font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                              : "text-slate-400"
                          }`}
                        >
                          {date.getDate()}
                        </span>
                      );
                    })}
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>{days.length} ngày</span>
                    <span>{monthShiftCount} lượt ca theo lịch</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {!visibleShifts.length && (
          <div className="p-4">
            <EmptySchedule />
          </div>
        )}
      </div>

      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-slate-200 px-4 py-3 text-xs text-slate-500 dark:border-slate-800">
        <span>
          Đang hiển thị {visibleShifts.length} loại ca
        </span>
        <span>
          Lịch được dựng từ ngày làm việc định kỳ của từng ca
        </span>
      </div>
    </section>
  );
}

function EmptySchedule() {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 px-4 text-center dark:border-slate-700">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
        <CalendarDays size={22} />
      </div>

      <h3 className="mt-3 text-sm font-bold text-slate-800 dark:text-slate-100">
        Chưa có lịch làm việc
      </h3>

      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
        Không có ca phù hợp với ngày hoặc nhân viên đang chọn.
        Hãy thử chuyển kỳ xem hoặc bỏ lọc nhân viên.
      </p>
    </div>
  );
}