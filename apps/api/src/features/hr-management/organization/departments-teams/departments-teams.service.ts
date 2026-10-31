import { ConflictException, Injectable } from "@nestjs/common";
import { SchemaPipe } from "../../../../core/pipes/validation.pipe.js";
import {
  createDepartmentSchema,
  createTeamSchema,
  updateDepartmentSchema,
  updateTeamSchema,
} from "./dto/departments-teams.dto.js";
import { DepartmentsTeamsRepository } from "./departments-teams.repository.js";
import type {
  DepartmentInput,
  ListQuery,
  TeamInput,
} from "./dto/departments-teams.dto.js";
import type { Transaction } from "../../../../core/database/database.module.js";
@Injectable()
export class DepartmentsTeamsService {
  constructor(private readonly repository: DepartmentsTeamsRepository) {}
  listDepartments(query: ListQuery) {
    return this.repository.listDepartments(query);
  }
  getDepartment(id: string, tx?: Transaction) {
    return this.repository.getDepartment(id, tx);
  }
  createDepartment(input: DepartmentInput, tx?: Transaction) {
    return this.repository.createDepartment(
      new SchemaPipe(createDepartmentSchema).transform(input),
      tx,
    );
  }
  async updateDepartment(
    id: string,
    input: Partial<DepartmentInput> & { version: number },
    tx?: Transaction,
  ) {
    const parsed = new SchemaPipe(updateDepartmentSchema).transform(input);
    if (parsed.status === "INACTIVE") {
      const active = await this.repository.activeTeamCount(id, tx);
      if (active > 0)
        throw new ConflictException(
          "Không thể ngừng phòng ban khi còn nhóm đang hoạt động.",
        );
    }
    return this.repository.updateDepartment(id, parsed, tx);
  }
  listTeams(query: ListQuery) {
    return this.repository.listTeams(query);
  }
  getTeam(id: string, tx?: Transaction) {
    return this.repository.getTeam(id, tx);
  }
  createTeam(input: TeamInput, tx?: Transaction) {
    return this.repository.createTeam(
      new SchemaPipe(createTeamSchema).transform(input),
      tx,
    );
  }
  async updateTeam(
    id: string,
    input: Partial<Omit<TeamInput, "departmentId">> & { version: number },
    tx?: Transaction,
  ) {
    return this.repository.updateTeam(
      id,
      new SchemaPipe(updateTeamSchema).transform(input),
      tx,
    );
  }
}
