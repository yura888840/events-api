import { Injectable } from '@nestjs/common';
import type {
  AccessRequest,
  AuthServiceClient,
} from '../domain/auth-service-client.js';
import type { AuthDecision } from '../domain/auth-decision.js';

@Injectable()
export class MockAuthServiceClient implements AuthServiceClient {
  async checkAccess(_request: AccessRequest): Promise<AuthDecision> {
    return {
      isAllowed: true,
      userProfile: {
        id: 'user-123',
        name: 'Mock User',
        roles: ['user'],
        allowedResources: ['*'],
      },
    };
  }
}
