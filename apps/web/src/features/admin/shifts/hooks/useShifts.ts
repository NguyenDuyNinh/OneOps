"use client";

import { useCallback, useEffect, useState } from "react";

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

export function useShifts(): UseShiftsResult {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [shiftData, employeeData] = await Promise.all([
        shiftsApi.list(),
        shiftsApi.listEmployees(),
      ]);

      setShifts(shiftData);
      setEmployees(employeeData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không thể tải dữ liệu ca làm việc.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const createShift = useCallback(
    async (payload: ShiftPayload) => {
      setSaving(true);
      setError(null);

      try {
        await shiftsApi.create(payload);
        await reload();
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Không thể tạo ca làm việc.";

        setError(message);
        throw new Error(message);
      } finally {
        setSaving(false);
      }
    },
    [reload],
  );

  const updateShift = useCallback(
    async (id: string, payload: ShiftPayload) => {
      setSaving(true);
      setError(null);

      try {
        await shiftsApi.update(id, payload);
        await reload();
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Không thể cập nhật ca làm việc.";

        setError(message);
        throw new Error(message);
      } finally {
        setSaving(false);
      }
    },
    [reload],
  );

  const deleteShift = useCallback(
    async (id: string) => {
      setSaving(true);
      setError(null);

      try {
        await shiftsApi.remove(id);
        await reload();
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Không thể xóa ca làm việc.";

        setError(message);
        throw new Error(message);
      } finally {
        setSaving(false);
      }
    },
    [reload],
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