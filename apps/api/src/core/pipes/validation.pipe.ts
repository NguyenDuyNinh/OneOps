import { PipeTransform, BadRequestException } from "@nestjs/common";
import { z } from "zod";
export class SchemaPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: z.ZodType<T>) {}
  transform(value: unknown) {
    const parsed = this.schema.safeParse(value);
    if (!parsed.success)
      throw new BadRequestException({
        message: "Dữ liệu không hợp lệ",
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      });
    return parsed.data;
  }
}
