# CLEANCODE.md — Quy Tắc Viết Code Sạch (OneOps)

> Áp dụng cho toàn bộ team. Đây là tiêu chuẩn để reviewer reject PR nếu vi phạm.

---

## 1. Đặt tên (Naming)

### Quy tắc chung: Tên phải nói lên ý nghĩa, không cần comment giải thích

```typescript
// ❌ SAI
const d = new Date();
const u = await getUserById(id);
function check(x: string): boolean {}
const flag = true;
const list = [];

// ✅ ĐÚNG
const today = new Date();
const employee = await getUserById(id);
function isValidOfficeNetwork(ipAddress: string): boolean {}
const isLateCheckIn = true;
const overdueTaskList = [];
```

### Naming theo loại

| Loại | Convention | Ví dụ |
|---|---|---|
| Variable | `camelCase` | `checkedInAt`, `taskList` |
| Function/Method | `camelCase`, bắt đầu bằng động từ | `checkIn()`, `validateIp()`, `getHeadcount()` |
| Boolean variable | Tiền tố `is`, `has`, `can`, `should` | `isLate`, `hasCheckedIn`, `canApprove` |
| Constant | `SCREAMING_SNAKE_CASE` | `MAX_LATE_MINUTES`, `OFFICE_CHECK_IN_HOUR` |
| Class/Interface | `PascalCase` | `AttendanceService`, `TaskRecord` |
| Enum | `PascalCase` (tên), `SCREAMING_SNAKE_CASE` (giá trị) | `WorkStatus.AT_OFFICE` |
| File BE | `kebab-case` | `attendance.service.ts` |
| File FE Component | `PascalCase` | `CheckInButton.tsx` |
| File FE Hook | `camelCase` | `useAttendance.ts` |
| CSS Class | `kebab-case` | `.check-in-button` |
| CSS Module Class | `camelCase` | `styles.checkInButton` |

---

## 2. Hàm (Functions)

### Nguyên tắc Single Responsibility — Mỗi hàm làm đúng 1 việc

```typescript
// ❌ SAI — Hàm làm quá nhiều việc
async function handleCheckIn(userId: string, dto: CheckInDto, ip: string) {
  // Validate IP
  const allowedIps = process.env.OFFICE_ALLOWED_IPS.split(',');
  const isValidIp = allowedIps.some(range => ipInRange(ip, range));
  if (!isValidIp) throw new ForbiddenException();

  // Check đã check-in chưa
  const today = startOfDay(new Date());
  const existing = await prisma.attendance.findFirst({ ... });
  if (existing) throw new BadRequestException();

  // Tính toán trạng thái
  const now = new Date();
  const lateThreshold = set(today, { hours: 7, minutes: 55 });
  const isLate = now > lateThreshold;

  // Tạo record
  const record = await prisma.attendance.create({ ... });

  // Gửi thông báo
  await notificationService.send({ ... });

  // Emit event
  eventEmitter.emit('attendance.checked_in', record);
  return record;
}

// ✅ ĐÚNG — Tách thành các hàm nhỏ, mỗi hàm 1 nhiệm vụ
async function checkIn(userId: string, dto: CheckInDto, clientIp: string) {
  this.validateOfficeNetwork(dto.type, clientIp);
  await this.assertNotAlreadyCheckedIn(userId);

  const checkInStatus = this.determineCheckInStatus(dto.type);
  const record = await this.createAttendanceRecord(userId, dto, checkInStatus);

  this.eventEmitter.emit('attendance.checked_in', { userId, record });
  return record;
}

private validateOfficeNetwork(type: WorkStatus, ip: string): void { ... }
private async assertNotAlreadyCheckedIn(userId: string): Promise<void> { ... }
private determineCheckInStatus(type: WorkStatus): CheckInStatus { ... }
private async createAttendanceRecord(...): Promise<Attendance> { ... }
```

### Độ dài hàm: Tối đa 30 dòng

Nếu hàm vượt 30 dòng, xem xét tách ra hàm nhỏ hơn.

### Số lượng tham số: Tối đa 3

