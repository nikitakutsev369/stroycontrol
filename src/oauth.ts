import { config } from './config';

export const oauth = {
  /**
   * Начать OAuth flow через Kimi
   */
  startLogin(): void {
    const redirectUri = `${window.location.origin}/api/auth/oauth/callback`;
    window.location.href = `${config.apiBaseUrl}/auth/oauth/start?redirect_uri=${encodeURIComponent(redirectUri)}`;
  },

  /**
   * Проверить, есть ли OAuth callback параметры в URL
   */
  hasCallbackParams(): boolean {
    const params = new URLSearchParams(window.location.search);
    return params.has('code') || params.has('error');
  },

  /**
   * Получить OAuth callback параметры
   */
  getCallbackParams(): { code?: string; state?: string; error?: string } {
    const params = new URLSearchParams(window.location.search);
    return {
      code: params.get('code') || undefined,
      state: params.get('state') || undefined,
      error: params.get('error') || undefined,
    };
  },
};
