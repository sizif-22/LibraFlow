# 📚 LibraFlow — Sprint 3 Plan

> **Sprint:** 3 of 4
> **Week:** 3
> **Focus:** Fines System + Notifications + Admin Dashboard + Strategy Pattern

---

## Sprint Goal

> _"By the end of Sprint 3, the system automatically calculates fines using the Strategy Pattern, sends in-app notifications for borrow events, and admins have full visibility into users and reports."_

---

## Sprint 3 Backlog

| Story ID | User Story                                                                                                   | Points | Assigned To |
| -------- | ------------------------------------------------------------------------------------------------------------ | ------ | ----------- |
| US-20    | As a system, I want to automatically calculate fines when a book is returned late using a pluggable strategy | 3      | Backend     |
| US-21    | As a librarian, I want to choose the fine calculation strategy so I can apply the right rules                | 2      | Backend     |
| US-22    | As a librarian, I want to record a fine payment so the student's account gets unblocked                      | 2      | Backend     |
| US-23    | As a student, I want to see my outstanding fines on my dashboard so I know what I owe                        | 2      | Frontend    |
| US-24    | As a system, I want to send an in-app notification when a borrow is approved, rejected, or returned          | 3      | Backend     |
| US-25    | As a system, I want to send a reminder notification 1 day before the due date                                | 2      | Backend     |
| US-26    | As a student, I want to see my notifications in a bell icon so I stay informed                               | 3      | Frontend    |
| US-27    | As an admin, I want to view all users and change their roles so I can manage access                          | 2      | Backend     |
| US-28    | As an admin, I want to deactivate or reactivate a student account                                            | 2      | Backend     |
| US-29    | As an admin, I want to see a report of the most borrowed books                                               | 2      | Backend     |
| US-30    | As an admin, I want to see a report of all overdue borrows                                                   | 2      | Backend     |
| US-31    | As an admin, I want to see the total fines collected                                                         | 1      | Backend     |
| US-32    | As an admin, I want an admin dashboard showing all reports and user management                               | 3      | Frontend    |
| US-33    | As a librarian, I want a fines management page to view and record payments                                   | 2      | Frontend    |

**Total Points: 31**

---

## Sprint 3 Tasks Breakdown

### 🔵 Backend Tasks (Ahmed + Sayed)

```
Week 3 — Backend
├── Day 1: Prisma Schema Update
│   ├── Add Fine model
│   ├── Add Notification model
│   └── Run migration
│
├── Day 1-2: Strategy Pattern — Fines (feature/fines)
│   ├── Create IFineStrategy interface
│   ├── Implement PerDayFine    → 5 EGP × overdue days
│   ├── Implement FixedFine     → 50 EGP flat after 7 days late
│   ├── Implement PercentageFine → 5% of book price
│   └── Implement FineCalculator(strategy: IFineStrategy)
│
├── Day 2-3: Fine Repository + API (feature/fines)
│   ├── Implement FineRepository
│   │   ├── createFine(borrowId, amount)
│   │   ├── findByStudent(studentId)
│   │   ├── hasUnpaidFine(studentId)
│   │   ├── markAsPaid(fineId)
│   │   └── getTotalCollected()
│   ├── POST /api/fines/calculate   → auto calculate on return
│   ├── GET  /api/fines/my          → student views their fines
│   ├── GET  /api/fines             → librarian views all fines
│   └── PUT  /api/fines/:id/pay     → librarian records payment
│
├── Day 3-4: Notifications (feature/notifications)
│   ├── Implement NotificationRepository
│   │   ├── create(studentId, message, type)
│   │   ├── findByStudent(studentId)
│   │   └── markAsRead(notificationId)
│   ├── Trigger notifications on:
│   │   ├── Borrow approved → notify student
│   │   ├── Borrow rejected → notify student
│   │   ├── Fine added      → notify student
│   │   └── Due date - 1 day → remind student
│   ├── GET /api/notifications/my       → student views notifications
│   └── PUT /api/notifications/:id/read → mark as read
│
└── Day 4-5: Admin APIs (feature/admin)
    ├── GET  /api/admin/users              → list all users
    ├── PUT  /api/admin/users/:id/role     → change user role
    ├── PUT  /api/admin/users/:id/status   → activate/deactivate
    ├── GET  /api/admin/reports/top-books  → most borrowed books
    ├── GET  /api/admin/reports/overdue    → all overdue borrows
    └── GET  /api/admin/reports/fines      → total fines collected
```

### 🟢 Frontend Tasks (Sherif + Noureen)

