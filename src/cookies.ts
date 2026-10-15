/**
 * Утилиты для работы с cookies
 * Поддерживают как localStorage (demo), так и httpOnly cookies (production)
 */

import { config } from './config';

// === Определение окружения ===

export function isLocalhost(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.host;
  return host.startsWith('localhost:') || host.startsWith('127.0.0.1:') || host === 'localhost' || host === '127.0.0.1';
}

// === Cookie options (аналог backend) ===

export interface CookieOptions {
  httpOnly?: boolean;
  path?: string;
  sameSite?: 'Strict' | 'Lax' | 'None';
  secure?: boolean;
  maxAge?: number;
  expires?: Date;
  domain?: string;
}

export function getSessionCookieOptions(): CookieOptions {
  const localhost = isLocalhost();

  return {
    httpOnly: false, // На клиенте не может быть httpOnly, но backend установит правильно
    path: '/',
    sameSite: localhost ? 'Lax' : 'None',
    secure: !localhost,
    maxAge: 365 * 24 * 60 * 60, // 1 год в секундах
  };
}

// === Cookie утилиты ===

export const cookies = {
  /**
   * Получить cookie по имени
   */
  get(name: string): string | null {
    if (typeof document === 'undefined') return null;
    
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    
    return null;
  },

  /**
   * Установить cookie
   */
  set(name: string, value: string, options: CookieOptions = {}): void {
    if (typeof document === 'undefined') return;

    const defaults = getSessionCookieOptions();
    const opts = { ...defaults, ...options };

    let cookieString = `${name}=${encodeURIComponent(value)}`;

    if (opts.path) cookieString += `; path=${opts.path}`;
    if (opts.domain) cookieString += `; domain=${opts.domain}`;
    if (opts.secure) cookieString += '; secure';
    if (opts.sameSite) cookieString += `; samesite=${opts.sameSite}`;
    
    if (opts.maxAge !== undefined) {
      cookieString += `; max-age=${opts.maxAge}`;
    } else if (opts.expires) {
      cookieString += `; expires=${opts.expires.toUTCString()}`;
    }

    document.cookie = cookieString;
  },

  /**
   * Удалить cookie
   */
  remove(name: string, path: string = '/'): void {
    if (typeof document === 'undefined') return;
    
    document.cookie = `${name}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  },

  /**
   * Проверить существование cookie
   */
  has(name: string): boolean {
    return this.get(name) !== null;
  },

  /**
   * Получить все cookies как объект
   */
  getAll(): Record<string, string> {
    if (typeof document === 'undefined') return {};

    const result: Record<string, string> = {};
    const cookies = document.cookie.split(';');

    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        result[name] = decodeURIComponent(value);
      }
    }

    return result;
  },
};

// === Session cookie name ===

export const SESSION_COOKIE_NAME = 'kimi_sid';

// === Session helpers ===

export function getSessionId(): string | null {
  // В production читаем из httpOnly cookie (устанавливается backend)
  // В demo mode используем localStorage
  if (config.isProduction) {
    return cookies.get(SESSION_COOKIE_NAME);
  }
  
  // Demo mode: читаем из localStorage
  if (typeof localStorage !== 'undefined') {
    const session = localStorage.getItem('sk_session');
    if (session) {
      try {
        const parsed = JSON.parse(session);
        return parsed.sessionId || null;
      } catch {
        return null;
      }
    }
  }
  
  return null;
}

export function clearSession(): void {
  // Удаляем cookie
  cookies.remove(SESSION_COOKIE_NAME);
  
  // Удаляем localStorage (demo mode)
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('sk_session');
  }
}
