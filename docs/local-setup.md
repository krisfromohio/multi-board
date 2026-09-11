# Local setup

Release 1 targets the Product Owner's installed Node.js `v24.16.0` and uses Node's built-in `node:sqlite`; no separate SQLite installation, native compiler toolchain, Docker, cloud database, or local administrator rights are required.

## First-time setup

From PowerShell in the repository directory:

```powershell
node --version
npm install
npm run dev
```

Expected Node version is `v24.16.0` or newer within the Node 24 line used for the POC.

Open:

```text
http://127.0.0.1:5173
```

The Vite development UI proxies `/api/*` to the local Fastify server at `127.0.0.1:4173`.

## Runtime data

The server creates its local SQLite database at:

```text
.local-data/multi-board.db
```

`.local-data/` and SQLite sidecar files are ignored by Git. Do not put real source exports in committed fixture directories.

## Health check

While `npm run dev` is running, this should return local runtime information:

```powershell
Invoke-RestMethod http://127.0.0.1:4173/api/health
```

Expected persistence value:

```text
node:sqlite
```

## Build

```powershell
npm run build
npm start
```

The production-style local server binds only to `127.0.0.1` and serves the compiled frontend plus `/api/*`.

## Tests

```powershell
npm test
```

Playwright browser tests will be added/expanded with the vertical stories. When browser binaries are first needed:

```powershell
npx playwright install chromium
npm run test:e2e
```

## Troubleshooting principle

Do not work around setup issues by adding a cloud service, hosted database, telemetry service, or native SQLite dependency. Resolve the local Node-based path first because zero-cost/no-admin/local-only operation is an R1 product constraint.