```typescript
// ❌ SAI — Quá nhiều params
function createTask(title: string, desc: string, assigneeId: string,
  deadline: Date, priority: string, projectId: string) {}

// ✅ ĐÚNG — Dùng DTO/object
function createTask(dto: CreateTaskDto) {}
```

---

## 3. Điều kiện & Vòng lặp (Conditions & Loops)

### Early return — Thoát sớm khi có thể

```typescript
// ❌ SAI — Nested if sâu
async function approveLeave(managerId: string, leaveId: string) {
  const leave = await this.prisma.leave.findUnique({ where: { id: leaveId } });
  if (leave) {
    if (leave.status === 'PENDING') {
      if (leave.userId !== managerId) {
        // ... logic chính ở đây, sâu 3 cấp
      }
    }
  }
}

// ✅ ĐÚNG — Early return
async function approveLeave(managerId: string, leaveId: string) {
  const leave = await this.prisma.leave.findUnique({ where: { id: leaveId } });
  if (!leave) throw new NotFoundException('Leave request not found');
  if (leave.status !== 'PENDING') throw new BadRequestException('Already processed');
  if (leave.userId === managerId) throw new ForbiddenException('Cannot approve own leave');

  // Logic chính ở đây, không bị nest
  return this.processLeaveApproval(leave);
}
```

### Điều kiện phức tạp — Đặt tên có ý nghĩa

```typescript
// ❌ SAI
if (task.deadline < new Date() && task.status !== 'DONE' && task.status !== 'CANCELLED') {}

// ✅ ĐÚNG
const isOverdue = task.deadline < new Date();
const isActiveTask = !['DONE', 'CANCELLED'].includes(task.status);
if (isOverdue && isActiveTask) {}
```

---

## 4. Async/Await & Error Handling

### Luôn handle error — KHÔNG nuốt exception

```typescript
// ❌ SAI — Nuốt lỗi
try {
  await this.sendEmail(userId);
} catch (e) {}

// ❌ SAI — Log rồi tiếp tục như không có gì
try {
  await this.sendEmail(userId);
} catch (e) {
  console.log(e); // dùng Logger, và phải quyết định có rethrow không
}

// ✅ ĐÚNG — Log có context, quyết định rõ ràng
try {
  await this.sendEmail(userId);
} catch (error) {
  // Email không gửi được không nên chặn luồng check-in
  this.logger.warn('Failed to send check-in email', { userId, error: error.message });
  // KHÔNG rethrow → tính năng phụ không được ảnh hưởng tính năng chính
}
```

### Không await trong vòng lặp khi có thể chạy song song

```typescript
// ❌ SAI — Sequential (chậm)
for (const userId of userIds) {
  await this.sendReminderEmail(userId); // Gửi lần lượt từng người
}

// ✅ ĐÚNG — Parallel
await Promise.allSettled(userIds.map(userId => this.sendReminderEmail(userId)));
```

---

## 5. Comment & Documentation

### Comment giải thích "Tại sao", không phải "Làm gì"

```typescript
// ❌ SAI — Comment thừa (code đã nói lên điều này)
// Tăng count lên 1
count++;

// ❌ SAI — Comment mô tả what, không why
// Kiểm tra IP có trong danh sách cho phép không
const isAllowed = allowedRanges.some(range => ipInRange(clientIp, range));

// ✅ ĐÚNG — Comment giải thích lý do nghiệp vụ không rõ ràng từ code
// BR-ATT-02: Chỉ từ chối khi type là AT_OFFICE; Remote/OnDuty không cần xác thực IP.
// Nhân viên chọn Remote sau khi đã vào văn phòng vẫn được chấp nhận.
if (dto.type === WorkStatus.AT_OFFICE && !isValidIp) {
  throw new ForbiddenException('Not connected to office network');
}
```

### JSDoc cho public API của service

```typescript
/**
 * Thực hiện check-in cho nhân viên.
 *
 * @param userId - ID của nhân viên
 * @param dto - Thông tin check-in (loại làm việc, ghi chú)
 * @param clientIp - IP của client (dùng để xác thực mạng văn phòng)
 * @throws {BadRequestException} Nếu đã check-in trong ngày
 * @throws {ForbiddenException} Nếu chọn AT_OFFICE nhưng không trong mạng văn phòng
 */
async checkIn(userId: string, dto: CheckInDto, clientIp: string): Promise<AttendanceRecord> {}
```

