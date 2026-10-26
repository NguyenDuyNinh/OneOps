import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserRole } from '../../platform/types/identity.types';
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '../users.constants';

/** Chuẩn hoá email trước khi validate: bỏ khoảng trắng, chuyển chữ thường. */
const normalizeEmail = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

/** Chuẩn hoá chuỗi: bỏ khoảng trắng đầu/cuối. */
const trimString = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class CreateUserDto {
  @Transform(normalizeEmail)
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @MaxLength(255, { message: 'Email tối đa 255 ký tự' })
  email: string;

  @Transform(trimString)
  @IsString({ message: 'Tên không hợp lệ' })
  @IsNotEmpty({ message: 'Tên không được để trống' })
  @MaxLength(120, { message: 'Tên tối đa 120 ký tự' })
  name: string;

  @IsEnum(UserRole, { message: 'Vai trò không hợp lệ' })
  role: UserRole;

  @IsString({ message: 'Mật khẩu không hợp lệ' })
  @MinLength(PASSWORD_MIN_LENGTH, {
    message: `Mật khẩu tối thiểu ${PASSWORD_MIN_LENGTH} ký tự`,
  })
  @MaxLength(PASSWORD_MAX_LENGTH, {
    message: `Mật khẩu tối đa ${PASSWORD_MAX_LENGTH} ký tự`,
  })
  password: string;

  @Transform(trimString)
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Đường dẫn ảnh tối đa 500 ký tự' })
  avatarUrl?: string;

  @Transform(trimString)
  @IsOptional()
  @IsString()
  @MaxLength(64, { message: 'Mã phòng ban tối đa 64 ký tự' })
  departmentId?: string;

  @Transform(trimString)
  @IsOptional()
  @IsString()
  @MaxLength(64, { message: 'Mã quản lý tối đa 64 ký tự' })
  managerId?: string;

  @IsOptional()
  @IsBoolean({ message: 'Trạng thái không hợp lệ' })
  isActive?: boolean;
}
