import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  @MaxLength(255)
  email: string;

  // Không ràng buộc độ dài tối thiểu: đây là đăng nhập, không phải đăng ký.
  @IsString({ message: 'Mật khẩu không hợp lệ' })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MaxLength(128)
  password: string;
}
