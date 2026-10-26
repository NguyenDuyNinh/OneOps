# AGENTS.md — Quy Tắc Kiến Trúc Bắt Buộc (OneOps)

> File này là bộ luật tối cao cho AI agents và toàn bộ team khi làm việc trong dự án.
> MỌI AI agent phải đọc và tuân thủ toàn bộ nội dung dưới đây trước khi thực hiện bất kỳ thay đổi nào.

---

## 1. PHÂN QUYỀN SỞ HỮU FILE (File Ownership)

### Nguyên tắc cứng — KHÔNG ĐƯỢC VI PHẠM:

1. Mỗi module có **một chủ sở hữu duy nhất**. Chủ sở hữu là người DUY NHẤT được tạo file mới trong phạm vi module.
2. KHÔNG BAO GIỜ import trực tiếp service của module khác. Giao tiếp chéo module qua `EventEmitter2`.
3. KHÔNG BAO GIỜ sửa `packages/database/prisma/schema.prisma` mà không thông báo cả team.
4. KHÔNG BAO GIỜ sửa `apps/api/src/core/` mà không có sự đồng ý của ít nhất 2 người.
5. KHÔNG BAO GIỜ sửa `apps/web/src/shared/` mà không thông báo team.

### Bảng phân quyền:

| Đường dẫn | Chủ sở hữu | Ghi chú |
|---|---|---|
| `apps/api/src/modules/attendance/` | Dev 1 | Exclusive |
| `apps/web/src/features/attendance/` | Dev 1 | Exclusive |
| `packages/shared-types/src/attendance.types.ts` | Dev 1 | Exclusive |
| `apps/api/src/modules/auth/` | Dev 1 (setup) | Thay đổi cần review |
| `apps/api/src/modules/users/` | Dev 1 (setup) | Thay đổi cần review |
| `apps/web/src/features/auth/` | Dev 1 (setup) | Thay đổi cần review |
| `apps/api/src/modules/tasks/` | Dev 2 | Exclusive |
| `apps/web/src/features/tasks/` | Dev 2 | Exclusive |
| `packages/shared-types/src/task.types.ts` | Dev 2 | Exclusive |
| `apps/api/src/modules/chat/` | Dev 3 | Exclusive |
| `apps/api/src/modules/notifications/` | Dev 3 | Exclusive |
| `apps/web/src/features/chat/` | Dev 3 | Exclusive |
| `apps/web/src/features/notifications/` | Dev 3 | Exclusive |
| `packages/shared-types/src/chat.types.ts` | Dev 3 | Exclusive |
| `packages/shared-types/src/notification.types.ts` | Dev 3 | Exclusive |
| `packages/database/prisma/schema.prisma` | SHARED | Cần thông báo team |
| `apps/api/src/core/` | SHARED | Cần review ≥2 người |
| `apps/web/src/shared/` | SHARED | Cần thông báo team |
| `apps/web/src/app/` | SHARED | Cần review ≥2 người |
| `packages/config/` | SHARED | Cần review ≥2 người |

---

## 2. QUY TẮC KIẾN TRÚC BACKEND (NestJS)

### 2.1 Cấu trúc bắt buộc của mỗi Module

Mỗi NestJS module PHẢI có cấu trúc sau (không thêm, không bớt tầng):

```
<module>/
├── dto/
│   ├── create-<entity>.dto.ts
│   └── update-<entity>.dto.ts
├── entities/            # (optional) Entity types thuần, không phụ thuộc Prisma
├── <module>.controller.ts
├── <module>.service.ts
├── <module>.module.ts
├── <module>.gateway.ts  # (nếu có WebSocket)
└── <module>.cron.ts     # (nếu có scheduled jobs)
```

### 2.2 Controller — Chỉ làm HTTP layer

```typescript
// ✅ ĐÚNG — Controller chỉ nhận request, gọi service, trả response
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('check-in')
  @UseGuards(JwtAuthGuard)
  async checkIn(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CheckInDto,
    @Req() req: Request,
  ) {
    return this.attendanceService.checkIn(user.id, dto, req.ip);
  }
}

// ❌ SAI — KHÔNG viết business logic trong controller
@Post('check-in')
async checkIn(@Body() dto: CheckInDto) {
  if (dto.type === 'OFFICE') {
    // business logic ở đây là SAI
    const isValidIp = this.ipList.includes(req.ip);
    if (!isValidIp) throw new ForbiddenException();
  }
}
```

