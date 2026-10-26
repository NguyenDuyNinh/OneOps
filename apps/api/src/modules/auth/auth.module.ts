import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { buildJwtOptions } from './auth.config';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    // registerAsync: factory chạy sau khi dotenv đã nạp .env, secret luôn sẵn sàng.
    JwtModule.registerAsync({
      useFactory: () => buildJwtOptions(),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
