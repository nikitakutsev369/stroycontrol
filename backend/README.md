# СтройКонтроль Backend

Backend сервер для системы управления строительными проектами.

## 🚀 Технологии

- **Hono** — быстрый веб-фреймворк
- **Drizzle ORM** — типобезопасная ORM для MySQL
- **MySQL** — база данных
- **TypeScript** — типизация

## 📦 Установка

```bash
cd backend
npm install
```

## ⚙️ Конфигурация

Создайте файл `.env` на основе `.env.example`:

```bash
cp .env.example .env
```

Заполните переменные:
- `APP_ID`, `APP_SECRET` — OAuth Kimi
- `DATABASE_URL` — подключение к MySQL
- `KIMI_AUTH_URL`, `KIMI_OPEN_URL` — OAuth endpoints

## 🗄️ База данных

Создайте базу данных:

```sql
CREATE DATABASE stroycontrol;
```

Примените схему:

```bash
npm run db:push
```

## 🏃 Запуск

### Development

```bash
npm run dev
```

Сервер запустится на `http://localhost:3000`

### Production

```bash
npm run build
npm start
```

## 📡 API Endpoints

### Auth
- `POST /api/auth/login` — вход (admin/foreman)
- `POST /api/auth/logout` — выход
- `GET /api/auth/me` — текущий пользователь

### Projects
- `GET /api/projects` — список проектов
- `GET /api/projects/:id` — проект по ID
- `POST /api/projects` — создать проект
- `PATCH /api/projects/:id` — обновить проект
- `DELETE /api/projects/:id` — удалить проект

### Brigades
- `GET /api/brigades` — список бригад
- `POST /api/brigades` — создать бригаду
- `PATCH /api/brigades/:id` — обновить бригаду
- `DELETE /api/brigades/:id` — удалить бригаду

### Foremen
- `GET /api/foremen` — список прорабов
- `POST /api/foremen` — создать прораба
- `PATCH /api/foremen/:id` — обновить прораба
- `DELETE /api/foremen/:id` — удалить прораба

### Stages
- `GET /api/stages` — список этапов (опционально `?projectId=X`)
- `POST /api/stages` — создать этап
- `PATCH /api/stages/:id` — обновить этап
- `DELETE /api/stages/:id` — удалить этап

### Notifications
- `GET /api/notifications` — список уведомлений
- `POST /api/notifications/:id/read` — отметить прочитанным
- `POST /api/notifications/read-all` — отметить все прочитанными
- `DELETE /api/notifications/:id` — удалить уведомление

## 🔐 Авторизация

Сессии хранятся в httpOnly cookies (`kimi_sid`):
- `httpOnly: true` — защита от XSS
- `secure: true` — только HTTPS (кроме localhost)
- `sameSite: 'None'` — для cross-domain
- `maxAge: 1 год`

## 📁 Структура

```
backend/
├── src/
│   ├── index.ts              # Главный файл сервера
│   ├── env.ts                # Переменные окружения
│   ├── errors.ts             # Система ошибок
│   ├── db/
│   │   ├── index.ts          # Подключение к БД
│   │   └── schema.ts         # Схема Drizzle ORM
│   ├── routes/
│   │   ├── auth.ts           # Авторизация
│   │   ├── projects.ts       # Проекты
│   │   ├── brigades.ts       # Бригады
│   │   ├── foremen.ts        # Прорабы
│   │   ├── stages.ts         # Этапы
│   │   └── notifications.ts  # Уведомления
│   └── middleware/
│       └── serve-static.ts   # Раздача frontend
├── package.json
├── tsconfig.json
├── drizzle.config.ts
└── .env.example
```

## 🔗 Интеграция с Frontend

Frontend автоматически переключается между режимами:
- **Demo mode** — localStorage (без backend)
- **API mode** — запросы к этому серверу

Для включения API mode установите:
```bash
VITE_ENABLE_DEMO_MODE=false
VITE_API_BASE_URL=http://localhost:3000/api
```

## 📝 Следующие шаги

1. **OAuth Kimi** — интеграция авторизации через Kimi
2. **WebSocket** — real-time обновления
3. **Email уведомления** — отправка писем прорабам
4. **Логирование** — Winston/Pino
5. **Rate limiting** — защита от DDoS
6. **Валидация** — Zod для входных данных
