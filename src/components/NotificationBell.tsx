import { Bell } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { notifications as notificationsDB } from "@/schema";
import { useState, useEffect } from "react";

const TYPE_LABEL: Record<string, string> = {
  assigned: "Назначение",
  starts_soon: "Скоро начало",
  overdue: "Просрочка",
  completed: "Выполнено",
  updated: "Обновление",
};

export default function NotificationBell() {
  const [all, setAll] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const load = () => {
      const notifs = notificationsDB.select();
      const sorted = [...notifs].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setAll(sorted);
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const unread = all.filter((n) => !n.read);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && unread.length > 0) {
      unread.forEach((n) => notificationsDB.markRead(n.id));
      setAll((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unread.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] rounded-full min-w-4 h-4 px-1 flex items-center justify-center">
              {unread.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="px-4 py-3 border-b border-border font-semibold text-sm">Уведомления</div>
        <ScrollArea className="max-h-96">
          {all.length === 0 && (
            <div className="p-4 text-sm text-muted-foreground">Пока уведомлений нет</div>
          )}
          {all.map((n) => (
            <div
              key={n.id}
              className={`px-4 py-3 border-b border-border last:border-0 ${!n.read ? "bg-accent/60" : ""}`}
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  {TYPE_LABEL[n.type] ?? n.type}
                </span>
                <span className="text-[10px] text-muted-foreground ml-auto">
                  {new Date(n.createdAt).toLocaleString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <div className="text-sm font-medium mt-0.5">{n.title}</div>
              {n.message && <div className="text-xs text-muted-foreground mt-0.5">{n.message}</div>}
            </div>
          ))}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
