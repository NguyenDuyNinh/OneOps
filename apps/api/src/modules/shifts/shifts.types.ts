export type ShiftStatusFilter = 'all' | 'active' | 'inactive';

export interface ShiftListItem {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedShifts {
  items: ShiftListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
