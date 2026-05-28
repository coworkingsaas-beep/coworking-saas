# Coworking Management System — Agent Build Spec

Source roadmap: user-provided coworking Airtable roadmap. This document converts it into a precise, implementation-ready build plan.

## 1) Product goal

Build a clean, scalable coworking management system where:

- data is entered once
- related records update automatically
- payments, occupancy, renewals, and exits stay in sync
- dashboards always reflect live operational status
- manual work is minimized

## 2) Recommended build approach

Build this as a database-driven system with:

- **Core records** in tables
- **Derived values** in formulas / rollups / lookups
- **User actions** captured through forms and interfaces
- **Automations** handling record creation, syncing, and status updates
- **Dashboards** reading only from computed fields and linked rollups

### Canonical tables

1. Member Management
2. Payment Tracking
3. Workspace Inventory
4. Meeting Room Booking
5. Discontinued Co-workers
6. P&L Statement
7. Leads & Inquiries
8. Dashboard / Interface views

---

## 3) Data model

## 3.1 Member Management

**Purpose:** master table for all active and inactive coworkers.

### Fields

- `Name` — primary field
- `Phone Number` — single line text, unique
- `Email` — email
- `Date of Birth` — date
- `Joining Date` — date, default today
- `Renewal Date` — date, editable; can be auto-updated after payment
- `Space Type` — single select:
  - Dedicated Desk
  - Manager Cabin
  - Two-Seater Cabin
  - Virtual Desk
- `Security Deposit` — currency / number
- `Rent Amount` — currency / number
- `Team Size` — number
- `Assigned Space` — linked record to Workspace Inventory
- `Payment Status` — lookup / rollup from Payment Tracking
- `Latest Payment Date` — lookup / rollup
- `Total Prints Used` — number
- `Total Printouts Allowed` — number
- `Discounted Member` — checkbox or tag
- `Source` — single select or text
- `Status` — single select:
  - Active
  - Inactive
- `Exit Reason` — long text
- `Welcome Message Status` — single select:
  - Pending
  - Sent
- `Duplicate Entry Flag` — checkbox

### Rules

- `Joining Date` defaults to today if empty.
- `Status` defaults to `Active`.
- `Phone Number` must be used as duplicate key.
- `Assigned Space` should always match exactly one inventory record when occupied.
- `Payment Status` should be derived from the latest linked payment record.
- If `Status` becomes `Inactive`, the member is moved into the discontinuation flow.

---

## 3.2 Payment Tracking

**Purpose:** monthly payment ledger for each member.

### Fields

- `Payment ID` — primary field or formula
- `Member Name` — linked record to Member Management
- `Month` — single select Jan–Dec
- `Year` — number
- `Rent Amount` — currency / number
- `Paid?` — checkbox
- `Payment Date` — date
- `Payment Mode` — single select:
  - Cash
  - UPI
  - Bank
- `Due Date` — formula or date
- `Payment Status` — formula
- `Next Due Date` — formula
- `Is Overdue` — formula
- `Overdue Status` — formula text or boolean
- `Days Overdue` — formula
- `Reminder Flag` — single select:
  - Reminder Due
  - Payment Due Today
  - Overdue Reminder
- `Income Synced` — checkbox
- `Renewal Synced` — checkbox

### Recommended formulas

**Payment Status**
```text
IF({Paid?}, "Paid", "Due")
```

**Due Date**
```text
DATETIME_PARSE("5-" & {Month} & "-" & {Year})
```
If the platform cannot parse month names reliably, store a numeric month index instead and calculate via date formula.

**Next Due Date**
```text
DATEADD(DATEADD({Payment Date}, 1, 'month'), -1, 'day')
```

**Is Overdue**
```text
IF(
  AND(
    NOT({Paid?}),
    TODAY() > {Due Date}
  ),
  "YES",
  "NO"
)
```

**Days Overdue**
```text
IF(
  {Is Overdue} = "YES",
  DATETIME_DIFF(TODAY(), {Due Date}, 'days'),
  0
)
```

### Rules

- One member can have many payment records.
- One record = one month per member.
- Payment records should be filterable by month/year.
- If a payment is marked paid, the member and P&L must sync.
- If overdue, status must be visible without manual checks.

---

## 3.3 Workspace Inventory

**Purpose:** single source of truth for all seats and cabins.

### Fields

- `Space ID` — primary field
- `Space Type` — single select:
  - Seat
  - Cabin
- `Status` — single select:
  - Occupied
  - Available
- `Assigned Member` — linked record to Member Management
- `Notes` — optional text

### Rules

- `D1` to `D28` and `C1` to `C4` are pre-created records.
- `Status` is `Occupied` when linked to a member.
- `Status` is `Available` when unlinked or member becomes inactive.

---

## 3.4 Meeting Room Booking

**Purpose:** meeting room schedule with conflict detection.

### Fields

