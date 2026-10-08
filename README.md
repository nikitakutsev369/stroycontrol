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
stroycontrol/
├── src/                    # Frontend (React)
│   ├── components/         # React компоненты
│   │   ├── Dashboard.tsx   # Панель управления
│   │   ├── GanttChart.tsx  # Диаграмма Ганта
│   │   ├── ProjectManager.tsx
│   │   ├── BrigadeManager.tsx
│   │   ├── Notifications.tsx
│   │   └── Login.tsx
│   ├── schema.ts           # CRUD операции
│   ├── types.ts            # TypeScript типы
│   ├── errors.ts           # Система ошибок
│   ├── config.ts           # Конфигурация
│   ├── api.ts              # API клиент
│   ├── http-client.ts      # HTTP клиент
│   ├── cookies.ts          # Работа с cookies
│   ├── index.ts            # Реэкспорт
│   ├── App.tsx             # Главный компонент
│   └── utils/seed.ts       # Демо-данные
│
├── backend/                # Backend (Hono + Drizzle)
│   ├── src/
│   │   ├── index.ts        # Главный файл сервера
│   │   ├── env.ts          # Переменные окружения
│   │   ├── errors.ts       # Система ошибок
│   │   ├── constants.ts    # Константы (Session)
│   │   ├── auth/
│   │   │   ├── auth.ts     # OAuth flow + authenticateRequest
│   │   │   ├── session.ts  # JWT sign/verify (jose)
│   │   │   ├── platform.ts # Kimi API client
│   │   │   └── types.ts    # TokenResponse, UserProfile
│   │   ├── db/
│   │   │   ├── index.ts    # Подключение к БД
│   │   │   └── schema.ts   # Drizzle ORM схема
│   │   ├── routes/         # API endpoints
│   │   ├── queries/        # DB queries
│   │   └── middleware/     # Middleware (auth, serve-static)
│   ├── package.json
│   └── README.md
│
├── package.json            # Frontend зависимости
├── vite.config.js          # Vite конфигурация
└── README.md               # Этот файл
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

### Frontend (Development)

```bash
# Установка зависимостей
npm install

# Разработка (порт 5173)
npm run dev

# Сборка в dist/public
npm run build
```

### Backend (Development)

```bash
cd backend

# Установка зависимостей
npm install

# Настройка БД
cp .env.example .env
# Заполните DATABASE_URL

# Применение схемы
npm run db:push

# Запуск сервера (порт 3000)
npm run dev
```

### Production

```bash
# Frontend
npm run build  # Сборка в dist/public

# Backend
cd backend
npm run build
npm start  # Запуск на порту 3000
```

Frontend автоматически раздаётся backend через `serveStaticFiles`.

## 📝 Следующие шаги

### Готово к реализации:
1. ✅ **Система авторизации** — админ + прорабы с PIN + OAuth через Kimi
2. ✅ **Сессии** — localStorage (demo) + JWT cookies (production)
3. ✅ **CRUD операции** — централизованы в schema.ts
4. ✅ **API клиент** — готов к подключению backend (HttpClient с таймаутами)
5. ✅ **Конфигурация** — переменные окружения + feature flags
6. ✅ **Backend** — Hono + Drizzle ORM + MySQL
7. ✅ **OAuth** — полная интеграция с Kimi Open Platform (jose + JWKS)

### Для production:
1. **Backend сервер** (Hono/Express):
   - Реализовать endpoints из `api.ts`
   - Подключить MySQL через Drizzle ORM
   - Настроить OAuth Kimi для авторизации
   - Установить httpOnly cookies для сессий

2. **WebSocket** — для real-time обновлений этапов

3. **Email/SMS уведомления** — отправка писем прорабам

4. **Мобильное приложение** — React Native для прорабов

5. **Отчёты** — экспорт в PDF/Excel

6. **Фотоотчёты** — загрузка фото с объектов

### Архитектура backend:
```
backend/
├── src/
│   ├── index.ts          # Hono app
│   ├── db/
│   │   └── schema.ts     # Drizzle ORM схема (уже есть)
│   ├── routes/
│   │   ├── auth.ts       # /auth/login, /auth/logout, /auth/me
│   │   ├── projects.ts   # CRUD projects
│   │   ├── brigades.ts   # CRUD brigades
│   │   ├── foremen.ts    # CRUD foremen
│   │   ├── stages.ts     # CRUD stages
│   │   └── notifications.ts
│   ├── middleware/
│   │   └── auth.ts       # Проверка сессии
│   └── utils/
│       ├── session.ts    # Управление сессиями
│       └── cookie.ts     # Cookie options (уже есть)
├── package.json
└── .env
```

### Использование HttpClient:

```typescript
import { HttpClient } from './http-client';

const client = new HttpClient('https://api.example.com');

// GET запрос
const projects = await client.get<Project[]>('/projects');

// POST запрос
const newProject = await client.post<Project>('/projects', {
  name: 'ЖК Солнечный',
  address: 'ул. Ленина, 1'
});

// PATCH запрос
await client.patch(`/projects/${id}`, { status: 'completed' });

// DELETE запрос
await client.delete(`/projects/${id}`);

// С query параметрами
const stages = await client.get<Stage[]>('/stages', { projectId: '123' });

// С кастомным таймаутом
const data = await client.get('/slow-endpoint', undefined, { timeout: 60000 });
```

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
- Сессии в localStorage
- Не требует backend сервера
- Подходит для разработки и демонстрации

**API Mode** (`VITE_ENABLE_DEMO_MODE=false`):
- Данные загружаются через API
- Сессии через httpOnly cookies (`kimi_sid`)
- Требуется backend сервер
- Используется в production

### Интеграция с backend

Frontend готов к работе с backend, который устанавливает httpOnly cookies:

```typescript
// Backend (Hono) устанавливает cookie:
setCookie(c, 'kimi_sid', sessionId, {
  httpOnly: true,
  secure: !isLocalhost,
  sameSite: isLocalhost ? 'Lax' : 'None',
  path: '/',
  maxAge: 365 * 24 * 60 * 60,
});

// Frontend читает сессию:
const session = sessions.get(); // Автоматически определяет режим
```

**Cookie настройки:**
- `httpOnly: true` — защита от XSS (устанавливается backend)
- `secure: true` — только HTTPS (кроме localhost)
- `sameSite: 'None'` — для cross-domain (production)
- `sameSite: 'Lax'` — для localhost
- `maxAge: 1 год` — срок действия сессии

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
