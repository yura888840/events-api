import { Inject, Injectable } from '@nestjs/common';
import { AUTH_SERVICE_CLIENT } from '../auth.tokens.js';
import type {
  AccessRequest,
  AuthServiceClient,
} from '../domain/auth-service-client.js';
import type { AuthDecision } from '../domain/auth-decision.js';

@Injectable()
export class AuthorizationService {
  constructor(
    @Inject(AUTH_SERVICE_CLIENT)
    private readonly authServiceClient: AuthServiceClient,
  ) {}

  async checkAccess(request: AccessRequest): Promise<AuthDecision> {
    return this.authServiceClient.checkAccess(request);
  }
}
