import { IsString, MaxLength, MinLength } from 'class-validator';
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '../users.constants';

export class ResetUserPasswordDto {
  @IsString({ message: 'Mật khẩu không hợp lệ' })
  @MinLength(PASSWORD_MIN_LENGTH, {
    message: `Mật khẩu tối thiểu ${PASSWORD_MIN_LENGTH} ký tự`,
  })
  @MaxLength(PASSWORD_MAX_LENGTH, {
    message: `Mật khẩu tối đa ${PASSWORD_MAX_LENGTH} ký tự`,
  })
  password: string;
}
