import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Bỏ qua JWT guard cho endpoint công khai.
 * Sử dụng: @Public() trên controller/route handler
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
