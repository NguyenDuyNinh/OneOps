import { Injectable } from "@nestjs/common";
import { SchemaPipe } from "../../../../core/pipes/validation.pipe.js";
import {
  createEmployeeSchema,
  updateEmployeeSchema,
} from "./dto/employee-directory.dto.js";
import { EmployeeDirectoryRepository } from "./employee-directory.repository.js";
import type { EmployeeInput, ListQuery } from "./dto/employee-directory.dto.js";
import type { Transaction } from "../../../../core/database/database.module.js";
@Injectable()
export class EmployeeDirectoryService {
  constructor(private readonly repository: EmployeeDirectoryRepository) {}
  list(query: ListQuery) {
    return this.repository.list(query);
  }
  get(id: string, tx?: Transaction) {
    return this.repository.get(id, tx);
  }
  create(input: EmployeeInput, tx?: Transaction) {
    return this.repository.create(
      new SchemaPipe(createEmployeeSchema).transform(input),
      tx,
    );
  }
  update(
    id: string,
    input: Partial<EmployeeInput> & { version: number },
    tx?: Transaction,
  ) {
    return this.repository.update(
      id,
      new SchemaPipe(updateEmployeeSchema).transform(input),
      tx,
    );
  }
}