### 2.3 Service — Business logic thuần

```typescript
// ✅ ĐÚNG — Service chứa toàn bộ business logic
@Injectable()
export class AttendanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async checkIn(userId: string, dto: CheckInDto, clientIp: string): Promise<AttendanceRecord> {
    // Validate business rules
    await this.validateNoExistingCheckIn(userId);
    if (dto.type === WorkStatus.AT_OFFICE) {
      this.validateOfficeNetwork(clientIp);
    }

    const record = await this.prisma.attendance.create({ ... });

    // Emit event để các module khác lắng nghe — KHÔNG gọi service module khác trực tiếp
    this.eventEmitter.emit('attendance.checked_in', { userId, record });

    return record;
  }

  private validateOfficeNetwork(ip: string): void {
    // ...
  }
}

// ❌ SAI — KHÔNG inject service của module khác trực tiếp
constructor(
  private readonly notificationService: NotificationService, // KHÔNG ĐƯỢC
  private readonly taskService: TaskService,                  // KHÔNG ĐƯỢC
) {}
```

### 2.4 DTO — Validation với class-validator

```typescript
// ✅ ĐÚNG
export class CheckInDto {
  @IsEnum(WorkStatus)
  @IsNotEmpty()
  type: WorkStatus;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  note?: string;
}

// ❌ SAI — KHÔNG dùng interface thuần làm DTO
interface CheckInRequest {
  type: string; // không có validation
}
```

### 2.5 Giao tiếp chéo module (Cross-module Communication)

```typescript
// ✅ ĐÚNG — Module A emit event
this.eventEmitter.emit('attendance.checked_in', payload);

// ✅ ĐÚNG — Module B lắng nghe event
@OnEvent('attendance.checked_in')
async handleCheckedIn(payload: AttendanceCheckedInEvent): Promise<void> {
  // xử lý
}

// ❌ SAI — KHÔNG inject và gọi trực tiếp service module khác
@Injectable()
export class AttendanceService {
  constructor(
    private readonly notificationService: NotificationService, // CẤM
  ) {}
}
```

### 2.6 Prisma — Quy tắc truy vấn

```typescript
// ✅ ĐÚNG — Select chỉ các field cần thiết
const user = await this.prisma.user.findUnique({
  where: { id: userId },
  select: { id: true, name: true, role: true },
});

// ❌ SAI — Không select toàn bộ khi không cần
const user = await this.prisma.user.findUnique({ where: { id: userId } });
// → Lấy cả password hash, sensitive data không cần thiết

// ✅ ĐÚNG — Transaction khi cần tính nguyên tử
const result = await this.prisma.$transaction(async (tx) => {
  const attendance = await tx.attendance.create({ ... });
  await tx.attendanceLog.create({ ... });
  return attendance;
});
```

### 2.7 Error Handling

```typescript
// ✅ ĐÚNG — Dùng HTTP exceptions của NestJS với message rõ ràng
throw new NotFoundException(`Task ${taskId} not found`);
throw new BadRequestException('Cannot check-in twice in the same day');
throw new ForbiddenException('You are not authorized to approve this task');

// ❌ SAI — Throw lỗi generic
throw new Error('Something went wrong');
throw new HttpException('Error', 400); // Message không rõ ràng
```

---

## 3. QUY TẮC KIẾN TRÚC FRONTEND (Next.js)

### 3.1 Nguyên tắc Server Component vs Client Component

```typescript
// ✅ ĐÚNG — Mặc định là Server Component (không có 'use client')
// app/(dashboard)/attendance/page.tsx
import { AttendancePageClient } from '@/features/attendance/components/AttendancePageClient';

export default async function AttendancePage() {
  // Fetch data ở Server Component
  const initialData = await fetchAttendanceData();
  return <AttendancePageClient initialData={initialData} />;
}

// ✅ ĐÚNG — Client Component khi cần state/effect/event handlers
// features/attendance/components/AttendancePageClient.tsx
'use client';
export function AttendancePageClient({ initialData }) {
  const [data, setData] = useState(initialData);
  // ...
}
```

### 3.2 Feature Folder — Cấu trúc bắt buộc

```
features/<module>/
├── components/    # React components của module
├── hooks/         # Custom hooks (useXxx.ts)
├── api/           # API calls (axios/fetch wrapper)
│   └── <module>.api.ts
└── types/
    └── index.ts   # Re-export từ packages/shared-types
```

