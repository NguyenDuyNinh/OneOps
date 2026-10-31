import { SchemaPipe } from "../../../../core/pipes/validation.pipe.js";
import {
  createGradeSchema,
  createPositionSchema,
  updateGradeSchema,
  updatePositionSchema,
} from "./dto/positions-grades.dto.js";
import { Injectable } from "@nestjs/common";
import { PositionsGradesRepository } from "./positions-grades.repository.js";
import type {
  GradeInput,
  ListQuery,
  PositionInput,
} from "./dto/positions-grades.dto.js";
import type { Transaction } from "../../../../core/database/database.module.js";
@Injectable()
export class PositionsGradesService {
  constructor(private readonly repository: PositionsGradesRepository) {}
  listPositions(query: ListQuery) {
    return this.repository.listPositions(query);
  }
  getPosition(id: string, tx?: Transaction) {
    return this.repository.getPosition(id, tx);
  }
  createPosition(input: PositionInput, tx?: Transaction) {
    return this.repository.createPosition(
      new SchemaPipe(createPositionSchema).transform(input),
      tx,
    );
  }
  updatePosition(
    id: string,
    input: Partial<PositionInput> & { version: number },
    tx?: Transaction,
  ) {
    return this.repository.updatePosition(
      id,
      new SchemaPipe(updatePositionSchema).transform(input),
      tx,
    );
  }
  listGrades(query: ListQuery) {
    return this.repository.listGrades(query);
  }
  getGrade(id: string, tx?: Transaction) {
    return this.repository.getGrade(id, tx);
  }
  createGrade(input: GradeInput, tx?: Transaction) {
    return this.repository.createGrade(
      new SchemaPipe(createGradeSchema).transform(input),
      tx,
    );
  }
  updateGrade(
    id: string,
    input: Partial<GradeInput> & { version: number },
    tx?: Transaction,
  ) {
    return this.repository.updateGrade(
      id,
      new SchemaPipe(updateGradeSchema).transform(input),
      tx,
    );
  }
}
