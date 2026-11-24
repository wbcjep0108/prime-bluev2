# Prime Blue

Prime Blue is a scroll-driven marketing and product-catalog website for the Prime beverage lineup (Hydration, Energy and Shake). The frontend is a Next.js app with heavy motion and WebGL work. A standalone Express + MongoDB backend lives in `server/` and provides accounts and sign-in.

> **Status:** accounts work end to end. Visitors can register and log in with email and password or with Google, view their account, and log out. The product catalog still renders from static files in `data/`. There are no product endpoints yet.

## Technology stack

| Layer | Technology |
|---|---|
| Frontend framework | Next.js 16.2.6 (App Router) |
| UI | React 19.2.4 (provided by Next.js), TypeScript 5, Tailwind CSS 4 |
| Motion and graphics | GSAP, Framer Motion, Lenis, OGL |
| Icons | Inline SVG, plus `@phosphor-icons/react` on the auth pages |
| Media | Cloudinary (`next-cloudinary`, upload scripts), `sharp` |
| Backend runtime | Node.js |
| Backend framework | Express 5, with Helmet, CORS and `cookie-parser` |
| Database | MongoDB (MongoDB Atlas intended) through Mongoose 9 |
| Authentication | JWT in an httpOnly cookie, `bcryptjs` password hashing, Google Identity Services verified with `google-auth-library` |
| Frontend tests | Vitest, React Testing Library, jsdom |
| Language / modules | TypeScript and ES modules in both apps |

## Architecture

```
prime-blue/
├─ app/                                  Next.js routes
│  ├─ login/ register/ account/          Auth pages (server page + client component)
│  └─ about/ shop/ page.tsx              Existing site
├─ components/
│  ├─ auth/                              Forms, fields, GoogleButton, AuthShell, TransitionLink
│  └─ account/                           AccountView
├─ lib/
│  ├─ api/config.ts                      API base URL and Google client ID
│  └─ auth/                              types, validation, api (the only code that calls fetch)
├─ data/ public/                         Static product data and assets
├─ server/                               Standalone Express backend
│  ├─ src/
│  │  ├─ index.ts                        Entry point: env, DB connect, index build, listen, shutdown
│  │  ├─ app.ts                          Express app: Helmet, CORS, JSON, cookies, routes, errors
│  │  ├─ config/                         env.ts (validation), database.ts (Mongoose)
│  │  ├─ routes/                         /api/v1 routing (health, auth)
│  │  ├─ controllers/                    Request handlers (health, auth)
│  │  ├─ middleware/                     requireAuth, centralised error handling
│  │  ├─ models/                         User
│  │  ├─ validators/                     Server-side input rules
│  │  └─ utils/                          session (JWT and cookie), google (ID token check)
│  └─ package.json                       Separate dependencies and scripts
└─ package.json                          Frontend dependencies plus helper scripts
```

- **Frontend:** the existing Next.js application. React comes from Next.js, so there is no separate React app.
- **Backend:** Express runs as its own process inside `server/`, with its own `package.json`, `tsconfig.json` and `node_modules`. The root TypeScript and ESLint configs exclude `server/`.
- **Database:** MongoDB connectivity is handled through Mongoose in `server/src/config/database.ts`. At startup the server builds the `User` indexes before it accepts requests.
- **Static export:** the frontend stays configured with `output: 'export'` in `next.config.mjs`, so it builds to static files in `out/`. Because of this, Next.js route handlers, server actions and `rewrites()` are not available. All API access goes to the Express server over HTTP from the browser, through `lib/auth/api.ts`.
- **API:** all backend routes are served under the `/api/v1` prefix. CORS allows exactly one origin, `CLIENT_URL`, with credentials.

> Next.js loads `next.config.mjs` before `next.config.ts`, so `next.config.mjs` is the active config. This version of Next.js has breaking changes from older releases, so read the guides in `node_modules/next/dist/docs/` before changing Next.js code.

## Authentication

### Pages

| Route | Purpose |
|---|---|
| `/login` | Log in with email and password, or with Google. On success it goes to `/`. |
| `/register` | Create an account with email and password, or with Google. On success it shows a message and a link to `/login`. It does not log the person in. |
| `/account` | Shows the logged-in person's name and email with a Log out button, or "You are not logged in" with links to log in or register. The navbar has an Account link. |

### API

