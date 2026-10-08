export function parseDay(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(dateStr: string, days: number): string {
  const d = parseDay(dateStr);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

export function diffDays(a: string, b: string): number {
  const da = parseDay(a);
  const db = parseDay(b);
  return Math.round((db.getTime() - da.getTime()) / (1000 * 60 * 60 * 24));
}

export function todayStr(): string {
  return formatDate(new Date());
}

export function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function stageColor(status: string, endDate: string): string {
  if (status === "done") return "#15803d";
  if (isOverdue(endDate, status)) return "#c42121";
  if (status === "in_progress") return "#d97706";
  return "#94a3b8";
}

export function isOverdue(endDate: string, status: string): boolean {
  if (status === "done") return false;
  return endDate < todayStr();
}

export const STATUS_LABEL: Record<string, string> = {
  planned: "Запланирован",
  in_progress: "В работе",
  done: "Выполнен",
};
