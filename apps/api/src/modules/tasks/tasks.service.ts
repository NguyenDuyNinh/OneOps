import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../core/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskStateMachine } from './task-state.machine';
import { TaskStatus, UserRole } from '@oneops/shared-types';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createdById: string, dto: CreateTaskDto) {
    const deadlineDate = new Date(dto.deadline);
    if (deadlineDate <= new Date()) {
      throw new BadRequestException('Deadline phải là thời điểm trong tương lai.');
    }

    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        deadline: deadlineDate,
        assigneeId: dto.assigneeId,
        createdById,
        status: TaskStatus.TODO,
      },
    });

    this.eventEmitter.emit('task.created', {
      taskId: task.id,
      taskTitle: task.title,
      assigneeId: task.assigneeId,
      assignedById: createdById,
      deadline: task.deadline,
    });

    return task;
  }

  async updateStatus(taskId: string, newStatus: TaskStatus, userId: string, role: UserRole, reason?: string) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task không tồn tại');

    TaskStateMachine.validateTransition(task.status, newStatus, role);

    const updatedTask = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.task.update({
        where: { id: taskId },
        data: { status: newStatus },
      });

      await tx.taskLog.create({
        data: {
          taskId,
          fromStatus: task.status,
          toStatus: newStatus,
          changedById: userId,
          reason,
        },
      });

      return updated;
    });

    this.eventEmitter.emit('task.status_changed', {
      taskId: updatedTask.id,
      fromStatus: task.status,
      toStatus: newStatus,
      userId,
    });

    return updatedTask;
  }

  async findAll(query?: { assigneeId?: string; status?: TaskStatus }) {
    return this.prisma.task.findMany({
      where: {
        ...(query?.assigneeId && { assigneeId: query.assigneeId }),
        ...(query?.status && { status: query.status }),
      },
      include: {
        assignee: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { deadline: 'asc' },
    });
  }
}