```
Week 3 — Frontend
├── Day 1: Setup & Types
│   ├── Add Fine and Notification types
│   └── Add new API calls to client
│
├── Day 2: Student Pages (feature/fines + feature/notifications)
│   ├── Fines section on student dashboard
│   │   ├── Outstanding fines list
│   │   └── Total amount owed
│   └── Notification bell icon in navbar
│       ├── Unread count badge
│       ├── Dropdown with notification list
│       └── Mark as read on click
│
├── Day 3-4: Librarian Pages (feature/fines)
│   └── /librarian/fines → fines management page
│       ├── Table of all fines (paid + unpaid)
│       ├── Filter by student or status
│       └── Record payment button
│
└── Day 4-5: Admin Pages (feature/admin)
    └── /admin/dashboard
        ├── Users management table
        │   ├── Change role dropdown
        │   └── Activate/Deactivate toggle
        ├── Most borrowed books chart
        ├── Overdue borrows table
        └── Total fines collected card
```

---

## Prisma Schema Update (Sprint 3)

```prisma
model Fine {
  id        Int      @id @default(autoincrement())
  borrow    Borrow   @relation(fields: [borrowId], references: [id])
  borrowId  Int      @unique
  amount    Float
  isPaid    Boolean  @default(false)
  paidAt    DateTime?
  createdAt DateTime @default(now())
}

model Notification {
  id        Int      @id @default(autoincrement())
  student   User     @relation(fields: [studentId], references: [id])
  studentId Int
  message   String
  type      NotificationType
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
}

enum NotificationType {
  BORROW_APPROVED
  BORROW_REJECTED
  FINE_ADDED
  DUE_REMINDER
}
```

---

## Strategy Pattern — Code Structure

```
backend/src/
└── strategies/
    └── fines/
        ├── IFineStrategy.ts       ← interface
        ├── PerDayFine.ts          ← 5 EGP × overdue days
        ├── FixedFine.ts           ← 50 EGP flat
        ├── PercentageFine.ts      ← 5% of book price
        └── FineCalculator.ts      ← context class
```

```typescript
// IFineStrategy.ts
interface IFineStrategy {
  calculate(overdueDays: number, bookPrice?: number): number;
}

// PerDayFine.ts
class PerDayFine implements IFineStrategy {
  calculate(overdueDays: number): number {
    return overdueDays * 5;
  }
}

// FineCalculator.ts
class FineCalculator {
  constructor(private strategy: IFineStrategy) {}

  setStrategy(strategy: IFineStrategy) {
    this.strategy = strategy;
  }

  calculate(overdueDays: number, bookPrice?: number): number {
    return this.strategy.calculate(overdueDays, bookPrice);
  }
}
```

---

## API Endpoints — Sprint 3

### Fines

| Method | Endpoint               | Auth | Role      | Description                   |
| ------ | ---------------------- | ---- | --------- | ----------------------------- |
| POST   | `/api/fines/calculate` | ✅   | System    | Auto calculate fine on return |
| GET    | `/api/fines/my`        | ✅   | Student   | View my fines                 |
| GET    | `/api/fines`           | ✅   | Librarian | View all fines                |
| PUT    | `/api/fines/:id/pay`   | ✅   | Librarian | Record fine payment           |

### Notifications

| Method | Endpoint                      | Auth | Role    | Description               |
| ------ | ----------------------------- | ---- | ------- | ------------------------- |
| GET    | `/api/notifications/my`       | ✅   | Student | View my notifications     |
| PUT    | `/api/notifications/:id/read` | ✅   | Student | Mark notification as read |

### Admin

| Method | Endpoint                       | Auth | Role  | Description              |
| ------ | ------------------------------ | ---- | ----- | ------------------------ |
| GET    | `/api/admin/users`             | ✅   | Admin | List all users           |
| PUT    | `/api/admin/users/:id/role`    | ✅   | Admin | Change user role         |
| PUT    | `/api/admin/users/:id/status`  | ✅   | Admin | Activate/Deactivate user |
| GET    | `/api/admin/reports/top-books` | ✅   | Admin | Most borrowed books      |
| GET    | `/api/admin/reports/overdue`   | ✅   | Admin | Overdue borrows          |
| GET    | `/api/admin/reports/fines`     | ✅   | Admin | Total fines collected    |

---

## New Branches This Sprint

```
develop
├── feature/fines           ← Fine system + Strategy Pattern
├── feature/notifications   ← Notification system
└── feature/admin           ← Admin dashboard + Reports
```

---

## Sprint 3 — Definition of Done

A story is **Done** when:

- [ ] Code is written and works locally
- [ ] Strategy Pattern used for fine calculation (no hardcoded logic)
- [ ] Repository Pattern used for all DB operations
- [ ] Notifications triggered correctly on borrow events
- [ ] Feature branch created and pushed to GitHub
- [ ] Pull Request reviewed by at least 1 teammate
- [ ] PR merged to `develop`
- [ ] No console errors or warnings

---

_Document maintained by: Product Owner — Sherif_
_Last updated: April 2026_