All endpoints are under `/api/v1/auth`. Successful user responses are always `{ "user": { "id", "name", "email" } }`. The password hash and Google ID are never returned. Errors use `{ "status": "error", "message" }`, plus a `fieldErrors` object for validation failures only.

| Method and path | Auth | Success | Notes |
|---|---|---|---|
| `POST /auth/register` | no | 201 | Body `{ name, email, password }`. Duplicate email returns 409. No cookie is set. |
| `POST /auth/login` | no | 200 | Body `{ email, password }`. Sets the session cookie. Wrong email, wrong password and a Google-only account all return the same 401 `Invalid email or password`. It never creates an account. |
| `POST /auth/google` | no | 200 or 201 | Body `{ credential, mode }`, where `mode` is `login` or `register`. See below. |
| `POST /auth/logout` | cookie | 200 | Clears the session cookie. |
| `GET /auth/me` | cookie | 200 | Returns the current user, or 401. |

**Input rules** (checked on the server and, identically, in the browser): name 2 to 60 characters; a valid email up to 254 characters; password at least 8 characters with an uppercase letter, a lowercase letter and a number, and at most 72 bytes (a bcrypt limit). Login only requires a password to be present.

**Session:** a signed JWT in the `prime_session` cookie, valid for 7 days. The cookie is `HttpOnly` and `SameSite=Lax`, and it is also `Secure` when `NODE_ENV=production`. No token is stored in `localStorage`. Passwords are hashed with bcrypt at cost 12.

### Google sign-in

The browser loads Google Identity Services, shows Google's own button, and receives an ID token from Google. It sends the token to `POST /auth/google`. The server verifies the token with `google-auth-library` (audience must be `GOOGLE_CLIENT_ID`, and the email must be verified by Google). There is no redirect-based OAuth and no client secret.

| `mode` | Behaviour |
|---|---|
| `login` | Finds the user by Google ID, then by email. No match returns 404 `No account found. Please register first.` An existing email/password account is linked to the Google ID on its first Google login. Success sets the session cookie. |
| `register` | An existing user returns 409 `An account with this email already exists. Please log in.` Otherwise it creates the user from the token's name and email, with no password. It does not set a cookie. |

If `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is not set, the Google button and its "or" divider are not rendered at all.

## Prerequisites

- Node.js 20.9 or newer to run the site and the API
- Node.js 22.22 or newer, or 24.15 or newer, to run the frontend tests (the jsdom test environment requires it)
- npm 10 or newer
- Git
- A MongoDB database, preferably a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster. The backend needs it for accounts. The frontend pages render without it, but registering and logging in will not work.
- A Google OAuth client ID, only if you want "Continue with Google"

## Installation

Run both installs. The backend has its own dependencies, and `npm install` at the root does not install them.

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
npm run server:install
```

## Environment configuration

Both env files are ignored by Git and must never be committed. There is no `.env.example` template, so create the files by hand using the tables below.

### Backend: `server/.env`

| Variable | Default | Description |
|---|---|---|
| `PORT` | `4000` | Port the Express server listens on. Must be an integer from 1 to 65535. |
| `CLIENT_URL` | `http://localhost:3000` | Origin of the Next.js frontend. It is the only allowed CORS origin and must match the address you open in the browser exactly. |
| `MONGODB_URI` | empty | MongoDB connection string. It must start with `mongodb://` or `mongodb+srv://`. Required when `NODE_ENV=production`. |
| `JWT_SECRET` | none | **Required.** Secret that signs session tokens, at least 32 characters. The server refuses to start without it. |
| `GOOGLE_CLIENT_ID` | none | **Required.** The Google OAuth client ID (not the client secret). The server refuses to start without it. |

Generate a `JWT_SECRET` with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

### Frontend: `.env.local` (in the project root)

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | none | The same Google client ID as the backend. When missing, the Google button is hidden. |
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000/api/v1` | Base URL of the API. |

`NEXT_PUBLIC_` values are written into the JavaScript at build time. With the static export, changing them requires a rebuild. The Google client ID is public by design.

### Configuring MongoDB Atlas

1. Create a cluster and a database user in MongoDB Atlas.
2. Under Network Access, allow your current IP address. If your IP changes, add the new one.
3. Copy the cluster's connection string (`mongodb+srv://...`) into `MONGODB_URI` in `server/.env`, including a database name.
4. Start the backend and look for `[db] connected to MongoDB` in the log.

Never put real credentials in code, documentation or commits.

### Configuring Google sign-in

