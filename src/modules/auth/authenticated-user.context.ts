import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { UserProfile } from './domain/user-profile.js';

export const AuthenticatedUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): UserProfile | undefined => {
    const request = context.switchToHttp().getRequest<{
      authUser?: UserProfile;
    }>();

    return request.authUser;
  },
);
