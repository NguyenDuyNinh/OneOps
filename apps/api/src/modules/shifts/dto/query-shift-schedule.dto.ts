import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  Matches,
  Validate,
  ValidateIf,
} from 'class-validator';
import { IsCalendarDateConstraint } from './is-calendar-date.constraint';

export class QueryShiftScheduleDto {
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Ngày bắt đầu phải đúng định dạng YYYY-MM-DD',
  })
  @Validate(IsCalendarDateConstraint)
  from!: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Ngày kết thúc phải đúng định dạng YYYY-MM-DD',
  })
  @Validate(IsCalendarDateConstraint)
  to!: string;

  @ValidateIf((_object, value) => value !== undefined)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty({ message: 'Mã nhân viên không được để trống' })
  employeeId?: string;
}
