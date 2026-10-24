# Bank Ledger Frontend

A portfolio office workspace for a double-entry bank ledger. Built with Next.js and TypeScript; it connects to the Go API in [bank-ledger-backend](https://github.com/kundan223/bank-ledger-backend). This frontend builds on the original MIT-licensed project and is adapted for Kundan Yadav's portfolio.

## Run locally

Requirements: Node.js 20.9 or newer, Yarn 1, and a running backend with PostgreSQL. Start the backend first using its README.

```powershell
Copy-Item .env.local.example .env.local
corepack yarn install
corepack yarn dev
```

Open http://localhost:3000. The default API address is http://localhost:8080. To use another backend, set `API_BASE_URL` in `.env.local`, then restart Next.js.

## Features

- Overview of balances, movement totals, recent activity, and a seven-day chart.
- Accounts, account ledgers, reconciliation, transaction details, filters, pagination, and CSV export.
- A lightweight client directory with local browser notes. The Go API does not currently provide CRM endpoints, so client data is not server-synced.
- `/demo` is an interactive sample workspace; its sample transactions do not call the API.
- Sign-in and registration use the backend's JWT API.

## API contract and checks

The frontend calls the Go API through Next.js rewrites. The supported endpoints are registration/login, account list/create/detail, deposit, withdrawal, transfers, ledger entries, transaction detail, reconciliation, and `/health`. Amounts are sent as decimal strings and the API assigns USD.

```powershell
corepack yarn test
corepack yarn type-check
corepack yarn build
```

See [backend compatibility and verification](BACKEND_COMPATIBILITY.md) for the request/response contract and integration-test notes.

## Hosting

This is a Next.js server application, so GitHub stores the source but does not run the app. Deploy it to a Node.js host such as Vercel or your own server. Set `API_BASE_URL` on the frontend host to the public backend base URL (for example `https://api.example.com`) and rebuild after changing it. Keep `JWT_SECRET` and database credentials on the backend only. When the frontend and API use different domains, configure the backend's `CORS_ALLOWED_ORIGINS` for the exact frontend origin if you call the API directly; this frontend uses the Next.js proxy by default.

See the backend repository's `DEPLOYMENT.md` for backend deployment details.

## Project and developer links

- Frontend: https://github.com/kundan223/bank-ledger-frontend
- Backend: https://github.com/kundan223/bank-ledger-backend
- LinkedIn: https://www.linkedin.com/in/kundan-yadav-5777a8289/
- X: https://x.com/KundanYada52032
