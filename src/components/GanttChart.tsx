import { useMemo, useRef, useEffect } from "react";
import {
  parseDay,
  addDays,
  diffDays,
  todayStr,
  stageColor,
  isOverdue,
  STATUS_LABEL,
} from "@/lib/dates";

const DAY_W = 30;
const ROW_H = 34;

type Project = {
  id: string;
  name: string;
};

type Stage = {
  id: string;
  projectId: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  progress: number;
  crewId?: string | null;
  foremanId?: string | null;
};

type Crew = {
  id: string;
  name: string;
};

type Foreman = {
  id: string;
  name: string;
};

type Props = {
  projects: Project[];
  stages: Stage[];
  crews: Crew[];
  foremen: Foreman[];
  onStageClick?: (stage: Stage) => void;
};

export default function GanttChart({ projects, stages, crews, foremen, onStageClick }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const { start, totalDays } = useMemo(() => {
    const today = todayStr();
    if (stages.length === 0) {
      return { start: addDays(today, -7), totalDays: 45 };
    }
    let min = stages[0].startDate;
    let max = stages[0].endDate;
    for (const s of stages) {
      if (s.startDate < min) min = s.startDate;
      if (s.endDate > max) max = s.endDate;
    }
    const start = addDays(min < today ? min : today, -3);
    const end = addDays(max > today ? max : today, 7);
    return { start, totalDays: diffDays(start, end) + 1 };
  }, [stages]);

  const days = useMemo(
    () => Array.from({ length: totalDays }, (_, i) => addDays(start, i)),
    [start, totalDays]
  );

  // центрирование на сегодня при загрузке
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const offset = diffDays(start, todayStr()) * DAY_W;
    el.scrollLeft = Math.max(0, offset - el.clientWidth / 3);
  }, [start]);

  const crewName = (id: string | null | undefined) => crews.find((c) => c.id === id)?.name ?? null;
  const foremanName = (id: string | null | undefined) => foremen.find((f) => f.id === id)?.name ?? null;

  const today = todayStr();
  const todayX = diffDays(start, today) * DAY_W;

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      <div className="flex">
        {/* Левая колонка: названия */}
        <div className="w-[280px] shrink-0 border-r border-border">
          <div className="h-[52px] border-b border-border flex items-end px-3 pb-2 text-xs font-medium text-muted-foreground">
            Объект / этап
          </div>
          {projects.map((p) => {
            const pStages = stages.filter((s) => s.projectId === p.id);
            return (
              <div key={p.id}>
                <div
                  className="px-3 flex items-center font-semibold text-sm bg-secondary/60 border-b border-border truncate"
                  style={{ height: ROW_H }}
                  title={p.name}
                >
                  {p.name}
                </div>
                {pStages.map((s) => (
                  <div
                    key={s.id}
                    className="pl-6 pr-3 flex items-center text-sm border-b border-border truncate cursor-pointer hover:bg-accent"
                    style={{ height: ROW_H }}
                    onClick={() => onStageClick?.(s)}
                    title={s.name}
                  >
                    <span
                      className="inline-block w-2 h-2 rounded-full mr-2 shrink-0"
                      style={{ background: stageColor(s.status, s.endDate) }}
                    />
                    <span className="truncate">{s.name}</span>
                  </div>
                ))}
              </div>
            );
          })}
          {projects.length === 0 && (
            <div className="p-4 text-sm text-muted-foreground">Нет объектов</div>
          )}
        </div>

        {/* Таймлайн */}
        <div ref={scrollRef} className="overflow-x-auto flex-1">
          <div style={{ width: totalDays * DAY_W }}>
            {/* Заголовок дат */}
            <div className="h-[52px] border-b border-border relative">
              {days.map((d, i) => {
                const date = parseDay(d);
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                const isFirst = date.getDate() === 1 || i === 0;
                return (
                  <div
                    key={d}
                    className={`absolute top-0 h-full border-l border-border/60 text-center ${isWeekend ? "bg-secondary/40" : ""}`}
                    style={{ left: i * DAY_W, width: DAY_W }}
                  >
                    <div className="text-[10px] text-muted-foreground pt-1 leading-tight">
                      {isFirst
                        ? date.toLocaleDateString("ru-RU", { month: "short" })
                        : ""}
                    </div>
                    <div className={`text-[11px] leading-tight ${d === today ? "font-bold text-destructive" : ""}`}>
                      {date.getDate()}
                    </div>
                  </div>
                );
              })}
              {/* линия сегодня */}
              <div
                className="absolute top-0 bottom-0 w-px bg-destructive z-10"
                style={{ left: todayX + DAY_W / 2 }}
              />
            </div>

            {/* Строки */}
            {projects.map((p) => {
              const pStages = stages.filter((s) => s.projectId === p.id);
              return (
                <div key={p.id}>
                  <div
                    className="relative border-b border-border bg-secondary/30"
                    style={{ height: ROW_H }}
                  >
                    {/* общий диапазон проекта */}
                    {pStages.length > 0 && (
                      <ProjectRange stages={pStages} start={start} />
                    )}
                  </div>
                  {pStages.map((s) => {
                    const left = diffDays(start, s.startDate) * DAY_W;
                    const width = Math.max(DAY_W, (diffDays(s.startDate, s.endDate) + 1) * DAY_W);
                    const color = stageColor(s.status, s.endDate);
                    return (
                      <div
                        key={s.id}
                        className="relative border-b border-border"
                        style={{ height: ROW_H }}
                      >
                        {/* фон выходных */}
                        {days.map((d, i) => {
                          const date = parseDay(d);
                          return date.getDay() === 0 || date.getDay() === 6 ? (
                            <div
                              key={d}
                              className="absolute top-0 h-full bg-secondary/30"
                              style={{ left: i * DAY_W, width: DAY_W }}
                            />
                          ) : null;
                        })}
                        <div
                          className="absolute top-[7px] h-5 rounded cursor-pointer group"
                          style={{ left, width, background: color + "33", border: `1px solid ${color}` }}
                          onClick={() => onStageClick?.(s)}
                          title={`${s.name}\n${s.startDate} — ${s.endDate}\n${STATUS_LABEL[s.status]}${isOverdue(s.endDate, s.status) ? " (просрочен)" : ""}${crewName(s.crewId) ? `\nБригада: ${crewName(s.crewId)}` : ""}${foremanName(s.foremanId) ? `\nПрораб: ${foremanName(s.foremanId)}` : ""}`}
                        >
                          {/* прогресс */}
                          <div
                            className="h-full rounded-l"
                            style={{ width: `${s.status === "done" ? 100 : s.progress}%`, background: color + "66" }}
                          />
                          {width > 110 && (
                            <span className="absolute inset-0 flex items-center px-2 text-[11px] truncate" style={{ color }}>
                              {s.name}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Легенда */}
      <div className="flex flex-wrap gap-4 px-3 py-2 border-t border-border text-xs text-muted-foreground">
        <Legend color="#94a3b8" label="Запланирован" />
        <Legend color="#d97706" label="В работе" />
        <Legend color="#15803d" label="Выполнен" />
        <Legend color="#c42121" label="Просрочен" />
        <span className="flex items-center gap-1">
          <span className="inline-block w-px h-3 bg-destructive" /> Сегодня
        </span>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className="inline-block w-3 h-3 rounded-sm" style={{ background: color }} /> {label}
    </span>
  );
}

function ProjectRange({ stages, start }: { stages: Stage[]; start: string }) {
  let min = stages[0].startDate;
  let max = stages[0].endDate;
  for (const s of stages) {
    if (s.startDate < min) min = s.startDate;
    if (s.endDate > max) max = s.endDate;
  }
  const left = diffDays(start, min) * DAY_W;
  const width = (diffDays(min, max) + 1) * DAY_W;
  return (
    <div
      className="absolute top-[13px] h-2 rounded-full bg-primary/70"
      style={{ left, width }}
    />
  );
}
