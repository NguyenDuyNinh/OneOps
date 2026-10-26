"use client";

import React from "react";
import type { UserRole, UserStatusFilter } from "../types";
import { ROLE_FILTER_OPTIONS, STATUS_FILTER_OPTIONS } from "../constants";
import FormSelect from "./FormSelect";

interface UsersToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  role: UserRole | "";
  onRoleChange: (value: UserRole | "") => void;
  status: UserStatusFilter;
  onStatusChange: (value: UserStatusFilter) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export default function UsersToolbar({
  search,
  onSearchChange,
  role,
  onRoleChange,
  status,
  onStatusChange,
  onRefresh,
  isLoading,
}: UsersToolbarProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="flex-1">
        <label htmlFor="user-search" className="sr-only">
          Tìm kiếm tài khoản
        </label>
        <input
          id="user-search"
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Tìm theo tên hoặc email..."
          className="shadow-theme-xs h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:ring-brand-500/10 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="sm:w-48">
          <label htmlFor="user-role-filter" className="sr-only">
            Lọc theo vai trò
          </label>
          <FormSelect
            id="user-role-filter"
            value={role}
            options={ROLE_FILTER_OPTIONS.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
            onChange={(value) => onRoleChange(value as UserRole | "")}
            disabled={isLoading}
          />
        </div>

        <div className="sm:w-52">
          <label htmlFor="user-status-filter" className="sr-only">
            Lọc theo trạng thái
          </label>
          <FormSelect
            id="user-status-filter"
            value={status}
            options={STATUS_FILTER_OPTIONS.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
            onChange={(value) => onStatusChange(value as UserStatusFilter)}
            disabled={isLoading}
          />
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="shadow-theme-xs h-11 rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
        >
          {isLoading ? "Đang tải..." : "Làm mới"}
        </button>
      </div>
    </div>
  );
}
