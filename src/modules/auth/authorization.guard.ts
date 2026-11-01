import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthorizationService } from './application/authorization.service.js';
import { ACCESS_RESOURCE_KEY } from './auth.constants.js';
import type { UserProfile } from './domain/user-profile.js';

type RequestWithAuth = {
  method: string;
  url?: string;
  originalUrl?: string;
  route?: {
    path?: string;
  };
  headers: {
    authorization?: string;
  };
  authUser?: UserProfile;
};

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithAuth>();
    const authorizationHeader = request.headers.authorization;

    if (undefined === authorizationHeader) {
      throw new UnauthorizedException('Missing Authorization header');
    }

    const token = this.extractToken(authorizationHeader);

    if (undefined === token) {
      throw new UnauthorizedException('Invalid Authorization header');
    }

    const endpoint = request.originalUrl ?? request.url ?? '';
    const resource =
      this.reflector.getAllAndOverride<string>(ACCESS_RESOURCE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? request.route?.path ?? endpoint;

    const decision = await this.authorizationService.checkAccess({
      token,
      endpoint,
      method: request.method,
      resource,
    });

    if (!decision.isAllowed) {
      throw new ForbiddenException('Access denied');
    }

    request.authUser = decision.userProfile;

    return true;
  }

  private extractToken(header: string): string | undefined {
    const match = /^Bearer\s+(.+)$/i.exec(header.trim());

    if (null === match) {
      return undefined;
    }

    return match[1].trim();
  }
}
