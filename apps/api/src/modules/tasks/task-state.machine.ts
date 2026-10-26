import { BadRequestException } from '@nestjs/common';
import { TaskStatus, UserRole } from '@oneops/shared-types';

export class TaskStateMachine {
  // Bảng 9.1b các chuyển trạng thái hợp lệ
  private static readonly VALID_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
    [TaskStatus.TODO]: [TaskStatus.IN_PROGRESS, TaskStatus.PAUSED, TaskStatus.CANCELLED],
    [TaskStatus.IN_PROGRESS]: [TaskStatus.REVIEW, TaskStatus.PAUSED, TaskStatus.CANCELLED],
    [TaskStatus.REVIEW]: [TaskStatus.DONE, TaskStatus.REWORK],
    [TaskStatus.REWORK]: [TaskStatus.REVIEW, TaskStatus.PAUSED, TaskStatus.CANCELLED],
    [TaskStatus.PAUSED]: [TaskStatus.IN_PROGRESS, TaskStatus.CANCELLED],
    [TaskStatus.DONE]: [TaskStatus.REWORK], // Manager mở lại
    [TaskStatus.CANCELLED]: [], // Khóa hoàn toàn
  };

  static validateTransition(from: TaskStatus, to: TaskStatus, userRole: UserRole): void {
    const allowed = this.VALID_TRANSITIONS[from];
    if (!allowed || !allowed.includes(to)) {
      throw new BadRequestException(`Không thể chuyển trạng thái từ ${from} sang ${to}`);
    }

    // BR-ST-01: Chỉ Quản lý được duyệt DONE hoặc yêu cầu REWORK
    if ((to === TaskStatus.DONE || to === TaskStatus.REWORK) && userRole === UserRole.EMPLOYEE) {
      throw new BadRequestException('Chỉ Quản lý mới có quyền phê duyệt Hoàn thành hoặc yêu cầu Làm lại.');
    }
  }
}
