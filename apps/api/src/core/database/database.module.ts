import { Module, Injectable, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient, Prisma } from "@oneops/database";
import { PrismaPg } from "@prisma/adapter-pg";
@Injectable()
export class Database extends PrismaClient implements OnModuleDestroy {
  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new Error("DATABASE_URL is required");
    super({ adapter: new PrismaPg({ connectionString }) });
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
export type Transaction = Prisma.TransactionClient;
@Module({ providers: [Database], exports: [Database] })
export class DatabaseModule {}
