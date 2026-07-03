# Fududeeye CRM - UI Redesign Prototype Prompt

Use this prompt in Claude Design, Google Stitch, v0, or another UI prototyping
tool. The goal is to create a new visual direction first, confirm it, then
apply the design system across the existing working React app.

## Current Project Status

The active M0-M17 build plan is complete. The backend and frontend are already
connected and working.

- Backend: Django 5, Django REST Framework, session auth, CSRF.
- Frontend: React 19, TypeScript, Vite, React Router v7, TanStack Query v5,
  Tailwind CSS, lucide-react, axios, zod v4, date-fns v4, recharts.
- All main routes are live and call real API endpoints.
- No authenticated frontend pages still use static mock data.
- Current brand colors: deep navy `#1d3480` and amber gold `#f9a800`.
- Current typography: IBM Plex Sans.
- Product type: internal CRM for a brokerage and inventory business in Galkayo,
  Somalia.

Known non-blocking backend gaps are not part of the redesign:

- AuditLog model-level delete guard can be bypassed by QuerySet.delete, but
  admin UI already blocks deletion.
- Audit signal `_pre_save_state` can hold stale entries after failed saves at
  small scale.

## Product Context

Fududeeye is a markup brokerage, not a percentage commission business.

Customers bring items such as electronics, vehicles, furniture, or real estate
and say the price they want. Fududeeye lists the item higher. When the item
sells, the owner receives the locked asking price and Fududeeye keeps the
markup. The CRM tracks:

- Customers
- Inventory and categories
- Consignment owners
- Company-owned stock
- Sales and refunds
- Owner payouts
- Demands, which are customer requests for items not currently available
- Complaints and ticket workflow
- Expenses
- Reports and profit
- Audit log
- Staff users and permissions

Money is always USD. Values from the API are decimal strings and should display
as USD currency.

## Roles

Design should make role restrictions feel clear without making the UI noisy.

- Admin: full access, user management, deletes, audit, finance.
- Manager: finance, reports, payouts, audit, most operations.
- Sales: customers, inventory creation, sales, demands, complaints, but no
  finance or user management.

The frontend hides restricted actions, but the backend enforces permissions.

## Current Routes

Design for an authenticated internal app, not a marketing website.

- `/login`
- `/`
- `/customers`
- `/customers/new`
- `/customers/:id`
- `/items`
- `/items/new`
- `/items/:id`
- `/sales`
- `/sales/new`
- `/sales/:id`
- `/sales/payouts`
- `/demands`
- `/demands/:id`
- `/complaints`
- `/complaints/:id`
- `/expenses`
- `/reports`
- `/reports/sales`
- `/reports/profit`
- `/audit`
- `/users`

## Redesign Objective

Create a polished, modern, operational SaaS design system for the whole CRM.
The design must be reusable across every route. Focus on a quiet, efficient,
work-focused interface instead of a landing-page or decorative dashboard.

The owner wants to review a small prototype first, then reuse the approved
style across the full project.

Design these sample screens:

1. App shell with sidebar and topbar
2. Dashboard page
3. One reusable list page template
4. One reusable create/edit form design
5. One detail page template

The list page should demonstrate cards, search, filters, table, row actions,
empty state, loading state, error state, and pagination.

The form should demonstrate text fields, selects, date fields, money fields,
textarea, segmented controls, validation errors, helper text, disabled state,
primary/secondary buttons, and a sticky or clearly placed action footer.

## Required Screen Details

### 1. App Shell

Design the full authenticated layout.

Include:

- Left sidebar
- Fududeeye brand area with logo placeholder
- Navigation items for Dashboard, Customers, Items, Sales, Demands,
  Complaints, Expenses, Payouts, Reports, Audit log, Users
- Clear active nav state
- Collapsed or compact sidebar behavior idea
- Topbar with global search, quick action button, notification button, and user
  menu
- Role indicator for the signed-in user
- Responsive behavior for tablet and mobile

Avoid a huge hero layout. This is a daily-use CRM.

### 2. Dashboard

Design a live operational dashboard.

Suggested sections:

- KPI cards:
  - Month income
  - Month profit
  - Pending payouts
  - Active items
  - Open demands
  - Open complaints
- Recent sales table
- Pending payout preview
- Demand/supply signal
- Complaint priority preview
- Small chart area for sales or profit

Make it scannable for a business owner checking the system from home or office.

