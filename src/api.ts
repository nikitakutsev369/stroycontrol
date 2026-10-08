/**
 * API клиент для работы с backend
 * Использует HttpClient для HTTP запросов
 */

import { config } from './config';
import { Errors } from './errors';
import { HttpClient } from './http-client';
import type { Project, Brigade, Foreman, Stage, Notification, Session, User } from './types';

// === HTTP клиент ===

const httpClient = new HttpClient(config.apiBaseUrl);

// === API клиент ===

export const apiClient = {
  // Auth
  auth: {
    loginAdmin: async (name: string, password: string): Promise<{ user: User; session: Session }> => {
      return httpClient.post('/auth/login', { name, password, role: 'admin' });
    },
    
    loginForeman: async (name: string, pin: string): Promise<{ foreman: Foreman; session: Session }> => {
      return httpClient.post('/auth/login', { name, pin, role: 'foreman' });
    },
    
    logout: async (): Promise<void> => {
      return httpClient.post('/auth/logout');
    },
    
    me: async (): Promise<{ user?: User; foreman?: Foreman }> => {
      return httpClient.get('/auth/me');
    },
  },

  // Projects
  projects: {
    list: async (): Promise<Project[]> => {
      return httpClient.get('/projects');
    },
    
    get: async (id: string): Promise<Project> => {
      return httpClient.get(`/projects/${id}`);
    },
    
    create: async (data: Omit<Project, 'id' | 'createdAt'>): Promise<Project> => {
      return httpClient.post('/projects', data);
    },
    
    update: async (id: string, data: Partial<Project>): Promise<Project> => {
      return httpClient.patch(`/projects/${id}`, data);
    },
    
    delete: async (id: string): Promise<void> => {
      return httpClient.delete(`/projects/${id}`);
    },
  },

  // Brigades
  brigades: {
    list: async (): Promise<Brigade[]> => {
      return httpClient.get('/brigades');
    },
    
    create: async (data: Omit<Brigade, 'id' | 'createdAt'>): Promise<Brigade> => {
      return httpClient.post('/brigades', data);
    },
    
    update: async (id: string, data: Partial<Brigade>): Promise<Brigade> => {
      return httpClient.patch(`/brigades/${id}`, data);
    },
    
    delete: async (id: string): Promise<void> => {
      return httpClient.delete(`/brigades/${id}`);
    },
  },

  // Foremen
  foremen: {
    list: async (): Promise<Foreman[]> => {
      return httpClient.get('/foremen');
    },
    
    create: async (data: Omit<Foreman, 'id' | 'createdAt'>): Promise<Foreman> => {
      return httpClient.post('/foremen', data);
    },
    
    update: async (id: string, data: Partial<Foreman>): Promise<Foreman> => {
      return httpClient.patch(`/foremen/${id}`, data);
    },
    
    delete: async (id: string): Promise<void> => {
      return httpClient.delete(`/foremen/${id}`);
    },
  },

  // Stages
  stages: {
    list: async (projectId?: string): Promise<Stage[]> => {
      const params = projectId ? { projectId } : undefined;
      return httpClient.get('/stages', params);
    },
    
    create: async (data: Omit<Stage, 'id' | 'createdAt' | 'updatedAt'>): Promise<Stage> => {
      return httpClient.post('/stages', data);
    },
    
    update: async (id: string, data: Partial<Stage>): Promise<Stage> => {
      return httpClient.patch(`/stages/${id}`, data);
    },
    
    delete: async (id: string): Promise<void> => {
      return httpClient.delete(`/stages/${id}`);
    },
  },

  // Notifications
  notifications: {
    list: async (): Promise<Notification[]> => {
      return httpClient.get('/notifications');
    },
    
    markRead: async (id: string): Promise<void> => {
      return httpClient.post(`/notifications/${id}/read`);
    },
    
    markAllRead: async (): Promise<void> => {
      return httpClient.post('/notifications/read-all');
    },
    
    delete: async (id: string): Promise<void> => {
      return httpClient.delete(`/notifications/${id}`);
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
