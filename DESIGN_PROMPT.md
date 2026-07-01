# Fududeeye CRM — UI Design Brief

Generate UI mockups for an internal web CRM. Produce **three style variants** of the
**dashboard** side by side so the team can compare, then mock up the other listed
screens in the chosen style.

## What this CRM is

An internal tool for **Fududeeye**, a brokerage and inventory company in Galkayo,
Somalia. Used by the owner and a small staff team on desktops and mid-range Android
phones.

The business is a **markup brokerage**:
- Customers bring goods (computers, sofas, cars, houses, land) and lock an asking
  price (e.g. "I want $200 for this computer").
- Fududeeye lists those goods at a higher price ($230) and keeps the difference ($30)
  as profit when sold.
- They also sell some inventory they own outright.
- They track customer requests ("I am looking for a fridge") and match them to supply.

This is **not a consumer app**. It must feel **trustworthy and calm** because it tracks
real money. Think "a small bank's internal back office" or "an inventory operations
console" — not a social or marketing site.

## Users

- **Owner** — opens it from home, wants glanceable numbers and a short list of things
  needing attention (pending payouts, open complaints, customer requests).
- **Sales staff** — records sales, creates listings, looks up customer phone numbers
  all day. Needs fast keyboard-friendly forms.
- **Manager** — same as staff plus expenses and reports.

## Constraints

- **English** UI only. Type scale should accommodate slightly longer Somali strings later.
- **USD** currency, displayed as `$1,234.56`.
- **Desktop-first** but **must work on Android phones (375–390px wide)**. Tables collapse
  to card layouts on narrow screens.
- **Bandwidth-aware** — Galkayo internet can be slow. Avoid heavy imagery and large
  icon sets. System font or one variable font.
- Use **lucide-react** style icons only. No emoji in UI.

## Three style variants — produce all three for the dashboard

Generate the same Dashboard screen in each of these directions, side by side:

**Variant A — "Calm and clinical."**
Inspired by Linear and Vercel. Near-monochrome (slate / gray) with one accent color
(deep blue or teal). Modern sans-serif (Inter or Geist). Tight typography, generous
whitespace, subtle dividers, no harsh borders. Feels precise.

**Variant B — "Warm professional."**
Inspired by Notion and Pipedrive. Off-white background, warmer grays, an accent
leaning amber or terracotta. Slightly larger touch targets, friendlier rounded
corners. Feels approachable, not corporate.

**Variant C — "Solid and trusted."**
Inspired by traditional banking dashboards (Mercury, Stripe's back office). Saturated
navy or forest-green primary on white surface, real shadows, strong typographic
hierarchy with one display weight for KPI numbers. Feels conservative and reliable.

**Do not include in any variant:** gradients on data, neon, glassmorphism, cartoon
illustrations, stock photos, hero images, more than one accent color, "AI futuristic"
aesthetics.

## Screens to produce

### 1. Dashboard — produce in all three variants
The owner's home page. Layout:
- **Sidebar (left):** logo at top, then nav — Dashboard, Customers, Items, Sales,
  Demands, Complaints, Expenses, Reports, Audit log, Users. Collapses to icons.
- **Top bar:** global search, "+ New" dropdown (new sale, item, customer, demand),
  current user menu.
- **Top row — five KPI cards:**
  1. Sales today — count + dollar revenue
  2. Profit today — dollar amount
  3. Pending payouts — total $ owed to consignment owners
  4. Open complaints — count
  5. Open demands — count
- **Second row — two charts side by side:**
  - Revenue last 7 days (line chart)
  - Top 5 categories by demand (horizontal bar chart)
- **Three tables stacked below:**
  - Recent sales (last 10): item, buyer, sale price, profit, date, staff
  - Pending payouts grouped by customer: customer name, total $ owed, # of items,
    days waiting, "Mark paid" button per row
  - Open demands without matches: customer, what they want, target price, age

Also produce the dashboard at **375px width** for each variant to show the
responsive collapse.

### 2. Items list — produce in chosen variant only
Dense data table. Columns: thumbnail, title, category, owner type badge
(Company / Consignment), owner name (or em-dash), listed price, qty available,
status colored badge (Draft / Active / Reserved / Sold / Completed / Refunded /
Withdrawn), created date. Left-side filters: status, category, owner type.
Search box. "+ New item" button top right.

### 3. New sale form — produce in chosen variant only
Two-column layout.
- **Left column — form fields:** pick item (combobox showing thumbnail + title +
  remaining quantity), pick buyer (combobox with phone), quantity, sale price (USD),
  sale date, payment method (Cash / EVC Plus / Zaad / Bank Transfer / Other), staff
  handled (defaults to current user), notes.
- **Right column — live summary panel that updates as user types:**
  - Item's listed price
  - Owner asking price (consignment) OR cost price (company-owned)
  - **Owner payout** — calculated, highlighted
  - **Company profit** — calculated, highlighted as the most prominent number
- Sticky "Save sale" button at bottom.

### 4. Customer detail — produce in chosen variant only
- **Header:** customer name, phone, badges (Active, Buyer, Seller), edit button.
- **Tabs below:** Profile, Items Owned (consignment), Purchases, Demands, Complaints.
- Each tab renders a small filtered data table.

### 5. Pending payouts — produce in chosen variant only
A list grouped by customer. Each group shows: customer name + phone, total $ owed,
and one row per unpaid sale (item title, sale date, amount, days waiting). Each row
has a "Mark paid" button. Each group has "Mark all paid". Clicking opens a dialog
asking for payout method (Cash / EVC Plus / Zaad / Bank Transfer) and payout date.

## Deliverables

For **each of the three variants**, give back:
1. Dashboard mockup at desktop width (≥1440px).
2. Dashboard mockup at mobile width (375–390px).
3. A **color and typography spec card** showing:
   - Colors: primary, accent, success, warning, danger, surface, background,
     text-primary, text-muted, divider, success-bg, danger-bg.
   - Type scale: display, h1, h2, h3, body, small — with font family and weights.
   - Border radius scale and shadow scale used.

For the **chosen variant only**, then produce the four other screens above
(Items list, New sale form, Customer detail, Pending payouts) at desktop width.