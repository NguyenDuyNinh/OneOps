import {
  commentInput,
  commentPageSchema,
  commentSchema,
  type CommentDto,
  type CommentInput,
} from "@/features/work-management/work/task-comments/types";
import { apiRequest } from "@/features/work-management/work/task-comments/api/http";

export const client = {
  list: (taskId: string, signal?: AbortSignal) =>
    apiRequest(
      `/task-comments?taskId=${taskId}&pageSize=100`,
      { signal },
      commentPageSchema,
    ),
  async create(input: CommentInput): Promise<CommentDto> {
    return apiRequest(
      "/task-comments",
      { method: "POST", body: JSON.stringify(commentInput.parse(input)) },
      commentSchema,
    );
  },
};
