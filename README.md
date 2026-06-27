# BusinessCase

Минимальный Next.js (App Router) + Prisma + NeonDB (PostgreSQL), готовый к деплою на Vercel.

## Стек

- Next.js 15 (TypeScript, App Router)
- Prisma ORM
- Neon PostgreSQL

## Быстрый старт (локально)

### 1. Установка зависимостей

```powershell
npm install
```

### 2. База Neon

1. Создайте проект на [neon.tech](https://neon.tech).
2. Скопируйте **pooled** и **direct** connection strings из дашборда Neon.
3. Создайте `.env` из примера:

```powershell
Copy-Item .env.example .env
```

4. Подставьте реальные URL в `.env`:

```env
DATABASE_URL="postgresql://...@ep-xxx-pooler....neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://...@ep-xxx....neon.tech/neondb?sslmode=require"
```

### 3. Миграция и seed

```powershell
npx prisma migrate deploy
npm run db:seed
```

Для разработки (создание новых миграций):

```powershell
npm run db:migrate
```

### 4. Запуск

```powershell
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) — на странице отобразятся заметки из БД.

## Деплой на Vercel

1. Запушьте репозиторий в GitHub.
2. Импортируйте проект в [Vercel](https://vercel.com).
3. В **Environment Variables** добавьте:
   - `DATABASE_URL` — pooled connection string Neon
   - `DIRECT_URL` — direct connection string Neon
4. Deploy.

После деплоя выполните миграцию и seed **один раз** (локально с prod URL или через Neon SQL Editor):

```powershell
npx prisma migrate deploy
npm run db:seed
```

> `postinstall` и `build` уже вызывают `prisma generate` — клиент Prisma соберётся на Vercel автоматически.

## Структура

```
prisma/
  schema.prisma    # модель Note
  seed.ts          # тестовые данные
  migrations/      # SQL-миграции
src/
  app/page.tsx     # чтение заметок из БД
  lib/prisma.ts    # singleton Prisma Client
```

## Модель Note

| Поле      | Тип      |
|-----------|----------|
| id        | uuid     |
| title     | string   |
| createdAt | DateTime |
