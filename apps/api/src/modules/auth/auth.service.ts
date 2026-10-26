import { Injectable, Logger, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import type { JwtPayload, UserRole } from '../platform/types/identity.types';
import type { AuthenticatedUser, LoginResponse } from './auth.types';

/** Thông báo chung cho mọi trường hợp sai thông tin — tránh dò email tồn tại. */
const INVALID_CREDENTIALS_MESSAGE = 'Email hoặc mật khẩu không chính xác.';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<LoginResponse> {
    const user = await this.usersService.findAuthUserByEmail(dto.email);

    if (!user) {
      this.logger.warn(`Đăng nhập thất bại: không tìm thấy tài khoản cho email đã nhập`);
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      this.logger.warn(`Đăng nhập thất bại: sai mật khẩu (userId=${user.id})`);
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }

    if (!user.isActive) {
      this.logger.warn(`Đăng nhập bị chặn: tài khoản đã vô hiệu hoá (userId=${user.id})`);
      throw new ForbiddenException('Tài khoản đã bị vô hiệu hoá. Vui lòng liên hệ quản trị viên.');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role as UserRole,
    };
    const accessToken = await this.jwtService.signAsync(payload);
    const authenticatedUser: AuthenticatedUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
      ...(user.avatarUrl ? { avatarUrl: user.avatarUrl } : {}),
    };

    this.logger.log(`Người dùng ${user.id} đăng nhập thành công`);
    return { accessToken, user: authenticatedUser };
  }
}
