import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TasksGateway } from './tasks.gateway';
import { PrismaService } from '../../core/prisma.service';

@Module({
  controllers: [TasksController],
  providers: [TasksService, TasksGateway, PrismaService],
  exports: [TasksService],
})
export class TasksModule {}
