"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { shiftsApi } from "../api/shifts.api";

import type {
  Employee,
  Shift,
  ShiftPayload,
} from "../types/shifts.types";

type UseShiftsResult = {
  shifts: Shift[];
  employees: Employee[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  reload: () => Promise<void>;
  createShift: (payload: ShiftPayload) => Promise<void>;
  updateShift: (id: string, payload: ShiftPayload) => Promise<void>;
  deleteShift: (id: string) => Promise<void>;
};

/* -------------------------------------------------------------------------- */
/* Mock data: chỉ dùng khi phát triển và API không khả dụng                   */
/* -------------------------------------------------------------------------- */

const MOCK_SHIFTS: Shift[] = [
  {
    id: "shift-001",
    name: "Ca sáng",
    code: "CA-SANG",
    startTime: "08:00",
    endTime: "12:00",
    breakMinutes: 0,
    workDays: ["MON", "TUE", "WED", "THU", "FRI"],
    status: "ACTIVE",
    description: "Ca làm việc buổi sáng.",
  },
  {
    id: "shift-002",
    name: "Ca chiều",
    code: "CA-CHIEU",
    startTime: "13:00",
    endTime: "17:00",
    breakMinutes: 0,
    workDays: ["MON", "TUE", "WED", "THU", "FRI"],
    status: "ACTIVE",
    description: "Ca làm việc buổi chiều.",
  },
  {
    id: "shift-003",
    name: "Ca tối",
    code: "CA-TOI",
    startTime: "18:00",
    endTime: "22:00",
    breakMinutes: 0,
    workDays: ["MON", "TUE", "WED", "THU", "FRI", "SAT"],
    status: "ACTIVE",
    description: "Ca làm việc buổi tối.",
  },
  {
    id: "shift-004",
    name: "Ca hành chính",
    code: "CA-HC",
    startTime: "08:00",
    endTime: "17:00",
    breakMinutes: 60,
    workDays: ["MON", "TUE", "WED", "THU", "FRI"],
    status: "ACTIVE",
    description: "Ca hành chính, nghỉ trưa 60 phút.",
  },
  {
    id: "shift-005",
    name: "Ca đêm",
    code: "CA-DEM",
    startTime: "22:00",
    endTime: "06:00",
    breakMinutes: 30,
    workDays: ["MON", "TUE", "WED", "THU", "FRI", "SAT"],
    status: "INACTIVE",
    description: "Ca đêm, kết thúc vào ngày hôm sau.",
  },
];

const MOCK_EMPLOYEES: Employee[] = [
  {
    id: "NV001",
    name: "Nguyễn Văn Thanh",
    email: "thanh@oneops.vn",
    departmentId: "DEPT-IT",
    departmentName: "Công nghệ thông tin",
    position: "Frontend Developer",
    status: "ACTIVE",
    shiftCode: "CA-HC",
    weeklyHours: [8, 8, 8, 8, 8, 0, 0],
  },
  {
    id: "NV002",
    name: "Trần Minh Thuận",
    email: "thuan@oneops.vn",
    departmentId: "DEPT-IT",
    departmentName: "Công nghệ thông tin",
    position: "Backend Developer",
    status: "ACTIVE",
    shiftCode: "CA-HC",
    weeklyHours: [8, 8, 8, 8, 8, 0, 0],
  },
  {
    id: "NV003",
    name: "Lê Quốc Dân",
    email: "dan@oneops.vn",
    departmentId: "DEPT-HR",
    departmentName: "Nhân sự",
    position: "Chuyên viên nhân sự",
    status: "ACTIVE",
    shiftCode: "CA-SANG",
    weeklyHours: [4, 4, 4, 4, 4, 0, 0],
  },
  {
    id: "NV004",
    name: "Phạm Ngọc Quỳnh",
    email: "quynh@oneops.vn",
    departmentId: "DEPT-HR",
    departmentName: "Nhân sự",
    position: "Quản lý nhân sự",
    status: "ACTIVE",
    shiftCode: "CA-HC",
    weeklyHours: [8, 8, 8, 8, 8, 0, 0],
  },
  {
    id: "NV005",
    name: "Đỗ Hoàng Nam",
    email: "nam@oneops.vn",
    departmentId: "DEPT-OPS",
    departmentName: "Vận hành",
    position: "Nhân viên vận hành",
    status: "ACTIVE",
    shiftCode: "CA-CHIEU",
    weeklyHours: [4, 4, 4, 4, 4, 0, 0],
  },
  {
    id: "NV006",
    name: "Võ Thị Mai",
    email: "mai@oneops.vn",
    departmentId: "DEPT-OPS",
    departmentName: "Vận hành",
    position: "Điều phối viên",
    status: "ACTIVE",
    shiftCode: "CA-TOI",
    weeklyHours: [0, 4, 4, 4, 4, 4, 0],
  },
  {
    id: "NV007",
    name: "Bùi Đức Long",
    email: "long@oneops.vn",
    departmentId: "DEPT-IT",
    departmentName: "Công nghệ thông tin",
    position: "QA Engineer",
    status: "INACTIVE",
    shiftCode: null,
    weeklyHours: [0, 0, 0, 0, 0, 0, 0],
  },
  {
    id: "NV008",
    name: "Hoàng Thị Linh",
    email: "linh@oneops.vn",
    departmentId: "DEPT-OPS",
    departmentName: "Vận hành",
    position: "Nhân viên trực ca",
    status: "ACTIVE",
    shiftCode: "CA-DEM",
    weeklyHours: [0, 8, 8, 8, 8, 8, 0],
  },
];

function getErrorMessage(
  error: unknown,
  fallback: string,
): string {
  return error instanceof Error && error.message
    ? error.message
    : fallback;
}

export function useShifts(): UseShiftsResult {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mountedRef = useRef(false);
  const requestIdRef = useRef(0);
  const mutationCountRef = useRef(0);

  /**
   * Tải ca làm việc và nhân viên.
   *
   * Development:
   * Nếu API lỗi, sử dụng dữ liệu mẫu để kiểm tra giao diện.
   *
   * Production:
   * Giữ lỗi API và không thay thế bằng dữ liệu giả.
   */
  const reload = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    if (mountedRef.current) {
      setLoading(true);
      setError(null);
    }

    try {
      const [shiftData, employeeData] = await Promise.all([
        shiftsApi.list(),
        shiftsApi.listEmployees(),
      ]);

      if (
        !mountedRef.current ||
        requestId !== requestIdRef.current
      ) {
        return;
      }

      setShifts(shiftData);
      setEmployees(employeeData);
      setError(null);
    } catch (err) {
      if (
        !mountedRef.current ||
        requestId !== requestIdRef.current
      ) {
        return;
      }

      if (process.env.NODE_ENV === "development") {
        console.warn(
          "[OneOps] Không tải được dữ liệu từ API. Sử dụng dữ liệu mẫu để phát triển giao diện.",
          err,
        );

        setShifts(MOCK_SHIFTS);
        setEmployees(MOCK_EMPLOYEES);
        setError(null);
      } else {
        setError(
          getErrorMessage(
            err,
            "Không thể tải dữ liệu ca làm việc.",
          ),
        );
      }
    } finally {
      if (
        mountedRef.current &&
        requestId === requestIdRef.current
      ) {
        setLoading(false);
      }
    }
  }, []);

  /**
   * Quản lý vòng đời component.
   */
  useEffect(() => {
    mountedRef.current = true;

    void reload();

    return () => {
      mountedRef.current = false;
      requestIdRef.current += 1;
    };
  }, [reload]);

  /**
   * Chạy thao tác tạo, sửa hoặc xóa.
   */
  const executeMutation = useCallback(
    async (
      operation: () => Promise<unknown>,
      fallback: string,
    ) => {
      mutationCountRef.current += 1;

      if (mountedRef.current) {
        setSaving(true);
        setError(null);
      }

      try {
        await operation();
      } catch (err) {
        const message = getErrorMessage(err, fallback);

        if (mountedRef.current) {
          setError(message);
        }

        throw new Error(message);
      } finally {
        mutationCountRef.current = Math.max(
          0,
          mutationCountRef.current - 1,
        );

        if (
          mountedRef.current &&
          mutationCountRef.current === 0
        ) {
          setSaving(false);
        }
      }

      /**
       * Chỉ tải lại sau khi thao tác API thành công.
       * reload tự xử lý lỗi tải dữ liệu và trạng thái loading.
       */
      await reload();
    },
    [reload],
  );

  const createShift = useCallback(
    async (payload: ShiftPayload) => {
      await executeMutation(
        () => shiftsApi.create(payload),
        "Không thể tạo ca làm việc.",
      );
    },
    [executeMutation],
  );

  const updateShift = useCallback(
    async (id: string, payload: ShiftPayload) => {
      await executeMutation(
        () => shiftsApi.update(id, payload),
        "Không thể cập nhật ca làm việc.",
      );
    },
    [executeMutation],
  );

  const deleteShift = useCallback(
    async (id: string) => {
      await executeMutation(
        () => shiftsApi.remove(id),
        "Không thể xóa ca làm việc.",
      );
    },
    [executeMutation],
  );

  return {
    shifts,
    employees,
    loading,
    saving,
    error,
    reload,
    createShift,
    updateShift,
    deleteShift,
  };
}