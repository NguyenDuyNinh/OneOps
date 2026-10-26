# OneOps — Nền Tảng Vận Hành Nội Bộ

> Hệ thống quản lý nhân sự, công việc, và giao tiếp nội bộ tích hợp theo thời gian thực.

## Mục lục
- [Tổng quan kiến trúc](#tổng-quan-kiến-trúc)
- [Tech Stack](#tech-stack)
- [Phân chia module theo dev](#phân-chia-module-theo-dev)
- [Cài đặt & Khởi chạy](#cài-đặt--khởi-chạy)

---

## Tổng quan kiến trúc

```
oneops/
├── apps/
│   ├── api/          # NestJS Backend (PORT: 4000)
│   └── web/          # Next.js Frontend (PORT: 3000)
├── packages/
│   ├── database/     # Prisma schema + migrations (SHARED)
│   ├── shared-types/ # TypeScript types dùng chung FE & BE
│   └── config/       # ESLint, Prettier, tsconfig base
└── package.json      # pnpm workspace root
```

**Nguyên tắc cốt lõi:** Mỗi developer sở hữu 1 module hoàn toàn độc lập.
Các module giao tiếp qua `EventEmitter2` (internal events) và `shared-types`,
KHÔNG import trực tiếp service của nhau.

---

## Tech Stack

| Layer | Technology | Ghi chú |
|---|---|---|
| Backend | NestJS ^10 | Modular, DI, Guards, Interceptors |
| Frontend | Next.js ^14 (App Router) | Server Components + Client Components |
| Database | PostgreSQL ^16 | |
| ORM | Prisma ^5 | Type-safe queries |
| Real-time | Socket.IO ^4 | NestJS WebSocket Gateways |
| Auth | JWT + Passport.js | |
| Styling | CSS Modules (Vanilla CSS) | Không dùng Tailwind |
| Package Manager | pnpm Workspaces ^9 | |
| Language | TypeScript ^5 (strict mode) | |
| Queue | BullMQ + Redis | Email queue, cron jobs |

---

## Cài đặt & Khởi chạy

### Yêu cầu
- Node.js >= 20
- pnpm >= 9
- PostgreSQL >= 16 (hoặc Docker)

### 1. Clone & Cài đặt

```bash
git clone <repo-url> oneops && cd oneops
pnpm install
```

### 2. Cấu hình môi trường

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
# Điền các giá trị cần thiết
```

### 3. Chạy database (Docker)

```bash
docker run --name oneops-db \
  -e POSTGRES_USER=oneops \
  -e POSTGRES_PASSWORD=oneops \
  -e POSTGRES_DB=oneops \
  -p 5432:5432 -d postgres:16
```

### 4. Migrate database

```bash
pnpm db:migrate   # Chạy migrations
pnpm db:generate  # Generate Prisma Client
pnpm db:seed      # (optional) Seed dữ liệu mẫu
```

### 5. Khởi chạy dev

```bash
pnpm dev              # Chạy tất cả apps
# Hoặc riêng lẻ:
pnpm --filter @oneops/api dev    # API: http://localhost:4000
pnpm --filter @oneops/web dev    # Web: http://localhost:3000
```

### Scripts

```bash
pnpm build        # Build tất cả
pnpm lint         # Lint toàn bộ project
pnpm typecheck    # Type check toàn bộ
pnpm test         # Unit tests
pnpm db:studio    # Prisma Studio GUI
```

---
