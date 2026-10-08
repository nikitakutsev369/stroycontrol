import React, { useMemo, useState } from 'react';
import { Project, Brigade, Foreman, Stage } from '../types';
import { format, differenceInDays, parseISO, addDays, startOfDay, isBefore } from 'date-fns';
import { ru } from 'date-fns/locale';

interface GanttChartProps {
  projects: Project[];
  brigades: Brigade[];
  foremen: Foreman[];
  stages: Stage[];
  onUpdateStageProgress: (stageId: string, progress: number, status: Stage['status']) => void;
}

export default function GanttChart({ projects, brigades, foremen, stages, onUpdateStageProgress }: GanttChartProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [zoom, setZoom] = useState<'day' | 'week'>('day');

  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const projectStages = stages.filter(s => s.projectId === selectedProjectId).sort((a, b) => a.sortOrder - b.sortOrder);

  const getBrigadeName = (crewId: string) => brigades.find(b => b.id === crewId)?.name || '';
  const getForemanName = (foremanId?: string) => {
    if (!foremanId) return '';
    return foremen.find(f => f.id === foremanId)?.name || '';
  };

  const { minDate, maxDate, days, totalDays } = useMemo(() => {
    if (projectStages.length === 0) {
      const today = new Date();
      const start = addDays(today, -3);
      const end = addDays(today, 30);
      const total = differenceInDays(end, start) + 1;
      return { minDate: start, maxDate: end, days: Array.from({ length: total }, (_, i) => addDays(start, i)), totalDays: total };
    }

    const allDates = projectStages.flatMap(s => [parseISO(s.startDate), parseISO(s.endDate)]);
    const min = startOfDay(new Date(Math.min(...allDates.map(d => d.getTime()))));
    const max = startOfDay(new Date(Math.max(...allDates.map(d => d.getTime()))));
    
    const start = addDays(min, -2);
    const end = addDays(max, 3);
    const total = differenceInDays(end, start) + 1;
    const daysArr = Array.from({ length: total }, (_, i) => addDays(start, i));

    return { minDate: start, maxDate: end, days: daysArr, totalDays: total };
  }, [projectStages]);

  const getStagePosition = (stage: Stage) => {
    const start = differenceInDays(parseISO(stage.startDate), minDate);
    const duration = differenceInDays(parseISO(stage.endDate), parseISO(stage.startDate)) + 1;
    const left = (start / totalDays) * 100;
    const width = (duration / totalDays) * 100;
    return { left: `${Math.max(0, left)}%`, width: `${Math.min(100 - Math.max(0, left), width)}%` };
  };

  const getStageBarColor = (stage: Stage) => {
    const status = stage.status as string;
    if (status === 'done') return 'from-emerald-400 to-emerald-500';
    if (status === 'overdue' || (status !== 'done' && isBefore(parseISO(stage.endDate), new Date()))) return 'from-red-400 to-red-500';
    if (status === 'in_progress') return 'from-blue-400 to-blue-500';
    return 'from-amber-300 to-amber-400';
  };

  const cellWidth = zoom === 'day' ? 36 : 20;
  const today = new Date();
  const todayPosition = useMemo(() => {
    const diff = differenceInDays(today, minDate);
    return (diff / totalDays) * 100;
  }, [minDate, totalDays]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Диаграмма Ганта</h1>
          <p className="text-gray-500 mt-1">Визуализация этапов строительства</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          
          <div className="flex bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
            <button
              onClick={() => setZoom('day')}
              className={`px-3 py-1.5 text-xs rounded-lg transition font-medium ${zoom === 'day' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Дни
            </button>
            <button
              onClick={() => setZoom('week')}
              className={`px-3 py-1.5 text-xs rounded-lg transition font-medium ${zoom === 'week' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Недели
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-3 flex flex-wrap gap-5 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-3 rounded bg-gradient-to-r from-amber-300 to-amber-400"></div>
          <span className="text-gray-600">Запланировано</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-3 rounded bg-gradient-to-r from-blue-400 to-blue-500"></div>
          <span className="text-gray-600">В работе</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-3 rounded bg-gradient-to-r from-emerald-400 to-emerald-500"></div>
          <span className="text-gray-600">Завершено</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-3 rounded bg-gradient-to-r from-red-400 to-red-500"></div>
          <span className="text-gray-600">Просрочено</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-0.5 h-3 bg-red-500"></div>
          <span className="text-gray-600">Сегодня</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-3 text-gray-400" viewBox="0 0 16 12" fill="none">
            <path d="M0 6h12m0 0l-3-3m3 3l-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-gray-600">Зависимость</span>
        </div>
      </div>

      {selectedProject && projectStages.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <div style={{ minWidth: `${Math.max(900, totalDays * cellWidth + 320)}px` }}>
              {/* Header */}
              <div className="flex border-b border-gray-200 bg-gray-50/80">
                <div className="w-80 min-w-[320px] px-5 py-3 font-semibold text-xs text-gray-500 uppercase tracking-wider border-r border-gray-200 sticky left-0 bg-gray-50 z-10">
                  Этап работ
                </div>
                <div className="flex-1 relative">
                  <div className="flex">
                    {days.map((day, i) => {
                      const isToday = format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
                      const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                      return (
                        <div
                          key={i}
                          className={`text-center text-[10px] py-3 border-r border-gray-100 ${
                            isToday ? 'bg-blue-50 font-bold text-blue-600' : 
                            isWeekend ? 'bg-gray-100/50 text-gray-400' : 'text-gray-500'
                          }`}
                          style={{ width: `${cellWidth}px`, minWidth: `${cellWidth}px` }}
                        >
                          {(zoom === 'day' || (zoom === 'week' && i % 7 === 0)) && 
                            format(day, 'd', { locale: ru })
                          }
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Stages */}
              {projectStages.map((stage, idx) => {
                const pos = getStagePosition(stage);
                const isOverdue = stage.status !== 'done' && isBefore(parseISO(stage.endDate), today);
                const bgColor = getStageBarColor(stage);
                
                return (
                  <div key={stage.id} className={`flex border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'} hover:bg-blue-50/20 transition group`}>
                    <div className="w-80 min-w-[320px] px-5 py-3 border-r border-gray-200 sticky left-0 bg-inherit z-10">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                          stage.status === 'done' ? 'bg-emerald-100 text-emerald-700' :
                          stage.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                          isOverdue ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {stage.sortOrder + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${stage.status === 'done' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                            {stage.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-gray-400">
                              {format(parseISO(stage.startDate), 'd MMM', { locale: ru })} — {format(parseISO(stage.endDate), 'd MMM', { locale: ru })}
                            </span>
                            {stage.crewId && (
                              <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-medium">{getBrigadeName(stage.crewId)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 relative h-14">
                      {/* Grid lines */}
                      <div className="absolute inset-0 flex">
                        {days.map((_, i) => (
                          <div
                            key={i}
                            className={`border-r ${i % 7 === 0 ? 'border-gray-200' : 'border-gray-100/50'}`}
                            style={{ width: `${cellWidth}px`, minWidth: `${cellWidth}px` }}
                          ></div>
                        ))}
                      </div>
                      
                      {/* Today marker */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                        style={{ left: `${todayPosition}%` }}
                      >
                        <div className="absolute -top-1 -left-1.5 w-3 h-3 bg-red-500 rounded-full opacity-80"></div>
                      </div>
                      
                      {/* Stage bar with progress */}
                      <div
                        className="absolute top-2.5 h-9 rounded-lg bg-gray-200/50 overflow-hidden cursor-pointer group/bar"
                        style={{ left: pos.left, width: pos.width }}
                        title={`${stage.name}: ${stage.progress}%`}
                      >
                        {/* Progress fill */}
                        <div 
                          className={`h-full bg-gradient-to-r ${bgColor} transition-all duration-500 flex items-center px-2`}
                          style={{ width: `${stage.progress}%` }}
                        >
                          {stage.progress > 15 && (
                            <span className="text-white text-[10px] font-bold truncate">{stage.progress}%</span>
                          )}
                        </div>
                        {/* Remaining */}
                        {stage.progress < 100 && stage.progress > 0 && (
                          <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            <span className="text-gray-400 text-[10px]">{100 - stage.progress}%</span>
                          </div>
                        )}
                      </div>

                      {/* Dependency arrow */}
                      {stage.dependsOnId && (
                        <div className="absolute top-1/2 -translate-y-1/2 left-0 w-4 h-4 text-gray-300">
                          <svg viewBox="0 0 16 16" fill="none" className="w-full h-full">
                            <path d="M0 8h12m0 0l-3-3m3 3l-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-gray-500 text-lg">
            {projects.length === 0 ? 'Добавьте проект, чтобы увидеть диаграмму Ганта' : 'В этом проекте пока нет этапов'}
          </p>
        </div>
      )}
    </div>
  );
}
