import { IsBoolean } from 'class-validator';

export class UpdateUserStatusDto {
  @IsBoolean({ message: 'Trạng thái không hợp lệ' })
  isActive: boolean;
}
