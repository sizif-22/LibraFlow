# 📚 LibraFlow — Sprint 4 Plan

> **Sprint:** 4 of 4
> **Week:** 4
> **Focus:** Test Suite + Heroku Deployment + UML Diagrams + Bug Fixes

---

## Sprint Goal

> _"By the end of Sprint 4, the system has a comprehensive test suite (109 tests), is deployed to Heroku with JawsDB Maria, and all UML diagrams are finalized."_

---

## Sprint 4 Backlog

| Story ID | User Story | Points | Assigned To |
| -------- | ---------- | ------ | ----------- |
| US-34    | As a developer, I want a test suite for all backend modules so I can catch regressions | 5      | Backend     |
| US-35    | As a developer, I want the app deployed to Heroku so it's publicly accessible | 3      | Backend     |
| US-36    | As a developer, I want CI/CD so tests run automatically before deployment | 2      | Backend     |
| US-37    | As a developer, I want UML diagrams so the architecture is documented | 2      | Team        |
| US-38    | As a developer, I want design pattern tests so factories and strategies are verified | 3      | Backend     |
| US-39    | As a developer, I want the borrow lifecycle tested end-to-end | 3      | Backend     |

**Total Points: 18**

---

## Sprint 4 Tasks Breakdown

### 🔵 Backend Tasks

#### 1. Test Suite (8 test files, 109 tests)

```
sprint_4/
├── Tests
│   ├── strategies.test.ts       ← Fine calculation strategy tests (PerDay, Fixed, Percentage)
│   ├── factories.test.ts        ← BorrowFactory tests (Book, Magazine, Thesis due dates)
│   ├── auth.test.ts             ← Auth module (registration, login, role guards)
│   ├── book.test.ts             ← Book CRUD, search, pagination, role enforcement
│   ├── borrow.test.ts           ← Full lifecycle: create → approve → return + edge cases
│   ├── fine.test.ts             ← Fine calculation, payment, student fine queries
│   ├── notification.test.ts     ← Notification creation, reading, error handling
│   └── admin.test.ts            ← Admin user management, reports, system health
├── Test fixes
│   ├── Unique test data         ← Timestamped emails/ISBNs to avoid DB collisions
│   ├── Borrow lifecycle         ← Create borrow at runtime, use real ID for approve/return
│   └── Non-existent IDs         ← Use 99999-style IDs for not-found assertions
└── Response body assertions     ← Verify names, statuses, IDs in response JSON
```

#### 2. Heroku Deployment

```
sprint_4/
├── Deployment                    
│   ├── Buildpack setup          
│   │   ├── jakeg/heroku-buildpack-bun   ← Bun runtime for Heroku
│   │   └── Procfile                     ← web + release processes
│   ├── Environment config
│   │   ├── DATABASE_URL                 ← JawsDB Maria connection string
│   │   ├── JWT_SECRET                   ← JWT signing secret
│   │   └── PORT                         ← Heroku-assigned port
│   ├── Infrastructure
│   │   ├── Root package.json            ← postinstall bootstraps backend/
│   │   ├── .buildpacks                  ← Buildpack URL reference
│   │   └── Procfile
│   │       ├── release: bun x prisma migrate deploy
│   │       └── web: cd backend && bun src/index.ts
│   ├── Prisma migrations
│   │   ├── 20260509000000_init          ← Initial schema (User, Book, Borrow, Fine, Notification)
│   │   └── 20260509000001_add_is_verified ← isVerified column on User
│   └── Verified endpoints
│       ├── GET /ping        → 200  ✓
│       ├── GET /api/books   → 401  ✓ (auth guard active)
│       └── GET /swagger     → 200  ✓
```

#### 3. Macro Fix (Elysia Pattern)

```
sprint_4/
├── Elysia macro fix
│   ├── Problem: .macro({ onBeforeHandle }) callback pattern not supported in Elysia v1.4.28
│   ├── Fix: .macro({ isAuth, hasRole }) returns { beforeHandle: fn } directly
│   ├── Files changed:
│   │   ├── src/index.ts                    ← App-level macros
│   │   ├── src/controllers/admin.controller.ts
│   │   ├── src/controllers/book.controller.ts
│   │   ├── src/controllers/borrow.controller.ts
│   │   ├── src/controllers/fine.controller.ts
│   │   └── src/controllers/notification.controller.ts
│   └── Result: Auth guards work correctly on all routes
```

---

### 🟢 Frontend Tasks

| Task | Status |
| ---- | ------ |
| No frontend changes this sprint | N/A |

---

### 📐 UML Diagrams

```
sprint_4/
├── Diagrams
│   ├── UseCaseDiagram.drawio.pdf          ← All actors + use cases
│   ├── ClassDiagram.drawio.pdf            ← All models + relationships
│   ├── ActivityDiagram_Borrow.pdf         ← Borrow request flow
│   ├── ActivityDiagram_Return.pdf         ← Return + fine calculation flow
│   ├── SequenceDiagram_Borrow.pdf         ← Borrow request sequence
│   └── SequenceDiagram_Return.pdf         ← Return + fine sequence
```

---

## Test Suite Summary

