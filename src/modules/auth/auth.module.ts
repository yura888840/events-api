import { Global, Module } from '@nestjs/common';
import { AUTH_SERVICE_CLIENT } from './auth.tokens.js';
import { MockAuthServiceClient } from './infrastructure/mock-auth-service.client.js';
import { AuthorizationService } from './application/authorization.service.js';
import { AuthorizationGuard } from './authorization.guard.js';

@Global()
@Module({
  providers: [
    {
      provide: AUTH_SERVICE_CLIENT,
      useClass: MockAuthServiceClient,
    },
    AuthorizationService,
    AuthorizationGuard,
  ],
  exports: [AuthorizationService, AuthorizationGuard, AUTH_SERVICE_CLIENT],
})
export class AuthModule {}
