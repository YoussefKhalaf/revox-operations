# REVOX Operations

Internal operations and financial tracking system for REVOX. This application is separate from the Revox OS SaaS product and is intentionally small in scope.

## Product purpose

REVOX Operations helps the REVOX team record apartment revenues, operating expenses, cash advances, and team activity in one secure internal system. Amounts are tracked in **EGP** only.

## Completed MVP modules

- Authentication and role-aware access
- Operation Team management
- Apartments management
- Revenue and expense entry
- Cash advances, returned amounts, and expense-to-advance linking
- Real Admin and Operation dashboards with database-backed financial analysis

## Admin capabilities

- Dashboard with period filter, apartment performance, and monthly performance
- Manage apartments, revenues, expenses, cash advances, and operation team members
- Record advance returns and link expenses to advances
- View outstanding advance balances and operating profit/loss

## Operation capabilities

- Personal dashboard with current-month expenses and advance balances
- View active apartments
- Record and review own expenses
- View own cash advances
- Optionally link new expenses to open advances

## Roles and access

| Role | Access |
|------|--------|
| `admin` | Dashboard, Apartments, Income & Expenses, Cash Advances, Operation Team |
| `operation` | Dashboard, Apartments, My Expenses, My Cash Advances |

Role information always comes from `public.profiles` on the server. Operation access also requires an active linked `operation_members` record.

## Environment variables

Configure these in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Do not commit `.env.local`. No service-role key belongs in application code or Git.

## Database migrations

Apply in order through the linked Supabase workflow or SQL editor:

1. `001_initial_schema.sql` — tables, views, RLS, base helpers
2. `002_enforce_active_operation_member.sql` — active linked Operation member enforcement
3. `003_cash_advance_integrity.sql` — capacity triggers and authenticated DELETE removal
4. `004_dashboard_analysis.sql` — dashboard aggregation functions
5. `005_admin_delete_records.sql` — secure admin and operation delete functions

## Database setup workflow

1. Install dependencies with `npm install`
2. Copy `.env.example` to `.env.local`
3. Fill in the Supabase environment variables
4. Apply migrations `001` through `004` to the connected project
5. Create Auth users manually in Supabase
6. Promote the first admin profile in `public.profiles`

## Core profit formula

```text
Net Profit = Recorded Apartment Revenue − Recorded Apartment Expenses
```

## Cash-advance balance formula

```text
Remaining Balance = Issued Amount − Linked Expenses − Returned Amounts
```

Issuing a cash advance is **not** an apartment expense.

Returning unused advance money is **not** revenue.

Only recorded expense rows affect apartment expenses and dashboard expense totals.

## Local run commands

```bash
npm install
npm run dev
```

## Validation commands

```bash
npm run lint
npm run build
```

## Current limitations

- No receipt upload
- No owners, bookings, guests, reservations, housekeeping, or maintenance workflows
- No multi-currency support
- No advanced accounting, taxes, commissions, or owner payouts
- No exports, notifications, or external integrations

## Deployment

- **Live app:** https://revox-operations.vercel.app
- **Source code:** https://github.com/YoussefKhalaf/revox-operations (public)

The live URL is publicly reachable, but all business data requires sign-in. Configure production environment variables on Vercel:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Supabase Auth must allow the production site URL and redirect URLs for the Vercel domain.

## Tech stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- Supabase (`@supabase/supabase-js`, `@supabase/ssr`)
