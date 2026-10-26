import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../types/identity.types';

export const ROLES_KEY = 'roles';

/**
 * Chỉ định roles được phép truy cập endpoint.
 * Sử dụng: @Roles(UserRole.MANAGER)
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
