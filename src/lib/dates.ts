// Работа с датами в формате YYYY-MM-DD (без часовых поясов)
export function parseDay(s: string): Date {
  const [y, m, d] = s.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatDay(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayStr(): string {
  return formatDay(new Date());
}

export function addDays(s: string, n: number): string {
  const d = parseDay(s);
  d.setDate(d.getDate() + n);
  return formatDay(d);
}

export function diffDays(a: string, b: string): number {
  return Math.round((parseDay(b).getTime() - parseDay(a).getTime()) / 86400000);
}

export function humanDay(s: string): string {
  return parseDay(s).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

export function humanDayFull(s: string): string {
  return parseDay(s).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

export function isOverdue(endDate: string, status: string): boolean {
  return status !== "done" && endDate < todayStr();
}

export const STATUS_LABEL: Record<string, string> = {
  planned: "Запланирован",
  in_progress: "В работе",
  done: "Выполнен",
};

export const STATUS_COLOR: Record<string, string> = {
  planned: "#94a3b8",
  in_progress: "#d97706",
  done: "#15803d",
  overdue: "#c42121",
};

export function stageColor(status: string, endDate: string): string {
  if (isOverdue(endDate, status)) return STATUS_COLOR.overdue;
  return STATUS_COLOR[status] ?? STATUS_COLOR.planned;
}
