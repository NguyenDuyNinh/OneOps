import { Transform } from 'class-transformer';
import { IsBoolean, IsInt, IsNotEmpty, IsString, Matches, Max, MaxLength, Min, ValidateIf } from 'class-validator';

const TIME_FORMAT = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

export class UpdateShiftDto {
  @ValidateIf((_object, value) => value !== undefined)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty({ message: 'Tên ca không được để trống' })
  @MaxLength(100, { message: 'Tên ca tối đa 100 ký tự' })
  name?: string;

  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @Matches(TIME_FORMAT, { message: 'Giờ bắt đầu phải đúng định dạng HH:mm (00:00–23:59)' })
  startTime?: string;

  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @Matches(TIME_FORMAT, { message: 'Giờ kết thúc phải đúng định dạng HH:mm (00:00–23:59)' })
  endTime?: string;

  @ValidateIf((_object, value) => value !== undefined)
  @Transform(({ value }) => (value === null ? null : Number(value)))
  @IsInt({ message: 'Thời gian nghỉ phải là số nguyên' })
  @Min(0, { message: 'Thời gian nghỉ không được âm' })
  @Max(1440, { message: 'Thời gian nghỉ vượt quá giới hạn trong ngày' })
  breakMinutes?: number;

  @ValidateIf((_object, value) => value !== undefined)
  @IsBoolean({ message: 'Trạng thái hoạt động phải là boolean' })
  isActive?: boolean;
}
