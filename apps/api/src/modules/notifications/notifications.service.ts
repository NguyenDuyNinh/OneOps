import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../core/prisma.service';
import { NotificationType } from '@oneops/shared-types';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  @OnEvent('task.created')
  async handleTaskCreated(payload: { taskId: string; taskTitle: string; assigneeId: string }) {
    await this.createNotification({
      userId: payload.assigneeId,
      type: NotificationType.TASK_ASSIGNED,
      title: 'Công việc mới được giao',
      body: `Bạn được giao công việc: "${payload.taskTitle}"`,
      actionUrl: `/tasks?id=${payload.taskId}`,
    });
  }

  @OnEvent('attendance.checked_in')
  async handleAttendanceCheckedIn(payload: { userId: string; status: string }) {
    this.logger.log(`Received attendance.checked_in event for user ${payload.userId}`);
  }

  async createNotification(data: {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    actionUrl?: string;
  }) {
    return this.prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        body: data.body,
        actionUrl: data.actionUrl,
      },
    });
  }

  async getUserNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }
}
