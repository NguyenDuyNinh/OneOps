import { IsNotEmpty, IsString } from 'class-validator';

export class RejectDeadlineProposalDto {
  @IsNotEmpty({ message: 'Lý do từ chối là bắt buộc' })
  @IsString({ message: 'Lý do từ chối phải là chuỗi ký tự' })
  reason!: string;
}

