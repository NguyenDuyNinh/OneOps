import { apiClient } from '@/shared/lib/api-client';
import { Task, TaskStatus } from '@oneops/shared-types';

export const tasksApi = {
  getTasks: (): Promise<Task[]> => apiClient.get('/tasks'),
  updateStatus: (id: string, status: TaskStatus): Promise<Task> =>
    apiClient.patch(`/tasks/${id}/status`, { status }),
};
