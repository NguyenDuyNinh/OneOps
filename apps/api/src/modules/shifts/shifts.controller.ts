import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../platform/decorators/current-user.decorator';
import { Roles } from '../platform/decorators/roles.decorator';
import { JwtAuthGuard } from '../platform/guards/jwt-auth.guard';
import { RolesGuard } from '../platform/guards/roles.guard';
import { UserRole } from '../platform/types/identity.types';
import type { JwtPayload } from '../platform/types/identity.types';
import { QueryShiftsDto } from './dto/query-shifts.dto';
import type { PaginatedShifts } from './shifts.types';
import { ShiftsService } from './shifts.service';

@Controller('shifts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.MANAGER, UserRole.ADMIN)
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) {}

  @Get()
  async list(
    @Query() query: QueryShiftsDto,
    @CurrentUser() _user: JwtPayload,
  ): Promise<PaginatedShifts> {
    return this.shiftsService.list(query);
  }
}
