import { env } from "../env";

export interface KimiUserProfile {
  id: string;
  name: string;
  avatar_url?: string;
  email?: string;
}

export const kimiUsers = {
  async getProfile(accessToken: string): Promise<KimiUserProfile | null> {
    try {
      const resp = await fetch(`${env.kimiOpenUrl}/api/v1/user/profile`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!resp.ok) {
        console.error(`Failed to fetch profile: ${resp.status}`);
        return null;
      }

      return resp.json() as Promise<KimiUserProfile>;
    } catch (error) {
      console.error("Error fetching Kimi profile:", error);
      return null;
    }
  },
};