1. In the [Google Cloud console](https://console.cloud.google.com/), create an OAuth client ID of type **Web application**.
2. Under Authorized JavaScript origins, add every address you open the site at, for example `http://localhost:3000`. No redirect URI is needed.
3. Put the client ID in `GOOGLE_CLIENT_ID` (`server/.env`) and `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (`.env.local`). Do not use the client secret anywhere.
4. Restart the dev servers after changing env files.

## Development commands

```bash
# Frontend only (http://localhost:3000)
npm run dev

# Backend only (http://localhost:4000)
npm run server:dev

# Frontend and backend together
npm run dev:all
```

Rules for a working local setup:

- **Run the API.** The login, register, Google and account features all call it. If it is not running, the forms show "Could not reach the server."
- **Open the site at exactly `http://localhost:3000`.** `http://127.0.0.1:3000` and the "Network" address that Next.js prints are different origins, so the browser blocks their requests to the API.
- **Keep port 3000 free for the site.** If it is taken, Next.js moves to 3001, which the API's CORS setting does not allow. Do not start `npm run dev:all` while another dev server is already using port 3000.

### Health check

```
http://localhost:4000/api/v1/health
```

| Situation | HTTP status | `status` |
|---|---|---|
| MongoDB connected and answering a ping | 200 | `ok` |
| `MONGODB_URI` not set, or the database is not connected | 503 | `degraded` |

The response also includes a `database` object with `configured`, `state` and `reachable` fields.

If `MONGODB_URI` is set but the connection fails at startup, the server logs the error (without the connection string) and exits.

## Tests

The frontend tests use Vitest and run without a database, a network or a Google account. The API and Google script are mocked.

```bash
npx vitest --run
```

They cover validation, the API client, both forms, the Google button, and the account page. There is no test suite for `server/` yet.

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

Other scripts: `npm run lint` runs ESLint on the frontend. It currently reports problems in files that predate the auth work (the `.agents/` scripts, the root helper scripts and some existing components). The auth files themselves lint clean.

## Troubleshooting

| Symptom | Likely cause and fix |
|---|---|
| "Could not reach the server. Check your connection and try again." | The API is not running, or the site is open at an address other than `http://localhost:3000`. Start `npm run server:dev` and check `/api/v1/health`. |
| API exits with `[env] JWT_SECRET is required` or `GOOGLE_CLIENT_ID is required` | Add the variable to `server/.env`. |
| API exits with `failed to connect` and an SSL alert | Atlas is rejecting the connection. Add your current IP under Network Access. |
| `/health` returns 503 `degraded` | MongoDB is not configured, not connected yet, or briefly disconnected. |
| No Google button on the forms | `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is missing from `.env.local`, or the dev server was not restarted after adding it. |
| Google button shows but sign-in is blocked | The address you opened is not listed under Authorized JavaScript origins for the client ID. |

## Known limitations

- **No rate limiting.** Login, register and Google endpoints can be hit repeatedly. Add a limiter before a public launch.
- **Logout is stateless.** It clears the cookie, but a copied token stays valid until it expires (7 days).
- **Production hosting.** The cookie is `SameSite=Lax`, so the site and the API need to be on the same site (for example `www.example.com` and `api.example.com`) for the browser to send it. Different registrable domains need a different cookie setup.
- **No password reset or email verification.** The login page shows "Forgot password? Coming soon."
- **Account linking trusts Google's verified email.** An existing email/password account is linked on the first Google login with the same email.

## Git collaboration workflow

1. Update `main`: `git checkout main` then `git pull`.
2. Create a branch for your work, such as `feature/short-description` or `fix/short-description`. Do not commit directly to `main`.
3. Make small, focused commits with clear messages.
4. Before pushing, run `npm run build` and `npx vitest --run`, and `npm run server:build` if you touched `server/`.
5. Push your branch with `git push -u origin <branch>` and open a pull request into `main`.
6. Get the pull request reviewed before merging.

Rules:
- Never commit `.env` or `.env.local` files, credentials or secrets.
- Keep frontend and backend changes separate where possible. Only `lib/auth/api.ts` should call the auth API from the frontend.
- Line endings are normalised by `.gitattributes`, so no per-machine Git settings are needed.

## Project assets

Images are served from `public/images/`. Cloudinary helpers live in the root (`upload-to-cloudinary.cjs`) and need `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` in the root `.env.local` (also Git-ignored). They are not needed to run the site locally.
