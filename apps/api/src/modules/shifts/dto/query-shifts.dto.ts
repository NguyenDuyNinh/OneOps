import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import type { ShiftStatusFilter } from '../shifts.types';

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;
const STATUS_FILTERS: readonly ShiftStatusFilter[] = ['all', 'active', 'inactive'];

export class QueryShiftsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Số trang không hợp lệ' })
  @Min(1, { message: 'Số trang phải lớn hơn 0' })
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Kích thước trang không hợp lệ' })
  @Min(1, { message: 'Kích thước trang phải lớn hơn 0' })
  @Max(MAX_PAGE_SIZE, { message: `Kích thước trang tối đa ${MAX_PAGE_SIZE}` })
  pageSize = DEFAULT_PAGE_SIZE;

  @IsOptional()
  @IsString()
  @MaxLength(120, { message: 'Từ khoá tìm kiếm tối đa 120 ký tự' })
  q?: string;

  @IsOptional()
  @IsIn(STATUS_FILTERS, { message: 'Trạng thái lọc không hợp lệ' })
  status: ShiftStatusFilter = 'all';
}
