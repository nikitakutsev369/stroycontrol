export type UserRole = 'admin' | 'foreman';

export interface User {
  id: string;
  unionId: string;
  name: string;
  email?: string;
  avatar?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  lastSignInAt: string;
}

export interface Session {
  sessionId?: string;
  userId?: string;
  foremanId?: string;
  role: UserRole;
  expiresAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user?: User;
  foreman?: Foreman;
  session?: Session;
}

export interface Project {
  id: string;
  name: string;
  address?: string;
  customer?: string;
  description?: string;
  createdAt: string;
}

export interface Brigade {
  id: string;
  name: string;
  specialty?: string;
  createdAt: string;
}

export interface Foreman {
  id: string;
  name: string;
  phone?: string;
  pin: string;
  crewId?: string;
  createdAt: string;
}

export type StageStatus = 'planned' | 'in_progress' | 'done';

export interface Stage {
  id: string;
  projectId: string;
  crewId?: string;
  foremanId?: string;
  name: string;
  startDate: string;
  endDate: string;
  dependsOnId?: string;
  status: StageStatus;
  progress: number;
  comment?: string;
  sortOrder: number;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type NotificationType = 'assigned' | 'starts_soon' | 'overdue' | 'completed' | 'updated';

export interface Notification {
  id: string;
  userId?: string;
  foremanId?: string;
  stageId?: string;
  type: NotificationType;
  title: string;
  message?: string;
  read: boolean;
  createdAt: string;
}

export type ViewMode = 'dashboard' | 'gantt' | 'projects' | 'brigades' | 'notifications';

export type AuthMode = 'login' | null;
export type AuthUser = { type: 'admin'; user: User } | { type: 'foreman'; foreman: Foreman };
