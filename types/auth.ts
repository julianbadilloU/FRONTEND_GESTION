export type UserRole = "adoptante" | "albergue" | "admin";

export type SessionTokens = {
  accessToken: string | null;
  refreshToken: string | null;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};
