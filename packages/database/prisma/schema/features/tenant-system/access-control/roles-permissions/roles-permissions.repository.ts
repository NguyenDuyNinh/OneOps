import { ConflictException, Injectable } from "@nestjs/common";
import {
  Prisma,
  type PermissionChange,
  type RolePermission,
} from "@oneops/database";
import {
  Database,
  type Transaction,
} from "../../../../core/database/database.module.js";
import {
  permissionChangeSchema,
  type PermissionChangeDto,
  type PermissionRole,
} from "./dto/roles-permissions.dto.js";

export interface StoredPermission {
  featureKey: string;
  role: PermissionRole;
  actions: string[];
  version: number;
}

@Injectable()
export class RolesPermissionsRepository {
  constructor(private readonly db: Database) {}

  private permissions(tx: Transaction = this.db) {
    return tx.rolePermission;
  }

  private changes(tx: Transaction = this.db) {
    return tx.permissionChange;
  }

  transaction<T>(run: (tx: Transaction) => Promise<T>) {
    return this.db.$transaction(run, {
      isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead,
    });
  }

  async stored(): Promise<StoredPermission[]> {
    const rows = await this.permissions().findMany();
    return rows.map((row) => this.storedOf(row));
  }

  /** Single cell read used by the permission guard on protected routes. */
  async cell(
    featureKey: string,
    role: PermissionRole,
  ): Promise<StoredPermission | null> {
    const row = await this.permissions().findUnique({
      where: { featureKey_role: { featureKey, role } },
    });
    return row ? this.storedOf(row) : null;
  }

  /**
   * Writes one cell. `version: 0` means the cell still uses the built-in default;
   * every later write must match the version the client read.
   */
  async save(
    row: StoredPermission,
    updatedBy: string,
    tx: Transaction,
  ): Promise<StoredPermission> {
    if (row.version === 0) {
      try {
        const created = await this.permissions(tx).create({
          data: {
            featureKey: row.featureKey,
            role: row.role,
            actions: row.actions,
            updatedBy,
          },
        });
        return this.storedOf(created);
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        )
          throw new ConflictException(
            "Quyền của chức năng này vừa thay đổi. Vui lòng tải lại ma trận.",
          );
        throw error;
      }
    }
    const result = await this.permissions(tx).updateMany({
      where: {
        featureKey: row.featureKey,
        role: row.role,
        version: row.version,
      },
      data: {
        actions: row.actions,
        updatedBy,
        version: { increment: 1 },
      },
    });
    if (result.count !== 1)
      throw new ConflictException(
        "Quyền của chức năng này vừa thay đổi. Vui lòng tải lại ma trận.",
      );
    const saved = await this.permissions(tx).findUnique({
      where: {
        featureKey_role: { featureKey: row.featureKey, role: row.role },
      },
    });
    if (!saved)
      throw new ConflictException("Không đọc lại được quyền vừa lưu.");
    return this.storedOf(saved);
  }

  recordChange(
    change: {
      featureKey: string;
      role: PermissionRole;
      fromActions: string[];
      toActions: string[];
      actorName: string;
      reason: string;
    },
    tx: Transaction,
  ) {
    return this.changes(tx).create({ data: change });
  }

  async history(limit = 50): Promise<{ items: PermissionChangeDto[] }> {
    const rows = await this.changes().findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return { items: rows.map((row) => this.changeDto(row)) };
  }

  private storedOf(row: RolePermission): StoredPermission {
    return {
      featureKey: row.featureKey,
      role: row.role === "MANAGER" ? "MANAGER" : "EMPLOYEE",
      actions: row.actions,
      version: row.version,
    };
  }

  private changeDto(row: PermissionChange): PermissionChangeDto {
    return permissionChangeSchema.parse({
      id: row.id,
      featureKey: row.featureKey,
      role: row.role,
      fromActions: row.fromActions,
      toActions: row.toActions,
      actorName: row.actorName,
      reason: row.reason,
      createdAt: row.createdAt.toISOString(),
    });
  }
}
