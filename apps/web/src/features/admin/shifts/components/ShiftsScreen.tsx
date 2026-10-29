"use client";

import { useMemo, useState } from "react";
import { Plus, Users, Clock3, RefreshCw } from "lucide-react";

import { ShiftForm } from "./ShiftForm";
import { ShiftTable } from "./ShiftTable";
import { EmployeeList } from "./EmployeeList";
import { EmployeeDetail } from "./EmployeeDetail";

import { useShifts } from "../hooks/useShifts";
import { useShiftPermissions } from "../hooks/useShiftPermissions";

import type {
  Employee,
  Shift,
  ShiftAccessContext,
  ShiftPayload,
} from "../types/shifts.types";

type ShiftsScreenProps = {
  access: ShiftAccessContext;
};

export function ShiftsScreen({ access }: ShiftsScreenProps) {
  const permissions = useShiftPermissions(access);

  const {
    shifts,
    employees,
    loading,
    saving,
    error,
    reload,
    createShift,
    updateShift,
    deleteShift,
  } = useShifts();

  const [activeTab, setActiveTab] = useState<
    "employees" | "shifts"
  >("employees");

  const [search, setSearch] = useState("");
  const [selectedEmployee, setSelectedEmployee] =
    useState<Employee | null>(null);

  const [editingShift, setEditingShift] =
    useState<Shift | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] =
    useState<Shift | null>(null);

  const [notice, setNotice] = useState("");

  const visibleEmployees = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase("vi");

    return employees.filter((employee) => {
      if (!permissions.canViewEmployee(employee)) {
        return false;
      }

      if (!keyword) return true;

      return [
        employee.name,
        employee.id,
        employee.email,
        employee.departmentName,
      ].some((value) =>
        value.toLocaleLowerCase("vi").includes(keyword),
      );
    });
  }, [employees, search, permissions]);

  const visibleShifts = useMemo(() => {
    if (permissions.canViewAllShifts) {
      return shifts;
    }

    if (!permissions.canViewAssignedShifts) {
      return [];
    }

    // Chỉ lọc theo mã ca của nhân viên trong phạm vi xem được.
    // Để bảo đảm quyền thực tế, API cần trả đúng phạm vi được phép.
    const assignedCodes = new Set(
      employees
        .filter((employee) =>
          permissions.canViewEmployee(employee),
        )
        .map((employee) => employee.shiftCode)
        .filter((code): code is string => Boolean(code)),
    );

    return shifts.filter((shift) => assignedCodes.has(shift.code));
  }, [
    shifts,
    employees,
    permissions,
  ]);

  const activeEmployees = visibleEmployees.filter(
    (employee) => employee.status === "ACTIVE",
  ).length;

  const canSeeEmployees =
    permissions.canViewAllEmployees ||
    permissions.canViewDepartmentEmployees ||
    permissions.canViewSelf;

  const canSeeShifts =
    permissions.canViewAllShifts ||
    permissions.canViewAssignedShifts;

  async function handleSave(payload: ShiftPayload) {
    if (editingShift) {
      if (!permissions.canUpdateShift) {
        throw new Error("Bạn không có quyền sửa ca.");
      }

      await updateShift(editingShift.id, payload);
      setNotice("Đã cập nhật ca làm việc.");
    } else {
      if (!permissions.canCreateShift) {
        throw new Error("Bạn không có quyền tạo ca.");
      }

      await createShift(payload);
      setNotice("Đã thêm ca làm việc.");
    }

    setFormOpen(false);
    setEditingShift(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    if (!permissions.canDeleteShift) {
      setNotice("Bạn không có quyền xóa ca.");
      setDeleteTarget(null);
      return;
    }

    const assigned = employees.some(
      (employee) => employee.shiftCode === deleteTarget.code,
    );

    if (assigned) {
      setNotice(
        "Không thể xóa ca đang được phân công. Hãy thay đổi phân công trước.",
      );
      setDeleteTarget(null);
      return;
    }

    try {
      await deleteShift(deleteTarget.id);
      setNotice("Đã xóa ca làm việc.");
      setDeleteTarget(null);
    } catch (err) {
      setNotice(
        err instanceof Error ? err.message : "Không thể xóa ca.",
      );
    }
  }

  function openCreateForm() {
    if (!permissions.canCreateShift) {
      setNotice("Bạn không có quyền tạo ca.");
      return;
    }

    setEditingShift(null);
    setFormOpen(true);
  }

  function openEditForm(shift: Shift) {
    if (!permissions.canUpdateShift) {
      setNotice("Bạn không có quyền sửa ca.");
      return;
    }

    setEditingShift(shift);
    setFormOpen(true);
  }

  if (!canSeeEmployees && !canSeeShifts) {
    return (
      <div className="p-6">
        <h1 className="text-lg font-bold">Ca làm việc</h1>
        <p className="mt-2 text-sm text-slate-500">
          Tài khoản của bạn chưa được cấp quyền truy cập chức năng này.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
      <header className="shrink-0 border-b border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs text-slate-500">
              Quản trị / Ca làm việc
            </p>
            <h1 className="mt-1 text-xl font-bold">
              Quản lý thời gian làm việc
            </h1>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void reload()}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm disabled:opacity-50 dark:border-slate-700"
            >
              <RefreshCw size={15} />
              Làm mới
            </button>

            {activeTab === "shifts" &&
              permissions.canCreateShift && (
                <button
                  type="button"
                  onClick={openCreateForm}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white"
                >
                  <Plus size={16} />
                  Thêm ca
                </button>
              )}
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          {canSeeEmployees && (
            <button
              type="button"
              onClick={() => setActiveTab("employees")}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${
                activeTab === "employees"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800"
              }`}
            >
              <Users size={16} />
              Nhân viên
            </button>
          )}

          {canSeeShifts && (
            <button
              type="button"
              onClick={() => setActiveTab("shifts")}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${
                activeTab === "shifts"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800"
              }`}
            >
              <Clock3 size={16} />
              Danh sách ca
            </button>
          )}
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-auto p-3">
        {notice && (
          <div
            role="status"
            className="mb-3 flex items-center justify-between rounded-lg bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-950 dark:text-blue-200"
          >
            <span>{notice}</span>
            <button
              type="button"
              onClick={() => setNotice("")}
              aria-label="Đóng thông báo"
            >
              ×
            </button>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-200"
          >
            {error}
            <button
              type="button"
              onClick={() => void reload()}
              className="ml-3 font-semibold underline"
            >
              Thử lại
            </button>
          </div>
        )}

        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Đang tải dữ liệu...
          </div>
        ) : activeTab === "employees" && canSeeEmployees ? (
          <div className="grid min-h-[400px] gap-3 lg:grid-cols-[300px_minmax(0,1fr)]">
            <EmployeeList
              employees={visibleEmployees}
              selectedId={selectedEmployee?.id ?? null}
              search={search}
              onSearchChange={setSearch}
              onSelect={setSelectedEmployee}
            />

            <div>
              {selectedEmployee &&
              visibleEmployees.some(
                (employee) => employee.id === selectedEmployee.id,
              ) ? (
                <EmployeeDetail employee={selectedEmployee} />
              ) : visibleEmployees[0] ? (
                <EmployeeDetail employee={visibleEmployees[0]} />
              ) : (
                <div className="rounded-xl border p-8 text-center text-sm text-slate-500 dark:border-slate-800">
                  Không có nhân viên trong phạm vi được phép xem.
                </div>
              )}
            </div>
          </div>
        ) : activeTab === "shifts" && canSeeShifts ? (
          <section className="flex min-h-[300px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b p-4 dark:border-slate-800">
              <h2 className="font-bold">Danh sách ca làm việc</h2>
              <p className="mt-1 text-xs text-slate-500">
                {visibleShifts.length} ca trong phạm vi hiển thị
              </p>
            </div>

            <ShiftTable
              shifts={visibleShifts}
              canUpdate={permissions.canUpdateShift}
              canDelete={permissions.canDeleteShift}
              onEdit={openEditForm}
              onDelete={setDeleteTarget}
            />
          </section>
        ) : (
          <p className="p-6 text-sm text-slate-500">
            Bạn không có quyền xem nội dung này.
          </p>
        )}

        {canSeeEmployees && (
          <p className="mt-3 text-xs text-slate-500">
            Nhân viên hoạt động trong phạm vi xem: {activeEmployees}
          </p>
        )}
      </main>

      <ShiftForm
        open={formOpen}
        initialData={editingShift}
        saving={saving}
        onClose={() => {
          setFormOpen(false);
          setEditingShift(null);
        }}
        onSubmit={handleSave}
      />

      {deleteTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div
            role="alertdialog"
            aria-modal="true"
            className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl dark:bg-slate-900"
          >
            <h2 className="text-lg font-bold">Xóa ca làm việc?</h2>
            <p className="mt-2 text-sm text-slate-500">
              Bạn có chắc muốn xóa ca{" "}
              <strong>{deleteTarget.name}</strong>?
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg border px-4 py-2 text-sm dark:border-slate-700"
              >
                Hủy
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={() => void handleDelete()}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {saving ? "Đang xóa..." : "Xác nhận xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}