```
📊 Test Results: 109 pass · 0 fail · 152 expect() calls

src/tests/
├── strategies.test.ts      ✓  14 tests  ← PerDayFine, FixedFine, PercentageFine, FineCalculator
├── factories.test.ts       ✓   6 tests  ← BookBorrow, MagazineBorrow, ThesisBorrow, BorrowFactory
├── auth.test.ts            ✓  14 tests  ← Register, Login, JWT, Role guards, Mock DB
├── book.test.ts            ✓   9 tests  ← CRUD, Search, Pagination, Role enforcement
├── borrow.test.ts          ✓  23 tests  ← Create, Approve, Reject, Return, Lifecycle, Edge cases
├── fine.test.ts            ✓  17 tests  ← Calculate, List, Pay, Overdue, Student fines
├── notification.test.ts    ✓   8 tests  ← List, Mark read, Non-existent ID error
└── admin.test.ts           ✓  18 tests  ← List users, Create user, Status toggle, Reports, Health
```

### Test Design Decisions

| Decision | Rationale |
|----------|-----------|
| Real MySQL DB (not mocked) | Tests run against local MySQL to verify real queries, schema, and constraints |
| Timestamped unique data | Emails/ISBNs use `test-${Date.now()}@domain` to avoid unique constraint collisions |
| Borrow lifecycle test | Creates a borrow at runtime, uses the real returned ID for approve → return flow |
| Response body assertions | Tests verify JSON structure, not just HTTP status codes |
| Auth mock for login test | Only `auth.test.ts` uses `mock.module` on Prisma to isolate from DB user data |

---

## API Endpoints — Sprint 4

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/api/books` | ✅ | All | List + search books |
| GET | `/api/books/:id` | ✅ | All | Get single book |
| POST | `/api/books` | ✅ | Librarian | Add book |
| PUT | `/api/books/:id` | ✅ | Librarian | Edit book |
| DELETE | `/api/books/:id` | ✅ | Librarian | Delete book |
| POST | `/api/borrows` | ✅ | Student | Request a borrow |
| GET | `/api/borrows/my` | ✅ | Student | View my borrow history |
| GET | `/api/borrows/pending` | ✅ | Librarian | View pending requests |
| PUT | `/api/borrows/:id/approve` | ✅ | Librarian | Approve borrow |
| PUT | `/api/borrows/:id/reject` | ✅ | Librarian | Reject borrow |
| PUT | `/api/borrows/:id/return` | ✅ | Librarian | Record return |
| POST | `/api/fines/calculate` | ✅ | System | Auto-calculate on return |
| GET | `/api/fines/my` | ✅ | Student | View my fines |
| GET | `/api/fines` | ✅ | Librarian | View all fines |
| PUT | `/api/fines/:id/pay` | ✅ | Librarian | Record payment |
| GET | `/api/notifications/my` | ✅ | Student | View my notifications |
| PUT | `/api/notifications/:id/read` | ✅ | Student | Mark as read |
| GET | `/api/admin/users` | ✅ | Admin | List all users |
| POST | `/api/admin/users` | ✅ | Admin | Create user |
| PUT | `/api/admin/users/:id/status` | ✅ | Admin | Activate/Deactivate |
| GET | `/api/admin/reports/top-books` | ✅ | Admin | Most borrowed books |
| GET | `/api/admin/reports/overdue` | ✅ | Admin | Overdue borrows |
| GET | `/api/admin/reports/fines` | ✅ | Admin | Total fines collected |
| POST | `/api/admin/reminders/trigger` | ✅ | Admin | Trigger due reminders |
| GET | `/api/admin/system/health` | ✅ | Admin | System health |

---

## Heroku Architecture

```
┌──────────────┐          ┌───────────────────┐          ┌──────────────────┐
│              │  HTTPS   │                   │  MySQL   │                  │
│  Browser /   │─────────▶│  Heroku Dyno      │─────────▶│  JawsDB Maria   │
│  curl /      │          │  (Bun v1.3.13)    │          │  (Free Tier)     │
│  Frontend    │◀─────────│                   │◀────────│                  │
│              │  JSON    │  Elysia v1.4.28   │          │  gijk82zx77...   │
└──────────────┘          └───────────────────┘          └──────────────────┘
                                    │
                          ┌─────────┴───────┐
                          │  Config Vars    │
                          │  DATABASE_URL   │
                          │  JWT_SECRET     │
                          │  ZEPTO_MAIL_URL │
                          └─────────────────┘
```

### Build Process

```
git push heroku main
        ↓
Buildpack detects Bun app
        ↓
bun install (root package.json)
        ↓
postinstall → cd backend && bun install
        ↓
bun run build → cd backend && prisma generate
        ↓
Compress slug (122.4M)
        ↓
Release phase → bun x prisma migrate deploy
        ↓
Web process → cd backend && bun src/index.ts
```

---

## Sprint 4 — Definition of Done

A story is **Done** when:

- [x] 109 tests pass with 0 failures
- [x] Tests verify response bodies (not just status codes)
- [x] Design patterns (Factory, Strategy) have dedicated test files
- [x] Borrow lifecycle tested end-to-end (create → approve → return)
- [x] Auth guards tested for all roles (unauthorized, forbidden, allowed)
- [x] Edge cases covered (non-existent IDs, already-approved borrow transitions)
- [x] App deployed to Heroku on `main` branch
- [x] JawsDB Maria connected and migrations applied
- [x] All UML diagrams created and committed
- [x] Elysia macro pattern fixed across all controllers
- [x] Deployment branch `ci-testing-deployment` merged to `main`

---

*Last updated: May 2026*
