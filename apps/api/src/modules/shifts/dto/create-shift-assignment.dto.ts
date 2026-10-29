import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  Matches,
  Validate,
} from 'class-validator';
import { IsCalendarDateConstraint } from './is-calendar-date.constraint';

export class CreateShiftAssignmentDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty({ message: 'Mã ca không được để trống' })
  shiftId!: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty({ message: 'Mã nhân viên không được để trống' })
  employeeId!: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Ngày làm việc phải đúng định dạng YYYY-MM-DD',
  })
  @Validate(IsCalendarDateConstraint)
  workDate!: string;
}
