/** Auth + profile shared types. */

export interface AuthUser {
  id: string;
  email: string;
}

export interface Session {
  user: AuthUser;
  accessToken: string;
  refreshToken?: string;
  /** Epoch ms when the access token expires (best-effort). */
  expiresAt?: number;
  /** Where this session came from. */
  mode: "supabase" | "local";
}

/**
 * The personalization profile captured during onboarding. Stored as
 * per-user synced state under the key `profile`, so it rides the same
 * Supabase sync the rest of the app uses.
 */
export interface Profile {
  name?: string;
  age?: number;
  weightLb?: number;
  goalWeightLb?: number;
  heightIn?: number;
  businessType?: string;
  businessStage?: string;
  primaryGoal?: string;
  incomeGoal?: string;
  /** "home" | "starbucks" | "both" | "office" */
  workStyle?: string;
  /** Free-text description of their day-to-day. */
  dayStructure?: string;
  wakeTime?: string;
  experienceLevel?: string;
  hoursPerDay?: number;
  faith?: string;
  motivations?: string[];
  biggestStruggle?: string;
  onboardingComplete?: boolean;
  updatedAt?: number;
}
