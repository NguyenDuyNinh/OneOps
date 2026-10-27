import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum SystemLogActionEnum {
  PAUSE = 'PAUSE',
  CANCEL = 'CANCEL',
  REWORK = 'REWORK',
  REASSIGN = 'REASSIGN',
}

export class CreateSystemLogDto {
  @IsEnum(SystemLogActionEnum)
  @IsNotEmpty()
  action: SystemLogActionEnum;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  @IsOptional()
  newAssigneeId?: string;
}

