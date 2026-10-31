"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { shiftsApi } from "../api/shifts.api";
import type {
  Shift,
  ShiftInput,
  ShiftStatusFilter,
} from "../types/shifts.types";

export function useShifts() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ShiftStatusFilter>("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const loadShifts = useCallback(async (currentRequest: number) => {
    try {
      const response = await shiftsApi.list({
        q: query,
        status,
        page,
        pageSize: 10,
      });
      if (currentRequest !== requestId.current) return;
      setShifts(response.items);
      setTotal(response.total);
      setTotalPages(response.totalPages);
      setError(null);
    } catch (cause) {
      if (currentRequest === requestId.current) {
        setError(cause instanceof Error ? cause.message : "Không tải được danh sách ca.");
        setShifts([]);
        setTotal(0);
      }
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }, [page, query, status]);

  const reload = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setLoading(true);
    setError(null);
    await loadShifts(currentRequest);
  }, [loadShifts]);

  useEffect(() => {
    const currentRequest = ++requestId.current;
    void loadShifts(currentRequest);
    return () => {
      requestId.current += 1;
    };
  }, [loadShifts]);

  const changePage = useCallback((nextPage: number) => {
    setLoading(true);
    setPage(nextPage);
  }, []);

  const changeQuery = useCallback((nextQuery: string) => {
    setLoading(true);
    setQuery(nextQuery);
  }, []);

  const changeStatus = useCallback((nextStatus: ShiftStatusFilter) => {
    setLoading(true);
    setStatus(nextStatus);
  }, []);

  const createShift = useCallback(async (input: ShiftInput) => {
    setSaving(true);
    try {
      await shiftsApi.create(input);
      await reload();
    } finally {
      setSaving(false);
    }
  }, [reload]);

  const updateShift = useCallback(async (id: string, input: Partial<ShiftInput>) => {
    setSaving(true);
    try {
      await shiftsApi.update(id, input);
      await reload();
    } finally {
      setSaving(false);
    }
  }, [reload]);

  const deleteShift = useCallback(async (id: string) => {
    setSaving(true);
    try {
      const result = await shiftsApi.remove(id);
      await reload();
      return result;
    } finally {
      setSaving(false);
    }
  }, [reload]);

  return {
    shifts,
    total,
    page,
    totalPages,
    query,
    status,
    loading,
    saving,
    error,
    reload,
    setPage: changePage,
    setQuery: changeQuery,
    setStatus: changeStatus,
    createShift,
    updateShift,
    deleteShift,
  };
}
