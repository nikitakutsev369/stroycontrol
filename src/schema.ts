/**
 * Схема данных — аналог drizzle-orm/mysql-core схемы
 * Все CRUD-операции централизованы здесь.
 * При переходе на реальную БД нужно будет заменить localStorage на API-запросы.
 */

import { Project, Brigade, Foreman, Stage, Notification } from './types';

// === KEYS ===
const KEYS = {
  projects: 'sk_projects',
  brigades: 'sk_brigades',
  foremen: 'sk_foremen',
  stages: 'sk_stages',
  notifications: 'sk_notifications',
  seeded: 'sk_seeded',
};

// === HELPERS ===
function read<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]') as T[];
  } catch {
    return [];
  }
}

function write<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

function now(): string {
  return new Date().toISOString();
}

// === PROJECTS ===
export const projects = {
  select: (): Project[] => read<Project>(KEYS.projects),
  insert: (project: Omit<Project, 'createdAt'>): Project => {
    const all = read<Project>(KEYS.projects);
    const newProject: Project = { ...project, createdAt: now() };
    write(KEYS.projects, [...all, newProject]);
    return newProject;
  },
  update: (id: string, data: Partial<Project>): Project | null => {
    const all = read<Project>(KEYS.projects);
    const idx = all.findIndex(p => p.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...data };
    write(KEYS.projects, all);
    return all[idx];
  },
  delete: (id: string): boolean => {
    const all = read<Project>(KEYS.projects);
    const filtered = all.filter(p => p.id !== id);
    if (filtered.length === all.length) return false;
    write(KEYS.projects, filtered);
    return true;
  },
  findById: (id: string): Project | undefined =>
    read<Project>(KEYS.projects).find(p => p.id === id),
};

// === BRIGADES (CREWS) ===
export const crews = {
  select: (): Brigade[] => read<Brigade>(KEYS.brigades),
  insert: (crew: Omit<Brigade, 'createdAt'>): Brigade => {
    const all = read<Brigade>(KEYS.brigades);
    const newCrew: Brigade = { ...crew, createdAt: now() };
    write(KEYS.brigades, [...all, newCrew]);
    return newCrew;
  },
  update: (id: string, data: Partial<Brigade>): Brigade | null => {
    const all = read<Brigade>(KEYS.brigades);
    const idx = all.findIndex(b => b.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...data };
    write(KEYS.brigades, all);
    return all[idx];
  },
  delete: (id: string): boolean => {
    const all = read<Brigade>(KEYS.brigades);
    const filtered = all.filter(b => b.id !== id);
    if (filtered.length === all.length) return false;
    write(KEYS.brigades, filtered);
    return true;
  },
  findById: (id: string): Brigade | undefined =>
    read<Brigade>(KEYS.brigades).find(b => b.id === id),
};

// === FOREMEN ===
export const foremen = {
  select: (): Foreman[] => read<Foreman>(KEYS.foremen),
  insert: (foreman: Omit<Foreman, 'createdAt'>): Foreman => {
    const all = read<Foreman>(KEYS.foremen);
    const newForeman: Foreman = { ...foreman, createdAt: now() };
    write(KEYS.foremen, [...all, newForeman]);
    return newForeman;
  },
  update: (id: string, data: Partial<Foreman>): Foreman | null => {
    const all = read<Foreman>(KEYS.foremen);
    const idx = all.findIndex(f => f.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...data };
    write(KEYS.foremen, all);
    return all[idx];
  },
  delete: (id: string): boolean => {
    const all = read<Foreman>(KEYS.foremen);
    const filtered = all.filter(f => f.id !== id);
    if (filtered.length === all.length) return false;
    write(KEYS.foremen, filtered);
    return true;
  },
  findById: (id: string): Foreman | undefined =>
    read<Foreman>(KEYS.foremen).find(f => f.id === id),
  findByCrew: (crewId: string): Foreman[] =>
    read<Foreman>(KEYS.foremen).filter(f => f.crewId === crewId),
  // Авторизация по имени + PIN
  authenticate: (name: string, pin: string): Foreman | null => {
    const all = read<Foreman>(KEYS.foremen);
    return all.find(f => f.name === name && f.pin === pin) || null;
  },
};