### 3. Reusable List Page Template

Use either Inventory, Sales, Customers, or Complaints as the sample list page.
The preferred sample is Inventory because it has rich filters and status badges.

Include:

- Page title and subtitle
- Primary action button
- Summary cards at top
- Search field
- Filter bar with status, category, owner type, payment method, or role filters
- Sort control
- Data table with compact but readable rows
- Status badges
- Money display
- Row links/actions
- Pagination with previous/next and page count
- Empty state
- Loading skeleton
- Error state

The table should feel dense enough for repeated business use but not cramped.

### 4. Reusable Form Template

Use New Item or New Sale as the sample form.

New Item form requirements:

- Title
- Description
- Category
- Owner type: Company or Consignment
- Owner customer picker when Consignment
- Owner asking price when Consignment
- Cost price when Company
- Listed price
- Quantity
- Condition
- Location
- Category-specific attributes
- Submit as Draft or Active depending on role

New Sale form requirements:

- Item picker
- Buyer picker
- Quantity sold
- Sale price
- Sale date
- Payment method
- Read-only pricing context
- Live preview of owner payout and company profit
- Clear warning that API values are authoritative after save

Design the form so it can be reused for customers, expenses, demands, and
complaints.

### 5. Detail Page Template

Use Sale detail, Item detail, Customer detail, Demand detail, or Complaint
detail as the sample.

Include:

- Back link
- Title and status
- Key metric cards
- Metadata panel
- Related records table
- Activity/notes area
- Primary workflow actions
- Safe destructive action placement

## Component System To Produce

Please produce a reusable component direction, including:

- Sidebar
- Topbar
- Page header
- KPI card
- Filter bar
- Search input
- Select control
- Date field
- Money field
- Text input
- Textarea
- Segmented control
- Toggle or checkbox
- Primary, secondary, subtle, and danger buttons
- Status badge
- Role badge
- Priority badge
- Data table
- Pagination
- Empty state
- Loading skeleton
- Error state
- Modal or drawer
- Form section
- Sticky form action footer
- Detail metadata row
- Toast notification style

Use lucide-style icons for actions and navigation.

## Visual Direction

Keep the Fududeeye identity, but improve the whole UI.

Explore a professional CRM style:

- Calm, trustworthy, fast to scan
- Light mode first
- Strong but restrained brand presence
- Navy and gold may remain, but do not let the whole interface become only
  navy/gold
- Use neutrals, soft borders, and clear hierarchy
- Cards should have 8px radius or less
- Avoid nested cards
- Avoid decorative gradient blobs, orbs, and marketing hero sections
- Avoid oversized typography inside compact panels
- Avoid text-heavy onboarding copy inside the app
- Prefer actual CRM controls over explanatory text
- Make all text fit on desktop and mobile
- Make tables readable on laptop screens
- Use responsive layouts that work at desktop, tablet, and mobile widths

Suggested palette direction:

- Primary navy: `#1d3480`
- Accent gold: `#f9a800`
- Background: very light cool gray
- Surface: white
- Muted surfaces: light blue-gray
- Success: green
- Warning: amber
- Danger: red
- Info: blue

You may propose a refined palette if it keeps brand recognition.

## Data Examples For Mockups

Use realistic Somali names and business data.

Customers:

- Axmed Aweys
- Hodan Maxamuud
- Maryan Faarax
- Yuusuf Cali
- Cabdiraxmaan Nuur

Inventory:

- HP EliteBook 840 G8
- Toyota Vitz 2016
- Office chairs set
- Samsung Galaxy S23
- Two-bedroom apartment

Statuses:

- Draft
- Active
- Reserved
- Sold
- Completed
- Refunded
- Withdrawn
- Open
- Matched
- Fulfilled
- Dropped
- In progress
- Resolved
- Closed
- Pending
- Paid

Money examples:

- Listed price: `$620.00`
- Owner asking price: `$500.00`
- Company profit: `$120.00`
- Pending payout: `$200.00`
- Monthly profit: `$5,180.00`

Payment methods:

- Cash
- EVC Plus
- Zaad
- Bank Transfer
- Other

## Deliverables

Return a design prototype with:

1. Desktop screens for:
   - App shell + dashboard
   - Inventory or sales list page
   - Create/edit form
   - Detail page
2. Mobile or narrow responsive examples for:
   - Sidebar/top navigation
   - List filters
   - Form layout
