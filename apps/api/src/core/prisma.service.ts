import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { prisma } from '@oneops/database';

@Injectable()
export class PrismaService implements OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  get user() { return prisma.user; }
  get attendance() { return prisma.attendance; }
  get attendanceLog() { return prisma.attendanceLog; }
  get workConfig() { return prisma.workConfig; }
  get task() { return prisma.task; }
  get taskLog() { return prisma.taskLog; }
  get taskProposal() { return prisma.taskProposal; }
  get taskComment() { return prisma.taskComment; }
  get chatRoom() { return prisma.chatRoom; }
  get chatMember() { return prisma.chatMember; }
  get message() { return prisma.message; }
  get notification() { return prisma.notification; }
  get $transaction() { return prisma.$transaction.bind(prisma); }

  async onModuleDestroy() {
    await prisma.$disconnect();
  }
}
