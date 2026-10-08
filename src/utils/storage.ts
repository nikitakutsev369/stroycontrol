import { Project, Brigade, Foreman, Stage, Notification } from '../types';

const KEYS = {
  projects: 'sk_projects',
  brigades: 'sk_brigades',
  foremen: 'sk_foremen',
  stages: 'sk_stages',
  notifications: 'sk_notifications',
  seeded: 'sk_seeded',
};

export function getProjects(): Project[] {
  return JSON.parse(localStorage.getItem(KEYS.projects) || '[]');
}
export function saveProjects(v: Project[]) {
  localStorage.setItem(KEYS.projects, JSON.stringify(v));
}

export function getBrigades(): Brigade[] {
  return JSON.parse(localStorage.getItem(KEYS.brigades) || '[]');
}
export function saveBrigades(v: Brigade[]) {
  localStorage.setItem(KEYS.brigades, JSON.stringify(v));
}

export function getForemen(): Foreman[] {
  return JSON.parse(localStorage.getItem(KEYS.foremen) || '[]');
}
export function saveForemen(v: Foreman[]) {
  localStorage.setItem(KEYS.foremen, JSON.stringify(v));
}

export function getStages(): Stage[] {
  return JSON.parse(localStorage.getItem(KEYS.stages) || '[]');
}
export function saveStages(v: Stage[]) {
  localStorage.setItem(KEYS.stages, JSON.stringify(v));
}

export function getNotifications(): Notification[] {
  return JSON.parse(localStorage.getItem(KEYS.notifications) || '[]');
}
export function saveNotifications(v: Notification[]) {
  localStorage.setItem(KEYS.notifications, JSON.stringify(v));
}

export function isSeeded(): boolean {
  return localStorage.getItem(KEYS.seeded) === '1';
}
export function setSeeded() {
  localStorage.setItem(KEYS.seeded, '1');
}
