import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { JwtPayload, TaskStatus } from '@oneops/shared-types';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateTaskDto) {
    return this.tasksService.create(user.sub, dto);
  }

  @Get()
  async findAll(@Query('assigneeId') assigneeId?: string, @Query('status') status?: TaskStatus) {
    return this.tasksService.findAll({ assigneeId, status });
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body('status') status: TaskStatus,
    @Body('reason') reason?: string,
  ) {
    return this.tasksService.updateStatus(id, status, user.sub, user.role, reason);
  }
}
