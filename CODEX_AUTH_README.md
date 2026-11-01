Implemented a full authorization module with a mocked auth-service client, and wired it into the API so /events endpoints are now token-protected.
- Added a new auth module at src/modules/auth/auth.module.ts and registered it in src/app.module.ts:1.
- Introduced an auth-service abstraction (src/modules/auth/domain/auth-service-client.ts) and a use-facing service (src/modules/auth/application/authorization.service.ts).
- Added a mock auth-service client at src/modules/auth/infrastructure/mock-auth-service.client.ts that returns a hardcoded user profile and always grants access (allowedResources: ['*']).
- Implemented AuthorizationGuard in src/modules/auth/authorization.guard.ts:
- reads Authorization: Bearer <token>
- calls auth service with token, method, endpoint, and resource
- throws 401 for missing/invalid token, 403 when denied
- attaches user profile to request (authUser) for downstream usage
- Added resource metadata support via @AccessResource(...) in src/modules/auth/decorators/access-resource.decorator.ts, and applied it to events controller in src/modules/events/controller/events.controller.ts:36.
- Updated docs in README.md:14 to note auth header requirement and mock behavior.
Tests and validation run successfully:
- npm run test -- src/modules/auth/authorization.guard.spec.ts src/modules/events/controller/events.controller.spec.ts
- npm run test:e2e -- test/app.e2e-spec.ts
- npm run build
Also added/updated tests:
- New guard tests in src/modules/auth/authorization.guard.spec.ts
- Updated controller test DI wiring in src/modules/events/controller/events.controller.spec.ts
- Updated e2e request to include bearer token in test/app.e2e-spec.ts:19
If you want, next logical steps are:
1. Replace MockAuthServiceClient with a real HTTP client to your auth service.
2. Add fine-grained authorization rules (resource/action-level checks) instead of allow-all.