**Quy tắc:**
- Component KHÔNG được gọi API trực tiếp (axios/fetch). Phải qua file `api/<module>.api.ts`.
- Component KHÔNG được chứa business logic. Logic đặt trong `hooks/`.
- `types/index.ts` CHỈ re-export từ `@oneops/shared-types`, KHÔNG định nghĩa type mới ở đây.

```typescript
// ✅ ĐÚNG — Component gọi qua hook
export function CheckInButton() {
  const { checkIn, isLoading } = useAttendance();
  return <button onClick={checkIn} disabled={isLoading}>Check In</button>;
}

// ❌ SAI — Component gọi API trực tiếp
export function CheckInButton() {
  const handleClick = async () => {
    await axios.post('/attendance/check-in'); // KHÔNG ĐƯỢC
  };
}
```

### 3.3 API Layer

```typescript
// ✅ ĐÚNG — features/attendance/api/attendance.api.ts
import { apiClient } from '@/shared/lib/api-client';
import type { CheckInDto, AttendanceRecord } from '@oneops/shared-types';

export const attendanceApi = {
  checkIn: (dto: CheckInDto): Promise<AttendanceRecord> =>
    apiClient.post('/attendance/check-in', dto),

  checkOut: (): Promise<AttendanceRecord> =>
    apiClient.post('/attendance/check-out'),

  getHeadcount: (): Promise<HeadcountData> =>
    apiClient.get('/attendance/headcount'),
};
```

### 3.4 Custom Hooks

```typescript
// ✅ ĐÚNG — features/attendance/hooks/useAttendance.ts
export function useAttendance() {
  const [status, setStatus] = useState<AttendanceRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkIn = useCallback(async (dto: CheckInDto) => {
    setIsLoading(true);
    try {
      const record = await attendanceApi.checkIn(dto);
      setStatus(record);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { status, isLoading, checkIn };
}
```

### 3.5 CSS Modules — Styling

```css
/* ✅ ĐÚNG — features/attendance/components/CheckInButton.module.css */
.button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.button--loading {
  opacity: 0.7;
  cursor: not-allowed;
}
```

```typescript
// ✅ ĐÚNG — Import CSS Module
import styles from './CheckInButton.module.css';
<button className={`${styles.button} ${isLoading ? styles['button--loading'] : ''}`}>
```

```typescript
// ❌ SAI — KHÔNG dùng inline style cho layout
<button style={{ padding: '12px 24px', borderRadius: '8px' }}>
```

---

## 4. QUY TẮC DATABASE (Prisma Schema)

### 4.1 Naming conventions trong schema

```prisma
// ✅ ĐÚNG
model Attendance {
  id          String      @id @default(cuid())
  userId      String      @map("user_id")
  status      WorkStatus
  checkedInAt DateTime    @map("checked_in_at")
  createdAt   DateTime    @default(now()) @map("created_at")
  updatedAt   DateTime    @updatedAt @map("updated_at")

  user        User        @relation(fields: [userId], references: [id])

  @@map("attendances")
  @@index([userId])
  @@index([checkedInAt])
}
```

**Bắt buộc:**
- `id` là `String @id @default(cuid())`.
- Luôn có `createdAt`, `updatedAt`.
- Field tên JS dùng `camelCase`, map sang DB dùng `@map("snake_case")`.
- Table name: số nhiều, `@map("snake_case")`.
- Thêm `@@index` cho các field thường dùng trong `WHERE` clause.

### 4.2 Quy trình thay đổi Schema

1. Thông báo team trên channel chung: *"Tôi cần thêm model X / field Y vào schema"*.
2. Tạo branch: `chore/db/add-<model-name>`.
3. Sửa `schema.prisma`, chạy `pnpm db:migrate --name add_<model_name>`.
4. Tạo PR, tag cả 3 dev để review.
5. Merge SAU KHI có ít nhất 2 approvals.

---

## 5. QUY TẮC TYPESCRIPT

### 5.1 Strict mode — KHÔNG tắt bất kỳ rule nào

```json
// tsconfig.json — Bắt buộc
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true
  }
}
```

### 5.2 Type vs Interface

