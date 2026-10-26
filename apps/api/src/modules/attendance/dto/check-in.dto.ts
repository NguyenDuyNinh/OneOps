import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { WorkStatus } from '@oneops/shared-types';

export class CheckInDto {
  @IsEnum(WorkStatus)
  @IsNotEmpty()
  type: WorkStatus;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  note?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  workLocation?: string;
}
