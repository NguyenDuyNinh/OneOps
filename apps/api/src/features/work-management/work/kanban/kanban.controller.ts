import { Controller, Get, Inject, Query } from "@nestjs/common";
import { z } from "zod";
import { SchemaPipe } from "../../../../core/pipes/validation.pipe.js";
import {
  kanbanQuery,
  type KanbanBoardResponse,
  type KanbanQuery,
} from "./dto/kanban.dto.js";

export const KANBAN_BOARD_READER = "KANBAN_BOARD_READER";

export interface KanbanBoardReader {
  board(query: KanbanQuery): Promise<KanbanBoardResponse>;
}

@Controller("kanban")
export class KanbanController {
  constructor(
    @Inject(KANBAN_BOARD_READER)
    private readonly reader: KanbanBoardReader,
  ) {}

  @Get()
  board(@Query(new SchemaPipe(kanbanQuery)) query: z.infer<typeof kanbanQuery>) {
    return this.reader.board(query);
  }
}
