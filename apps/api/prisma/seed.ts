// Seed dữ liệu khởi tạo cho môi trường phát triển.
// Chạy: pnpm db:seed
//
// Mật khẩu lấy từ SEED_DEFAULT_PASSWORD. Nếu không khai báo, script sinh mật khẩu
// ngẫu nhiên và in ra một lần — không hardcode credential trong source code.

import * as dotenv from 'dotenv';
dotenv.config();

import { randomBytes } from 'node:crypto';
import * as bcrypt from 'bcrypt';
import { PrismaClient, UserRole } from '@prisma/client';

/** Client riêng cho script CLI — API dùng `PrismaService` trong `modules/database`. */
const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

const SEED_USERS: ReadonlyArray<{ email: string; name: string; role: UserRole }> = [
  { email: 'admin@oneops.vn', name: 'Quản trị viên', role: UserRole.ADMIN },
  { email: 'manager@oneops.vn', name: 'Quản lý', role: UserRole.MANAGER },
  { email: 'employee@oneops.vn', name: 'Nhân viên', role: UserRole.EMPLOYEE },
];

/** Ghi log ra stdout — script CLI, không dùng Logger của NestJS. */
function writeLine(message: string): void {
  process.stdout.write(`${message}\n`);
}

function generateTemporaryPassword(): string {
  return randomBytes(9).toString('base64url');
}

async function upsertSeedUser(
  seedUser: { email: string; name: string; role: UserRole },
  password: string,
): Promise<'created' | 'updated'> {
  const existing = await prisma.user.findUnique({
    where: { email: seedUser.email },
    select: { id: true },
  });

  if (existing) {
    await prisma.user.update({
      where: { email: seedUser.email },
      data: { name: seedUser.name, role: seedUser.role },
    });
    return 'updated';
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  await prisma.user.create({
    data: { email: seedUser.email, name: seedUser.name, role: seedUser.role, passwordHash },
  });
  return 'created';
}

async function main(): Promise<void> {
  const explicitPassword = process.env.SEED_DEFAULT_PASSWORD?.trim();
  const isGeneratedPassword = !explicitPassword;
  const password = explicitPassword ?? generateTemporaryPassword();

  if (isGeneratedPassword) {
    writeLine('[seed] Không có SEED_DEFAULT_PASSWORD — dùng mật khẩu tạm cho lần seed này.');
  }

  const results = await Promise.allSettled(
    SEED_USERS.map((seedUser) => upsertSeedUser(seedUser, password)),
  );

  results.forEach((result, index) => {
    const email = SEED_USERS[index].email;
    if (result.status === 'fulfilled') {
      writeLine(`[seed] ${result.value === 'created' ? 'Đã tạo' : 'Đã cập nhật'}: ${email}`);
      return;
    }
    writeLine(`[seed] Thất bại: ${email} — ${String(result.reason)}`);
  });

  if (results.some((result) => result.status === 'rejected')) {
    throw new Error('Seed thất bại ở một hoặc nhiều tài khoản.');
  }

  if (isGeneratedPassword) {
    writeLine(`[seed] Mật khẩu tạm cho các tài khoản vừa tạo: ${password}`);
  }
  writeLine('[seed] Hoàn tất.');
}

main()
  .catch((error: unknown) => {
    writeLine(`[seed] Lỗi: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
