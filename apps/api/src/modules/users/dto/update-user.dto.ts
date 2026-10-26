import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { UserRole } from '../../platform/types/identity.types';

/** Chuẩn hoá chuỗi: bỏ khoảng trắng đầu/cuối. */
const trimString = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

/**
 * Cho phép gửi `null` để bỏ gán (avatarUrl / departmentId / managerId),
 * nhưng nếu gửi chuỗi thì không được rỗng.
 */
const allowNullString = ({ value }: { value: unknown }): unknown =>
  value === null ? null : typeof value === 'string' ? value.trim() : value;

export class UpdateUserDto {
  @Transform(trimString)
  @IsOptional()
  @IsString({ message: 'Tên không hợp lệ' })
  @IsNotEmpty({ message: 'Tên không được để trống' })
  @MaxLength(120, { message: 'Tên tối đa 120 ký tự' })
  name?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Vai trò không hợp lệ' })
  role?: UserRole;

  @Transform(allowNullString)
  @IsOptional()
  @ValidateIf((_dto, value: unknown) => value !== null)
  @IsString()
  @MaxLength(500, { message: 'Đường dẫn ảnh tối đa 500 ký tự' })
  avatarUrl?: string | null;

  @Transform(allowNullString)
  @IsOptional()
  @ValidateIf((_dto, value: unknown) => value !== null)
  @IsString()
  @MaxLength(64, { message: 'Mã phòng ban tối đa 64 ký tự' })
  departmentId?: string | null;

  @Transform(allowNullString)
  @IsOptional()
  @ValidateIf((_dto, value: unknown) => value !== null)
  @IsString()
  @MaxLength(64, { message: 'Mã quản lý tối đa 64 ký tự' })
  managerId?: string | null;
}
