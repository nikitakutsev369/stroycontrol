# СтройКонтроль 🏗️

Система управления строительными проектами с диаграммой Ганта, системой уведомлений и ролевой авторизацией.

## 🚀 Возможности

- **Диаграмма Ганта** — визуализация этапов строительства с зависимостями
- **Управление проектами** — объекты строительства, этапы работ, бригады
- **Система уведомлений** — автоматические напоминания о сроках
- **Ролевая модель** — администраторы и прорабы с разными правами
- **Авторизация** — вход по имени+пароль (админ) или имени+PIN (прораб)
- **Адаптивный дизайн** — работает на всех устройствах

## 📁 Структура проекта

```
src/
├── components/          # React компоненты
│   ├── Dashboard.tsx    # Панель управления
│   ├── GanttChart.tsx   # Диаграмма Ганта
│   ├── ProjectManager.tsx  # Управление проектами
│   ├── BrigadeManager.tsx  # Управление бригадами
│   ├── Notifications.tsx   # Уведомления
│   └── Login.tsx        # Страница входа
├── schema.ts            # Схема данных (CRUD операции)
├── types.ts             # TypeScript типы
├── errors.ts            # Классы ошибок и сообщения
├── index.ts             # Реэкспорт типов и утилит
├── App.tsx              # Главный компонент
└── utils/
    └── seed.ts          # Демо-данные
```

## 🔐 Авторизация

### Администратор
- **Имя:** `Админ`
- **Пароль:** `admin`
- Доступ: все разделы

### Прораб
- **Имя:** `Иван Петров`
- **PIN:** `1234`
- Доступ: Панель, Диаграмма Ганта, Уведомления

## 🏗️ Архитектура

### Схема данных (`schema.ts`)
Централизованный модуль для работы с данными (аналог Drizzle ORM):
- `projects` — проекты строительства
- `crews` — бригады
- `foremen` — прорабы (с PIN-кодами)
- `stages` — этапы работ (с зависимостями)
- `notifications` — уведомления
- `sessions` — управление сессиями
- `admins` — администраторы

### Ошибки (`errors.ts`)
Система ошибок через tagged unions (discriminated unions):
- `AppError` — базовый тип с `tag`, `status`, `message`
- `Errors.badRequest()` — 400 ошибки
- `Errors.unauthorized()` — 401 ошибки авторизации
- `Errors.forbidden()` — 403 недостаточно прав
- `Errors.notFound()` — 404 данные не найдены
- `Errors.internal()` — 500 внутренние ошибки
- `isAppError()` — проверка типа ошибки
- `handleError()` — обработка и логирование

### Типы (`types.ts`)
Полная типизация всех сущностей:
- `Project`, `Brigade`, `Foreman`, `Stage`
- `Notification`, `Session`, `User`
- `ViewMode`, `UserRole`, `StageStatus`

## 🎨 Особенности реализации

### Диаграмма Ганта
- Визуализация этапов с прогрессом
- Зависимости между этапами (`dependsOnId`)
- Маркер "сегодня"
- Цветовая индикация статусов
- Масштабирование (дни/недели)

### Уведомления
- Автоматическая генерация при просрочке
- Напоминания за 3 дня до начала
- Напоминания за 1 день до окончания
- Привязка к конкретным этапам

### Ролевая модель
- **Администратор** — полный доступ ко всем разделам
- **Прораб** — только свои задачи и уведомления
- Разграничение навигации в зависимости от роли

## 💾 Хранение данных

Сейчас данные хранятся в `localStorage` (для демонстрации).  
Для продакшена нужно заменить на реальную БД:

```typescript
// schema.ts — заменить localStorage на API
export const projects = {
  select: async () => {
    const response = await fetch('/api/projects');
    return response.json();
  },
  // ...
};
```

## 🚀 Запуск

```bash
# Установка зависимостей
npm install

# Разработка
npm run dev

# Сборка
npm run build

# Предпросмотр сборки
npm run preview
```

## 📝 Следующие шаги

1. **Подключить реальную БД** — MySQL + Drizzle ORM
2. **API сервер** — Express/Fastify для CRUD операций
3. **WebSocket** — для real-time обновлений
4. **Email уведомления** — отправка писем прорабам
5. **Мобильное приложение** — React Native для прорабов
6. **Отчёты** — экспорт в PDF/Excel
7. **Фотоотчёты** — загрузка фото с объектов

## 🛠️ Технологии

- **React 18** — UI фреймворк
- **TypeScript** — типизация
- **Tailwind CSS** — стилизация
- **date-fns** — работа с датами
- **Vite** — сборщик
- **localStorage** — временное хранилище (demo mode)

## ⚙️ Конфигурация

### Переменные окружения

Создайте файл `.env` на основе `.env.example`:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api

# App Info
VITE_APP_NAME=СтройКонтроль
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_DEMO_MODE=true
VITE_OAUTH_ENABLED=false
VITE_OAUTH_CALLBACK_URL=/auth/callback
```

### Режимы работы

**Demo Mode** (`VITE_ENABLE_DEMO_MODE=true`):
- Данные хранятся в localStorage
- Не требует backend сервера
- Подходит для разработки и демонстрации

**API Mode** (`VITE_ENABLE_DEMO_MODE=false`):
- Данные загружаются через API
- Требуется backend сервер
- Используется в production

### Backend конфигурация

Для production backend требует следующие переменные:

```bash
# OAuth (Kimi)
APP_ID=your_app_id
APP_SECRET=your_app_secret
KIMI_AUTH_URL=https://open.kimi.com/oauth
KIMI_OPEN_URL=https://open.kimi.com/api

# Database
DATABASE_URL=mysql://user:pass@localhost:3306/stroycontrol

# Owner
OWNER_UNION_ID=owner_union_id

# Environment
NODE_ENV=production
```

## 📄 Лицензия

MIT

---

**Разработано для оптимизации управления строительными проектами** 🏗️