// === STAGES ===
export const stages = {
  select: (): Stage[] => read<Stage>(KEYS.stages),
  selectByProject: (projectId: string): Stage[] =>
    read<Stage>(KEYS.stages).filter(s => s.projectId === projectId).sort((a, b) => a.sortOrder - b.sortOrder),
  selectByForeman: (foremanId: string): Stage[] =>
    read<Stage>(KEYS.stages).filter(s => s.foremanId === foremanId),
  selectByCrew: (crewId: string): Stage[] =>
    read<Stage>(KEYS.stages).filter(s => s.crewId === crewId),
  insert: (stage: Omit<Stage, 'createdAt' | 'updatedAt'>): Stage => {
    const all = read<Stage>(KEYS.stages);
    const newStage: Stage = { ...stage, createdAt: now(), updatedAt: now() };
    write(KEYS.stages, [...all, newStage]);
    return newStage;
  },
  update: (id: string, data: Partial<Stage>): Stage | null => {
    const all = read<Stage>(KEYS.stages);
    const idx = all.findIndex(s => s.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...data, updatedAt: now() };
    write(KEYS.stages, all);
    return all[idx];
  },
  delete: (id: string): boolean => {
    const all = read<Stage>(KEYS.stages);
    const filtered = all.filter(s => s.id !== id);
    if (filtered.length === all.length) return false;
    write(KEYS.stages, filtered);
    return true;
  },
  findById: (id: string): Stage | undefined =>
    read<Stage>(KEYS.stages).find(s => s.id === id),
};

// === NOTIFICATIONS ===
export const notifications = {
  select: (): Notification[] => read<Notification>(KEYS.notifications),
  selectUnread: (): Notification[] =>
    read<Notification>(KEYS.notifications).filter(n => !n.read),
  selectByForeman: (foremanId: string): Notification[] =>
    read<Notification>(KEYS.notifications).filter(n => n.foremanId === foremanId),
  insert: (notification: Omit<Notification, 'createdAt'>): Notification => {
    const all = read<Notification>(KEYS.notifications);
    const newNotif: Notification = { ...notification, createdAt: now() };
    write(KEYS.notifications, [newNotif, ...all]);
    return newNotif;
  },
  markRead: (id: string): boolean => {
    const all = read<Notification>(KEYS.notifications);
    const idx = all.findIndex(n => n.id === id);
    if (idx === -1) return false;
    all[idx] = { ...all[idx], read: true };
    write(KEYS.notifications, all);
    return true;
  },
  markAllRead: (): void => {
    const all = read<Notification>(KEYS.notifications).map(n => ({ ...n, read: true }));
    write(KEYS.notifications, all);
  },
  delete: (id: string): boolean => {
    const all = read<Notification>(KEYS.notifications);
    const filtered = all.filter(n => n.id !== id);
    if (filtered.length === all.length) return false;
    write(KEYS.notifications, filtered);
    return true;
  },
};

// === SEED ===
export function isSeeded(): boolean {
  return localStorage.getItem(KEYS.seeded) === '1';
}

export function setSeeded(): void {
  localStorage.setItem(KEYS.seeded, '1');
}

export function seedAll(data: {
  projects: Project[];
  brigades: Brigade[];
  foremen: Foreman[];
  stages: Stage[];
}): void {
  write(KEYS.projects, data.projects);
  write(KEYS.brigades, data.brigades);
  write(KEYS.foremen, data.foremen);
  write(KEYS.stages, data.stages);
}

// === BULK WRITE (для React state sync) ===
export function writeAll(data: {
  projects: Project[];
  brigades: Brigade[];
  foremen: Foreman[];
  stages: Stage[];
  notifications: Notification[];
}): void {
  write(KEYS.projects, data.projects);
  write(KEYS.brigades, data.brigades);
  write(KEYS.foremen, data.foremen);
  write(KEYS.stages, data.stages);
  write(KEYS.notifications, data.notifications);
}
