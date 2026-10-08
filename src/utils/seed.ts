import { Project, Brigade, Foreman, Stage } from '../types';

function fmt(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return fmt(d);
}

export function getSeedData() {
  const projects: Project[] = [
    {
      id: 'p1',
      name: 'ЖК «Северный», корпус 3',
      address: 'ул. Строителей, 12',
      customer: 'ООО «СеверСтрой»',
      description: 'Монолитный жилой дом, 12 этажей',
      status: 'active',
      createdAt: daysFromNow(-30),
    },
    {
      id: 'p2',
      name: 'Торговый центр «Меридиан»',
      address: 'пр. Победы, 45',
      customer: 'АО «Меридиан-Инвест»',
      description: 'Реконструкция фасада и внутренняя отделка',
      status: 'active',
      createdAt: daysFromNow(-20),
    },
  ];

  const brigades: Brigade[] = [
    { id: 'c1', name: 'Бригада №1', specialty: 'Монолитные работы' },
    { id: 'c2', name: 'Бригада №2', specialty: 'Кровля и фасад' },
    { id: 'c3', name: 'Бригада №3', specialty: 'Отделочные работы' },
  ];

  const foremen: Foreman[] = [
    { id: 'f1', name: 'Иван Петров', phone: '+7 900 111-22-33', pin: '1234', crewId: 'c1' },
    { id: 'f2', name: 'Сергей Сидоров', phone: '+7 900 444-55-66', pin: '4321', crewId: 'c3' },
  ];

  const stages: Stage[] = [
    {
      id: 's1', projectId: 'p1', crewId: 'c1', foremanId: 'f1',
      name: 'Заливка фундамента',
      startDate: daysFromNow(-10), endDate: daysFromNow(-2),
      status: 'done', progress: 100, completedAt: daysFromNow(-2), sortOrder: 0,
    },
    {
      id: 's2', projectId: 'p1', crewId: 'c1', foremanId: 'f1',
      name: 'Возведение коробки (1–4 этаж)',
      startDate: daysFromNow(-1), endDate: daysFromNow(20),
      dependsOnId: 's1', status: 'in_progress', progress: 30, sortOrder: 1,
    },
    {
      id: 's3', projectId: 'p1', crewId: 'c2',
      name: 'Монтаж кровли',
      startDate: daysFromNow(22), endDate: daysFromNow(35),
      dependsOnId: 's2', status: 'planned', progress: 0, sortOrder: 2,
    },
    {
      id: 's4', projectId: 'p1', crewId: 'c3', foremanId: 'f2',
      name: 'Внутренняя отделка квартир',
      startDate: daysFromNow(25), endDate: daysFromNow(50),
      dependsOnId: 's2', status: 'planned', progress: 0, sortOrder: 3,
    },
    {
      id: 's5', projectId: 'p2', crewId: 'c2',
      name: 'Демонтаж старого фасада',
      startDate: daysFromNow(-5), endDate: daysFromNow(-1),
      status: 'done', progress: 100, completedAt: daysFromNow(-1), sortOrder: 0,
    },
    {
      id: 's6', projectId: 'p2', crewId: 'c2',
      name: 'Монтаж нового фасада',
      startDate: daysFromNow(0), endDate: daysFromNow(15),
      dependsOnId: 's5', status: 'in_progress', progress: 10, sortOrder: 1,
    },
    {
      id: 's7', projectId: 'p2', crewId: 'c3', foremanId: 'f2',
      name: 'Внутренняя отделка холла',
      startDate: daysFromNow(1), endDate: daysFromNow(14),
      status: 'planned', progress: 0, sortOrder: 2,
    },
  ];

  return { projects, brigades, foremen, stages };
}