- `Booking Name` — primary field
- `Member Name` — linked record to Member Management
- `Date` — date
- `Start Time` — time
- `End Time` — time
- `Duration` — formula
- `Status` — single select:
  - Upcoming
  - Ongoing
  - Completed
  - Cancelled
  - Booked
- `Conflict` — checkbox or single select YES/NO
- `Total Hours Used per Member` — rollup / summary

### Recommended formula

**Duration**
```text
DATETIME_DIFF({End Time}, {Start Time}, 'minutes') / 60
```

### Rules

- A booking with overlapping time on the same date must be flagged as conflict.
- Status should reflect date relative to today.
- Usage totals should be rollup-based for reporting.

---

## 3.5 Discontinued Co-workers

**Purpose:** archive members who exit.

### Fields

- `Name` — linked or copied from Member Management
- `Phone Number`
- `Email`
- `Assigned Space`
- `Team Size`
- `Last Payment Status`
- `Security Deposit`
- `Exit Date`
- `Reason for Leaving`
- `Security Deposit Returned` — yes/no
- `Exit Notes` — optional

### Rules

- This table is append-only.
- Create a record when member status changes to inactive.
- Keep historical snapshot even after the member is cleaned from active workflow.

---

## 3.6 P&L Statement

**Purpose:** simple income/expense ledger.

### Fields

- `Date`
- `Type` — single select:
  - Income
  - Expense
- `Category` — single select:
  - Rent
  - Utilities
  - Salary
  - Misc
- `Amount`
- `Notes`
- `Linked Payment` — optional link to Payment Tracking
- `Month` — formula or select
- `Year` — formula or select

### Rules

- Every paid payment should create an income record.
- Monthly profit = total income - total expense.
- Dashboard must aggregate by month.

---

## 3.7 Leads & Inquiries

**Purpose:** sales pipeline for new prospects.

### Fields

- `Name`
- `Phone Number`
- `Source` — Instagram, Google, Referral, etc.
- `Visited?` — yes/no
- `Location Shared?` — yes/no
- `Requirement` — Seat / Cabin
- `Quantity`
- `Status` — Hot, Cold, Converted, Lost
- `Converted Member` — link to Member Management
- `Notes`

### Rules

- If `Status = Converted`, create a member record automatically.
- Preserve lead history after conversion.

---

## 4) Relationships

### Required links

- Member Management → Payment Tracking (1 to many)
- Member Management → Meeting Room Booking (1 to many)
- Member Management → Workspace Inventory (1 to 1 or 1 to many depending on space model)
- Leads & Inquiries → Member Management (conversion link)
- Payment Tracking → P&L Statement (1 to 1 or 1 to many depending on accounting policy)

### Relationship rules

- Use linked records instead of duplicated text wherever possible.
- Use lookups for payment status, occupancy, and usage summaries.
- Avoid manual mirrored fields unless required for workflow compatibility.

---

## 5) Views to create

## Member Management views

- Active Members
- Inactive Members
- Members Without Assigned Space
- Discounted Members

## Payment Tracking views

- Pending Payments
- Overdue Payments
- This Month Payments
- Paid Payments
- Upcoming Payments (next 30 days)

## Workspace Inventory views

- Available Spaces
- Occupied Spaces
- Seats
- Cabins

## Leads & Inquiries views

- Hot Leads
- Converted Leads
- Lost Leads

## Meeting Room Booking views

- Upcoming
- Ongoing
- Conflict Review
- Completed

---

## 6) Dashboard / interface spec

Build a coworking operations dashboard with:

### Summary cards

- Total Active Members
- Total Inactive Members
- Upcoming Payments
- Overdue Payments
- New Members This Month
- Discounted Members
- Total Visits
- Occupancy Rate
- Members Without Assigned Space
- Revenue This Month

### Charts

- Revenue by month
- Expenses by month
- Occupancy over time
- Lead status distribution
- Seat vs cabin distribution

### Filters

- Month
- Space Type
- Status
- Lead Source

### Calculation logic

- Active members = count where `Status = Active`
- Occupancy rate = occupied spaces / 32
- Pending payments = count where `Paid? = false`
- Revenue = sum of paid payments
- New members this month = joining date within current month

---

## 7) Automations

## 7.1 New member → auto payment creation

**Trigger:** new record created in Member Management

**Actions:**

- Create 12 monthly payment records
- Copy:
  - Member Name
  - Rent Amount
  - Month
  - Year
  - Due Date
  - Paid? = false
  - Payment Status = Due
- Set member default values:
  - Status = Active
  - Source = Direct Form Entry if created from form
- Optionally set `Welcome Message Status = Pending`

**Important rule:** one automation run should not create duplicate payment rows if the member already has payment records.

---

## 7.2 Payment status sync

**Trigger:** payment record updated

**Conditions:**

- If `Paid?` is checked:
  - set `Payment Status = Paid`
  - mark `Renewal Synced = true`
  - update linked member’s latest payment status
  - update member `Renewal Date = DATEADD(Payment Date, 1, month)`
  - create linked P&L income row if not already created

