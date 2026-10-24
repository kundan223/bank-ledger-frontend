# Verified backend compatibility

Backend: https://github.com/kundan223/BANK-DOUBLE-LEDGER

Verified source commit: `18f990e6b97b67c9a4131f5ce4e03fc2dfc03e33` (23 October 2026).

The source checkout is in `../backend-reference`. Its Go source was built unchanged and tested with its own migrations in a separate local PostgreSQL database. HTTP integration checks ran through the Next.js frontend proxy, not directly against a replacement/mock backend.

## Contract used by this frontend

| Feature | Request | Response |
| --- | --- | --- |
| Register | `POST /register` with `{email,password}` | `{user_id,email,token}` |
| Login | `POST /login` with `{email,password}` | `{token}` |
| List accounts | `GET /accounts` | `AccountResponse[]` |
| Create account | `POST /accounts` with `{name}` | `AccountResponse` (USD assigned by backend) |
| Account detail | `GET /accounts/:id` | `AccountResponse` |
| Deposit | `POST /accounts/:id/deposit` with `{amount:"100.1234"}` | `{message}` |
| Withdraw | `POST /accounts/:id/withdraw` with `{amount:"0.0001"}` | `{message}` |
| Transfer | `POST /transfers` with `{from_id,to_id,amount}` | `{message}` |
| History | `GET /accounts/:id/entries?limit=100&offset=0` | `EntryResponse[]` |
| Transaction detail | `GET /transactions/:id` | Both ledger entries |
| Reconcile | `GET /accounts/:id/reconcile` | `{matched,message}` |
| Health | `GET /health` | `{status,uptime,version}` |

Source of truth: `cmd/main.go`, `internal/api/handler.go`, `internal/api/dto.go`, `internal/service/ledger.go`, and `postgres/migrations` in the backend repository.

Protected endpoints receive `Authorization: Bearer <JWT>`. The frontend route guard only handles pages; API authentication/errors are left to the Go backend. Optional account `owner_id` and entry `description` match the backend DTOs.

## Corrections from the first frontend version

- Withdrawal entry filters use `withdrawal`, matching the Go operation enum. The HTTP path remains `/withdraw`.
- Fetch history in 100-entry pages until exhausted; do not silently omit entries after the server's default 20.
- Preserve payment amounts as strings and use scaled integer arithmetic for account totals and demo balances. Inputs and displays support four decimal places, matching `NUMERIC(19,4)`.
- Transfers accept a recipient UUID, including accounts owned by other users. Only the source account must appear in the sender's list.
- Dashboard external money-in/out totals exclude transfers. The movement chart still shows account debits/credits.
- `/` opens the authenticated workspace through `/auth`; `/demo` is an explicitly separate sample workspace.
- Remove the original frontend's unrelated hosted-API fallback. Use `API_BASE_URL` on the Next.js server, with `NEXT_PUBLIC_API_BASE_URL` supported for older configurations.

## Validation

`node --test tests/api-contract.test.cjs`: four passing tests covering exact amounts, request fields and authentication, multi-page loading, and expired sessions.

`TEST_FRONTEND_URL=http://localhost:3000 node scripts/verify-backend.cjs` (set the variable using your shell's syntax): passed against the actual backend with a disposable local database. The test creates users/accounts and performs mock ledger operations; run it only on a disposable test database.

Verified registration/login, USD account creation and account lookup, a `100.1234` deposit, a `0.0001` withdrawal, a `3.0001` transfer to another user's account, exact resulting balances, insufficient-funds rejection, ownership rejection, matching debit/credit transaction legs, 104-entry history across multiple pages, and reconciliation for both accounts.

Client contacts and notes remain browser-local: the supplied backend has no CRM endpoints. They do not pretend to be server-synced records. No invoices, payroll posting, or other unsupported API operations were added.
