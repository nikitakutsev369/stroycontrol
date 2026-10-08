/**
 * API клиент для работы с backend
 * Поддерживает два режима:
 * - demo: использует localStorage (текущая реализация)
 * - api: делает запросы к backend
 */

import { config, API } from './config';
import { Errors, type AppError } from './errors';
import type { Project, Brigade, Foreman, Stage, Notification, Session, User } from './types';

// === HTTP утилиты ===

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      credentials: 'include', // Для cookies
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw Errors.badRequest(error.message || 'Request failed');
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error && error.message === 'Failed to fetch') {
      throw Errors.networkError('Не удалось подключиться к серверу');
    }
    throw error;
  }
}

// === API клиент ===

export const apiClient = {
  // Auth
  auth: {
    loginAdmin: async (name: string, password: string): Promise<{ user: User; session: Session }> => {
      return fetchJson(API.login, {
        method: 'POST',
        body: JSON.stringify({ name, password, role: 'admin' }),
      });
    },
    
    loginForeman: async (name: string, pin: string): Promise<{ foreman: Foreman; session: Session }> => {
      return fetchJson(API.login, {
        method: 'POST',
        body: JSON.stringify({ name, pin, role: 'foreman' }),
      });
    },
    
    logout: async (): Promise<void> => {
      return fetchJson(API.logout, { method: 'POST' });
    },
    
    me: async (): Promise<{ user?: User; foreman?: Foreman }> => {
      return fetchJson(API.me);
    },
  },

  // Projects
  projects: {
    list: async (): Promise<Project[]> => {
      return fetchJson(API.projects);
    },
    
    get: async (id: string): Promise<Project> => {
      return fetchJson(API.project(id));
    },
    
    create: async (data: Omit<Project, 'id' | 'createdAt'>): Promise<Project> => {
      return fetchJson(API.projects, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    
    update: async (id: string, data: Partial<Project>): Promise<Project> => {
      return fetchJson(API.project(id), {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    
    delete: async (id: string): Promise<void> => {
      return fetchJson(API.project(id), { method: 'DELETE' });
    },
  },

  // Brigades
  brigades: {
    list: async (): Promise<Brigade[]> => {
      return fetchJson(API.brigades);
    },
    
    create: async (data: Omit<Brigade, 'id' | 'createdAt'>): Promise<Brigade> => {
      return fetchJson(API.brigades, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    
    update: async (id: string, data: Partial<Brigade>): Promise<Brigade> => {
      return fetchJson(API.brigade(id), {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    
    delete: async (id: string): Promise<void> => {
      return fetchJson(API.brigade(id), { method: 'DELETE' });
    },
  },

  // Foremen
  foremen: {
    list: async (): Promise<Foreman[]> => {
      return fetchJson(API.foremen);
    },
    
    create: async (data: Omit<Foreman, 'id' | 'createdAt'>): Promise<Foreman> => {
      return fetchJson(API.foremen, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    
    update: async (id: string, data: Partial<Foreman>): Promise<Foreman> => {
      return fetchJson(API.foreman(id), {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    
    delete: async (id: string): Promise<void> => {
      return fetchJson(API.foreman(id), { method: 'DELETE' });
    },
  },

  // Stages
  stages: {
    list: async (projectId?: string): Promise<Stage[]> => {
      const url = projectId ? `${API.stages}?projectId=${projectId}` : API.stages;
      return fetchJson(url);
    },
    
    create: async (data: Omit<Stage, 'id' | 'createdAt' | 'updatedAt'>): Promise<Stage> => {
      return fetchJson(API.stages, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    
    update: async (id: string, data: Partial<Stage>): Promise<Stage> => {
      return fetchJson(API.stage(id), {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    
    delete: async (id: string): Promise<void> => {
      return fetchJson(API.stage(id), { method: 'DELETE' });
    },
  },

  // Notifications
  notifications: {
    list: async (): Promise<Notification[]> => {
      return fetchJson(API.notifications);
    },
    
    markRead: async (id: string): Promise<void> => {
      return fetchJson(`${API.notification(id)}/read`, { method: 'POST' });
    },
    
    markAllRead: async (): Promise<void> => {
      return fetchJson(`${API.notifications}/read-all`, { method: 'POST' });
    },
    
    delete: async (id: string): Promise<void> => {
      return fetchJson(API.notification(id), { method: 'DELETE' });
    },
  },
};

// === Режим работы ===

export function isDemoMode(): boolean {
  return config.enableDemoMode;
}

export function isApiMode(): boolean {
  return !config.enableDemoMode && config.isProduction;
}
