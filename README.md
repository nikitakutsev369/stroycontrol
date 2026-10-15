# СтройКонтроль

Полноценная система управления строительными проектами с frontend на React + shadcn/ui и backend на Hono + tRPC + Drizzle ORM.

## 🚀 Возможности

### Frontend
- **Диаграмма Ганта** — визуализация этапов строительства с зависимостями, прогрессом и цветовой индикацией
- **Портал прораба** — личный кабинет для прорабов с управлением своими этапами
- **50+ UI компонентов** — полная библиотека shadcn/ui (таблицы, формы, диалоги, навигация)
- **Система уведомлений** — колокольчик с счётчиком непрочитанных
- **Адаптивный дизайн** — работает на всех устройствах
- **Тёмная/светлая тема** — поддержка через CSS переменные

### Backend
- **tRPC API** — type-safe эндпоинты с валидацией через Zod
- **OAuth Kimi** — авторизация администраторов через Kimi Open Platform
- **JWT сессии** — httpOnly cookies для безопасности
- **Drizzle ORM** — типобезопасная работа с MySQL
- **Автоматические уведомления** — генерация при приближении сроков и просрочках

### Ролевая модель
- **Администратор** — полный доступ ко всем функциям, вход через Kimi OAuth
- **Прораб** — доступ только к своим этапам, вход по имени + PIN-код

## 📁 Структура проекта

```
stroycontrol/
├── src/                          # Frontend (React)
│   ├── pages/
│   │   ├── Home.tsx             # Главная страница администратора
│   │   ├── Login.tsx            # Страница входа
│   │   ├── ForemanPortal.tsx    # Кабинет прораба
│   │   └── NotFound.tsx         # Страница 404
│   ├── components/
│   │   ├── GanttChart.tsx       # Диаграмма Ганта
│   │   ├── NotificationBell.tsx # Колокольчик уведомлений
│   │   └── ui/                  # 50+ компонентов shadcn/ui
│   ├── hooks/
│   │   ├── useAuth.ts          # Хук авторизации
│   │   └── use-mobile.ts       # Определение мобильного устройства
│   ├── lib/
│   │   ├── dates.ts            # Утилиты для работы с датами
│   │   └── utils.ts            # Утилита cn() для классов
│   ├── providers/
│   │   └── trpc.tsx            # tRPC провайдер
│   ├── schema.ts               # CRUD операции с localStorage
│   ├── types.ts                # TypeScript типы
│   └── errors.ts               # Система ошибок
│
├── api/                          # Backend (Hono + tRPC)
│   ├── boot.ts                  # Точка входа сервера
│   ├── router.ts                # Корневой tRPC роутер
│   ├── context.ts               # Контекст tRPC
│   ├── middleware.ts            # Middleware авторизации
│   ├── auth-router.ts           # Роутер авторизации
│   ├── construction-router.ts   # Основной роутер
│   ├── kimi/                    # Интеграция с Kimi OAuth
│   ├── lib/                     # Утилиты
│   └── queries/                 # Работа с БД
│
├── db/                           # Схема базы данных
│   ├── schema.ts                # Drizzle ORM схема
│   └── relations.ts             # Отношения
│
├── contracts/                    # Общие контракты
│   ├── constants.ts             # Константы
│   └── errors.ts                # Система ошибок
│
└── README.md                     # Этот файл
```

## 🛠️ Технологии

### Frontend
- **React 18** — UI фреймворк
- **TypeScript** — типизация
- **Tailwind CSS v4** — стилизация
- **shadcn/ui** — библиотека компонентов
- **Radix UI** — доступные примитивы
- **date-fns** — работа с датами
- **Vite** — сборщик
- **React Router** — маршрутизация

### Backend
- **Hono** — легковесный веб-фреймворк
- **tRPC** — type-safe API
- **Drizzle ORM** — типобезопасная ORM
- **MySQL** — реляционная база данных
- **JWT (jose)** — токены сессий
- **Zod** — валидация входных данных
- **SuperJSON** — сериализация для tRPC

## 📦 Установка и запуск

### Frontend (разработка)

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Сборка для production
npm run build
```

### Backend (production)

```bash
# Создание базы данных
mysql -u root -p
CREATE DATABASE stroycontrol;
EXIT;

# Настройка переменных окружения
cp .env.example .env
# Отредактируйте .env и заполните все необходимые значения

# Применение схемы БД
npm run db:push

# Заполнение БД демо-данными (опционально)
npm run db:seed

# Запуск сервера
npm start
```

### Демо-данные

Скрипт `npm run db:seed` создаёт тестовые данные:
- 2 проекта (ЖК «Северный» и ТЦ «Меридиан»)
- 3 бригады (монолитные работы, кровля/фасад, отделочные работы)
- 2 прораба (Иван Петров с PIN 1234, Сергей Сидоров с PIN 4321)
- 5 этапов работ с разными статусами и зависимостями

## 🔐 Переменные окружения

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

## 🎯 Демо-доступ

### Администратор
- **Имя:** `Админ`
- **Пароль:** `admin`
- **Доступ:** все функции системы

### Прораб
- **Имя:** `Иван Петров`
- **PIN:** `1234`
- **Доступ:** только свои этапы

## 📊 API Endpoints

### Авторизация
- `GET /api/oauth/callback` - OAuth callback от Kimi
- `POST /api/trpc/auth.me` - Получить текущего пользователя
- `POST /api/trpc/auth.logout` - Выйти из системы

### Управление (только для админов)
- `POST /api/trpc/construction.project.*` - CRUD проектов
- `POST /api/trpc/construction.crew.*` - CRUD бригад
- `POST /api/trpc/construction.foreman.*` - CRUD прорабов
- `POST /api/trpc/construction.stage.*` - CRUD этапов
- `POST /api/trpc/construction.notification.*` - Управление уведомлениями

### Портал прораба (публичный доступ)
- `POST /api/trpc/construction.portal.directory` - Список прорабов для входа
- `POST /api/trpc/construction.portal.login` - Вход прораба по PIN
- `POST /api/trpc/construction.portal.myStages` - Мои этапы
- `POST /api/trpc/construction.portal.updateStageStatus` - Обновить статус этапа
- `POST /api/trpc/construction.portal.myNotifications` - Мои уведомления

## 🔔 Система уведомлений

Автоматическая генерация уведомлений:
- **starts_soon** - когда этап начинается сегодня или завтра
- **overdue** - когда этап просрочен
- **assigned** - когда прорабу назначен новый этап
- **completed** - когда прораб отметил этап выполненным
- **updated** - когда прораб обновил статус этапа

Уведомления отправляются:
- Администратору - о всех изменениях
- Прорабу - только о его этапах

## 📏 Размер бандла

- **CSS:** 104.48 kB (gzip: 16.68 kB)
- **JS:** 383.50 kB (gzip: 120.68 kB)
- **Всего модулей:** 1477

## 📝 Дополнительная документация

- [BACKEND_README.md](./BACKEND_README.md) - подробная документация по backend

## 🤝 Вклад

Проект готов к production использованию. Для внесения изменений:

1. Fork репозитория
2. Создайте ветку для новой функции (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📄 Лицензия

MIT

---

**Разработано для оптимизации управления строительными проектами** 🏗️
