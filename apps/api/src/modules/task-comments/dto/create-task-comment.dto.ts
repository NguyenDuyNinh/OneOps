import { IsArray, IsEnum, IsISO8601, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CommentType } from '@prisma/client';

export class CreateTaskCommentDto {
  @IsNotEmpty({ message: 'Nội dung bình luận không được để trống' })
  @IsString({ message: 'Nội dung bình luận phải là chuỗi ký tự' })
  content!: string;

  @IsOptional()
  @IsEnum(CommentType, { message: 'Loại bình luận không hợp lệ' })
  type?: CommentType;

  @IsOptional()
  @IsArray({ message: 'Danh sách mentions phải là một mảng' })
  @IsString({ each: true, message: 'ID người được nhắc đến phải là chuỗi' })
  mentions?: string[];

  @IsOptional()
  @IsArray({ message: 'Danh sách liên kết phải là một mảng' })
  @IsString({ each: true, message: 'Liên kết phải là chuỗi' })
  links?: string[];

  @IsOptional()
  @IsArray({ message: 'Danh sách tệp đính kèm phải là một mảng' })
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    size?: number;
    mimeType?: string;
  }>;

  @IsOptional()
  @IsISO8601({}, { message: 'Thời hạn đề xuất phải đúng định dạng ISO 8601' })
  proposedDeadline?: string;
}