```typescript
// ✅ Dùng type cho union types, mapped types
type WorkStatus = 'AT_OFFICE' | 'REMOTE' | 'ON_DUTY' | 'ABSENT';
type TaskStatusMap = Record<TaskStatus, string>;

// ✅ Dùng interface cho object shapes (có thể extend)
interface AttendanceRecord {
  id: string;
  userId: string;
  status: WorkStatus;
  checkedInAt: Date;
}

// ❌ KHÔNG dùng `any`
const data: any = response.data; // CẤM
// ✅ Dùng `unknown` và type guard
const data: unknown = response.data;
if (isAttendanceRecord(data)) { ... }
```

### 5.3 Shared Types — Nguồn sự thật duy nhất

```typescript
// ✅ ĐÚNG — packages/shared-types/src/attendance.types.ts
export enum WorkStatus {
  AT_OFFICE = 'AT_OFFICE',
  REMOTE = 'REMOTE',
  ON_DUTY = 'ON_DUTY',
  ABSENT = 'ABSENT',
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  status: WorkStatus;
  checkedInAt: Date;
  checkedOutAt?: Date;
}

// ❌ SAI — KHÔNG định nghĩa lại type đã có trong shared-types
// apps/api/src/modules/attendance/attendance.types.ts
type WorkStatus = 'at_office' | 'remote'; // TRÙNG LẶP, CẤM
```

---

## 6. QUY TẮC GIT & COMMIT

### 6.1 Branch naming

```
feat/<module>/<short-description>     # Tính năng mới
fix/<module>/<short-description>      # Bug fix
chore/<scope>/<short-description>     # Config, deps, refactor
docs/<scope>/<short-description>      # Tài liệu

# Ví dụ:
feat/attendance/check-in-ip-validation
fix/tasks/state-machine-paused-transition
chore/db/add-task-proposal-model
```

### 6.2 Commit message (Conventional Commits — BẮT BUỘC)

```
<type>(<scope>): <mô tả tiếng Anh, ngắn gọn>

type:  feat | fix | refactor | chore | docs | test | style | perf
scope: attendance | tasks | chat | notifications | auth | db | shared | config

# Đúng:
feat(attendance): add office IP validation on check-in
fix(tasks): prevent duplicate task warning on creation
chore(db): add index on attendance.checked_in_at

# Sai:
fix: sửa bug   ← thiếu scope
feat: Add new feature   ← chữ hoa đầu
update attendance service   ← không có type
```

### 6.3 Pull Request

- PR title = commit message format.
- Description phải ghi rõ: "Thay đổi gì?", "Tại sao?", "Cách test?".
- KHÔNG tự merge PR của mình vào `develop` hay `main`.
- PR đụng file SHARED: tag cả 3 dev, cần ≥2 approvals.

---

## 7. WEBSOCKET — NAMING CONVENTION

### Room naming (server-side)

```typescript
// Format: <module>:<entity>:<id>
`headcount`                   // Phòng quân số chung
`tasks:user:${userId}`        // Task của 1 user
`tasks:all`                   // Tất cả task (Manager view)
`chat:room:${roomId}`         // Phòng chat
`notifications:${userId}`     // Thông báo của user
```

### Event naming

```typescript
// Format: <module>.<action> (dấu chấm, snake_case)
'attendance.checked_in'
'attendance.checked_out'
'attendance.status_changed'
'task.created'
'task.status_changed'
'task.deadline_warning'
'chat.message_sent'
'notification.created'
```

---

## 8. NHỮNG ĐIỀU TUYỆT ĐỐI CẤM (Hard Rules)

1. **KHÔNG** import `AttendanceService` vào `TasksService` hoặc ngược lại.
2. **KHÔNG** viết raw SQL query (dùng Prisma).
3. **KHÔNG** commit file `.env` chứa secret thật.
4. **KHÔNG** dùng `console.log` trong production code (dùng `Logger` của NestJS).
5. **KHÔNG** push thẳng vào branch `main` hoặc `develop`.
6. **KHÔNG** disable TypeScript strict checks (`// @ts-ignore`, `// @ts-nocheck`).
7. **KHÔNG** dùng `any` type (ngoại lệ: third-party library type không đầy đủ, phải có comment giải thích).
8. **KHÔNG** để TODO comment trong code trước khi merge vào `develop`.
9. **KHÔNG** hardcode URL, IP, port trong code — phải dùng biến môi trường.
10. **KHÔNG** xử lý lỗi bằng cách nuốt exception: `try { ... } catch (e) {}`.
