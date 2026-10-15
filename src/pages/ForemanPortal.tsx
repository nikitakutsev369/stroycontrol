import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { HardHat, LogOut, Bell, CheckCircle2, Play, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { humanDayFull, isOverdue, STATUS_LABEL, stageColor, todayStr } from "@/lib/dates";
import { foremen as foremenDB, stages as stagesDB, notifications as notificationsDB } from "@/schema";
import type { Foreman, Stage, Notification } from "@/types";

type Session = { id: string; name: string; pin: string };

const SESSION_KEY = "foreman-session";

function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export default function ForemanPortal() {
  const [session, setSession] = useState<Session | null>(loadSession);

  if (!session) return <ForemanLogin onLogin={setSession} />;
  return <ForemanDashboard session={session} onLogout={() => { localStorage.removeItem(SESSION_KEY); setSession(null); }} />;
}

// ---------- Вход ----------

function ForemanLogin({ onLogin }: { onLogin: (s: Session) => void }) {
  const directory = foremenDB.select();
  const [foremanId, setForemanId] = useState<string>("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    const foreman = foremenDB.findById(foremanId);
    if (foreman && foreman.pin === pin) {
      const s = { id: foreman.id, name: foreman.name, pin };
      localStorage.setItem(SESSION_KEY, JSON.stringify(s));
      onLogin(s);
    } else {
      setError("Неверный PIN-код. Проверьте и попробуйте снова.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
            <HardHat className="h-5 w-5 text-destructive" />
          </div>
          <CardTitle>Кабинет прораба</CardTitle>
          <p className="text-sm text-muted-foreground">Выберите своё имя и введите PIN-код</p>
        </CardHeader>
        <CardContent className="grid gap-3">
          {directory.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center">
              В системе пока нет ни одного прораба. Попросите руководителя добавить вас в разделе «Прорабы».
            </p>
          ) : (
            <>
              <div className="grid gap-1.5">
                <Label>Имя</Label>
                <Select value={foremanId} onValueChange={setForemanId}>
                  <SelectTrigger><SelectValue placeholder="Выберите себя из списка" /></SelectTrigger>
                  <SelectContent>
                    {directory.map((f) => (
                      <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>PIN-код</Label>
                <Input
                  type="password"
                  inputMode="numeric"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && foremanId && pin && handleLogin()}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button
                className="w-full"
                disabled={!foremanId || pin.length < 4}
                onClick={handleLogin}
              >
                Войти
              </Button>
            </>
          )}
          <Link to="/" className="text-xs text-center text-muted-foreground underline mt-2">
            Вход для руководителя
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------- Кабинет ----------

type StageWithProject = Stage & {
  projectName: string;
  projectAddress?: string;
  crewName?: string;
};

function ForemanDashboard({ session, onLogout }: { session: Session; onLogout: () => void }) {
  const [showNotif, setShowNotif] = useState(false);
  const [doneDialog, setDoneDialog] = useState<{ stageId: string; status: "in_progress" | "done" } | null>(null);
  const [comment, setComment] = useState("");

  const allStages = stagesDB.selectByForeman(session.id);
  const notifications = notificationsDB.selectByForeman(session.id);
  const unread = notifications.filter((n) => !n.read);

  // Автоматически отмечаем уведомления как прочитанные при открытии
  useEffect(() => {
    if (showNotif && unread.length > 0) {
      unread.forEach((n) => notificationsDB.markRead(n.id));
    }
  }, [showNotif]);

  // Обогащаем этапы информацией о проекте и бригаде
  const stages: StageWithProject[] = allStages.map((s) => {
    const projects = JSON.parse(localStorage.getItem("sk_projects") || "[]");
    const crews = JSON.parse(localStorage.getItem("sk_crews") || "[]");
    const project = projects.find((p: any) => p.id === s.projectId);
    const crew = crews.find((c: any) => c.id === s.crewId);
    return {
      ...s,
      projectName: project?.name || "Неизвестный проект",
      projectAddress: project?.address,
      crewName: crew?.name,
    };
  });

  const active = stages.filter((s) => s.status !== "done");
  const done = stages.filter((s) => s.status === "done");

  const handleUpdateStatus = () => {
    if (!doneDialog) return;
    stagesDB.update(doneDialog.stageId, {
      status: doneDialog.status,
      progress: doneDialog.status === "done" ? 100 : undefined,
      comment: comment || undefined,
      completedAt: doneDialog.status === "done" ? new Date().toISOString() : undefined,
    });
    setDoneDialog(null);
    setComment("");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <HardHat className="h-5 w-5 text-destructive" />
          <h1 className="font-bold">Мои этапы</h1>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="icon" className="relative" onClick={() => setShowNotif(true)}>
              <Bell className="h-4 w-4" />
              {unread.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] rounded-full min-w-4 h-4 px-1 flex items-center justify-center">
                  {unread.length}
                </span>
              )}
            </Button>
            <span className="text-sm text-muted-foreground hidden sm:inline">{session.name}</span>
            <Button variant="outline" size="icon" onClick={onLogout}><LogOut className="h-4 w-4" /></Button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {stages.length === 0 && (
          <div className="border border-dashed border-border rounded-lg p-8 text-center text-sm text-muted-foreground bg-card">
            Вам пока не назначено ни одного этапа. Как только руководитель назначит этап — здесь появится уведомление.
          </div>
        )}

        {active.length > 0 && (
          <section className="space-y-3">
            <h2 className="font-semibold">Текущие и предстоящие ({active.length})</h2>
            {active.map((s) => {
              const overdue = isOverdue(s.endDate, s.status);
              const startsToday = s.startDate === todayStr() && s.status === "planned";
              return (
                <Card key={s.id} className={overdue ? "border-destructive" : ""}>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold">{s.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" /> {s.projectName}{s.projectAddress ? ` — ${s.projectAddress}` : ""}
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        style={{ borderColor: stageColor(s.status, s.endDate), color: stageColor(s.status, s.endDate) }}
                      >
                        {overdue ? "Просрочен" : STATUS_LABEL[s.status]}
                      </Badge>
                    </div>
                    <div className="text-sm">
                      {humanDayFull(s.startDate)} — {humanDayFull(s.endDate)}
                      {s.crewName && <span className="text-muted-foreground"> · Бригада: {s.crewName}</span>}
                    </div>
                    {startsToday && (
                      <div className="text-sm font-medium text-amber-700">Этап начинается сегодня!</div>
                    )}
                    {overdue && (
                      <div className="text-sm font-medium text-destructive">Срок сдачи прошёл — отметьте выполнение или свяжитесь с руководителем.</div>
                    )}
                    {s.comment && <div className="text-sm text-muted-foreground">Комментарий: {s.comment}</div>}
                    <div className="flex gap-2 pt-1">
                      {s.status === "planned" && (
                        <Button size="sm" variant="outline" onClick={() => { setComment(""); setDoneDialog({ stageId: s.id, status: "in_progress" }); }}>
                          <Play className="h-4 w-4 mr-1" /> Начать работу
                        </Button>
                      )}
                      <Button size="sm" onClick={() => { setComment(""); setDoneDialog({ stageId: s.id, status: "done" }); }}>
                        <CheckCircle2 className="h-4 w-4 mr-1" /> Выполнено
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </section>
        )}

        {done.length > 0 && (
          <section className="space-y-3">
            <h2 className="font-semibold text-muted-foreground">Выполненные ({done.length})</h2>
            {done.map((s) => (
              <Card key={s.id} className="opacity-70">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="font-medium line-through">{s.name}</div>
                      <div className="text-sm text-muted-foreground">{s.projectName} · {humanDayFull(s.startDate)} — {humanDayFull(s.endDate)}</div>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-green-700 shrink-0" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>
        )}
      </main>

      {/* Панель уведомлений */}
      <Dialog open={showNotif} onOpenChange={setShowNotif}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Уведомления</DialogTitle></DialogHeader>
          <div className="max-h-96 overflow-y-auto -mx-2 px-2">
            {notifications.length === 0 && <p className="text-sm text-muted-foreground">Уведомлений нет</p>}
            {notifications.map((n) => (
              <div key={n.id} className={`py-3 border-b border-border last:border-0 ${!n.read ? "font-medium" : ""}`}>
                <div className="text-sm">{n.title}</div>
                {n.message && <div className="text-xs text-muted-foreground mt-0.5">{n.message}</div>}
                <div className="text-[10px] text-muted-foreground mt-1">
                  {new Date(n.createdAt).toLocaleString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Диалог подтверждения */}
      <Dialog open={!!doneDialog} onOpenChange={(o) => !o && setDoneDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{doneDialog?.status === "done" ? "Отметить этап выполненным" : "Начать работу над этапом"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-1.5">
            <Label>Комментарий (необязательно)</Label>
            <Textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2} placeholder="Например: нужны материалы, задержка поставки…" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDoneDialog(null)}>Отмена</Button>
            <Button onClick={handleUpdateStatus}>
              Подтвердить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
