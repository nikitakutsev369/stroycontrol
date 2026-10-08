export interface Brigade {
  id: string;
  name: string;
  specialty: string;
}

export interface Foreman {
  id: string;
  name: string;
  phone: string;
  pin: string;
  crewId: string;
}

export type StageStatus = 'planned' | 'in_progress' | 'done' | 'overdue';

export interface Stage {
  id: string;
  projectId: string;
  crewId: string;
  foremanId?: string;
  name: string;
  startDate: string;
  endDate: string;
  dependsOnId?: string;
  status: StageStatus;
  progress: number;
  completedAt?: string;
  sortOrder: number;
}

export interface Project {
  id: string;
  name: string;
  address: string;
  customer: string;
  description: string;
  status: 'active' | 'paused' | 'completed';
  createdAt: string;
}

export interface Notification {
  id: string;
  projectId: string;
  projectName: string;
  stageId: string;
  stageName: string;
  message: string;
  type: 'reminder' | 'overdue' | 'completed' | 'info' | 'dependency';
  read: boolean;
  createdAt: string;
}

export type ViewMode = 'dashboard' | 'gantt' | 'projects' | 'brigades' | 'notifications';
