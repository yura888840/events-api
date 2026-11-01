import { SetMetadata } from '@nestjs/common';
import { ACCESS_RESOURCE_KEY } from '../auth.constants.js';

export const AccessResource = (resource: string) =>
  SetMetadata(ACCESS_RESOURCE_KEY, resource);
