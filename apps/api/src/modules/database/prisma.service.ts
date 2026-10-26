import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * [SHARED] Cổng truy cập PostgreSQL duy nhất của API.
 *
 * Kế thừa trực tiếp `PrismaClient` nên không cần khai báo getter cho từng model:
 * model nào Prisma sinh ra thì `this.prisma.<model>` dùng được ngay. Nhờ vậy khi
 * một dev thêm bảng mới cho module của mình, **không ai phải sửa file này** —
 * đúng nguyên tắc zero-conflict của kiến trúc dọc.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
