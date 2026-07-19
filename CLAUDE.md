# CLAUDE.md

Guidance for Claude Code when working in this repository.

## WTFGames ecosystem

This project is one of three related repositories (sibling directories under
`~/Work/web/wtfgames/`):

| Project | Role | Stack | Remote |
|---------|------|-------|--------|
| `wtfgames-site` | Public frontend (website) | React 19 (CRA), Redux Toolkit, axios | GitHub `serhii-chechui/WTFGamesSiteClient` |
| `wtfgames-site-admin` | Admin panel | React 19 (CRA), Redux Toolkit, axios | Bitbucket `wtf_games/wtfgamessiteadmin` |
| **`wtfgames-site-api`** | **Backend API (this project)** | Node.js, Express 4, MongoDB/Mongoose | GitHub `serhii-chechui/wtfgames-api` |

Both frontends consume this API. The public site uses read-only endpoints
(`GET /api/games`, `GET /api/applications`) without authentication; the admin
panel uses mutating endpoints and user management (auth via an httpOnly cookie
carrying a JWT, `withCredentials`).

> Note: `package.json` lists a stale Bitbucket URL
> (`wtf_games/wtfgamessiteapi`) — the canonical remote is on GitHub
> (`serhii-chechui/wtfgames-api`).

## This project (wtfgames-site-api)

- **Modules:** ESM (`"type": "module"`). Node >= 20.19 (`.nvmrc`).
- **Entry point:** `bin/www` → `app.js`. DB startup: `startup/db.js`;
  route/CORS/error-handler registration: `startup/routes.js`.
- **Run:** `npm start` (port from `PORT`, default `3156`);
  `npm run dev` — nodemon.
- **Database:** MongoDB Atlas via Mongoose 8.
- **File storage:** AWS S3 (`@aws-sdk/client-s3`), upload via multer +
  resize via sharp.
- **Authentication:** JWT in an httpOnly cookie (`controllers/auth.js`,
  `middleware/check-auth.js`). RBAC — `middleware/require-role.js`
  (role verified against the DB).

### Structure

- `routes/` — route definitions (public reads vs `checkAuth` on mutations).
- `controllers/` — handlers (HTTP + business logic + DB access; there is no
  separate service layer — justified by the project's scale).
- `middleware/` — auth, RBAC, upload/S3/resize, mailer, error handler.
- `models/` — Mongoose schemas (`user`, `game`, `applications`).
- Active routers: `auth`, `games`, `applications`, `users`. The
  `categories/products/orders/gift-certificate/main-page` modules are
  unfinished stubs and are not wired up.

## Conventions

- **Language:** all commit messages, documentation, and code comments must be
  written in **English only**.
- Errors are thrown via `throw` inside `express-async-handler`; the centralized
  `errorHandler` (`middleware/errorMiddleware.js`) builds the JSON response and
  respects `err.status` / a `res.status()` set beforehand.
- Never expose the password hash: `password` has `select: false`; request it
  explicitly (`.select("+password")`) when verifying.
- Mutating endpoints (`POST/PATCH/DELETE`) require `checkAuth`; reading
  `games`/`applications` is public. Managing `users` is role-gated.
- **git-flow:** `main` (production) / `develop` (integration) / `feature/*`.
  Releases are tagged `vX.Y.Z` on `main` (current api — `v1.0.0`).
  Conventional commits (`feat(...)`, `fix(...)`, `chore(...)`).
  Commit locally; do not push without an explicit request.

## Production and deployment (AWS EC2)

There is no CI/CD — no pipeline, Dockerfile, or deploy script in the repo.
Pushing `main` does not trigger a deploy; the EC2 rollout is a manual step by
the maintainer.

- **Backend (this repo):** no build step — bump the version and deploy the
  source to EC2. It runs as a long-lived Node process under **PM2**
  (`pm2.log` is git-ignored); files live in AWS **S3** (`AWS_*` in
  `middleware/s3Upload.js`).
- **Production domains** (all under `wtfgames.com.ua`, i.e. same-site /
  cross-subdomain):
  - `wtfgames.com.ua` — public site
  - `admin.wtfgames.com.ua` — admin panel
  - `api.wtfgames.com.ua` — this API
- **Production env on the host** (not in the repo): `COOKIE_SECURE=true`,
  `COOKIE_SAMESITE=none`, `CLIENT_ORIGINS=https://admin.wtfgames.com.ua`,
  plus `JWT_PRIVATE`, `MONGO_URI`, `AWS_*`. Cookie auth is cross-domain, so
  admin and backend must be released together — otherwise login breaks.

## Known limitations

- No automated tests, Docker, or CI/CD.
- No TypeScript and no runtime-validation layer (Zod/Joi) — input is validated
  manually.
- Secrets live in `.env` (not in the repo; see `.env.example`).
