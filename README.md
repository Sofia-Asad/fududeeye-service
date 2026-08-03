# Fududeeye

A brokerage-mediated public marketplace and role-based CRM for **Fududeeye**, a consignment and inventory brokerage in Galkayo, Somalia.

Fududeeye connects people who want to sell second-hand goods, real estate, and vehicles with people who want to buy them — but unlike a plain classifieds board, nothing reaches the public site until staff verify it, and every transaction is staff-mediated end to end.

## Table of Contents

- [What This System Does](#what-this-system-does)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Core Modules](#core-modules)
- [Roles & Permissions](#roles--permissions)
- [Core Business Logic](#core-business-logic)
- [Getting Started](#getting-started)
- [Testing](#testing)
- [Known Limitations](#known-limitations)
- [Team](#team)

## What This System Does

Fududeeye supports two ownership models side by side:

- **Company stock** — Fududeeye buys inventory outright and earns the difference between cost price and sale price.
- **Consignment** — a customer brings an item and names an asking price. Fududeeye markets it, and on sale pays the owner that exact price while keeping the markup as profit.

Every action taken in the system — every create, update, and delete — is written to an immutable audit log that cannot be edited or deleted, not even by an Admin account.

## Key Features

- **Staff-mediated marketplace** — the public site only ever shows items staff have explicitly approved; there's no self-serve listing.
- **Dual ownership accounting** — company-stock and consignment items are tracked and paid out differently, computed once at time of sale and never silently recalculated.
- **Immutable audit log** — every create/update/delete is logged at the database level; the log itself cannot be edited or deleted by any role.
- **Role-based permissions** — Admin / Manager / Sales roles gate not just UI visibility but actual API-level access to sensitive fields like cost price and profit.
- **Demand matching** — customer want-lists are matched live against current inventory, and a sale automatically fulfills a matched demand.
- **Lead-to-customer pipeline** — public marketplace inquiries convert into real CRM customer records with one action.

## Architecture

```
fududeeye/
├── backend/          Django REST Framework API — the single source of truth
├── frontend/         Internal Brokerage CRM (staff only, session-authenticated)
└── marketplace/      Public marketplace (anonymous browsing, no account needed)
```

Both frontends are independent React single-page applications that talk to the same Django REST API. There is exactly one integration point between the public and staff-facing halves of the system: the `Item.status` field. The public API only ever returns items where `status = ACTIVE`. There is no separate publish step — changing an item's status inside the CRM instantly changes what the public site shows.

In development, the marketplace's Vite dev server reverse-proxies `/crm/*` to the CRM's own dev server, so both apps appear to live at one origin.

## Tech Stack

**Backend**
- Python 3.13
- Django 5.1+ · Django REST Framework 3.15+
- Session-cookie authentication with a custom `User` model (`role`: Admin / Manager / Sales)
- django-filter, django-cors-headers, Pillow
- SQLite (development) → PostgreSQL via psycopg2 (production), same Django ORM models, environment-driven config via python-decouple

**Frontend (both apps)**
- React 19 + TypeScript, built with Vite
- TanStack Query 5 (data fetching/caching)
- React Router 7 (routing)
- React Hook Form 7 + Zod 4 (forms/validation)
- Recharts 3 (CRM dashboard charts)
- Axios (HTTP client)
- Styling: Tailwind CSS 3.4 + class-variance-authority (marketplace); hand-authored CSS custom properties (CRM)

## Core Modules

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

## Roles & Permissions

| Capability | Sales Staff | Manager | Admin |
|---|---|---|---|
| View records | ✅ | ✅ | ✅ |
| Create item (Draft only vs. publish) | Draft only | Publish directly | Publish directly |
| Edit any record | Own records only | Any | Any |
| View cost price / profit / payout figures | ❌ | ✅ | ✅ |
| Mark payout paid | ❌ | ✅ | ✅ |
| Manage staff accounts | ❌ | ❌ | ✅ |
| Hard-delete a record | ❌ | ❌ | ✅ (rare) |

## Core Business Logic

```
Consignment:
  owner_payout   = owner_asking_price × quantity_sold
  company_profit = sale_price − owner_payout

Company stock:
  owner_payout   = 0
  company_profit = sale_price − (cost_price × quantity_sold)
```

Both are computed once, in the backend, at the moment a sale is created, and are never recalculated afterward.

## Getting Started

### Prerequisites
- Python 3.13+
- Node.js 20+ and npm

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

## Testing

```bash
cd backend
pytest
```

The backend test suite covers all ten apps — `accounts`, `complaints`, `core`, `customers`, `demands`, `finance`, `inventory`, `marketplace`, `reports`, `sales` — with roughly 3,160 lines of test code exercising permission rules, model validation, and API behaviour.

Current status:

| Check | Result |
|---|---|
| Automated backend tests | 177 / 177 passed |
| `python manage.py check` | 0 issues |
| Migrations | No pending or missing migrations |
| CRM frontend type-check | 0 errors |
| Marketplace frontend type-check | 0 errors |
| Production build, both frontends | Succeed cleanly |

## Known Limitations

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

Supervisor: Ibrahim Mohamud Abdirihman
