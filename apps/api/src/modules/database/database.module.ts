import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * [SHARED] Module hạ tầng DB.
 *
 * `@Global()` để mọi module nghiệp vụ chỉ cần inject `PrismaService` mà không
 * phải khai báo lại `providers: [PrismaService]` ở từng module — trước đây
 * 5 module đang lặp lại đúng dòng đó, gây sửa trùng lặp khi thêm hạ tầng mới.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}
