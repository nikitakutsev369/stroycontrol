import React, { useState, useEffect, useCallback } from 'react';
import { Project, Brigade, Foreman, Stage, Notification, ViewMode } from './types';
import {
  getProjects, saveProjects, getBrigades, saveBrigades,
  getForemen, saveForemen, getStages, saveStages,
  getNotifications, saveNotifications, isSeeded, setSeeded
} from './utils/storage';
import { getSeedData } from './utils/seed';
import { v4 as uuidv4 } from 'uuid';
import { parseISO, differenceInDays, isBefore, format } from 'date-fns';
import { ru } from 'date-fns/locale';
import Dashboard from './components/Dashboard';
import GanttChart from './components/GanttChart';
import ProjectManager from './components/ProjectManager';
import BrigadeManager from './components/BrigadeManager';
import Notifications from './components/Notifications';

function App() {
  const [view, setView] = useState<ViewMode>('dashboard');
  const [projects, setProjects] = useState<Project[]>([]);
  const [brigades, setBrigades] = useState<Brigade[]>([]);
  const [foremen, setForemen] = useState<Foreman[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Initial load + seed
  useEffect(() => {
    if (!isSeeded()) {
      const seed = getSeedData();
      saveProjects(seed.projects);
      saveBrigades(seed.brigades);
      saveForemen(seed.foremen);
      saveStages(seed.stages);
      setSeeded();
      setProjects(seed.projects);
      setBrigades(seed.brigades);
      setForemen(seed.foremen);
      setStages(seed.stages);
    } else {
      setProjects(getProjects());
      setBrigades(getBrigades());
      setForemen(getForemen());
      setStages(getStages());
    }
    setNotifications(getNotifications());
    setLoaded(true);
  }, []);

  // Persist changes
  useEffect(() => { if (loaded) saveProjects(projects); }, [projects, loaded]);
  useEffect(() => { if (loaded) saveBrigades(brigades); }, [brigades, loaded]);
  useEffect(() => { if (loaded) saveForemen(foremen); }, [foremen, loaded]);
  useEffect(() => { if (loaded) saveStages(stages); }, [stages, loaded]);
  useEffect(() => { if (loaded) saveNotifications(notifications); }, [notifications, loaded]);

  // Check deadlines and generate notifications
  useEffect(() => {
    if (!loaded || stages.length === 0) return;

    const newNotifs: Notification[] = [];
    const today = new Date();

    stages.forEach(stage => {
      if (stage.status === 'done') return;
      const project = projects.find(p => p.id === stage.projectId);
      if (!project) return;

      const endDate = parseISO(stage.endDate);
      const startDate = parseISO(stage.startDate);
      const daysUntilEnd = differenceInDays(endDate, today);
      const daysUntilStart = differenceInDays(startDate, today);

      // Overdue
      if (isBefore(endDate, today)) {
        const exists = notifications.find(n => n.stageId === stage.id && n.type === 'overdue' && !n.read);
        if (!exists) {
          newNotifs.push({
            id: uuidv4(), projectId: project.id, projectName: project.name,
            stageId: stage.id, stageName: stage.name,
            message: `⚠️ Этап «${stage.name}» просрочен! Срок был ${format(endDate, 'd MMMM', { locale: ru })}`,
            type: 'overdue', read: false, createdAt: new Date().toISOString()
          });
        }
      }

      // Reminder 3 days before start
      if (daysUntilStart === 3) {
        const exists = notifications.find(n => n.stageId === stage.id && n.type === 'reminder' && n.message.includes('начнётся через 3 дня'));
        if (!exists) {
          newNotifs.push({
            id: uuidv4(), projectId: project.id, projectName: project.name,
            stageId: stage.id, stageName: stage.name,
            message: `📅 Этап «${stage.name}» начнётся через 3 дня (${format(startDate, 'd MMMM', { locale: ru })})`,
            type: 'reminder', read: false, createdAt: new Date().toISOString()
          });
        }
      }

      // Reminder 1 day before end
      if (daysUntilEnd === 1) {
        const exists = notifications.find(n => n.stageId === stage.id && n.type === 'reminder' && n.message.includes('заканчивается завтра'));
        if (!exists) {
          newNotifs.push({
            id: uuidv4(), projectId: project.id, projectName: project.name,
            stageId: stage.id, stageName: stage.name,
            message: `⏰ Этап «${stage.name}» заканчивается завтра (${format(endDate, 'd MMMM', { locale: ru })})`,
            type: 'reminder', read: false, createdAt: new Date().toISOString()
          });
        }
      }
    });

    if (newNotifs.length > 0) {
      setNotifications(prev => [...newNotifs, ...prev]);
    }
  }, [stages, projects, loaded]);

  // === Handlers ===

  const handleSaveProject = useCallback((project: Project) => {
    setProjects(prev => {
      const exists = prev.find(p => p.id === project.id);
      return exists ? prev.map(p => p.id === project.id ? project : p) : [...prev, project];
    });
  }, []);

  const handleDeleteProject = useCallback((id: string) => {
    if (confirm('Удалить объект и все его этапы?')) {
      setProjects(prev => prev.filter(p => p.id !== id));
      setStages(prev => prev.filter(s => s.projectId !== id));
    }
  }, []);

  const handleAddStage = useCallback((stage: Stage) => {
    setStages(prev => [...prev, stage]);
  }, []);

  const handleDeleteStage = useCallback((id: string) => {
    setStages(prev => prev.filter(s => s.id !== id));
  }, []);

  const handleUpdateStage = useCallback((updated: Stage) => {
    setStages(prev => prev.map(s => s.id === updated.id ? updated : s));
  }, []);

  const handleUpdateStageProgress = useCallback((stageId: string, progress: number, status: Stage['status']) => {
    setStages(prev => prev.map(s => {
      if (s.id !== stageId) return s;
      const updated = { ...s, progress, status };
      if (status === 'done' && s.status !== 'done') {
        updated.completedAt = new Date().toISOString();
        const project = projects.find(p => p.id === s.projectId);
        if (project) {
          setNotifications(prev => [{
            id: uuidv4(), projectId: project.id, projectName: project.name,
            stageId: s.id, stageName: s.name,
            message: `✅ Этап «${s.name}» отмечен как выполненный (${progress}%)`,
            type: 'completed', read: false, createdAt: new Date().toISOString()
          }, ...prev]);
        }
      }
      return updated;
    }));
  }, [projects]);

  const handleSaveBrigade = useCallback((brigade: Brigade) => {
    setBrigades(prev => {
      const exists = prev.find(b => b.id === brigade.id);
      return exists ? prev.map(b => b.id === brigade.id ? brigade : b) : [...prev, brigade];
    });
  }, []);

  const handleDeleteBrigade = useCallback((id: string) => {
    if (confirm('Удалить бригаду?')) {
      setBrigades(prev => prev.filter(b => b.id !== id));
      setForemen(prev => prev.filter(f => f.crewId !== id));
    }
  }, []);

  const handleSaveForeman = useCallback((foreman: Foreman) => {
    setForemen(prev => {
      const exists = prev.find(f => f.id === foreman.id);
      return exists ? prev.map(f => f.id === foreman.id ? foreman : f) : [...prev, foreman];
    });
  }, []);

  const handleDeleteForeman = useCallback((id: string) => {
    setForemen(prev => prev.filter(f => f.id !== id));
  }, []);

  const handleMarkRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const handleMarkAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const handleDeleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const navItems = [
    { id: 'dashboard' as ViewMode, label: 'Панель', icon: '📊' },
    { id: 'gantt' as ViewMode, label: 'Диаграмма Ганта', icon: '📅' },
    { id: 'projects' as ViewMode, label: 'Объекты', icon: '🏗️' },
    { id: 'brigades' as ViewMode, label: 'Бригады', icon: '👷' },
    { id: 'notifications' as ViewMode, label: 'Уведомления', icon: '🔔', badge: unreadCount },
  ];

  if (!loaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">🏗️</div>
          <p className="text-gray-500">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-300 lg:translate-x-0 lg:static lg:shadow-none lg:border-r lg:border-gray-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white text-xl">🏗️</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-lg">СтройКонтроль</h1>
              <p className="text-xs text-gray-400">Управление проектами</p>
            </div>
          </div>
        </div>
        
        <nav className="p-4 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setView(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition ${
                view === item.id 
                  ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="flex-1 text-sm">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">{item.badge}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
            <p className="text-xs font-semibold text-blue-800">💡 Подсказка</p>
            <p className="text-xs text-blue-600 mt-1">Отмечайте этапы как выполненные — система автоматически уведомит о прогрессе</p>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Main */}
      <main className="flex-1 min-w-0">
        <header className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          
          <div className="flex items-center gap-3 ml-auto">
            <button onClick={() => setView('notifications')} className="relative p-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">{unreadCount}</span>
              )}
            </button>
            
            <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">АД</span>
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">Админ</span>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8 max-w-[1600px] mx-auto">
          {view === 'dashboard' && <Dashboard projects={projects} brigades={brigades} foremen={foremen} stages={stages} notifications={notifications} />}
          {view === 'gantt' && <GanttChart projects={projects} brigades={brigades} foremen={foremen} stages={stages} onUpdateStageProgress={handleUpdateStageProgress} />}
          {view === 'projects' && <ProjectManager projects={projects} brigades={brigades} foremen={foremen} stages={stages} onSaveProject={handleSaveProject} onDeleteProject={handleDeleteProject} onAddStage={handleAddStage} onDeleteStage={handleDeleteStage} onUpdateStage={handleUpdateStage} />}
          {view === 'brigades' && <BrigadeManager brigades={brigades} foremen={foremen} stages={stages} onSaveBrigade={handleSaveBrigade} onDeleteBrigade={handleDeleteBrigade} onSaveForeman={handleSaveForeman} onDeleteForeman={handleDeleteForeman} />}
          {view === 'notifications' && <Notifications notifications={notifications} onMarkRead={handleMarkRead} onMarkAllRead={handleMarkAllRead} onDeleteNotification={handleDeleteNotification} />}
        </div>
      </main>
    </div>
  );
}

export default App;
