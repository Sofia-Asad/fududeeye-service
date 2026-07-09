# Fududeeye

A brokerage-mediated public marketplace and role-based Customer Relationship Management (CRM) system, built for Fududeeye, a consignment and inventory brokerage in Galkayo, Somalia.

Fududeeye connects people who want to sell second-hand goods, real estate, and vehicles with people who want to buy them — but unlike a plain classifieds board, nothing reaches the public site until staff verify it, and every transaction is staff-mediated end to end.

## What this system does

Fududeeye supports two ownership models side by side:

- **Company stock** — Fududeeye buys inventory outright and earns the difference between cost price and sale price.
- **Consignment** — a customer brings an item and names an asking price. Fududeeye markets it, and on sale pays the owner that exact price while keeping the markup as profit.

Every action taken in the system — every create, update, and delete — is written to an immutable audit log that cannot be edited or deleted, not even by an Admin account.

## Project structure

```
fududeeye/
├── backend/          Django REST Framework API — the single source of truth
├── frontend/         Internal Brokerage CRM (staff only, session-authenticated)
├── marketplace/       Public marketplace (anonymous browsing, no account needed)
└── design_handoff_fududeeye_redesign/   Design reference files
```

Both frontends are independent React single-page applications that talk to the same Django REST API. There is one integration point between the public and staff-facing halves of the system: an `Item.status` field. The public API only ever returns items where `status = ACTIVE`. There is no separate publish step — changing an item's status inside the CRM instantly changes what the public site shows.

## Tech stack

**Backend**
- Python 3.13
- Django 5.1 + Django REST Framework 3.15
- Session-cookie authentication with a custom `User` model (`role`: Admin / Manager / Sales)
- django-filter, django-cors-headers, Pillow
- SQLite (development) → PostgreSQL via psycopg2 (production), same Django ORM models, environment-driven config via python-decouple

**Frontend (both apps)**
- React 19.2 + TypeScript, built with Vite 8
- TanStack Query 5 (data fetching/caching)
- React Router 7 (routing)
- React Hook Form 7 + Zod 4 (forms/validation)
- Recharts 3 (CRM dashboard charts)
- Axios (HTTP client)
- Styling: Tailwind CSS 3.4 + class-variance-authority (marketplace); hand-authored CSS custom properties (CRM)

## Core modules

| Module | What it does |
|---|---|
| Dashboard | Manager/Admin only. Income vs. profit trend, inventory mix, pending payouts, recent sales |
| Customer Directory | Unified record for buyers, sellers, and consignment owners |
| Inventory | Category-driven item forms, image management, Draft/Active visibility control |
| Sales | Records a transaction, auto-computes payout/profit, supports "mark paid" for consignment payouts |
| Demands | Customer want-lists with live matching against current inventory |
| Complaints | Auto-numbered tickets (`TKT-00001`) with priority, status, and assignment |
| Inquiries | The bridge from the anonymous marketplace into the CRM — a "Convert" action turns a lead into a real Customer |
| Finance | Expense tracking and pending-payout queue |
| Reports | Sales/profit/expense breakdowns, demand-vs-supply, audit log viewer |
| User Management | Admin-only. Staff accounts are deactivated, never hard-deleted |

## Roles and permissions

| Capability | Sales Staff | Manager | Admin |
|---|---|---|---|
| View records | ✅ | ✅ | ✅ |
| Create item (Draft only vs. publish) | Draft only | Publish directly | Publish directly |
| Edit any record | Own records only | Any | Any |
| View cost price / profit / payout figures | ❌ | ✅ | ✅ |
| Mark payout paid | ❌ | ✅ | ✅ |
| Manage staff accounts | ❌ | ❌ | ✅ |
| Hard-delete a record | ❌ | ❌ | ✅ (rare) |

## Core business logic

```
Consignment:
  owner_payout   = owner_asking_price × quantity_sold
  company_profit = sale_price − owner_payout

Company stock:
  owner_payout   = 0
  company_profit = sale_price − (cost_price × quantity_sold)
```

Both are computed once, in the backend, at the moment a sale is created, and are never recalculated afterward.

## Getting started

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver        # http://localhost:8000
```

### Staff CRM

```bash
cd frontend
npm install
cp .env.example .env             # VITE_API_BASE_URL=http://localhost:8000/api/v1
npm run dev                       # http://localhost:5173
```

### Public Marketplace

```bash
cd marketplace
npm install
cp .env.example .env
npm run dev                       # http://localhost:5174
```

In development, the CRM is reverse-proxied under `/crm/*` behind the marketplace's dev server, so both apps appear to live at one origin.

## Testing

```bash
cd backend
pytest
```

The backend test suite covers all nine apps — `accounts`, `customers`, `inventory`, `sales`, `demands`, `complaints`, `finance`, `marketplace`, `reports` — with roughly 2,450 lines of test code exercising permission rules, model validation, and API behaviour.

Current status:

| Check | Result |
|---|---|
| Automated backend tests | 133 / 133 passed |
| `python manage.py check` | 0 issues |
| Migrations | No pending or missing migrations |
| CRM frontend type-check | 0 errors |
| Marketplace frontend type-check | 0 errors |
| Production build, both frontends | Succeed cleanly |

## Known limitations

- No online payment processing — all payments (cash, EVC Plus, Zaad, bank transfer) are settled off-platform and recorded manually.
- No buyer accounts on the public marketplace — a deliberate design choice, not a gap, since every serious transaction is routed through staff.
- Single currency (USD) and English-only interface.
- No native mobile app; no automated image-based item verification.

## Team

- Sofia Asad Abdukadir
- Fatima Ahmed Jama
- Deka Mohamud Abdi
- Emaan Abirixman Omar

East Africa University, Galkacyo Campus — Faculty of Information Science and Technology, Department of Computer Science.

Supervisor: ibrahim Mohamud Abdirihman
