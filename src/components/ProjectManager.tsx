import React, { useState } from 'react';
import { Project, Brigade, Foreman, Stage, StageStatus } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

interface ProjectManagerProps {
  projects: Project[];
  brigades: Brigade[];
  foremen: Foreman[];
  stages: Stage[];
  onSaveProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
  onAddStage: (stage: Stage) => void;
  onDeleteStage: (id: string) => void;
  onUpdateStage: (stage: Stage) => void;
}

export default function ProjectManager({
  projects, brigades, foremen, stages, onSaveProject, onDeleteProject, onAddStage, onDeleteStage, onUpdateStage
}: ProjectManagerProps) {
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  
  const [pName, setPName] = useState('');
  const [pAddress, setPAddress] = useState('');
  const [pCustomer, setPCustomer] = useState('');
  const [pDescription, setPDescription] = useState('');
  const [pStatus, setPStatus] = useState<Project['status']>('active');
  
  const [showStageForm, setShowStageForm] = useState(false);
  const [stageProjectId, setStageProjectId] = useState('');
  const [editingStage, setEditingStage] = useState<Stage | null>(null);
  const [sName, setSName] = useState('');
  const [sStartDate, setSStartDate] = useState('');
  const [sEndDate, setSEndDate] = useState('');
  const [sCrewId, setSCrewId] = useState('');
  const [sForemanId, setSForemanId] = useState('');
  const [sDependsOn, setSDependsOn] = useState('');
  const [sProgress, setSProgress] = useState(0);
  const [sStatus, setSStatus] = useState<StageStatus>('planned');

  const resetProjectForm = () => {
    setPName(''); setPAddress(''); setPCustomer(''); setPDescription(''); setPStatus('active');
    setEditingProject(null); setShowProjectForm(false);
  };

  const resetStageForm = () => {
    setSName(''); setSStartDate(''); setSEndDate(''); setSCrewId(''); setSForemanId('');
    setSDependsOn(''); setSProgress(0); setSStatus('planned'); setEditingStage(null); setShowStageForm(false);
  };

  const handleSaveProject = () => {
    if (!pName.trim()) return;
    if (editingProject) {
      onSaveProject({ ...editingProject, name: pName, address: pAddress, customer: pCustomer, description: pDescription, status: pStatus });
    } else {
      onSaveProject({ id: uuidv4(), name: pName, address: pAddress, customer: pCustomer, description: pDescription, status: pStatus, createdAt: new Date().toISOString() });
    }
    resetProjectForm();
  };

  const handleEditProject = (p: Project) => {
    setEditingProject(p); setPName(p.name); setPAddress(p.address); setPCustomer(p.customer); setPDescription(p.description); setPStatus(p.status);
    setShowProjectForm(true);
  };

  const handleAddStage = (projectId: string) => {
    setStageProjectId(projectId); resetStageForm(); setShowStageForm(true);
  };

  const handleSaveStage = () => {
    if (!sName.trim() || !sStartDate || !sEndDate) return;
    const projectStages = stages.filter(s => s.projectId === stageProjectId);
    
    if (editingStage) {
      onUpdateStage({ ...editingStage, name: sName, startDate: sStartDate, endDate: sEndDate, crewId: sCrewId, foremanId: sForemanId || undefined, dependsOnId: sDependsOn || undefined, progress: sProgress, status: sStatus });
    } else {
      onAddStage({
        id: uuidv4(), projectId: stageProjectId, crewId: sCrewId, foremanId: sForemanId || undefined,
        name: sName, startDate: sStartDate, endDate: sEndDate, dependsOnId: sDependsOn || undefined,
        status: sStatus, progress: sProgress, sortOrder: projectStages.length,
      });
    }
    resetStageForm();
  };

  const handleEditStage = (stage: Stage) => {
    setStageProjectId(stage.projectId); setEditingStage(stage);
    setSName(stage.name); setSStartDate(stage.startDate); setSEndDate(stage.endDate);
    setSCrewId(stage.crewId); setSForemanId(stage.foremanId || ''); setSDependsOn(stage.dependsOnId || '');
    setSProgress(stage.progress); setSStatus(stage.status); setShowStageForm(true);
  };

  const getBrigadeName = (id: string) => brigades.find(b => b.id === id)?.name || '—';
  const getForemanName = (id?: string) => id ? foremen.find(f => f.id === id)?.name || '—' : '—';
  const getStageName = (id: string) => stages.find(s => s.id === id)?.name || '—';

  const statusBadge = (s: string) => {
    switch (s) {
      case 'done': return { text: 'Завершён', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'in_progress': return { text: 'В работе', cls: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'overdue': return { text: 'Просрочен', cls: 'bg-red-50 text-red-700 border-red-200' };
      default: return { text: 'Запланирован', cls: 'bg-amber-50 text-amber-700 border-amber-200' };
    }
  };

  const projectStatusBadge = (s: string) => {
    switch (s) {
      case 'active': return { text: 'Активный', cls: 'bg-emerald-50 text-emerald-700' };
      case 'paused': return { text: 'Приостановлен', cls: 'bg-amber-50 text-amber-700' };
      case 'completed': return { text: 'Завершён', cls: 'bg-blue-50 text-blue-700' };
      default: return { text: s, cls: 'bg-gray-50 text-gray-700' };
    }
  };

  const crewForemen = sCrewId ? foremen.filter(f => f.crewId === sCrewId) : [];
  const projectStagesForDep = stages.filter(s => s.projectId === stageProjectId && (!editingStage || s.id !== editingStage.id));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Объекты строительства</h1>
          <p className="text-gray-500 mt-1">Управление проектами и этапами работ</p>
        </div>
        <button onClick={() => { resetProjectForm(); setShowProjectForm(true); }} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition flex items-center gap-2 shadow-sm font-medium">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Новый объект
        </button>
      </div>

      {/* Project Form Modal */}
      {showProjectForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">{editingProject ? 'Редактировать объект' : 'Новый объект строительства'}</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Название объекта *</label>
                <input type="text" value={pName} onChange={e => setPName(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="ЖК «Солнечный»" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Заказчик</label>
                <input type="text" value={pCustomer} onChange={e => setPCustomer(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="ООО «СтройИнвест»" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Адрес</label>
                <input type="text" value={pAddress} onChange={e => setPAddress(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="г. Москва, ул. Строителей, д. 1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Описание</label>
                <textarea value={pDescription} onChange={e => setPDescription(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent" rows={2} placeholder="Описание объекта..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Статус</label>
                <select value={pStatus} onChange={e => setPStatus(e.target.value as Project['status'])} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="active">Активный</option>
                  <option value="paused">Приостановлен</option>
                  <option value="completed">Завершён</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={resetProjectForm} className="px-5 py-2.5 text-gray-600 hover:text-gray-800 transition rounded-xl hover:bg-gray-100">Отмена</button>
              <button onClick={handleSaveProject} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition font-medium">{editingProject ? 'Сохранить' : 'Создать'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Stage Form Modal */}
      {showStageForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">{editingStage ? 'Редактировать этап' : 'Новый этап работ'}</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Название этапа *</label>
                <input type="text" value={sName} onChange={e => setSName(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Устройство фундамента" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Дата начала *</label>
                  <input type="date" value={sStartDate} onChange={e => setSStartDate(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Дата окончания *</label>
                  <input type="date" value={sEndDate} onChange={e => setSEndDate(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Бригада</label>
                <select value={sCrewId} onChange={e => { setSCrewId(e.target.value); setSForemanId(''); }} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Не назначена</option>
                  {brigades.map(b => <option key={b.id} value={b.id}>{b.name} — {b.specialty}</option>)}
                </select>
              </div>
              {crewForemen.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Прораб</label>
                  <select value={sForemanId} onChange={e => setSForemanId(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Не назначен</option>
                    {crewForemen.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Зависит от этапа</label>
                <select value={sDependsOn} onChange={e => setSDependsOn(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Нет зависимости</option>
                  {projectStagesForDep.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Статус</label>
                  <select value={sStatus} onChange={e => setSStatus(e.target.value as StageStatus)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="planned">Запланирован</option>
                    <option value="in_progress">В работе</option>
                    <option value="done">Завершён</option>
                    <option value="overdue">Просрочен</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Прогресс: {sProgress}%</label>
                  <input type="range" min="0" max="100" step="5" value={sProgress} onChange={e => setSProgress(Number(e.target.value))} className="w-full accent-blue-600" />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={resetStageForm} className="px-5 py-2.5 text-gray-600 hover:text-gray-800 transition rounded-xl hover:bg-gray-100">Отмена</button>
              <button onClick={handleSaveStage} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition font-medium">{editingStage ? 'Сохранить' : 'Добавить'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Projects List */}
      <div className="space-y-4">
        {projects.map(project => {
          const isExpanded = expandedProject === project.id;
          const projectStages = stages.filter(s => s.projectId === project.id);
          const completed = projectStages.filter(s => s.status === 'done').length;
          const total = projectStages.length;
          const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
          const ps = projectStatusBadge(project.status);
          
          return (
            <div key={project.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 cursor-pointer hover:bg-gray-50/50 transition" onClick={() => setExpandedProject(isExpanded ? null : project.id)}>
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-bold text-gray-900">{project.name}</h3>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${ps.cls}`}>{ps.text}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1.5 text-sm text-gray-500">
                      {project.address && <span>📍 {project.address}</span>}
                      {project.customer && <span>🏢 {project.customer}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-700">{completed}/{total} этапов</div>
                      <div className="w-28 bg-gray-100 rounded-full h-2 mt-1.5">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>
                    <svg className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {isExpanded && (
                <div className="border-t border-gray-100 p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-gray-800">Этапы работ</h4>
                    <button onClick={() => handleAddStage(project.id)} className="text-sm bg-blue-50 text-blue-700 px-4 py-2 rounded-xl hover:bg-blue-100 transition flex items-center gap-1.5 font-medium">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      Добавить этап
                    </button>
                  </div>
                  
                  {projectStages.length > 0 ? (
                    <div className="space-y-2">
                      {projectStages.sort((a, b) => a.sortOrder - b.sortOrder).map(stage => {
                        const sb = statusBadge(stage.status);
                        return (
                          <div key={stage.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500 shrink-0">
                                {stage.sortOrder + 1}
                              </div>
                              <div className="min-w-0">
                                <p className={`text-sm font-semibold truncate ${stage.status === 'done' ? 'line-through text-gray-400' : 'text-gray-800'}`}>{stage.name}</p>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  <span className="text-xs text-gray-400">
                                    {format(parseISO(stage.startDate), 'd MMM', { locale: ru })} — {format(parseISO(stage.endDate), 'd MMM', { locale: ru })}
                                  </span>
                                  {stage.crewId && <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-medium">{getBrigadeName(stage.crewId)}</span>}
                                  {stage.foremanId && <span className="text-xs text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded font-medium">{getForemanName(stage.foremanId)}</span>}
                                  {stage.dependsOnId && <span className="text-xs text-gray-400">← {getStageName(stage.dependsOnId)}</span>}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <div className="text-right">
                                <span className={`text-xs px-2 py-1 rounded-full font-medium border ${sb.cls}`}>{sb.text}</span>
                                <div className="w-16 bg-gray-100 rounded-full h-1.5 mt-1.5">
                                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${stage.progress}%` }}></div>
                                </div>
                              </div>
                              <button onClick={() => handleEditStage(stage)} className="p-2 text-gray-400 hover:text-blue-600 transition rounded-lg hover:bg-blue-50">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                              </button>
                              <button onClick={() => onDeleteStage(stage.id)} className="p-2 text-gray-400 hover:text-red-600 transition rounded-lg hover:bg-red-50">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-8">Нет этапов. Добавьте первый этап работ.</p>
                  )}
                  
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end gap-2">
                    <button onClick={() => handleEditProject(project)} className="text-sm text-blue-600 hover:text-blue-700 px-4 py-2 rounded-xl hover:bg-blue-50 transition font-medium">Редактировать</button>
                    <button onClick={() => onDeleteProject(project.id)} className="text-sm text-red-600 hover:text-red-700 px-4 py-2 rounded-xl hover:bg-red-50 transition font-medium">Удалить</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        
        {projects.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
            <div className="text-6xl mb-4">🏗️</div>
            <p className="text-gray-500 text-lg mb-2">Пока нет объектов строительства</p>
            <p className="text-gray-400 text-sm">Нажмите «Новый объект» чтобы добавить первый</p>
          </div>
        )}
      </div>
    </div>
  );
}
