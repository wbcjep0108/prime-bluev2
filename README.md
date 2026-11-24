# Prime Blue

Prime Blue is a scroll-driven marketing and product-catalog website for the Prime beverage lineup (Hydration, Energy and Shake). The frontend is a Next.js app with heavy motion and WebGL work. A standalone Express + MongoDB backend lives in `server/` and is the foundation for future API features.

> **Status:** the backend is infrastructure only. It exposes a health endpoint and a database connection module. There are no models, product endpoints or authentication yet, and the site still renders its product data from static files in `data/`.

## Technology stack

| Layer | Technology |
|---|---|
| Frontend framework | Next.js 16.2.6 (App Router) |
| UI | React 19.2.4 (provided by Next.js), TypeScript 5, Tailwind CSS 4 |
| Motion and graphics | GSAP, Framer Motion, Lenis, OGL |
| Media | Cloudinary (`next-cloudinary`, upload scripts), `sharp` |
| Backend runtime | Node.js |
| Backend framework | Express 5, with Helmet and CORS |
| Database | MongoDB (MongoDB Atlas intended) through Mongoose 9 |
| Language / modules | TypeScript and ES modules in both apps |

## Architecture

```
prime-blue/
├─ app/ components/ data/ lib/ public/   Next.js frontend (unchanged layout)
├─ server/                               Standalone Express backend
│  ├─ src/
│  │  ├─ index.ts                        Entry point: env, DB connect, listen, shutdown
│  │  ├─ app.ts                          Express app: Helmet, CORS, JSON, routes, errors
│  │  ├─ config/                         env.ts (validation), database.ts (Mongoose)
│  │  ├─ routes/ controllers/            /api/v1 routing and handlers
│  │  ├─ middleware/                     Centralised error handling
│  │  └─ models/                         Empty: no models yet
│  ├─ .env.example                       Environment template
│  └─ package.json                       Separate dependencies and scripts
└─ package.json                          Frontend dependencies plus helper scripts
```

- **Frontend:** the existing Next.js application. React comes from Next.js, so there is no separate React app.
- **Backend:** Express runs as its own process inside `server/`, with its own `package.json`, `tsconfig.json` and `node_modules`. The root TypeScript and ESLint configs exclude `server/`.
- **Database:** MongoDB connectivity is handled through Mongoose in `server/src/config/database.ts`.
- **Static export:** the frontend stays configured with `output: 'export'` in `next.config.mjs`, so it builds to static files in `out/`. Because of this, Next.js route handlers, server actions and `rewrites()` are not available. Any API access must go to the Express server over HTTP.
- **API:** all backend routes are served under the `/api/v1` prefix. Future frontend-to-backend communication will go through this API, with CORS restricted to `CLIENT_URL`.

> Next.js loads `next.config.mjs` before `next.config.ts`, so `next.config.mjs` is the active config. This version of Next.js has breaking changes from older releases, so read the guides in `node_modules/next/dist/docs/` before changing Next.js code.

## Prerequisites

- Node.js 20.9 or newer (Node 24 was used during setup)
- npm 10 or newer
- Git
- A MongoDB database, preferably a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster. It is optional for running the frontend or the backend in degraded mode.

## Installation

Run both installs. The backend has its own dependencies, and `npm install` at the root does not install them.

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
npm run server:install
```

## Environment configuration

The backend reads its settings from `server/.env`. This file is ignored by Git and must never be committed.

Create it from the template.

Windows PowerShell:

```powershell
Copy-Item server/.env.example server/.env
```

macOS/Linux:

```bash
cp server/.env.example server/.env
```

| Variable | Default | Description |
|---|---|---|
| `PORT` | `4000` | Port the Express server listens on. Must be an integer from 1 to 65535. |
| `CLIENT_URL` | `http://localhost:3000` | Origin of the Next.js frontend. Used as the only allowed CORS origin. |
| `MONGODB_URI` | empty | MongoDB connection string. It must start with `mongodb://` or `mongodb+srv://`. Required when `NODE_ENV=production`. |

### Configuring MongoDB Atlas

1. Create a cluster and a database user in MongoDB Atlas.
2. Under Network Access, allow your IP address.
3. Copy the cluster's connection string (`mongodb+srv://...`) into `MONGODB_URI` in `server/.env`, including a database name.
4. Start the backend and look for `[db] connected to MongoDB` in the log.

Never put real credentials in `server/.env.example`, in code, or in commits.

## Development commands

```bash
# Frontend only (http://localhost:3000)
npm run dev

# Backend only (http://localhost:4000)
npm run server:dev

# Frontend and backend together
npm run dev:all
```

### Health check

```
http://localhost:4000/api/v1/health
```

| Situation | HTTP status | `status` |
|---|---|---|
| MongoDB connected and answering a ping | 200 | `ok` |
| `MONGODB_URI` not set, or the database is not connected | 503 | `degraded` |

The API may return HTTP 503 with a `degraded` status until MongoDB is configured and connected. That is expected on a fresh clone. The response also includes a `database` object with `configured`, `state` and `reachable` fields.

If `MONGODB_URI` is set but the connection fails at startup, the server logs the error (without the connection string) and exits.

## Production build commands

```bash
# Frontend: static export, output in out/
npm run build

# Backend: compile TypeScript to server/dist
npm run server:build

# Backend: run the compiled server
npm run server:start
```

The backend scripts can also be run from inside `server/` as `npm run dev`, `npm run build` and `npm start`.

Other scripts: `npm run lint` runs ESLint on the frontend. It currently reports pre-existing problems unrelated to the backend.

## Git collaboration workflow

1. Update `main`: `git checkout main` then `git pull`.
2. Create a branch for your work, such as `feature/short-description` or `fix/short-description`. Do not commit directly to `main`.
3. Make small, focused commits with clear messages.
4. Before pushing, run `npm run build`, and `npm run server:build` if you touched `server/`.
5. Push your branch with `git push -u origin <branch>` and open a pull request into `main`.
6. Get the pull request reviewed before merging.

Rules:
- Never commit `.env` files or credentials. Only `server/.env.example` is tracked.
- Keep frontend and backend changes separate where possible, and do not duplicate API logic in the frontend.
- Line endings are normalised by `.gitattributes`, so no per-machine Git settings are needed.

## Project assets

Images are served from `public/images/`. Cloudinary helpers live in the root (`upload-to-cloudinary.cjs`) and need `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` in a root `.env.local` (also Git-ignored). They are not needed to run the site locally.
