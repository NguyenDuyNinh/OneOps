/**
 * API client của slice `admin/tasks`.
 *
 * ⚠️ ĐỂ TRỐNG THEO YÊU CẦU — Backend chưa cần làm luồng.
 * Khi nối luồng BE, thay các hàm bên dưới bằng `api.get` / `api.post` / `api.patch` từ `@/features/auth`.
 */

import type {
  CreateSubTaskPayload,
  CreateTaskPayload,
  RequestItem,
  SubTask,
  TaskBoardData,
  TaskItem,
  UpdateRequestApprovalPayload,
  UpdateTaskPayload,
  UpdateTaskStatusPayload,
} from "../types";

export const tasksApi = {
  getBoard: async (): Promise<TaskBoardData> => {
    throw new Error("API chưa được kết nối (GET /tasks/board)");
  },

  create: async (_dto: CreateTaskPayload): Promise<TaskItem> => {
    throw new Error("API chưa được kết nối (POST /tasks)");
  },

  updateStatus: async (
    _taskId: string,
    _dto: UpdateTaskStatusPayload,
  ): Promise<TaskItem> => {
    throw new Error("API chưa được kết nối (PATCH /tasks/:id/status)");
  },

  update: async (_taskId: string, _dto: UpdateTaskPayload): Promise<TaskItem> => {
    throw new Error("API chưa được kết nối (PATCH /tasks/:id)");
  },

  addSubtask: async (
    _taskId: string,
    _dto: CreateSubTaskPayload,
  ): Promise<SubTask> => {
    throw new Error("API chưa được kết nối (POST /tasks/:id/subtasks)");
  },

  updateRequestApproval: async (
    _requestId: string,
    _dto: UpdateRequestApprovalPayload,
  ): Promise<RequestItem> => {
    throw new Error("API chưa được kết nối (PATCH /tasks/requests/:id)");
  },
};
