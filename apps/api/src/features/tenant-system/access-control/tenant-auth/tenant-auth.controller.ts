import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { z } from "zod";
import { SchemaPipe } from "../../../../core/pipes/validation.pipe.js";
import {
  CurrentActor,
  Public,
  type ActorContext,
  type ActorRequest,
} from "../../../../core/auth/actor-context.js";
import { loginSchema, passwordChangeSchema } from "./dto/tenant-auth.dto.js";
import {
  SESSION_COOKIE,
  sessionCookieOptions,
  sessionToken,
} from "./session-cookie.js";
import { SessionGuard } from "./session.guard.js";
import { TenantAuthService } from "./tenant-auth.service.js";

interface CookieWriter {
  setHeader(name: string, value: string): unknown;
}

const cookieOf = (value: string, maxAgeSeconds?: number) => {
  const options = sessionCookieOptions();
  return [
    `${SESSION_COOKIE}=${encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    `SameSite=${options.sameSite === "lax" ? "Lax" : "Strict"}`,
    ...(options.secure ? ["Secure"] : []),
    ...(maxAgeSeconds === undefined ? [] : [`Max-Age=${maxAgeSeconds}`]),
  ].join("; ");
};

@Controller("auth")
export class TenantAuthController {
  constructor(private readonly service: TenantAuthService) {}

  @Get("setup")
  @Public()
  setup() {
    return this.service.setup();
  }

  @Post("login")
  @HttpCode(200)
  @Public()
  async login(
    @Body(new SchemaPipe(loginSchema)) input: z.infer<typeof loginSchema>,
    @Req() request: ActorRequest,
    @Res({ passthrough: true }) response: CookieWriter,
  ) {
    const { token, result } = await this.service.login(
      input,
      String(request.headers["user-agent"] ?? ""),
    );
    response.setHeader("Set-Cookie", cookieOf(token));
    return result;
  }

  @Post("logout")
  @HttpCode(200)
  @Public()
  async logout(
    @Req() request: ActorRequest,
    @Res({ passthrough: true }) response: CookieWriter,
  ) {
    const result = await this.service.logout(
      sessionToken(request.headers.cookie),
    );
    response.setHeader("Set-Cookie", cookieOf("", 0));
    return result;
  }

  @Get("session")
  @UseGuards(SessionGuard)
  session(@Req() request: ActorRequest) {
    const token = sessionToken(request.headers.cookie);
    if (!token)
      throw new UnauthorizedException(
        "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
      );
    return this.service.session(token);
  }

  @Post("password")
  @HttpCode(200)
  @UseGuards(SessionGuard)
  changePassword(
    @CurrentActor() actor: ActorContext,
    @Body(new SchemaPipe(passwordChangeSchema))
    input: z.infer<typeof passwordChangeSchema>,
    @Req() request: ActorRequest,
  ) {
    return this.service.changePassword(
      actor,
      input,
      sessionToken(request.headers.cookie),
    );
  }
}
