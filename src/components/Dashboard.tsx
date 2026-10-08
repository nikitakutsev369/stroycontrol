import React from 'react';
import { Project, Brigade, Foreman, Stage, Notification } from '../types';
import { format, differenceInDays, isAfter, isBefore, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

interface DashboardProps {
  projects: Project[];
  brigades: Brigade[];
  foremen: Foreman[];
  stages: Stage[];
  notifications: Notification[];
}

export default function Dashboard({ projects, brigades, foremen, stages, notifications }: DashboardProps) {
  const activeProjects = projects.filter(p => p.status === 'active');
  const totalStages = stages.length;
  const completedStages = stages.filter(s => s.status === 'done').length;
  const inProgressStages = stages.filter(s => s.status === 'in_progress').length;
  const overdueStages = stages.filter(s => {
    if (s.status === 'done') return false;
    return isBefore(parseISO(s.endDate), new Date());
  }).length;
  const unreadNotifications = notifications.filter(n => !n.read).length;

  const upcomingStages = stages
    .filter(s => s.status !== 'done')
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, 6);

  const getProjectName = (projectId: string) => projects.find(p => p.id === projectId)?.name || '';
  const getBrigadeName = (crewId: string) => brigades.find(b => b.id === crewId)?.name || '';
  const getForemanName = (foremanId?: string) => {
    if (!foremanId) return '';
    return foremen.find(f => f.id === foremanId)?.name || '';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Панель управления</h1>
        <p className="text-gray-500 mt-1">Обзор строительных проектов и задач</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{activeProjects.length}</div>
              <div className="text-xs text-gray-500">Проектов</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalStages}</div>
              <div className="text-xs text-gray-500">Этапов</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{completedStages}</div>
              <div className="text-xs text-gray-500">Завершено</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{inProgressStages}</div>
              <div className="text-xs text-gray-500">В работе</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{overdueStages}</div>
              <div className="text-xs text-gray-500">Просрочено</div>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Progress */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Прогресс по проектам</h2>
        <div className="space-y-5">
          {activeProjects.map(project => {
            const projectStages = stages.filter(s => s.projectId === project.id);
            const completed = projectStages.filter(s => s.status === 'done').length;
            const total = projectStages.length;
            const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
            
            return (
              <div key={project.id}>
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <span className="text-sm font-semibold text-gray-800">{project.name}</span>
                    <span className="text-xs text-gray-400 ml-2">{project.customer}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">{completed}/{total} этапов</span>
                    <span className="text-sm font-bold text-blue-600">{progress}%</span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-700"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
          {activeProjects.length === 0 && (
            <p className="text-gray-400 text-center py-6">Нет активных проектов</p>
          )}
        </div>
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Stages */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Ближайшие этапы</h2>
          <div className="space-y-3">
            {upcomingStages.map(stage => {
              const daysUntil = differenceInDays(parseISO(stage.startDate), new Date());
              const isOverdue = isBefore(parseISO(stage.endDate), new Date()) && stage.status !== 'done';
              
              return (
                <div key={stage.id} className={`p-3 rounded-xl border ${isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-gray-50'}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm truncate">{stage.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{getProjectName(stage.projectId)}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ml-2 ${
                      isOverdue ? 'bg-red-100 text-red-700' :
                      daysUntil <= 3 ? 'bg-amber-100 text-amber-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {isOverdue ? 'Просрочено' : daysUntil <= 0 ? 'Сегодня' : daysUntil === 1 ? 'Завтра' : `${daysUntil} дн.`}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-gray-400">
                      {format(parseISO(stage.startDate), 'd MMM', { locale: ru })} — {format(parseISO(stage.endDate), 'd MMM', { locale: ru })}
                    </span>
                    {stage.crewId && (
                      <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{getBrigadeName(stage.crewId)}</span>
                    )}
                  </div>
                </div>
              );
            })}
            {upcomingStages.length === 0 && (
              <p className="text-gray-400 text-center py-6">Нет предстоящих этапов</p>
            )}
          </div>
        </div>

        {/* Brigades */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Бригады и прорабы</h2>
          <div className="space-y-3">
            {brigades.map(brigade => {
              const brigadeForemen = foremen.filter(f => f.crewId === brigade.id);
              const brigadeStages = stages.filter(s => s.crewId === brigade.id && s.status !== 'done');
              
              return (
                <div key={brigade.id} className="p-3 rounded-xl border border-gray-100 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{brigade.name}</p>
                      <p className="text-xs text-gray-500">{brigade.specialty}</p>
                    </div>
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">
                      {brigadeStages.length} задач
                    </span>
                  </div>
                  {brigadeForemen.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      {brigadeForemen.map(f => (
                        <div key={f.id} className="flex items-center gap-2 text-xs text-gray-600">
                          <span>👷 {f.name}</span>
                          <span className="text-gray-400">{f.phone}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {brigades.length === 0 && (
              <p className="text-gray-400 text-center py-6">Нет бригад</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
