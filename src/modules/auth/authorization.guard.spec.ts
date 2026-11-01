import {
  ForbiddenException,
  UnauthorizedException,
  type ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { describe, expect, it, vi } from 'vitest';
import { AuthorizationGuard } from './authorization.guard.js';
import type { AuthorizationService } from './application/authorization.service.js';
import type { UserProfile } from './domain/user-profile.js';

type RequestWithAuth = {
  method: string;
  originalUrl: string;
  route?: {
    path?: string;
  };
  headers: {
    authorization?: string;
  };
  authUser?: UserProfile;
};

function createContext(request: RequestWithAuth): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    getClass: () => class TestController {},
    getHandler: () => () => undefined,
  } as ExecutionContext;
}

describe('AuthorizationGuard', () => {
  it('throws UnauthorizedException when Authorization header is missing', async () => {
    const authorizationService = {
      checkAccess: vi.fn(),
    } as unknown as AuthorizationService;
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValue('events'),
    } as unknown as Reflector;

    const guard = new AuthorizationGuard(authorizationService, reflector);
    const context = createContext({
      method: 'GET',
      originalUrl: '/events',
      headers: {},
    });

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(authorizationService.checkAccess).not.toHaveBeenCalled();
  });

  it('throws UnauthorizedException when Authorization header is invalid', async () => {
    const authorizationService = {
      checkAccess: vi.fn(),
    } as unknown as AuthorizationService;
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValue('events'),
    } as unknown as Reflector;

    const guard = new AuthorizationGuard(authorizationService, reflector);
    const context = createContext({
      method: 'GET',
      originalUrl: '/events',
      headers: {
        authorization: 'Token abc',
      },
    });

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(authorizationService.checkAccess).not.toHaveBeenCalled();
  });

  it('calls auth service and attaches user profile when access is granted', async () => {
    const request: RequestWithAuth = {
      method: 'GET',
      originalUrl: '/events',
      headers: {
        authorization: 'Bearer mock-token',
      },
    };

    const userProfile: UserProfile = {
      id: 'user-1',
      name: 'John Doe',
      roles: ['user'],
      allowedResources: ['*'],
    };

    const authorizationService = {
      checkAccess: vi.fn().mockResolvedValue({
        isAllowed: true,
        userProfile,
      }),
    } as unknown as AuthorizationService;
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValue('events'),
    } as unknown as Reflector;

    const guard = new AuthorizationGuard(authorizationService, reflector);

    await expect(guard.canActivate(createContext(request))).resolves.toBe(true);
    expect(authorizationService.checkAccess).toHaveBeenCalledExactlyOnceWith({
      token: 'mock-token',
      endpoint: '/events',
      method: 'GET',
      resource: 'events',
    });
    expect(request.authUser).toEqual(userProfile);
  });

  it('throws ForbiddenException when auth service denies access', async () => {
    const authorizationService = {
      checkAccess: vi.fn().mockResolvedValue({
        isAllowed: false,
        userProfile: {
          id: 'user-1',
          name: 'John Doe',
          roles: ['user'],
          allowedResources: [],
        },
      }),
    } as unknown as AuthorizationService;
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValue('events'),
    } as unknown as Reflector;

    const guard = new AuthorizationGuard(authorizationService, reflector);
    const context = createContext({
      method: 'GET',
      originalUrl: '/events',
      headers: {
        authorization: 'Bearer denied-token',
      },
    });

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('uses route path as resource fallback when metadata is not set', async () => {
    const authorizationService = {
      checkAccess: vi.fn().mockResolvedValue({
        isAllowed: true,
        userProfile: {
          id: 'user-1',
          name: 'John Doe',
          roles: ['user'],
          allowedResources: ['*'],
        },
      }),
    } as unknown as AuthorizationService;
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValue(undefined),
    } as unknown as Reflector;

    const guard = new AuthorizationGuard(authorizationService, reflector);
    const context = createContext({
      method: 'GET',
      originalUrl: '/events/123',
      route: {
        path: '/events/:id',
      },
      headers: {
        authorization: 'Bearer mock-token',
      },
    });

    await guard.canActivate(context);

    expect(authorizationService.checkAccess).toHaveBeenCalledExactlyOnceWith({
      token: 'mock-token',
      endpoint: '/events/123',
      method: 'GET',
      resource: '/events/:id',
    });
  });
});
