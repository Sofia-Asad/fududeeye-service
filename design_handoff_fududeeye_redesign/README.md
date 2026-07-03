# Handoff: Fududeeye CRM UI Redesign ("Forest Light")

## Overview
Full visual redesign of the Fududeeye internal CRM — a markup-brokerage & inventory business in Galkayo, Somalia. Customers consign items at a locked asking price; Fududeeye lists higher and keeps the markup. This package restyles the existing working app (Django REST backend + React 19 frontend). **Visual/interaction redesign only — keep all API modules, auth, permissions, and backend contracts intact.**

## About the Design Files
`Fududeeye Redesign.dc.html` is a **design reference created in HTML** — a prototype canvas showing intended look and behavior, not production code. Recreate these designs in the existing codebase: **React 19 + TypeScript + Vite + Tailwind CSS + lucide-react + TanStack Query v5 + React Router v7 + recharts**. Use Tailwind utilities/config tokens, not the inline styles from the prototype.

## Fidelity
**High-fidelity.** Colors, typography, spacing, radii, and copy are final intent. Recreate pixel-close using Tailwind.

## Files to update (as scoped by the owner)
- `frontend/src/index.css` — font imports, CSS vars
- `frontend/tailwind.config.ts` — token mapping below
- `frontend/src/components/Layout.tsx` — new sidebar + page header
- `frontend/src/components/DataTable.tsx`, `StatusBadge.tsx`, `MoneyDisplay.tsx`
- New shared components: `PageHeader`, `SummaryCard`, `DirectoryCard` (search+filter toolbar above table), `FormSection`, `ActionFooter`, `DetailMeta`, `ActivityFeed`
- Existing pages under `frontend/src/pages/`

## Design Tokens

### Colors (add to tailwind.config.ts)
| Token | Hex | Use |
|---|---|---|
| primary | #17795C | Primary buttons, links, active states |
| primary-hover | #136A50 | Button hover |
| primary-soft | #E6F1EA | Active nav bg, success badge bg, chips |
| primary-deep | #1C4A3C | Login left panel / marketing surfaces only |
| accent | #E8A33D | Chart secondary line, highlights |
| canvas | #F6F4ED | Page background |
| sidebar | #FBFAF5 | Sidebar background |
| surface | #FFFFFF | Cards, inputs |
| border | #ECEADF | Card borders |
| border-strong | #E5E1D3 | Input/button borders |
| row-line | #F3F1E8 | Table row dividers |
| thead-bg | #FAF9F4 | Table header row bg |
| text | #22302A | Primary text |
| text-mid | #3C4A42 | Secondary text |
| text-muted | #75806F | Captions, labels |
| text-faint | #9AA294 | Placeholders, table headers |
| success | #17795C on #E6F1EA | Active, Paid, Resolved, Matched, Fulfilled, Completed |
| warning | #B07818 on #FAF1DE | Pending, Open, Draft, Consignment tag |
| info | #3D5AA8 on #E8EDF6 | Reserved, In progress, Buyer tag |
| danger | #C2482F on #FBEAE4 | Refunded, High priority, Overdue; money-owed text #B2401F |
| neutral | #75806F on #EFEDE4 | Sold, Closed, Withdrawn, Dropped |

### Typography
- **UI font:** Jost (Google Fonts) 400/500/600 — body 13.5px, field labels 13px, captions 11–12.5px
- **Display/money font:** Source Serif 4 (Google Fonts) 600 — all money values, KPI numbers, page titles
- Page title: serif 29–31px · Card title: 15.5–17px/600 · Section eyebrow labels: 10–11px/600, letter-spacing .12–.16em, uppercase, text-muted
- Money always USD, always serif, 2 decimals in tables/forms ("$1,250.00"); KPI cards may abbreviate ("$18,420")

### Spacing / shape / depth
- Card radius **16px**, inputs & buttons **10px**, badges **999px**, sidebar item **10px**
- Control heights: inputs/buttons 42–44px desktop, 46px mobile footer buttons
- Card padding 16–20px; page gutter 32px; grid gaps 16px
- Shadow: cards `0 1px 2px rgba(34,48,42,.03)`; primary button `0 1px 2px rgba(23,121,92,.3)`
- No nested cards. No gradients.

