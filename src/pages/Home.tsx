import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { Project, Stage, Brigade, Foreman } from "@/types";
import GanttChart from "@/components/GanttChart";
import NotificationBell from "@/components/NotificationBell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, HardHat, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { humanDayFull, isOverdue, STATUS_LABEL, stageColor, todayStr } from "@/lib/dates";
import { projects as projectsDB, crews as crewsDB, foremen as foremenDB, stages as stagesDB } from "@/schema";
import { v4 as uuidv4 } from "uuid";

export default function Home() {
  const { user, isLoading, logout } = useAuth({ redirectOnUnauthenticated: true });

  const [stageDialog, setStageDialog] = useState<{ open: boolean; stage?: Stage }>({ open: false });

  const projects = projectsDB.select();
  const crews = crewsDB.select();
  const foremen = foremenDB.select();
  const stages = stagesDB.select();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Загрузка…</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-20">
        <div className="max-w-[1400px] mx-auto px-4 h-14 flex items-center gap-3">
          <HardHat className="h-5 w-5 text-destructive" />
          <h1 className="font-bold text-lg tracking-tight">СтройКонтроль</h1>
          <span className="text-xs text-muted-foreground hidden sm:inline">управление объектами и этапами</span>
          <div className="ml-auto flex items-center gap-2">
            <Link to="/foreman">
              <Button variant="ghost" size="sm">Кабинет прораба</Button>
            </Link>
            <NotificationBell />
            <span className="text-sm text-muted-foreground hidden md:inline">{user?.name}</span>
            <Button variant="outline" size="icon" onClick={logout} title="Выйти">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 py-6">
        <Tabs defaultValue="gantt">
          <TabsList>
            <TabsTrigger value="gantt">Диаграмма Ганта</TabsTrigger>
            <TabsTrigger value="stages">Этапы</TabsTrigger>
            <TabsTrigger value="projects">Объекты</TabsTrigger>
            <TabsTrigger value="crews">Бригады</TabsTrigger>
            <TabsTrigger value="foremen">Прорабы</TabsTrigger>
          </TabsList>

          <TabsContent value="gantt" className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">График работ</h2>
              <Button size="sm" onClick={() => setStageDialog({ open: true })} disabled={projects.length === 0}>
                <Plus className="h-4 w-4 mr-1" /> Добавить этап
              </Button>
            </div>
            {projects.length === 0 && (
              <EmptyHint text="Сначала добавьте объект строительства во вкладке «Объекты», затем создайте этапы работ." />
            )}
            {projects.length > 0 && (
              <GanttChart
                projects={projects.map(p => ({ id: p.id, name: p.name }))}
                stages={stages.map(s => ({
                  id: s.id,
                  projectId: s.projectId,
                  name: s.name,
                  startDate: s.startDate,
                  endDate: s.endDate,
                  status: s.status,
                  progress: s.progress,
                  crewId: s.crewId,
                  foremanId: s.foremanId,
                }))}
                crews={crews.map(c => ({ id: c.id, name: c.name }))}
                foremen={foremen.map(f => ({ id: f.id, name: f.name }))}
                onStageClick={(s) => {
                  const fullStage = stages.find(st => st.id === s.id);
                  if (fullStage) setStageDialog({ open: true, stage: fullStage });
                }}
              />
            )}
          </TabsContent>

          <TabsContent value="stages" className="mt-4">
            <StagesTab
              stages={stages}
              projects={projects}
              crews={crews}
              foremen={foremen}
              onEdit={(s) => setStageDialog({ open: true, stage: s })}
              onAdd={() => setStageDialog({ open: true })}
            />
          </TabsContent>

          <TabsContent value="projects" className="mt-4"><ProjectsTab /></TabsContent>
          <TabsContent value="crews" className="mt-4"><CrewsTab /></TabsContent>
          <TabsContent value="foremen" className="mt-4"><ForemenTab /></TabsContent>
        </Tabs>
      </main>

      <StageDialog
        open={stageDialog.open}
        stage={stageDialog.stage}
        projects={projects}
        crews={crews}
        foremen={foremen}
        stages={stages}
        onClose={() => setStageDialog({ open: false })}
      />
    </div>
  );
}

function EmptyHint({ text }: { text: string }) {
  return (
    <div className="border border-dashed border-border rounded-lg p-8 text-center text-sm text-muted-foreground bg-card">
      {text}
    </div>
  );
}

// ---------- Диалог этапа ----------

