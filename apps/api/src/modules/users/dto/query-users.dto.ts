import { Type } from 'class-transformer';
import { IsEnum, IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { UserRole } from '../../platform/types/identity.types';
import type { UserStatusFilter } from '../users.types';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../users.constants';

const STATUS_FILTERS: readonly UserStatusFilter[] = ['all', 'active', 'inactive'];

export class QueryUsersDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Số trang không hợp lệ' })
  @Min(1, { message: 'Số trang phải lớn hơn 0' })
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Kích thước trang không hợp lệ' })
  @Min(1, { message: 'Kích thước trang phải lớn hơn 0' })
  @Max(MAX_PAGE_SIZE, { message: `Kích thước trang tối đa ${MAX_PAGE_SIZE}` })
  pageSize: number = DEFAULT_PAGE_SIZE;

  @IsOptional()
  @IsString()
  @MaxLength(120, { message: 'Từ khoá tìm kiếm tối đa 120 ký tự' })
  q?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Vai trò không hợp lệ' })
  role?: UserRole;

  @IsOptional()
  @IsIn(STATUS_FILTERS, { message: 'Trạng thái lọc không hợp lệ' })
  status: UserStatusFilter = 'all';
}
