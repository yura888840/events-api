import type { AuthDecision } from './auth-decision.js';

export type AccessRequest = {
  token: string;
  endpoint: string;
  method: string;
  resource: string;
};

export interface AuthServiceClient {
  checkAccess(request: AccessRequest): Promise<AuthDecision>;
}
