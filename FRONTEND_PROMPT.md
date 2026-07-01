# Fududeeye CRM — Frontend Spec

> **For Claude Code / Codex:** This is the spec for the React frontend. Read
> `../SYSTEM_DESIGN.md` first to understand the business model and data shapes;
> this document covers the frontend only.

## Stack

- React 18 + TypeScript, Vite
- React Router v6
- TanStack Query (React Query) v5
- Tailwind CSS + shadcn/ui + lucide-react
- react-hook-form + zod
- axios (one shared instance)
- date-fns, recharts

No Redux. No Next.js.

## Project structure

```
frontend/
├── src/
│   ├── api/             axios client + per-resource modules (customers, items, sales, …)
│   ├── types/models.ts  TS interfaces matching backend serializers
│   ├── auth/            AuthContext, ProtectedRoute
│   ├── components/
│   │   ├── ui/          shadcn primitives
│   │   ├── layout/      AppShell, Sidebar, TopBar
│   │   ├── DataTable.tsx
│   │   ├── MoneyDisplay.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── PermissionGate.tsx
│   │   └── ConfirmDialog.tsx
│   ├── pages/           one folder per route group
│   ├── lib/             permissions.ts, format.ts, csrf.ts
│   ├── App.tsx          router + providers
│   └── main.tsx
├── index.html
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
└── package.json
```

## Auth & API

- Django session auth + CSRF. `axios.defaults.withCredentials = true`.
- On load: `GET /api/v1/me/`. 401 → `/login`. 200 → hydrate AuthContext.
- Login: `POST /api/v1/auth/login/` with `{username, password}`.
- Logout: `POST /api/v1/auth/logout/`.
- For every non-GET request, read cookie `csrftoken`, set header `X-CSRFToken`.
- API base from `import.meta.env.VITE_API_BASE_URL`.

## Routes

| Route                    | Page                       |
|--------------------------|----------------------------|
| `/login`                 | Login                      |
| `/`                      | Dashboard                  |
| `/customers`             | Customers list             |
| `/customers/new`         | New customer               |
| `/customers/:id`         | Customer detail (tabs)     |
| `/items`                 | Items list                 |
| `/items/new`             | New item (category drives extra fields) |
| `/items/:id`             | Item detail                |
| `/sales`                 | Sales list                 |
| `/sales/new`             | New sale (live profit calc)|
| `/sales/:id`             | Sale detail                |
| `/sales/payouts`         | Pending payouts            |
| `/demands`               | Demands list               |
| `/demands/:id`           | Demand detail              |
| `/complaints`            | Complaints (tickets)       |
| `/complaints/:id`        | Ticket detail              |
| `/expenses`              | Expenses (Admin/Manager)   |
| `/reports`               | Reports landing            |
| `/reports/sales`         | Sales report               |
| `/reports/profit`        | Profit report              |
| `/audit`                 | Audit log viewer           |
| `/users`                 | Users (Admin only)         |

## Permission-aware UI

Wrap restricted UI in `<PermissionGate role="ADMIN">…</PermissionGate>`.
Helper hooks: `useCanViewFinance()`, `useCanEdit(record)`, `useCanDelete()`.
The backend enforces the same rules — UI just hides actions the user can't take.

## Key form behaviors

- **New item form** — picking a category changes which extra fields render
  (real estate → bedrooms / sqm / rent vs sale; vehicle → make / model / year /
  mileage; electronics → brand / model). Picking `owner_type=CONSIGNMENT` shows
  Customer picker + `owner_asking_price` and hides `cost_price`. Picking COMPANY
  does the reverse.
- **New sale form** — picking an item shows its `listed_price` and the relevant
  base price (asking or cost) as read-only context. As user types `sale_price`
  and `quantity_sold`, show live-calculated `owner_payout` and `company_profit`.
  Authoritative values come from the server after save.
- **Refund form** — opens from a Sale's detail; pre-fills the sale link; asks
  amount (default = full sale price), reason, refund method, and whether item
  was returned.

## Visual style

Driven by the mockups produced from `DESIGN_PROMPT.md`. Once chosen, paste the
palette and typography into a "Visual style — locked" section at the bottom of
this file, and update `tailwind.config.ts` to match.

Until locked: gray-50 background, gray-900 text, one accent color for primary
actions, generous whitespace, dense tables with subtle dividers.

## Things to avoid

- Don't put authoritative business calculations on the frontend — the backend is
  the source of truth. The new-sale form may *preview* profit math, but the
  numbers shown after save come from the API response.
- Don't use JS floats for money. Treat amounts as strings; format with
  `Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })`.
- Don't bypass `PermissionGate`. Keep the rules auditable in one place.
- Don't introduce a new state library or CSS framework.