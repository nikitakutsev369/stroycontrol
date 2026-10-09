# Backend API - СтройКонтроль

Backend сервер на базе Hono + tRPC + Drizzle ORM для системы управления строительными проектами.

## Структура

```
api/
├── boot.ts                    # Точка входа сервера
├── router.ts                  # Корневой tRPC роутер
├── context.ts                 # Контекст tRPC
├── middleware.ts              # Middleware авторизации
├── auth-router.ts             # Роутер авторизации
├── construction-router.ts     # Основной роутер (проекты, бригады, этапы)
├── kimi/                      # Интеграция с Kimi OAuth
│   ├── auth.ts               # OAuth flow
│   ├── session.ts            # JWT токены
│   ├── platform.ts           # Kimi API клиент
│   └── types.ts              # Типы
├── lib/
│   ├── env.ts                # Переменные окружения
│   ├── cookies.ts            # Работа с cookies
│   ├── http.ts               # HTTP клиент
│   └── vite.ts               # Раздача статики
└── queries/
    ├── connection.ts         # Подключение к БД
    └── users.ts              # Работа с пользователями

db/
├── schema.ts                 # Drizzle ORM схема
└── relations.ts              # Отношения (пусто)

contracts/
├── constants.ts              # Константы (Session, Paths)
└── errors.ts                 # Система ошибок
```

## API Endpoints

### Авторизация
- `GET /api/oauth/callback` - OAuth callback от Kimi
- `POST /api/trpc/auth.me` - Получить текущего пользователя
- `POST /api/trpc/auth.logout` - Выйти из системы

### Проекты (только для админов)
- `POST /api/trpc/construction.project.list` - Список проектов
- `POST /api/trpc/construction.project.create` - Создать проект
- `POST /api/trpc/construction.project.update` - Обновить проект
- `POST /api/trpc/construction.project.remove` - Удалить проект

### Бригады (только для админов)
- `POST /api/trpc/construction.crew.list` - Список бригад
- `POST /api/trpc/construction.crew.create` - Создать бригаду
- `POST /api/trpc/construction.crew.update` - Обновить бригаду
- `POST /api/trpc/construction.crew.remove` - Удалить бригаду

### Прорабы (только для админов)
- `POST /api/trpc/construction.foreman.list` - Список прорабов
- `POST /api/trpc/construction.foreman.create` - Создать прораба
- `POST /api/trpc/construction.foreman.update` - Обновить прораба
- `POST /api/trpc/construction.foreman.remove` - Удалить прораба

### Этапы (только для админов)
- `POST /api/trpc/construction.stage.listAll` - Все этапы для диаграммы Ганта
- `POST /api/trpc/construction.stage.create` - Создать этап
- `POST /api/trpc/construction.stage.update` - Обновить этап
- `POST /api/trpc/construction.stage.remove` - Удалить этап

### Портал прораба (публичный доступ)
- `POST /api/trpc/construction.portal.directory` - Список прорабов для входа
- `POST /api/trpc/construction.portal.login` - Вход прораба по PIN
- `POST /api/trpc/construction.portal.myStages` - Мои этапы
- `POST /api/trpc/construction.portal.updateStageStatus` - Обновить статус этапа
- `POST /api/trpc/construction.portal.myNotifications` - Мои уведомления
- `POST /api/trpc/construction.portal.markRead` - Отметить уведомления прочитанными

### Уведомления (только для админов)
- `POST /api/trpc/construction.notification.list` - Список уведомлений
- `POST /api/trpc/construction.notification.listFromForemen` - Уведомления от прорабов
- `POST /api/trpc/construction.notification.markRead` - Отметить прочитанными

## Переменные окружения

Создайте файл `.env` в корне проекта:

```env
# Kimi OAuth
APP_ID=your_app_id
APP_SECRET=your_app_secret
KIMI_AUTH_URL=https://open.kimi.com
KIMI_OPEN_URL=https://api.kimi.com

# База данных
DATABASE_URL=mysql://user:password@localhost:3306/stroycontrol

# ID администратора в Kimi (опционально)
OWNER_UNION_ID=optional_owner_union_id

# Окружение
NODE_ENV=development
PORT=3000
```

## Установка и запуск

```bash
# Установка зависимостей
npm install

# Создание базы данных
mysql -u root -p
CREATE DATABASE stroycontrol;
EXIT;

# Применение схемы БД
npm run db:push

# Заполнение БД демо-данными (опционально)
npm run db:seed

# Запуск в режиме разработки
npm run dev

# Сборка для production
npm run build

# Запуск production версии
npm start
```

### Демо-данные

Скрипт `npm run db:seed` создаёт:
- 2 проекта (ЖК «Северный» и ТЦ «Меридиан»)
- 3 бригады (монолитные работы, кровля/фасад, отделочные работы)
- 2 прораба (Иван Петров с PIN 1234, Сергей Сидоров с PIN 4321)
- 5 этапов работ с разными статусами и зависимостями

## База данных

Проект использует MySQL с Drizzle ORM. Схема включает:
- `users` - пользователи системы (админы через Kimi OAuth)
- `projects` - строительные объекты
- `crews` - бригады
- `foremen` - прорабы (вход по PIN)
- `stages` - этапы работ
- `notifications` - уведомления

## Аутентификация

### Администраторы
Входят через Kimi OAuth. Сессия хранится в httpOnly cookie `kimi_sid`.

### Прорабы
Входят по имени и PIN-коду через `/foreman`. Сессия хранится в localStorage.

## Уведомления

Система автоматически генерирует уведомления:
- **starts_soon** - когда этап начинается сегодня или завтра
- **overdue** - когда этап просрочен
- **assigned** - когда прорабу назначен новый этап
- **completed** - когда прораб отметил этап выполненным
- **updated** - когда прораб обновил статус этапа

Уведомления отправляются:
- Администратору - о всех изменениях
- Прорабу - только о его этапах

## Технологии

- **Hono** - легковесный веб-фреймворк
- **tRPC** - type-safe API
- **Drizzle ORM** - типобезопасная ORM
- **MySQL** - реляционная база данных
- **JWT** - токены сессий (jose)
- **Zod** - валидация входных данных
- **SuperJSON** - сериализация для tRPC
