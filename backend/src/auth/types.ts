export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar_url?: string;
  email?: string;
}

export interface SessionPayload {
  unionId: string;
  clientId: string;
}