---

## 6. Constants & Magic Numbers

```typescript
// ❌ SAI — Magic numbers/strings
if (now.getHours() >= 7 && now.getMinutes() >= 55) { ... }
if (task.daysUntilDeadline <= 1) { ... }

// ✅ ĐÚNG — Named constants
const ATTENDANCE = {
  LATE_THRESHOLD_HOUR: 7,
  LATE_THRESHOLD_MINUTE: 55,
  EARLY_CHECKOUT_HOUR: 17,
  EARLY_CHECKOUT_MINUTE: 30,
  AUTO_CLOSE_HOUR: 23,
  AUTO_CLOSE_MINUTE: 59,
} as const;

const TASK = {
  WARNING_HOURS_BEFORE_DEADLINE: 24,
  DEADLINE_CHECK_INTERVAL_MINUTES: 30,
} as const;

if (now.getHours() >= ATTENDANCE.LATE_THRESHOLD_HOUR) { ... }
if (task.hoursUntilDeadline <= TASK.WARNING_HOURS_BEFORE_DEADLINE) { ... }
```

---

## 7. Logging

```typescript
// ✅ ĐÚNG — Dùng NestJS Logger với context đầy đủ
private readonly logger = new Logger(AttendanceService.name);

this.logger.log(`User ${userId} checked in as ${dto.type}`, { userId, type: dto.type });
this.logger.warn(`Late check-in for user ${userId}`, { userId, minutesLate: 5 });
this.logger.error('Failed to create attendance record', error.stack, { userId });

// ❌ SAI — console.log trong service/controller
console.log('checked in', userId);
console.error(error);
```

---

## 8. React Component Guidelines (Frontend)

### Component thuần túy — Không side effects trong render

```typescript
// ❌ SAI
export function TaskCard({ taskId }: { taskId: string }) {
  const [task, setTask] = useState(null);
  // Fetch trong component là anti-pattern với Next.js 14
  useEffect(() => {
    fetch(`/tasks/${taskId}`).then(r => r.json()).then(setTask);
  }, [taskId]);
}

// ✅ ĐÚNG — Dùng custom hook, để component chỉ lo render
export function TaskCard({ task }: { task: Task }) {
  const { isExpanded, toggle } = useTaskCardExpansion(task.id);
  return (
    <div className={styles.card}>
      <TaskCardHeader task={task} onToggle={toggle} />
      {isExpanded && <TaskCardBody task={task} />}
    </div>
  );
}
```

### Props — Đặt tên rõ ràng, có type đầy đủ

```typescript
// ❌ SAI
function Button({ onClick, text, type, disabled, color }) {}

// ✅ ĐÚNG
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
  isDisabled?: boolean;
}
function Button({ label, onClick, variant = 'primary', isLoading, isDisabled }: ButtonProps) {}
```

---

## 9. File Size Limits

| Loại file | Tối đa |
|---|---|
| Service (BE) | 200 dòng |
| Controller (BE) | 100 dòng |
| React Component | 150 dòng |
| Custom Hook | 80 dòng |
| Utility function file | 100 dòng |

Nếu vượt giới hạn → **tách file** hoặc **tách class/function**.

---

## 10. Checklist trước khi tạo PR

- [ ] Không có `console.log` trong code
- [ ] Không có `any` type (ngoại lệ phải có comment)
- [ ] Không có `// TODO` hay `// FIXME`
- [ ] Không có commented-out code
- [ ] Tất cả constants được đặt tên, không có magic numbers
- [ ] Hàm/biến đặt tên rõ ràng, nói lên ý nghĩa
- [ ] Các trường hợp lỗi đều được handle
- [ ] Có JSDoc cho các public method của service
- [ ] File không vượt quá giới hạn dòng
- [ ] Lint và typecheck pass (`pnpm lint && pnpm typecheck`)