## App Shell (Layout.tsx)
- **Sidebar 256px**, bg sidebar (#FBFAF5), right border #E9E6DA. Brand row: 38px green (#17795C) rounded-11px square with lucide `store` icon, "Fududeeye" 17px/600 + "BROKERAGE CRM" letterspaced caption.
- Nav grouped under eyebrow labels: OVERVIEW (Dashboard) · MANAGE (Customers, Items, Sales, Demands, Complaints) · MONEY (Expenses, Payouts) · INSIGHTS (Reports, Audit log, Users). Nav column is `flex-1` with `justify-content:space-between` so it **fills the full height** (no dead gap).
- Item: 14px text, icon 17px (lucide, muted). Active: bg #E6F1EA, text #136A50, weight 600. Hover: bg #F0EEE3.
- Count badges right-aligned: Demands (primary-soft/green), Complaints (danger-soft/red).
- Bottom user card: white, border, radius 12px — avatar circle (green), name 13.5/600, role caption, log-out icon.
- **Role gating:** Sales role — hide MONEY + INSIGHTS groups (keep backend enforcement as-is); Manager — all visible except Users.
- **Mobile (<768px):** top bar (brand + bell with count + avatar) and a 5-slot bottom tab bar: Home, Items, Sales, Customers, More. Active tab green/600.

## Page Header (all routes)
Breadcrumb-ish caption (13px muted) → serif page title → optional 13.5px subtitle. Right side: secondary buttons (white, border-strong, green text for icon actions like Export) then one primary button (green). Notification bell = white square button w/ red count pip.

## Dashboard (/)
1. **4 KPI cards:** Month income, Fududeeye profit, Pending payouts (value in #B2401F), Active items. Each: eyebrow label + 40px pastel icon chip top-right (green/amber/red/blue families) + serif 30px value + 12.5px caption with trend in green.
2. **Charts row (2fr/1fr):** Income vs profit line chart (recharts LineChart; income solid #17795C with 7% area fill, profit dashed #E8A33D, dot markers, grid lines #EFEDE4) · Inventory donut (recharts PieChart, #17795C vs #E8DDC4, center label "93% listed & live", footer split 142 Active / 11 Reserved).
3. **Bottom 3 equal cards** with colored dot headers + "View all": Overdue payouts (avatar rows, amounts red serif), Recent sales (item/buyer/method rows, amount + status pill), Open demands (name + waiting count + Matched/Open pill).

## List template (/items shown; reuse for customers, sales, demands, complaints, expenses, audit, users)
1. **4 summary cards** (same anatomy as KPI cards).
2. **Directory card** (single white card): header "Item directory" + count caption; **toolbar row INSIDE the card, above the table** — search input (flex 1.6, icon + placeholder), 2 select filters, green "Filter" button. **No search inside the table itself.**
3. Table: header row 11px/600 letterspaced faint on #FAF9F4 with top/bottom border; rows 13.5px, 13px vertical padding, divider #F3F1E8, hover #FAF9F4. Lead cell: 38px circular pastel icon chip + name/600 + SKU caption. Owner cell shows "Consignment" amber sub-tag or "Company stock" in green. Money right-aligned serif; markup column green.
4. Footer: "Showing 1–5 of 153" + Previous / numbered / Next buttons (34px, active = green fill).
5. States: loading = skeleton rows (pill-shaped #EFEDE4 bars); empty = centered icon chip + one line + primary button; error = danger-soft banner inside card with retry.

## Form template (/items/new shown; reuse for customers, sales, expenses, demands, complaints)
- Rendered **inside the shell** (sidebar visible), content max-width ~940px. Back link (green, arrow-left) → serif title → subtitle.
- **Section cards**: header row = 38px pastel icon chip + title 15.5/600 + helper caption, divider, then fields (16px gaps, 2-col grid where sensible).
- Fields: label 13px/500 with red `*`; input 44px, border-strong, radius 10; helper text 11.5px muted below; money inputs show muted `$` prefix.
- **Segmented control** (Owner type): pill container #F0EEE3 radius 10, active segment white w/ shadow + green text.
- Conditional: Consignment → Owner picker (avatar chip inside select) + locked Asking price; Company → Cost price.
- Validation error: 1.5px #C2482F border, #FFFBFA bg, alert-circle + message 11.5px red.
- Computed markup: read-only box, dashed #BCD6C9 border, bg #F3F7F4, green 600 text; caption "API values are authoritative after save."
- **Action footer** pinned below content (sticky on long forms): primary "Create item" (green), secondary "Save as draft" (primary-soft), "Cancel" (white/border); right-aligned note "Sales role can only submit as Draft".

## Detail template (/sales/:id shown; reuse for items, customers, demands, complaints)
- Back link → serif title "Sale SL-0047 · Samsung Galaxy S23" + status pill → caption line. Actions right: "Pay owner" (green-text secondary), "Receipt" (neutral), "Refund" (danger-tinted border+text — destructive kept visually quiet, confirm via modal).
- **4 metric cards:** Sale price, Owner payout (red, pending note), Company profit (green, % markup), Payment status.
- Left column: **metadata card** (2-col rows: 130px muted key + 600 value; entity values green as links) + **Related records table** (Payout, Item, Customer w/ status pills, amounts serif).
- Right column: **Activity feed** (30px pastel icon circles, bold event + caption timestamp/actor) + "Add note" textarea + green "Post note".

## Login (/login)
Split layout: left 460px deep-green (#1C4A3C) brand panel — logo, serif tagline ("You bring the item. / We find the buyer. / You get your price."), small stat row; right centered 380px form on canvas — serif "Sign in", username + password (46px inputs w/ leading icons, eye toggle), green checkbox "Keep me signed in", full-width green button, audit-log notice chip. Mobile: green header w/ centered logo, form in rounded-top canvas sheet.

## Interactions & behavior
- Hovers: nav #F0EEE3; table rows #FAF9F4; primary #136A50. Focus: 2px ring rgba(23,121,92,.35).
- Transitions ~150ms ease on bg/border only. No entrance animations.
- Currency: API decimal strings → format via existing MoneyDisplay (Intl.NumberFormat en-US USD).
- Toasts: white card, radius 12, left icon chip (green success / red error), 13.5px text, bottom-right desktop / above tab bar mobile.
- Modal (destructive confirm): white, radius 16, icon chip, danger primary button #C2482F.
- Responsive: <1200px summary cards 2-col; <768px sidebar → bottom tabs, tables → stacked cards (as in mobile frames: icon chip + name + status pill, money row below divider), filters → search + slider-icon button + horizontal chip row.

## Status badge mapping (StatusBadge.tsx)
success: Active, Paid, Resolved, Matched, Fulfilled, Completed · warning: Pending, Open, Draft · info: Reserved, In progress · danger: Refunded, High · neutral: Sold, Closed, Withdrawn, Dropped. Shape: radius-full, 11.5px/600, px-11 py-3px.

## Assets
- Icons: **lucide-react** (already installed) — store, layout-dashboard, users, package, shopping-cart, clipboard-list, message-square-warning, credit-card, hand-coins, chart-line, shield-check, user-cog, bell, plus, search, download, chevron-down, arrow-left, check, printer, rotate-ccw, clock, banknote, trending-up, badge-check, laptop, car, armchair, smartphone, building-2, user-plus, handshake, lock, eye, log-out.
- Fonts: Google Fonts — Jost (400,500,600,700) + Source Serif 4 (400,600,700). Import in index.css.
- No image assets required; logo placeholder = green rounded square + `store` icon.

## Files
- `Fududeeye Redesign.dc.html` — the full design canvas (open in a browser). Newest sections at top: §6 customers list + login, §5 sale detail + tokens, §4 dashboard / items list / new-item form / mobile frames.