3. Design tokens:
   - Colors
   - Typography
   - Spacing
   - Radius
   - Shadows
   - Border colors
   - Badge colors
4. Component inventory with names and states
5. Notes explaining how the same components apply to every CRM route

Do not generate a public landing page. Do not redesign the business model. Do
not introduce features that require new backend models.

## Implementation Notes For The Developer

After the design is approved, the React implementation should update:

- `frontend/src/index.css`
- `frontend/tailwind.config.ts`
- `frontend/src/components/Layout.tsx`
- `frontend/src/components/DataTable.tsx`
- `frontend/src/components/StatusBadge.tsx`
- `frontend/src/components/MoneyDisplay.tsx` if needed
- Shared page header/filter/form components if created
- Existing pages under `frontend/src/pages/`

Keep all API modules, auth behavior, permissions, and backend contracts intact.
This is a visual and interaction redesign, not a backend rebuild.

## Prompt To Paste Into Claude Design Or Google Stitch

Copy everything below this line into the design tool.

```text
Design a modern internal CRM interface for Fududeeye, a brokerage and inventory
business in Galkayo, Somalia. This is a working operational app, not a
marketing site.

The CRM tracks customers, consignment inventory, company-owned inventory, sales,
refunds, owner payouts, customer demands, complaints, expenses, reports, audit
logs, and staff users. Fududeeye earns markup: an owner asks for a locked price,
Fududeeye sells higher, the owner receives the locked asking price, and
Fududeeye keeps the difference. Money is USD.

Create a new reusable UI design system for the whole CRM. Keep the Fududeeye
brand recognizable with deep navy #1d3480 and amber gold #f9a800, but refine
the palette so the interface is calm, professional, and easy to scan. Use a
light operational SaaS style with neutral surfaces, soft borders, clear status
colors, compact tables, and strong hierarchy. Avoid marketing hero sections,
gradient blobs, oversized decorative cards, and one-note navy/gold screens.

Design these screens:

1. Authenticated app shell with left sidebar and topbar.
2. Dashboard page with KPI cards, recent sales, pending payouts, demand/supply
   signals, complaint priority preview, and a small chart.
3. Inventory list page as a reusable list template with summary cards, search,
   filters, sort, table, row actions, status badges, empty state, loading
   skeleton, error state, and pagination.
4. New Item form as a reusable form template with sections, category picker,
   owner type segmented control, conditional consignment/company price fields,
   money fields, date/select/text/textarea controls, validation errors, helper
   text, and sticky action footer.
5. Item or Sale detail page template with back link, title/status, metric cards,
   metadata panel, related records table, notes/activity area, and workflow
   actions.

Navigation routes to represent in the sidebar:
Dashboard, Customers, Items, Sales, Demands, Complaints, Expenses, Payouts,
Reports, Audit log, Users.

Roles:
Admin has full access. Manager can view finance, reports, payouts, and audit.
Sales can work with customers, inventory, sales, demands, and complaints but
cannot view finance or manage users. Show restricted navigation/actions
cleanly.

Use realistic data examples:
Customers: Axmed Aweys, Hodan Maxamuud, Maryan Faarax, Yuusuf Cali.
Items: HP EliteBook 840 G8, Toyota Vitz 2016, Office chairs set, Samsung Galaxy
S23, Two-bedroom apartment.
Statuses: Draft, Active, Reserved, Sold, Completed, Refunded, Withdrawn, Open,
Matched, Fulfilled, Dropped, In progress, Resolved, Closed, Pending, Paid.
Payments: Cash, EVC Plus, Zaad, Bank Transfer, Other.
Money examples: $620.00 listed price, $500.00 owner asking price, $120.00
company profit, $200.00 pending payout, $5,180.00 monthly profit.

Produce desktop and responsive mobile examples. Include design tokens for
colors, typography, spacing, radii, shadows, borders, and badge colors. Include
a component inventory for sidebar, topbar, page header, KPI card, filter bar,
inputs, selects, date fields, money fields, textareas, segmented controls,
buttons, badges, data table, pagination, empty state, loading skeleton, error
state, modal/drawer, form section, sticky action footer, detail metadata row,
and toast notifications.

The result should be directly usable by a React developer to restyle an
existing React 19 + TypeScript + Vite app. Do not add backend-only features or
new data models.
```
