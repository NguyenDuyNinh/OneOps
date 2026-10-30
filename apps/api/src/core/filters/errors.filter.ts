import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
  Logger,
} from "@nestjs/common";
import { Prisma } from "@oneops/database";
@Catch()
export class ErrorsFilter implements ExceptionFilter {
  private readonly logger = new Logger("API");
  catch(error: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    if (error instanceof HttpException) {
      response.status(error.getStatus()).json(error.getResponse());
      return;
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      const code = error.code;
      if (code === "P2002") {
        response
          .status(409)
          .json({ message: "Số / ký hiệu đã tồn tại trong phân hệ này." });
        return;
      }
      if (code === "P2025") {
        response
          .status(404)
          .json({ message: "Không tìm thấy bản ghi trong phân hệ này." });
        return;
      }
      if (code === "P2034") {
        response.status(409).json({
          message: "Dữ liệu đang được thay đổi. Vui lòng tải lại và thử lại.",
        });
        return;
      }
    }
    this.logger.error(
      error instanceof Error ? error.message : "Unexpected error",
    );
    response
      .status(500)
      .json({ message: "Không thể xử lý yêu cầu. Vui lòng thử lại." });
  }
}
