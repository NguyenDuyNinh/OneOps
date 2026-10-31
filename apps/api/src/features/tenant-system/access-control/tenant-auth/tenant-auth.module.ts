import { Module, type DynamicModule, type Type } from "@nestjs/common";
import { CREDENTIALS, type CredentialsPort } from "./credentials.port.js";
import { SessionGuard } from "./session.guard.js";
import { TenantAuthController } from "./tenant-auth.controller.js";
import { TenantAuthRepository } from "./tenant-auth.repository.js";
import { TenantAuthService } from "./tenant-auth.service.js";

/**
 * The credential owner is supplied by the composition (`tenant-system.module.ts`),
 * so this feature never imports another feature directly.
 */
@Module({})
export class TenantAuthModule {
  static forRoot(options: {
    credentials: Type<CredentialsPort>;
    imports?: DynamicModule["imports"];
  }): DynamicModule {
    return {
      module: TenantAuthModule,
      imports: options.imports ?? [],
      controllers: [TenantAuthController],
      providers: [
        TenantAuthRepository,
        TenantAuthService,
        SessionGuard,
        { provide: CREDENTIALS, useClass: options.credentials },
      ],
      exports: [TenantAuthService, SessionGuard],
    };
  }
}
