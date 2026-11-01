import type { UserProfile } from './user-profile.js';

export type AuthDecision = {
  isAllowed: boolean;
  userProfile: UserProfile;
};
