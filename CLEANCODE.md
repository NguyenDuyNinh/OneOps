# CLEANCODE.md — Cẩm Nang Quy Tắc Viết Code Chi Tiết (OneOps)

> **MỤC TIÊU**: Tài liệu này đóng vai trò là "Kinh Thánh Kỹ Thuật" của toàn đội ngũ OneOps.
> Bất kỳ đoạn code nào vi phạm các nguyên tắc trong tài liệu này sẽ bị **REJECT PULL REQUEST** trong quá trình Code Review.

---

## MỤC LỤC
1. [Triết Lý Clean Code Tại OneOps](#1-triết-lý-clean-code-tại-oneops)
2. [Quy Tắc Đặt Tên Toàn Diện (Naming Conventions)](#2-quy-tắc-đặt-tên-toàn-diện-naming-conventions)
3. [Thiết Kế Hàm & Phương Thức (Functions & Methods)](#3-thiết-kế-hàm--phương-thức-functions--methods)
4. [Kiểm Soát Luồng & Điều Kiện (Control Flow & Logic)](#4-kiểm-soát-luồng--điều-kiện-control-flow--logic)
5. [Async, Concurrency & Xử Lý Lỗi (Error Handling)](#5-async-concurrency--xử-lý-lỗi-error-handling)
6. [Chuẩn Mực Backend NestJS](#6-chuẩn-mực-backend-nestjs)
7. [Chuẩn Mực Frontend Next.js & React](#7-chuẩn-mực-frontend-nextjs--react)
8. [Quản Trị TypeScript & An Toàn Kiểu Dữ Liệu](#8-quản-trị-typescript--an-toàn-kiểu-dữ-liệu)
9. [Ghi Log & Quan Sát Hệ Thống (Logging & Observability)](#9-ghi-log--quan-sát-hệ-thống-logging--observability)
10. [Bộ Sưu Tập Anti-Patterns & Cách Refactor](#10-bộ-sưu-tập-anti-patterns--cách-refactor)
11. [Checklist Đánh Giá Pull Request (PR Review Checklist)](#11-checklist-đánh-giá-pull-request-pr-review-checklist)

---

## 1. Triết Lý Clean Code Tại OneOps

Tại OneOps, code sạch được định nghĩa qua 4 tiêu chuẩn bất biến:
* **Readable (Dễ đọc)**: Code viết cho người đọc trước, máy hiểu sau. Một developer mới tham gia dự án phải hiểu chức năng của hàm trong vòng 30 giây mà không cần người khác giải thích.
* **Predictable (Dễ đoán)**: Hàm nhận input A thì trả về output B, không có side-effect ngầm, không biến đổi dữ liệu tham chiếu (immutable).
* **Testable (Dễ kiểm thử)**: Code được chia nhỏ, phụ thuộc được trừu tượng hóa (Dependency Injection), dễ dàng viết unit test mà không phải mock cả hệ thống.
* **Maintainable (Dễ bảo trì)**: Thay đổi một logic nghiệp vụ tại module này tuyệt đối không làm gãy module khác.

---

## 2. Quy Tắc Đặt Tên Toàn Diện (Naming Conventions)

### 2.1 Bảng Quy Ước Chuẩn

| Đối tượng | Quy ước | Ví dụ Hợp lệ | Ví dụ Sai / Cấm |
|---|---|---|---|
| **Biến (Variable)** | `camelCase` | `checkedInAt`, `activeTaskList` | `checked_in_at`, `List1` |
| **Hằng số (Constant)** | `SCREAMING_SNAKE_CASE` | `MAX_ALLOWED_LATE_MINUTES`, `DEFAULT_PAGE_SIZE` | `maxLateMinutes`, `DefaultPage` |
| **Hàm / Phương thức** | `camelCase` (Bắt đầu bằng động từ) | `validateOfficeIp()`, `calculateOverdueDays()` | `officeIp()`, `data()`, `process()` |
| **Biến Boolean** | Bắt đầu bằng: `is`, `has`, `can`, `should` | `isOverdue`, `hasSubmittedProposal`, `canEditTask` | `overdue`, `proposalStatus`, `flag` |
| **Class / Interface / Type** | `PascalCase` | `AttendanceRecord`, `TaskStateMachine` | `attendance_record`, `iTask` |
| **Enum Type** | `PascalCase` | `WorkStatus`, `TaskDeadlineStatus` | `work_status`, `TASK_STATUS` |
| **Enum Value** | `SCREAMING_SNAKE_CASE` | `WorkStatus.AT_OFFICE`, `TaskStatus.IN_PROGRESS` | `WorkStatus.AtOffice` |
| **DTO Class** | `PascalCase` + hậu tố `Dto` | `CreateTaskDto`, `UpdateAttendanceStatusDto` | `TaskPayload`, `CreateTaskInput` |
| **File Backend** | `kebab-case.suffix.ts` | `attendance.service.ts`, `task-state.machine.ts` | `attendanceService.ts`, `TaskLogic.ts` |
| **File Component (FE)** | `PascalCase.tsx` | `KanbanBoard.tsx`, `NotificationBell.tsx` | `kanbanBoard.tsx`, `index.tsx` |
| **File Hook (FE)** | `camelCase.ts` (Bắt đầu bằng `use`) | `useAttendance.ts`, `useSocketSubscription.ts` | `attendanceHook.ts` |
| **DB Table / Column** | `snake_case` (trong DB) | `table: task_logs`, `col: checked_in_at` | `TaskLogs`, `checkedInAt` |

### 2.2 Quy Tắc Đặt Tên Có Ý Nghĩa
* **Cấm viết tắt vô nghĩa**: Không dùng `ctx`, `req1`, `u`, `d`, `tmp`. Ngoại lệ: `i`, `j` trong vòng lặp index ngắn.
* **Tránh từ ngữ tối nghĩa**: Không đặt tên hàm là `handleData()`, `process()`, `doSomething()`. Phải đổi thành: `syncHeadcountStatus()`, `assertAssigneeNotOnLeave()`.

---

## 3. Thiết Kế Hàm & Phương Thức (Functions & Methods)

### 3.1 Quy Tắc Đơn Nhiệm (Single Responsibility Principle - SRP)
Một hàm chỉ nên giải quyết **đúng một việc** ở cùng một tầng trừu tượng.

```typescript
// ❌ SAI: Hàm vừa validate, vừa ghi DB, vừa gửi socket, vừa gửi mail
async function handleTaskDone(taskId: string, userId: string) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new Error();
  if (task.assigneeId !== userId) throw new Error();
  await prisma.task.update({ where: { id: taskId }, data: { status: 'DONE' } });
  socket.emit('task:done', task);
  await mailer.send({ to: 'manager@oneops.vn', subject: 'Task done' });
}

// ✅ ĐÚNG: Tách thành các hàm độc lập, phối hợp luồng sạch sẽ
async function completeTask(taskId: string, userId: string): Promise<Task> {
  const task = await this.findTaskAndValidateOwnership(taskId, userId);
  this.stateMachine.assertCanTransition(task.status, TaskStatus.DONE);

  const updatedTask = await this.persistTaskCompletion(taskId);
  this.eventEmitter.emit('task.status_changed', { taskId, from: task.status, to: TaskStatus.DONE });
  
  return updatedTask;
}
```

### 3.2 Giới Hạn Kích Thước & Tham Số
* **Độ dài hàm**: Không vượt quá **30 dòng**. Nếu hàm dài hơn, bạn đang làm nhiều hơn 1 việc $\rightarrow$ Hãy tách hàm con (private helper).
* **Số lượng tham số**: Tối đa **3 tham số**. Nếu cần truyền nhiều hơn 3 giá trị, bắt buộc gom thành Object/DTO.
  ```typescript
  // ❌ SAI
  function registerShift(userId: string, date: Date, shiftId: string, ip: string, note?: string) {}

  // ✅ ĐÚNG
  function registerShift(dto: RegisterShiftDto) {}
  ```

---

## 4. Kiểm Soát Luồng & Điều Kiện (Control Flow & Logic)

### 4.1 Áp Dụng Guard Clauses (Return Early)
Luôn kiểm tra các điều kiện tiên quyết (pre-conditions) hoặc lỗi và `return` / `throw` ngay ở đầu hàm. Tránh lồng `if/else` sâu dạng bậc thang (Pyramid of Doom).

```typescript
// ❌ SAI: Lồng 3 cấp if
async function requestLeave(userId: string, dto: LeaveDto) {
  if (dto.days > 0) {
    const user = await this.getUser(userId);
    if (user.isActive) {
      if (user.remainingLeaveDays >= dto.days) {
        return this.createLeave(userId, dto);
      } else {
        throw new BadRequestException('Hết ngày nghỉ');
      }
    }
  }
}

// ✅ ĐÚNG: Thoát sớm, code phẳng hoàn toàn
async function requestLeave(userId: string, dto: LeaveDto) {
  if (dto.days <= 0) {
    throw new BadRequestException('Số ngày nghỉ không hợp lệ');
  }

  const user = await this.getUser(userId);
  if (!user.isActive) {
    throw new ForbiddenException('Tài khoản đã bị vô hiệu hóa');
  }
  if (user.remainingLeaveDays < dto.days) {
    throw new BadRequestException('Số ngày phép còn lại không đủ');
  }

  return this.createLeave(userId, dto);
}
```

### 4.2 Triệt Tiêu Magic Numbers & Magic Strings
Tất cả các số và chuỗi có ý nghĩa nghiệp vụ phải được đặt tên qua `const` hoặc `enum`.

```typescript
// ❌ SAI
if (diffHours < 24) { color = '#f59e0b'; }
if (now.getHours() === 7 && now.getMinutes() > 55) { status = 'LATE'; }

// ✅ ĐÚNG
import { DEADLINE_CONFIG, WORK_SCHEDULE } from './attendance.constants';

const isApproachingDeadline = remainingHours <= DEADLINE_CONFIG.WARNING_THRESHOLD_HOURS;
const isPastCheckInGracePeriod = now.getHours() > WORK_SCHEDULE.START_HOUR ||
  (now.getHours() === WORK_SCHEDULE.START_HOUR && now.getMinutes() > WORK_SCHEDULE.GRACE_PERIOD_MINUTES);
```

---

## 5. Async, Concurrency & Xử Lý Lỗi (Error Handling)

### 5.1 Quy Tắc Với `async/await`
* **Tuyệt đối không dùng `await` tuần tự trong vòng lặp**: Sử dụng `Promise.all()` (nếu fail 1 cái là dừng hết) hoặc `Promise.allSettled()` (nếu muốn thực thi độc lập).
  ```typescript
  // ❌ SAI: Gây nghẽn IO nghiêm trọng
  for (const employeeId of employeeIds) {
    await this.notifyEmployee(employeeId);
  }

  // ✅ ĐÚNG: Chạy song song
  await Promise.allSettled(employeeIds.map((id) => this.notifyEmployee(id)));
  ```

### 5.2 Xử Lý Lỗi Văn Minh
* **Không bao giờ "nuốt" lỗi ngầm**:
  ```typescript
  // ❌ TỘI ĐỒ LỚN NHẤT CỦA DEVELOPER:
  try {
    await this.syncDatabase();
  } catch (e) {}

  // ✅ ĐÚNG: Phân loại lỗi và xử lý có trách nhiệm
  try {
    await this.syncDatabase();
  } catch (error) {
    this.logger.error(`Database sync failed for tenant ${tenantId}`, (error as Error).stack);
    throw new InternalServerErrorException('Lỗi đồng bộ dữ liệu, vui lòng thử lại sau.');
  }
  ```
* **Sử dụng đúng HTTP Status Exception của NestJS**:
  * 400: `BadRequestException` (Sai format, vi phạm ràng buộc nghiệp vụ).
  * 401: `UnauthorizedException` (Chưa đăng nhập, token hết hạn).
  * 403: `ForbiddenException` (Không đủ quyền, bị chặn dải IP văn phòng).
  * 404: `NotFoundException` (Không tìm thấy bản ghi).
  * 409: `ConflictException` (Trùng lặp dữ liệu, duplicate check-in).

---

## 6. Chuẩn Mực Backend NestJS

### 6.1 Kiến Trúc Tách Lớp (Layer Separation)
* **Controller**: Chỉ làm nhiệm vụ ánh xạ HTTP Request $\rightarrow$ Validate DTO $\rightarrow$ Gọi Service $\rightarrow$ Trả kết quả. **Không được chứa bất kỳ logic `if/else` nghiệp vụ nào.**
* **Service**: Chứa 100% logic nghiệp vụ. Không truy cập vào object `Request` hay `Response` của Express.
* **Prisma**: Sử dụng qua `PrismaService`. Không viết SQL thô nếu Prisma hỗ trợ.

### 6.2 Truy Vấn Dữ Liệu Tối Ưu (Prisma Queries)
* **Luôn dùng `select`**: Không bao giờ lấy nguyên cả cục dữ liệu bảng User vì sẽ vô tình trả về trường `passwordHash`.
  ```typescript
  // ✅ ĐÚNG
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, role: true, avatarUrl: true },
  });
  ```
* **Bảo vệ Tính Toàn Vẹn bằng `$transaction`**:
  Khi một thao tác cần ghi vào từ 2 bảng trở lên (ví dụ: Tạo Task và Ghi Log lịch sử), **bắt buộc** bọc trong Transaction.

---

## 7. Chuẩn Mực Frontend Next.js & React

### 7.1 Server Components vs Client Components
* Mặc định mọi file trong thư mục `app/` là **Server Component**.
* Chỉ thêm directive `'use client'` khi Component đó cần:
  * Quản lý State: `useState`, `useReducer`.
  * Hiệu ứng / Vòng đời: `useEffect`, `useLayoutEffect`.
  * Tương tác người dùng: `onClick`, `onChange`, `onSubmit`.
  * Sử dụng Browser API hoặc WebSocket client.

### 7.2 Đóng Gói API & Logic Trong Custom Hooks
Component giao diện không được chứa logic gọi API hay tính toán phức tạp.

```typescript
// ❌ SAI: Viết API và state lung tung trong Component
export function AttendanceWidget() {
  const [data, setData] = useState();
  useEffect(() => {
    axios.get('/attendance/today').then(res => setData(res.data));
  }, []);
  return <div>{/* JSX */}</div>;
}

// ✅ ĐÚNG: Tách thành Hook chuyên trách
export function AttendanceWidget() {
  const { todayRecord, isLoading, checkIn } = useAttendance();
  if (isLoading) return <Spinner />;
  return <AttendanceDisplay record={todayRecord} onCheckIn={checkIn} />;
}
```

### 7.3 Giới Hạn Độ Dài Component
Một React Component không được vượt quá **150 dòng code**. Nếu vượt quá, lập tức tách thành các Component con nhỏ hơn (`TaskHeader.tsx`, `TaskTimeline.tsx`, `TaskCommentList.tsx`).

---

## 8. Quản Trị TypeScript & An Toàn Kiểu Dữ Liệu

### 8.1 Không Khoan Nhượng Với `any`
* `any` làm tê liệt trình kiểm tra kiểu và là nguyên nhân hàng đầu gây crash ứng dụng trong runtime.
* Nếu không biết chắc chắn kiểu dữ liệu từ bên ngoài (API bên thứ 3), dùng `unknown` và tạo Type Guard function:
  ```typescript
  function isTaskPayload(data: unknown): data is TaskPayload {
    return typeof data === 'object' && data !== null && 'taskId' in data;
  }
  ```

### 8.2 Single Source of Truth
* Tất cả kiểu dữ liệu dùng chung giữa API và Web Client **bắt buộc** nằm trong `packages/shared-types`.
* Frontend chỉ việc `import { Task, WorkStatus } from '@oneops/shared-types'`, tuyệt đối không tự gõ lại `interface Task { ... }` ở thư mục web.

---

## 9. Ghi Log & Quan Sát Hệ Thống (Logging & Observability)

* **Nghiêm cấm `console.log` trong toàn bộ mã nguồn**:
  * Trên NestJS: Khởi tạo logger theo class name:
    ```typescript
    private readonly logger = new Logger(TasksService.name);
    ```
  * Ghi log có ngữ cảnh rõ ràng:
    ```typescript
    this.logger.log(`Task ${taskId} status transitioned from ${from} to ${to} by user ${userId}`);
    this.logger.warn(`Potential duplicate check-in attempt for user ${userId}`);
    ```

---

## 10. Bộ Sưu Tập Anti-Patterns & Cách Refactor

### Anti-Pattern 1: Xuyên Thủng Ranh Giới Module (Cross-Module Bleeding)
* **Tình huống**: Khi Dev 2 (Tasks) muốn thông báo cho Dev 3 (Notifications).
* **Code Xấu**:
  ```typescript
  // CẤM: Direct Dependency Injection giữa 2 module khác nhau
  @Injectable()
  export class TasksService {
    constructor(private readonly notificationService: NotificationsService) {}
  }
  ```
* **Refactor Đúng Chuẩn**:
  ```typescript
  // ĐÚNG: Giao tiếp qua Event-Driven Architecture (Khớp nối lỏng)
  @Injectable()
  export class TasksService {
    constructor(private readonly eventEmitter: EventEmitter2) {}
    
    async assignTask(task: Task) {
      // ... logic
      this.eventEmitter.emit('task.assigned', { taskId: task.id, assigneeId: task.assigneeId });
    }
  }
  ```

---

## 11. Checklist Đánh Giá Pull Request (PR Review Checklist)

Trước khi submit PR hoặc phê duyệt PR của đồng nghiệp, hãy kiểm tra lần lượt:

- [ ] **Ranh giới module**: PR có vô tình chỉnh sửa file ngoài phạm vi sở hữu của mình không?
- [ ] **Kiểm tra Type**: Dự án chạy `pnpm typecheck` có 0 lỗi không? Có sử dụng `any` không?
- [ ] **Kiểm tra Lint**: Chạy `pnpm lint` có sạch sẽ không?
- [ ] **Độ dài hàm & file**: Không có hàm nào $> 30$ dòng, không có file service nào $> 200$ dòng.
- [ ] **Guard Clauses**: Đã thay thế các khối `if/else` lồng nhau bằng return early chưa?
- [ ] **Bảo vệ dữ liệu**: Các câu truy vấn Prisma có dùng `select` để loại trừ password không?
- [ ] **Transaction**: Các thao tác ghi nhiều bảng có được bọc trong `$transaction` không?
- [ ] **Thông báo lỗi**: Các lỗi ném ra có đúng HTTP status code và câu thông báo rõ ràng không?
- [ ] **Không còn dấu vết dev**: Đã xóa toàn bộ `console.log`, `// TODO`, code thừa bị comment chưa?
- [ ] **Conventional Commit**: Tên PR và Commit message có đúng chuẩn `<type>(<scope>): <desc>` chưa?