- If `Paid?` is unchecked and `TODAY() > Due Date`:
  - set `Is Overdue = YES`
  - flag reminder fields

---

## 7.3 Renewal continuity automation

**Trigger:** renewal date reached or payment received

**Actions:**

- create next month payment record if missing
- notify admin using a flag field or notification-ready status
- refresh member renewal date after payment

---

## 7.4 Space assignment automation

**Trigger:** member assigned space changed

**Actions:**

- find matching record in Workspace Inventory
- set `Status = Occupied`
- set `Assigned Member = member`
- when member becomes inactive:
  - set workspace `Status = Available`
  - clear assigned member
  - clear member assigned space

---

## 7.5 Exit automation

**Trigger:** Member Management `Status` changed to `Inactive`

**Actions:**

1. Create a record in Discontinued Co-workers
2. Copy all exit snapshot fields
3. Set `Exit Date = today`
4. Free up the assigned workspace
5. Clear `Assigned Space` in Member Management
6. Optionally keep a manual `Exit Reason`

---

## 7.6 Payment reminders automation

**Trigger:** daily scheduled automation

**Conditions and flags:**

- 3 days before due date → `Reminder Flag = Reminder Due`
- on due date → `Reminder Flag = Payment Due Today`
- 1 day after due date and unpaid → `Reminder Flag = Overdue Reminder`

These flags should be ready for WhatsApp / email integration later.

---

## 7.7 Leads → member conversion

**Trigger:** lead status becomes `Converted`

**Actions:**

- create Member Management record
- copy:
  - Name
  - Phone Number
  - Requirement → Space Type
  - Quantity → Team Size
- set source = converted lead
- link the new member back to the lead

---

## 7.8 Meeting room automation

**Trigger:** new meeting booking created

**Actions:**

- calculate duration
- check conflicts on same date and overlapping time
- set `Conflict = YES/NO`
- set status from date:
  - past = Completed
  - today = Ongoing
  - future = Upcoming
- flag conflict for review

---

## 7.9 Print usage tracking

**Trigger:** print count updated

**Actions:**

- deduct from `Total Printouts Allowed`
- update `Total Prints Used`
- flag if limit exceeded

---

## 7.10 P&L auto update

**Trigger:** payment marked paid

**Actions:**

- create income row in P&L Statement
- amount = rent amount
- category = rent
- link back to payment

---

## 7.11 Duplicate prevention

**Trigger:** new member form submission

**Check:**

- if phone number already exists
  - do not create a duplicate member
  - flag as duplicate entry
  - send to review queue if needed

---

## 8) Forms

## 8.1 New Member Form

Fields:

- Name
- Phone Number
- Email
- Date of Birth
- Joining Date
- Space Type
- Team Size
- Security Deposit

Behavior:

- creates Member Management record
- sets defaults:
  - `Status = Active`
  - `Joining Date = Today` if empty
  - `Source = Direct Form Entry`
- triggers payment creation automation
- duplicate check by phone

## 8.2 Meeting Room Booking Form

Fields:

- Name
- Member Name
- Date
- Start Time
- End Time

Behavior:

- creates Meeting Room Booking record
- triggers duration calculation and conflict detection

---

## 9) Build order for the agent

### Phase 1 — schema foundation
1. create all tables
2. create fields
3. create select options
4. create linked relations

### Phase 2 — formula logic
1. payment status formulas
2. due date formulas
3. occupancy and dashboard rollups
4. duration and overdue logic

### Phase 3 — workflows
1. new member automation
2. payment sync automation
3. renewal automation
4. lead conversion automation
5. exit automation
6. meeting conflict automation
7. P&L auto-entry automation

### Phase 4 — interface and reporting
1. dashboard cards
2. charts
3. filtered views
4. admin review views

### Phase 5 — data quality
1. duplicate prevention
2. required fields
3. default values
4. error flags and review states

---

## 10) Implementation constraints

- Prefer linked records over duplicated text.
- Use formulas for derived fields.
- Use automations for side effects.
- Do not let dashboards depend on manual entries where computation is possible.
- Keep member lifecycle state clear: lead → member → inactive/discontinued.
- Keep one canonical payment record per month per member.

---

## 11) Acceptance criteria

The system is complete when:

- a new member can be added from form or manual entry
- 12 payment rows are created automatically
- payment completion updates member status and P&L
- workspace occupancy updates automatically
- inactive members are archived correctly
- meeting conflicts are flagged
- dashboard cards and charts reflect live data
- duplicate phone numbers are blocked or flagged
- overdue reminders are visible through fields

---

## 12) Notes for the coding agent

- Treat this as a workflow-first business system.
- Build the database before automations.
- Use stable record IDs and links.
- Keep all automations idempotent.
- Prefer one-way source-of-truth updates:
  - Member → Payment creation
  - Payment → Member status sync
  - Member status → Workspace release
  - Payment → P&L income
  - Lead conversion → Member creation
- Add review flags instead of silent failures.

