import React from 'react';
import { Notification, NotificationType } from '../types';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface NotificationsProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDeleteNotification: (id: string) => void;
}

export default function Notifications({ notifications, onMarkRead, onMarkAllRead, onDeleteNotification }: NotificationsProps) {
  const unread = notifications.filter(n => !n.read);
  const read = notifications.filter(n => n.read);

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'starts_soon':
        return <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0"><svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>;
      case 'overdue':
        return <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0"><svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg></div>;
      case 'completed':
        return <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0"><svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>;
      case 'assigned':
        return <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center shrink-0"><svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></div>;
      case 'updated':
        return <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0"><svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg></div>;
      default:
        return <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shrink-0"><svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>;
    }
  };

  const getTypeLabel = (type: NotificationType) => {
    switch (type) {
      case 'starts_soon': return { text: 'Скоро начнётся', cls: 'bg-blue-50 text-blue-700' };
      case 'overdue': return { text: 'Просрочено', cls: 'bg-red-50 text-red-700' };
      case 'completed': return { text: 'Завершено', cls: 'bg-emerald-50 text-emerald-700' };
      case 'assigned': return { text: 'Назначено', cls: 'bg-purple-50 text-purple-700' };
      case 'updated': return { text: 'Обновлено', cls: 'bg-amber-50 text-amber-700' };
      default: return { text: 'Информация', cls: 'bg-gray-50 text-gray-700' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Уведомления</h1>
          {unread.length > 0 && <p className="text-gray-500 mt-1">{unread.length} непрочитанных</p>}
        </div>
        {unread.length > 0 && (
          <button onClick={onMarkAllRead} className="text-sm text-blue-600 hover:text-blue-700 px-4 py-2 rounded-xl hover:bg-blue-50 transition font-medium">
            Прочитать все
          </button>
        )}
      </div>

      {unread.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Новые</h2>
          {unread.map(n => {
            const tl = getTypeLabel(n.type);
            return (
              <div key={n.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 border-l-4 border-l-blue-500 hover:shadow-md transition">
                <div className="flex items-start gap-3">
                  {getIcon(n.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${tl.cls}`}>{tl.text}</span>
                      <span className="text-xs text-gray-400">{formatDistanceToNow(parseISO(n.createdAt), { addSuffix: true, locale: ru })}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-800">{n.title}</p>
                    {n.message && <p className="text-sm text-gray-600 mt-0.5">{n.message}</p>}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => onMarkRead(n.id)} className="p-2 text-gray-400 hover:text-emerald-600 transition rounded-lg hover:bg-emerald-50" title="Прочитано">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </button>
                    <button onClick={() => onDeleteNotification(n.id)} className="p-2 text-gray-400 hover:text-red-600 transition rounded-lg hover:bg-red-50" title="Удалить">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {read.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Прочитанные</h2>
          {read.map(n => {
            const tl = getTypeLabel(n.type);
            return (
              <div key={n.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 opacity-60 hover:opacity-100 transition">
                <div className="flex items-start gap-3">
                  {getIcon(n.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${tl.cls}`}>{tl.text}</span>
                      <span className="text-xs text-gray-400">{format(parseISO(n.createdAt), 'd MMM yyyy, HH:mm', { locale: ru })}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-700">{n.title}</p>
                    {n.message && <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>}
                  </div>
                  <button onClick={() => onDeleteNotification(n.id)} className="p-2 text-gray-400 hover:text-red-600 transition rounded-lg hover:bg-red-50 shrink-0" title="Удалить">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {notifications.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
          <div className="text-6xl mb-4">🔔</div>
          <p className="text-gray-500 text-lg mb-2">Нет уведомлений</p>
          <p className="text-gray-400 text-sm">Уведомления будут появляться при приближении сроков задач</p>
        </div>
      )}
    </div>
  );
}