function StageDialog({
  open,
  stage,
  projects,
  crews,
  foremen,
  stages,
  onClose,
}: {
  open: boolean;
  stage?: Stage;
  projects: Project[];
  crews: Brigade[];
  foremen: Foreman[];
  stages: Stage[];
  onClose: () => void;
}) {
  const isEdit = !!stage;
  const [form, setForm] = useState(() => ({
    projectId: stage?.projectId ?? projects[0]?.id ?? "",
    name: stage?.name ?? "",
    startDate: stage?.startDate ?? todayStr(),
    endDate: stage?.endDate ?? todayStr(),
    crewId: stage?.crewId ?? null as string | null,
    foremanId: stage?.foremanId ?? null as string | null,
    dependsOnId: stage?.dependsOnId ?? null as string | null,
    status: stage?.status ?? "planned",
    progress: stage?.progress ?? 0,
    comment: stage?.comment ?? "",
  }));

  const projectStages = stages.filter((s) => s.projectId === form.projectId && s.id !== stage?.id);

  const submit = () => {
    if (!form.name.trim() || !form.projectId) return;
    const payload = {
      projectId: form.projectId,
      name: form.name.trim(),
      startDate: form.startDate,
      endDate: form.endDate < form.startDate ? form.startDate : form.endDate,
      crewId: form.crewId || undefined,
      foremanId: form.foremanId || undefined,
      dependsOnId: form.dependsOnId || undefined,
    };
    if (isEdit && stage) {
      stagesDB.update(stage.id, { ...payload, status: form.status as "planned" | "in_progress" | "done", progress: form.progress, comment: form.comment || undefined });
    } else {
      stagesDB.insert({ id: uuidv4(), ...payload, status: "planned", progress: 0, sortOrder: stages.filter((s) => s.projectId === form.projectId).length });
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Редактировать этап" : "Новый этап"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label>Объект</Label>
            <Select value={form.projectId} onValueChange={(v) => setForm({ ...form, projectId: v, dependsOnId: null })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label>Название этапа</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Например: заливка фундамента" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Начало</Label>
              <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div className="grid gap-1.5">
              <Label>Окончание</Label>
              <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Бригада</Label>
              <Select value={form.crewId ? form.crewId : "none"} onValueChange={(v) => setForm({ ...form, crewId: v === "none" ? null : v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— не назначена —</SelectItem>
                  {crews.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Прораб</Label>
              <Select value={form.foremanId ? form.foremanId : "none"} onValueChange={(v) => setForm({ ...form, foremanId: v === "none" ? null : v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— не назначен —</SelectItem>
                  {foremen.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>Зависит от этапа (начнётся после)</Label>
            <Select value={form.dependsOnId ? form.dependsOnId : "none"} onValueChange={(v) => setForm({ ...form, dependsOnId: v === "none" ? null : v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— нет зависимости —</SelectItem>
                {projectStages.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {isEdit && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label>Статус</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as typeof form.status })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">Запланирован</SelectItem>
                      <SelectItem value="in_progress">В работе</SelectItem>
                      <SelectItem value="done">Выполнен</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label>Прогресс, %</Label>
                  <Input type="number" min={0} max={100} value={form.progress} onChange={(e) => setForm({ ...form, progress: Math.max(0, Math.min(100, Number(e.target.value))) })} />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label>Комментарий</Label>
                <Textarea value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} rows={2} />
              </div>
            </>
          )}
        </div>
        <DialogFooter className="gap-2">
          {isEdit && stage && (
            <Button variant="destructive" className="mr-auto" onClick={() => { if (confirm("Удалить этап?")) { stagesDB.delete(stage.id); onClose(); } }}>
              <Trash2 className="h-4 w-4 mr-1" /> Удалить
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button onClick={submit} disabled={!form.name.trim()}>{isEdit ? "Сохранить" : "Создать"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Вкладка «Этапы» ----------

function StagesTab({
  stages,
  projects,
  crews,
  foremen,
  onEdit,
  onAdd,
}: {
  stages: Stage[];
  projects: Project[];
  crews: Brigade[];
  foremen: Foreman[];
  onEdit: (s: Stage) => void;
  onAdd: () => void;
}) {
  const pName = (id: string) => projects.find((p) => p.id === id)?.name ?? "—";
  const cName = (id: string | null | undefined) => crews.find((c) => c.id === id)?.name ?? "—";
  const fName = (id: string | null | undefined) => foremen.find((f) => f.id === id)?.name ?? "—";
  const sorted = [...stages].sort((a, b) => (a.startDate < b.startDate ? -1 : 1));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Все этапы</h2>
        <Button size="sm" onClick={onAdd} disabled={projects.length === 0}>
          <Plus className="h-4 w-4 mr-1" /> Добавить этап
        </Button>
      </div>
      {sorted.length === 0 ? (
        <EmptyHint text="Этапов пока нет. Добавьте первый этап — он сразу появится на диаграмме Ганта." />
      ) : (
        <div className="border border-border rounded-lg bg-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Этап</TableHead>
                <TableHead>Объект</TableHead>
                <TableHead>Сроки</TableHead>
                <TableHead>Бригада</TableHead>
                <TableHead>Прораб</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>{pName(s.projectId)}</TableCell>
                  <TableCell className="whitespace-nowrap text-sm">
                    {humanDayFull(s.startDate)} — {humanDayFull(s.endDate)}
                  </TableCell>
                  <TableCell>{cName(s.crewId)}</TableCell>
                  <TableCell>{fName(s.foremanId)}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      style={{ borderColor: stageColor(s.status, s.endDate), color: stageColor(s.status, s.endDate) }}
                    >
                      {isOverdue(s.endDate, s.status) ? "Просрочен" : STATUS_LABEL[s.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => onEdit(s)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// ---------- Вкладка «Объекты» ----------

function ProjectsTab() {
  const [projects, setProjects] = useState(projectsDB.select());
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState({ name: "", address: "", customer: "", description: "" });

  const refresh = () => setProjects(projectsDB.select());

  const openDialog = (p?: Project) => {
    setEditing(p ?? null);
    setForm(p ? { name: p.name, address: p.address ?? "", customer: p.customer ?? "", description: p.description ?? "" } : { name: "", address: "", customer: "", description: "" });
    setOpen(true);
  };
  const submit = () => {
    if (!form.name.trim()) return;
    const payload: any = { id: uuidv4(), name: form.name.trim() };
    if (form.address) payload.address = form.address;
    if (form.customer) payload.customer = form.customer;
    if (form.description) payload.description = form.description;
    if (editing) projectsDB.update(editing.id, payload);
    else projectsDB.insert(payload);
    setOpen(false);
    refresh();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Объекты строительства</h2>
        <Button size="sm" onClick={() => openDialog()}><Plus className="h-4 w-4 mr-1" /> Добавить объект</Button>
      </div>
      {projects.length === 0 ? (
        <EmptyHint text="Добавьте первый объект: например, «ЖК Северный, корпус 3»." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {projects.map((p) => (
            <div key={p.id} className="border border-border rounded-lg bg-card p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold">{p.name}</div>
                  {p.address && <div className="text-sm text-muted-foreground mt-0.5">{p.address}</div>}
                  {p.customer && <div className="text-sm text-muted-foreground">Заказчик: {p.customer}</div>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => openDialog(p)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => { if (confirm(`Удалить объект «${p.name}» вместе со всеми этапами?`)) { projectsDB.delete(p.id); refresh(); } }}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
              {p.description && <div className="text-sm mt-2">{p.description}</div>}
            </div>
          ))}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Редактировать объект" : "Новый объект"}</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label>Название *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid gap-1.5">
              <Label>Адрес</Label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="grid gap-1.5">
              <Label>Заказчик</Label>
              <Input value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} />
            </div>
            <div className="grid gap-1.5">
              <Label>Описание</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Отмена</Button>
            <Button onClick={submit} disabled={!form.name.trim()}>{editing ? "Сохранить" : "Создать"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------- Вкладка «Бригады» ----------

function CrewsTab() {
  const [crews, setCrews] = useState(crewsDB.select());
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Brigade | null>(null);
  const [form, setForm] = useState({ name: "", specialty: "" });

  const refresh = () => setCrews(crewsDB.select());

  const openDialog = (c?: Brigade) => {
    setEditing(c ?? null);
    setForm(c ? { name: c.name, specialty: c.specialty ?? "" } : { name: "", specialty: "" });
    setOpen(true);
  };
  const submit = () => {
    if (!form.name.trim()) return;
    const payload: any = { id: uuidv4(), name: form.name.trim() };
    if (form.specialty) payload.specialty = form.specialty;
    if (editing) crewsDB.update(editing.id, payload);
    else crewsDB.insert(payload);
    setOpen(false);
    refresh();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Бригады</h2>
        <Button size="sm" onClick={() => openDialog()}><Plus className="h-4 w-4 mr-1" /> Добавить бригаду</Button>
      </div>
      {crews.length === 0 ? (
        <EmptyHint text="Добавьте бригады: например, «Бригада №1 — монолитные работы»." />
      ) : (
        <div className="border border-border rounded-lg bg-card">
          <Table>
            <TableHeader>
              <TableRow><TableHead>Название</TableHead><TableHead>Специализация</TableHead><TableHead></TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {crews.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.specialty ?? "—"}</TableCell>
                  <TableCell className="w-24">
                    <Button variant="ghost" size="icon" onClick={() => openDialog(c)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => { if (confirm(`Удалить бригаду «${c.name}»?`)) { crewsDB.delete(c.id); refresh(); } }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Редактировать бригаду" : "Новая бригада"}</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label>Название *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid gap-1.5">
              <Label>Специализация</Label>
              <Input value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} placeholder="Отделка, электрика, монолит…" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Отмена</Button>
            <Button onClick={submit} disabled={!form.name.trim()}>{editing ? "Сохранить" : "Создать"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------- Вкладка «Прорабы» ----------

function ForemenTab() {
  const [foremen, setForemen] = useState(foremenDB.select());
  const crews = crewsDB.select();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Foreman | null>(null);
  const [form, setForm] = useState<{ name: string; phone: string; pin: string; crewId: string | null }>({ name: "", phone: "", pin: "", crewId: null });

  const refresh = () => setForemen(foremenDB.select());

  const openDialog = (f?: Foreman) => {
    setEditing(f ?? null);
    setForm(f ? { name: f.name, phone: f.phone ?? "", pin: f.pin, crewId: f.crewId ?? null } : { name: "", phone: "", pin: String(Math.floor(1000 + Math.random() * 9000)), crewId: null });
    setOpen(true);
  };
  const submit = () => {
    if (!form.name.trim() || form.pin.length < 4) return;
    const payload: any = { id: uuidv4(), name: form.name.trim(), pin: form.pin };
    if (form.phone) payload.phone = form.phone;
    if (form.crewId) payload.crewId = form.crewId;
    if (editing) foremenDB.update(editing.id, payload);
    else foremenDB.insert(payload);
    setOpen(false);
    refresh();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Прорабы</h2>
        <Button size="sm" onClick={() => openDialog()}><Plus className="h-4 w-4 mr-1" /> Добавить прораба</Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Прораб входит в <Link to="/foreman" className="underline">личный кабинет</Link> по имени и PIN-коду — аккаунт и Telegram не нужны.
      </p>
      {foremen.length === 0 ? (
        <EmptyHint text="Добавьте прорабов и сообщите им PIN-код для входа в личный кабинет." />
      ) : (
        <div className="border border-border rounded-lg bg-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow><TableHead>Имя</TableHead><TableHead>Телефон</TableHead><TableHead>Бригада</TableHead><TableHead>PIN-код</TableHead><TableHead></TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {foremen.map((f) => {
                const crew = crews.find((c) => c.id === f.crewId);
                return (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium">{f.name}</TableCell>
                    <TableCell>{f.phone ?? "—"}</TableCell>
                    <TableCell>{crew?.name ?? "—"}</TableCell>
                    <TableCell><Badge variant="secondary" className="font-mono">{f.pin}</Badge></TableCell>
                    <TableCell className="w-24">
                      <Button variant="ghost" size="icon" onClick={() => openDialog(f)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => { if (confirm(`Удалить прораба «${f.name}»?`)) { foremenDB.delete(f.id); refresh(); } }}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Редактировать прораба" : "Новый прораб"}</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label>Имя *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid gap-1.5">
              <Label>Телефон</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+7 …" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>PIN-код (4–16 символов) *</Label>
                <Input value={form.pin} onChange={(e) => setForm({ ...form, pin: e.target.value })} />
              </div>
              <div className="grid gap-1.5">
                <Label>Бригада</Label>
                <Select value={form.crewId ? form.crewId : "none"} onValueChange={(v) => setForm({ ...form, crewId: v === "none" ? null : v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— без бригады —</SelectItem>
                    {crews.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Отмена</Button>
            <Button onClick={submit} disabled={!form.name.trim() || form.pin.length < 4}>{editing ? "Сохранить" : "Создать"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
