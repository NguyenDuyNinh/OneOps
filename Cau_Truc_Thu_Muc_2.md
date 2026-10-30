├── packages/
│   └── database/                            # ★ TẦNG DATABASE CHUNG (Prisma ORM)
│       ├── prisma/
│       │   ├── schema/
│       │   │   └── base.prisma              # Cấu hình datasource PostgreSQL & generator
│       │   ├── migrations/
│       │   └── seed/
│       │       └── index.ts
│       ├── generated/
│       ├── package.json
│       └── index.ts                         # Export PrismaClient & Types
│
├── apps/
│   ├── api/                                 # ★ BACKEND (NestJS)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── main.ts
│   │       ├── app.module.ts                # Root Module (Import CoreModule + 4 Module chính)
│   │       │
│   │       ├── core/                        # Hạ tầng dùng chung (Không chứa nghiệp vụ)
│   │       │   ├── auth/
│   │       │   ├── config/
│   │       │   ├── database/
│   │       │   ├── decorators/
│   │       │   ├── events/                  # Event Bus giao tiếp giữa các module
│   │       │   ├── filters/
│   │       │   ├── interceptors/
│   │       │   ├── pipes/
│   │       │   ├── realtime/                # WebSocket / SSE đồng bộ < 2s
│   │       │   └── types/
│   │       │
│   │       ├── shared/
│   │       │   ├── constants/
│   │       │   └── helpers/
│   │       │
│   │       └── features/                    # ★ 4 MODULE CHÍNH ĐÃ CHIA SẴN CÁC MODULE CON
│   │           │
│   │           ├── tenant-system/           # ==========================================
│   │           │   │                        # 1. QUẢN TRỊ HỆ THỐNG DOANH NGHIỆP
│   │           │   ├── tenant-system.module.ts
│   │           │   ├── index.ts
│   │           │   ├── organization/        # [Nhóm con 1.1: Tổ chức & Cấu hình]
│   │           │   │   ├── company-profile/
│   │           │   │   │   ├── prisma/
│   │           │   │   │   ├── dto/
│   │           │   │   │   ├── entities/
│   │           │   │   │   ├── guards/
│   │           │   │   │   ├── middlewares/
│   │           │   │   │   ├── listeners/
│   │           │   │   │   ├── company-profile.controller.ts
│   │           │   │   │   ├── company-profile.service.ts
│   │           │   │   │   ├── company-profile.module.ts
│   │           │   │   │   └── index.ts
│   │           │   │   └── work-policies/   # Cấu hình giờ làm, IP văn phòng, ngày lễ
│   │           │   │       ├── prisma/
│   │           │   │       ├── dto/
│   │           │   │       ├── entities/
│   │           │   │       ├── guards/
│   │           │   │       ├── middlewares/
│   │           │   │       ├── listeners/
│   │           │   │       ├── work-policies.controller.ts
│   │           │   │       ├── work-policies.service.ts
│   │           │   │       ├── work-policies.module.ts
│   │           │   │       └── index.ts
│   │           │   │
│   │           │   ├── access-control/      # [Nhóm con 1.2: Xác thực & Phân quyền]
│   │           │   │   ├── tenant-auth/
│   │           │   │   │   └── (prisma, dto, entities, guards, middlewares, listeners, controller, service, module, index.ts)
│   │           │   │   ├── roles-permissions/
│   │           │   │   │   └── (prisma, dto, entities, guards, middlewares, listeners, controller, service, module, index.ts)
│   │           │   │   └── audit-backups/
│   │           │   │       └── (prisma, dto, entities, guards, middlewares, listeners, controller, service, module, index.ts)
│   │           │   │
│   │           │   └── automation-hub/      # [Nhóm con 1.3: Tích hợp & AI]
│   │           │       ├── external-integrations/ # Kết nối Google, GitHub, Zalo, Email
│   │           │       │   └── (prisma, dto, entities, guards, middlewares, listeners, controller, service, module, index.ts)
│   │           │       ├── workflow-rules/
│   │           │       │   └── (prisma, dto, entities, guards, middlewares, listeners, controller, service, module, index.ts)
│   │           │       └── ai-copilot/
│   │           │           └── (prisma, dto, entities, guards, middlewares, listeners, controller, service, module, index.ts)
│   │           │
│   │           ├── work-management/         # ==========================================
│   │           │   │                        # 2. QUẢN LÝ CÔNG VIỆC (TRỌNG TÂM NHÓM 6 NGƯỜI)
│   │           │   ├── work-management.module.ts
│   │           │   ├── index.ts
│   │           │   ├── work/                # [Nhóm con 2.1: Thực thi công việc hàng ngày]
│   │           │   │   ├── tasks/           # ★ Giao việc, Việc của tôi, Tiến độ, Giao lại việc
│   │           │   │   │   ├── prisma/
│   │           │   │   │   │   ├── task.prisma
│   │           │   │   │   │   └── task.seed.ts
│   │           │   │   │   ├── dto/
│   │           │   │   │   ├── entities/
│   │           │   │   │   ├── guards/
│   │           │   │   │   ├── middlewares/
│   │           │   │   │   ├── listeners/
│   │           │   │   │   ├── tasks.controller.ts
│   │           │   │   │   ├── tasks.service.ts
│   │           │   │   │   ├── tasks.module.ts
│   │           │   │   │   └── index.ts
│   │           │   │   │
│   │           │   │   ├── task-workflow/   # ★ Máy trạng thái 7 bước (TR-01 -> TR-08), Hoãn/Hủy/Làm lại
│   │           │   │   │   ├── prisma/
│   │           │   │   │   │   ├── task-workflow.prisma
│   │           │   │   │   │   └── task-workflow.seed.ts
│   │           │   │   │   ├── dto/
│   │           │   │   │   ├── entities/
│   │           │   │   │   ├── guards/
│   │           │   │   │   ├── middlewares/
│   │           │   │   │   ├── listeners/
│   │           │   │   │   ├── task-workflow.controller.ts
│   │           │   │   │   ├── task-workflow.service.ts
│   │           │   │   │   ├── task-workflow.module.ts
│   │           │   │   │   └── index.ts
│   │           │   │   │
│   │           │   │   ├── task-comments/   # ★ Bình luận, @tag, Đề xuất đổi Deadline, Preview link
│   │           │   │   │   ├── prisma/
│   │           │   │   │   │   ├── task-comment.prisma
│   │           │   │   │   │   └── task-comment.seed.ts
│   │           │   │   │   ├── dto/
│   │           │   │   │   ├── entities/
│   │           │   │   │   ├── guards/
│   │           │   │   │   ├── middlewares/
│   │           │   │   │   ├── listeners/
│   │           │   │   │   ├── task-comments.controller.ts
│   │           │   │   │   ├── task-comments.service.ts
│   │           │   │   │   ├── task-comments.module.ts
│   │           │   │   │   └── index.ts
│   │           │   │   │
│   │           │   │   └── kanban/          # ★ Bảng Kanban SCR-01 & SCR-02, Bộ lọc, Cảnh báo Vàng/Đỏ
│   │           │   │       ├── prisma/
│   │           │   │       ├── dto/
│   │           │   │       ├── entities/
│   │           │   │       ├── guards/
│   │           │   │       ├── middlewares/
│   │           │   │       ├── listeners/
│   │           │   │       ├── kanban.controller.ts
│   │           │   │       ├── kanban.service.ts
│   │           │   │       ├── kanban.module.ts
│   │           │   │       └── index.ts
│   │           │   │
│   │           │   ├── coordination/        # [Nhóm con 2.2: Thông báo, Điều phối & Giao tiếp]
│   │           │   │   ├── notifications/   # ★ Thông báo In-app/Email/Zalo, Quét hạn 24h & 30p
│   │           │   │   │   ├── prisma/
│   │           │   │   │   │   ├── notification.prisma
│   │           │   │   │   │   └── notification.seed.ts
│   │           │   │   │   ├── dto/
│   │           │   │   │   ├── entities/
│   │           │   │   │   ├── guards/
│   │           │   │   │   ├── middlewares/
│   │           │   │   │   ├── listeners/
│   │           │   │   │   ├── notifications.controller.ts
│   │           │   │   │   ├── notifications.service.ts
│   │           │   │   │   ├── notifications.module.ts
│   │           │   │   │   └── index.ts
│   │           │   │   ├── internal-chat/   # Chat 1-1 & Nhóm nội bộ
│   │           │   │   │   └── (prisma, dto, entities, guards, middlewares, listeners, controller, service, module, index.ts)
│   │           │   │   ├── workspace-today/ # Trang Hôm nay / Dashboard công việc
│   │           │   │   │   └── (prisma, dto, entities, guards, middlewares, listeners, controller, service, module, index.ts)
│   │           │   │   ├── tickets-approvals/ # Ticket & Xét duyệt liên phòng ban
│   │           │   │   │   └── (prisma, dto, entities, guards, middlewares, listeners, controller, service, module, index.ts)
│   │           │   │   └── knowledge-sop/   # Cẩm nang SOP
│   │           │   │       └── (prisma, dto, entities, guards, middlewares, listeners, controller, service, module, index.ts)
│   │           │   │
│   │           │   └── projects/            # [Nhóm con 2.3: Dự án, Nghiệm thu & Timesheet]
│   │           │       ├── project-spaces/
│   │           │       │   └── (prisma, dto, entities, guards, middlewares, listeners, controller, service, module, index.ts)
│   │           │       ├── milestones-qa/
│   │           │       │   └── (prisma, dto, entities, guards, middlewares, listeners, controller, service, module, index.ts)
│   │           │       └── timesheets/
│   │           │           └── (prisma, dto, entities, guards, middlewares, listeners, controller, service, module, index.ts)
│   │           │
│   │           ├── hr-management/           # ==========================================
│   │           │   │                        # 3. QUẢN LÝ NHÂN SỰ
│   │           │   ├── hr-management.module.ts
│   │           │   ├── index.ts
│   │           │   ├── attendance/          # [Nhóm con 3.1: Điểm danh & Quân số]
│   │           │   │   ├── daily-checkin/   # Check-in/out, đổi trạng thái, kiểm tra IP
│   │           │   │   │   └── (prisma, dto, entities, guards, middlewares, listeners, controller, service, module, index.ts)
│   │           │   │   ├── workforce-board/ # Màn hình quân số 3 nhóm của Quản lý
│   │           │   │   │   └── (prisma, dto, entities, guards, middlewares, listeners, controller, service, module, index.ts)
│   │           │   │   └── checkin-explanations/ # Gửi & duyệt đơn giải trình điểm danh
│   │           │   │       └── (prisma, dto, entities, guards, middlewares, listeners, controller, service, module, index.ts)
│   │           │   │
│   │           │   ├── leaves/              # [Nhóm con 3.2: Đơn từ & Nghỉ phép]
│   │           │   │   ├── leave-requests/  # Gửi/hủy đơn Nghỉ phép, Nghỉ ốm, Làm remote
│   │           │   │   │   └── (prisma, dto, entities, guards, middlewares, listeners, controller, service, module, index.ts)
│   │           │   │   └── leave-approvals/ # Quản lý duyệt đơn & bắn sự kiện giao lại việc
│   │           │   │       └── (prisma, dto, entities, guards, middlewares, listeners, controller, service, module, index.ts)
│   │           │   │
│   │           │   └── employees/           # [Nhóm con 3.3: Hồ sơ nhân sự & Công suất]
│   │           │       ├── employee-directory/
│   │           │       │   └── (prisma, dto, entities, guards, middlewares, listeners, controller, service, module, index.ts)
│   │           │       └── resource-capacity/
│   │           │           └── (prisma, dto, entities, guards, middlewares, listeners, controller, service, module, index.ts)
│   │           │
│   │           └── crm/                     # ==========================================
│   │               │                        # 4. QUẢN LÝ KHÁCH HÀNG (CRM)
│   │               ├── crm.module.ts
│   │               ├── index.ts
│   │               ├── presales/            # [Nhóm con 4.1: Tiền bán hàng]
│   │               │   ├── leads-customers/
│   │               │   │   └── (prisma, dto, entities, guards, middlewares, listeners, controller, service, module, index.ts)
│   │               │   └── discovery-briefs/
│   │               │       └── (prisma, dto, entities, guards, middlewares, listeners, controller, service, module, index.ts)
│   │               ├── commercial/          # [Nhóm con 4.2: Báo giá, SOW & Hợp đồng]
│   │               │   ├── quotations-sow/
│   │               │   │   └── (prisma, dto, entities, guards, middlewares, listeners, controller, service, module, index.ts)
│   │               │   └── contracts/
│   │               │       └── (prisma, dto, entities, guards, middlewares, listeners, controller, service, module, index.ts)
│   │               └── customer-success/    # [Nhóm con 4.3: Công nợ, Cổng KH & Chăm sóc]
│   │                   ├── receivables/
│   │                   │   └── (prisma, dto, entities, guards, middlewares, listeners, controller, service, module, index.ts)
│   │                   ├── customer-portal/
│   │                   │   └── (prisma, dto, entities, guards, middlewares, listeners, controller, service, module, index.ts)
│   │                   └── after-sales/
│   │                       └── (prisma, dto, entities, guards, middlewares, listeners, controller, service, module, index.ts)
│   │
│   └── web/                                 # ★ FRONTEND (Next.js 16) - ĐỐI XỨNG 1-1 VỚI BACKEND
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── app/                         # Tầng Routing (Chỉ ghép component từ features)
│           │   ├── (auth)/
│           │   ├── (error-pages)/
│           │   └── (admin)/
│           │       ├── layout.tsx
│           │       ├── page.tsx
│           │       ├── tenant-system/
│           │       ├── work-management/
│           │       │   ├── tasks/page.tsx
│           │       │   ├── kanban/page.tsx
│           │       │   ├── notifications/page.tsx
│           │       │   └── projects/page.tsx
│           │       ├── hr-management/
│           │       │   ├── attendance/page.tsx
│           │       │   └── leaves/page.tsx
│           │       └── crm/
│           │
│           ├── core/                        # Hạ tầng dùng chung FE (ui, layout, shared, hooks, context, lib, types, constants)
│           ├── icons/
│           │
│           └── features/                    # ★ CẤU TRÚC MODULE FE ĐỐI XỨNG 100% VỚI BE
│               ├── tenant-system/
│               │   ├── organization/{company-profile,work-policies}/
│               │   ├── access-control/{tenant-auth,roles-permissions,audit-backups}/
│               │   └── automation-hub/{external-integrations,workflow-rules,ai-copilot}/
│               │
│               ├── work-management/         # 2. QUẢN LÝ CÔNG VIỆC (FE)
│               │   ├── work/
│               │   │   ├── tasks/
│               │   │   │   ├── components/
│               │   │   │   ├── hooks/
│               │   │   │   ├── api/
│               │   │   │   ├── actions/
│               │   │   │   ├── types.ts
│               │   │   │   ├── constants.ts
│               │   │   │   └── index.ts
│               │   │   ├── task-workflow/
│               │   │   │   └── (components, hooks, api, actions, types.ts, constants.ts, index.ts)
│               │   │   ├── task-comments/
│               │   │   │   └── (components, hooks, api, actions, types.ts, constants.ts, index.ts)
│               │   │   └── kanban/
│               │   │       └── (components, hooks, api, actions, types.ts, constants.ts, index.ts)
│               │   ├── coordination/
│               │   │   └── {notifications,internal-chat,workspace-today,tickets-approvals,knowledge-sop}/
│               │   └── projects/
│               │       └── {project-spaces,milestones-qa,timesheets}/
│               │
│               ├── hr-management/
│               │   ├── attendance/{daily-checkin,workforce-board,checkin-explanations}/
│               │   ├── leaves/{leave-requests,leave-approvals}/
│               │   └── employees/{employee-directory,resource-capacity}/
│               │
│               └── crm/
│                   ├── presales/{leads-customers,discovery-briefs}/
│                   ├── commercial/{quotations-sow,contracts}/
│                   └── customer-success/{receivables,customer-portal,after-sales}/
