import { useState, useEffect } from 'react';
import { Project, Brigade, Foreman, Stage, Notification } from '../types';
import { projects as projectsDB, crews as crewsDB, foremen as foremenDB, stages as stagesDB, notifications as notificationsDB, isSeeded, setSeeded, seedAll, writeAll, sessions, admins } from '../schema';
import { Errors, handleError } from '../errors';
import { getSeedData } from '../utils/seed';
import GanttChart from '../components/GanttChart';
import Dashboard from '../components/Dashboard';

export default function Home() {
  const [view, setView] = useState<'dashboard' | 'gantt'>('dashboard');
  const [projects, setProjects] = useState<Project[]>([]);
  const [brigades, setBrigades] = useState<Brigade[]>([]);
  const [foremen, setForemen] = useState<Foreman[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!isSeeded()) {
      const seed = getSeedData();
      seedAll(seed);
      setSeeded();
      setProjects(seed.projects);
      setBrigades(seed.brigades);
      setForemen(seed.foremen);
      setStages(seed.stages);
    } else {
      setProjects(projectsDB.select());
      setBrigades(crewsDB.select());
      setForemen(foremenDB.select());
      setStages(stagesDB.select());
    }
    setNotifications(notificationsDB.select());
    setLoaded(true);
  }, []);

  if (!loaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">🏗️</div>
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">СтройКонтроль</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setView('dashboard')}
              className={`px-4 py-2 rounded-md transition ${view === 'dashboard' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
            >
              Панель
            </button>
            <button
              onClick={() => setView('gantt')}
              className={`px-4 py-2 rounded-md transition ${view === 'gantt' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
            >
              Диаграмма Ганта
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {view === 'dashboard' ? (
          <Dashboard projects={projects} brigades={brigades} foremen={foremen} stages={stages} notifications={notifications} />
        ) : (
          <GanttChart
            projects={projects}
            stages={stages}
            crews={brigades}
            foremen={foremen}
          />
        )}
      </main>
    </div>
  );
}
