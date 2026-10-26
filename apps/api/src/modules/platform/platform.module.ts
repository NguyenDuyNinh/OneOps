import { Global, Module } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

/**
 * [SHARED] Hạ tầng HTTP dùng chung cho mọi module nghiệp vụ.
 *
 * Vì sao không đặt trong `modules/auth`? Guards/decorator dưới đây được 5 module
 * dùng (attendance, tasks, chat, notifications, users). Nếu để ở auth thì 5 module
 * phải import chéo từ auth, và auth lại đang cần `UsersService` → tạo phụ thuộc
 * vòng. `platform` chỉ chứa hạ tầng, không chứa nghiệp vụ, và **không được phép
 * import bất kỳ module nghiệp vụ nào**.
 */
@Global()
@Module({
  providers: [JwtAuthGuard, RolesGuard],
  exports: [JwtAuthGuard, RolesGuard],
})
export class PlatformModule {}
