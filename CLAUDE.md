# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Экосистема WTFGames

Проект — часть из трёх связанных репозиториев (соседние каталоги под
`~/Work/web/wtfgames/`):

| Проект | Роль | Стек | Remote |
|--------|------|------|--------|
| `wtfgames-site` | Публичный фронтенд (сайт) | React 19 (CRA), Redux Toolkit, axios | GitHub `serhii-chechui/WTFGamesSiteClient` |
| `wtfgames-site-admin` | Админ-панель | React 19 (CRA), Redux Toolkit, axios | Bitbucket `wtf_games/wtfgamessiteadmin` |
| **`wtfgames-site-api`** | **Backend API (этот проект)** | Node.js, Express 4, MongoDB/Mongoose | GitHub `serhii-chechui/wtfgames-api` |

Оба фронтенда — потребители этого API. Публичный сайт использует только
эндпоинты на чтение (`GET /api/games`, `GET /api/applications`) без
аутентификации; админ-панель — изменяющие эндпоинты и управление
пользователями (аутентификация через httpOnly-cookie с JWT, `withCredentials`).

> Примечание: в `package.json` указан устаревший Bitbucket-URL
> (`wtf_games/wtfgamessiteapi`) — канонический remote проекта на GitHub
> (`serhii-chechui/wtfgames-api`).

## Этот проект (wtfgames-site-api)

- **Модули:** ESM (`"type": "module"`). Node >= 20.19 (`.nvmrc`).
- **Точка входа:** `bin/www` → `app.js`. Старт БД: `startup/db.js`,
  регистрация роутов/CORS/error-handler: `startup/routes.js`.
- **Запуск:** `npm start` (порт из `PORT`, по умолчанию `3156`);
  `npm run dev` — nodemon.
- **База данных:** MongoDB Atlas через Mongoose 8.
- **Хранилище файлов:** AWS S3 (`@aws-sdk/client-s3`), загрузка через multer +
  ресайз через sharp.
- **Аутентификация:** JWT в httpOnly-cookie (`controllers/auth.js`,
  `middleware/check-auth.js`). RBAC — `middleware/require-role.js`
  (роль проверяется по БД).

### Структура

- `routes/` — определение маршрутов (публичное чтение vs `checkAuth` на мутациях).
- `controllers/` — обработчики (HTTP + бизнес-логика + доступ к БД; отдельного
  сервисного слоя нет — оправдано масштабом).
- `middleware/` — auth, RBAC, upload/S3/resize, mailer, error handler.
- `models/` — Mongoose-схемы (`user`, `game`, `applications`).
- Активные роутеры: `auth`, `games`, `applications`, `users`. Модули
  `categories/products/orders/gift-certificate/main-page` — незавершённые
  заготовки, не подключены.

## Конвенции

- Ошибки пробрасываются через `throw` внутри `express-async-handler`;
  централизованный `errorHandler` (`middleware/errorMiddleware.js`) формирует
  JSON-ответ и уважает `err.status` / выставленный `res.status()`.
- Никогда не отдавать наружу хеш пароля: `password` имеет `select: false`,
  для проверки запрашивается явно (`.select("+password")`).
- Изменяющие эндпоинты (`POST/PATCH/DELETE`) требуют `checkAuth`; чтение
  `games`/`applications` — публичное. Управление `users` — только по ролям.
- **git-flow:** `main` (production) / `develop` (integration) / `feature/*`.
  Релизы тегируются `vX.Y.Z` на `main` (текущий api — `v1.0.0`).
  Conventional commits (`feat(...)`, `fix(...)`, `chore(...)`).
  Коммитить локально; не пушить без явной просьбы.

## Production и деплой (AWS EC2)

CI/CD нет — ни пайплайна, ни Dockerfile, ни deploy-скрипта в репозитории.
Push в `main` **не** триггерит деплой; выкатка на EC2 — ручной шаг мейнтейнера.

- **Backend (этот репозиторий):** build-шага нет — бампается версия и на EC2
  выкатывается исходник. Работает как долгоживущий Node-процесс под **PM2**
  (`pm2.log` в `.gitignore`), файлы — в AWS **S3** (`AWS_*` в
  `middleware/s3Upload.js`).
- **Прод-домены** (все под `wtfgames.com.ua`, т.е. same-site / cross-subdomain):
  - `wtfgames.com.ua` — публичный сайт
  - `admin.wtfgames.com.ua` — админ-панель
  - `api.wtfgames.com.ua` — этот API
- **Прод-env на хосте** (не в репозитории): `COOKIE_SECURE=true`,
  `COOKIE_SAMESITE=none`, `CLIENT_ORIGINS=https://admin.wtfgames.com.ua`,
  плюс `JWT_PRIVATE`, `MONGO_URI`, `AWS_*`. Cookie-авторизация кросс-доменная,
  поэтому admin и backend должны релизиться вместе — иначе логин ломается.

## Известные ограничения

- Нет автоматических тестов, Docker, CI/CD.
- Нет TypeScript и слоя runtime-валидации (Zod/Joi) — ввод валидируется вручную.
- Секреты — в `.env` (не в репозитории; см. `.env.example`).
