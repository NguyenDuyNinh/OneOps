"use client";

import { useMemo, useState } from "react";
import {
  addSubTaskToTask,
  computeDepartmentMetrics,
  createTaskInColumn,
  moveTaskToColumn,
  toggleTaskCompletion,
  toggleTaskPriority,
} from "../lib/board";
import { INITIAL_DEPARTMENTS, INITIAL_REQUESTS, INITIAL_TASKS } from "../mocks";
import type { KanbanColumnId, RequestItem, TaskItem } from "../types";

export function useTaskBoard() {
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [requests, setRequests] = useState<RequestItem[]>(INITIAL_REQUESTS);

  const departmentMetrics = useMemo(
    () => computeDepartmentMetrics(INITIAL_DEPARTMENTS, tasks, INITIAL_TASKS),
    [tasks],
  );

  const reminderCount = useMemo(
    () => tasks.filter((t) => t.status !== "completed").length,
    [tasks],
  );

  const handleToggleTask = (taskId: string) => {
    setTasks((prev) => toggleTaskCompletion(prev, taskId));
  };

  const handleToggleTaskPriority = (
    taskId: string,
    field: "urgent" | "important",
  ) => {
    setTasks((prev) => toggleTaskPriority(prev, taskId, field));
  };

  const handleMoveTask = (taskId: string, targetColumn: KanbanColumnId) => {
    setTasks((prev) => moveTaskToColumn(prev, taskId, targetColumn));
  };

  const handleCreateTask = (
    columnId: KanbanColumnId,
    title: string,
    urgent: boolean = true,
    important: boolean = true,
  ) => {
    setTasks((prev) =>
      createTaskInColumn(prev, columnId, title, urgent, important),
    );
  };

  const handleAddSubtask = (taskId: string, title: string) => {
    setTasks((prev) => addSubTaskToTask(prev, taskId, title));
  };

  const handleUpdateDescription = (taskId: string, description: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, description } : t)),
    );
  };

  const handleToggleRequest = (reqId: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, completed: !r.completed } : r)),
    );
  };

  return {
    tasks,
    requests,
    departmentMetrics,
    reminderCount,
    handleToggleTask,
    handleToggleTaskPriority,
    handleMoveTask,
    handleCreateTask,
    handleAddSubtask,
    handleUpdateDescription,
    handleToggleRequest,
  };
}
