# 📚 LibraFlow — Sprint 2 Plan

> **Sprint:** 2 of 4
> **Week:** 2
> **Focus:** Borrowing System + Factory Pattern + Repository Pattern

---

## Sprint Goal

> *"By the end of Sprint 2, a student can request to borrow a book, a librarian can approve or reject the request, and the system automatically sets the due date using the BorrowFactory — with full borrow and return lifecycle tracked in the database."*

---

## Sprint 2 Backlog

| Story ID | User Story | Points | Assigned To |
|---|---|---|---|
| US-10 | As a student, I want to request borrowing a book so I can take it home | 3 | Backend |
| US-11 | As a librarian, I want to approve or reject borrow requests so I can control the catalog | 3 | Backend |
| US-12 | As a system, I want to use BorrowFactory to set due dates based on borrow type so rules are consistent | 3 | Backend |
| US-13 | As a librarian, I want to record a book return so the system stays up to date | 2 | Backend |
| US-14 | As a system, I want to update book availability when a borrow is approved or a return is recorded | 2 | Backend |
| US-15 | As a student, I want to view my full borrowing history so I can track what I borrowed | 2 | Backend |
| US-16 | As a student, I want to see a borrow request button on each book so I can request it easily | 3 | Frontend |
| US-17 | As a librarian, I want a dashboard showing all pending borrow requests so I can approve or reject them | 3 | Frontend |
| US-18 | As a student, I want to see my borrowing history page so I can track my active and past borrows | 2 | Frontend |
| US-19 | As a system, I want to block a student from borrowing if they have an unpaid fine | 2 | Backend |

**Total Points: 25**

---

## Sprint 2 Tasks Breakdown

### 🔵 Backend Tasks (Ahmed + Sayed)

```
Week 2 — Backend
├── Day 1: Prisma Schema Update
│   ├── Add Borrow model
│   ├── Add BorrowType enum (BOOK, MAGAZINE, THESIS)
│   ├── Add BorrowStatus enum (PENDING, APPROVED, REJECTED, RETURNED)
│   └── Run migration
│
├── Day 1-2: Factory Pattern (feature/borrowing)
│   ├── Create IBorrowType interface
│   ├── Implement BookBorrow    → dueDate = 14 days
│   ├── Implement MagazineBorrow → dueDate = 7 days
│   ├── Implement ThesisBorrow  → dueDate = 3 days
│   └── Implement BorrowFactory.create(type) → returns correct IBorrowType
│
├── Day 2-3: Repository Pattern (feature/borrowing)
│   ├── Implement BorrowRepository
│   │   ├── create(studentId, bookId, type)
│   │   ├── findById(id)
│   │   ├── findAllPending()
│   │   ├── findActiveByStudent(studentId)
│   │   ├── findHistoryByStudent(studentId)
│   │   └── updateStatus(id, status)
│   └── Implement FineRepository (stub for Sprint 3)
│       └── hasUnpaidFine(studentId) → boolean
│
└── Day 3-5: Borrow API Endpoints (feature/borrowing)
    ├── POST   /api/borrows              → Student requests borrow
    ├── GET    /api/borrows/pending      → Librarian views pending requests
    ├── PUT    /api/borrows/:id/approve  → Librarian approves
    ├── PUT    /api/borrows/:id/reject   → Librarian rejects
    ├── PUT    /api/borrows/:id/return   → Librarian records return
    └── GET    /api/borrows/my           → Student views their history
```

### 🟢 Frontend Tasks (Sherif + Noureen)

```
Week 2 — Frontend
├── Day 1: Setup & Types
│   ├── Add Borrow types/interfaces in TypeScript
│   └── Add borrow API calls to api client
│
├── Day 2-3: Student Pages (feature/borrowing)
│   ├── Borrow request button on book card
│   │   ├── Disabled if book unavailable
│   │   └── Disabled if student has unpaid fine
│   ├── Borrow type selector modal (Book / Magazine / Thesis)
│   └── /student/borrows → borrowing history page
│       ├── Active borrows tab (with due date)
│       └── Past borrows tab
│
└── Day 4-5: Librarian Pages (feature/borrowing)
    ├── /librarian/borrows → pending requests dashboard
    │   ├── Table of pending requests
    │   ├── Approve button → updates status + sets due date
    │   └── Reject button → updates status
    └── /librarian/returns → record return
        ├── Search by student name or book title
        └── Confirm return button
```

---

## Prisma Schema Update (Sprint 2)

```prisma
model Borrow {
  id         Int          @id @default(autoincrement())
  student    User         @relation(fields: [studentId], references: [id])
  studentId  Int
  book       Book         @relation(fields: [bookId], references: [id])
  bookId     Int
  type       BorrowType   @default(BOOK)
  status     BorrowStatus @default(PENDING)
  borrowDate DateTime     @default(now())
  dueDate    DateTime?
  returnDate DateTime?
  createdAt  DateTime     @default(now())
  updatedAt  DateTime     @updatedAt

  fine       Fine?
}

enum BorrowType {
  BOOK
  MAGAZINE
  THESIS
}

enum BorrowStatus {
  PENDING
  APPROVED
  REJECTED
  RETURNED
}
```

---

## Factory Pattern — Code Structure

```
backend/src/
└── factories/
    └── borrow/
        ├── IBorrowType.ts         ← interface
        ├── BookBorrow.ts          ← 14 days, renewable
        ├── MagazineBorrow.ts      ← 7 days, not renewable
        ├── ThesisBorrow.ts        ← 3 days, in-library only
        └── BorrowFactory.ts       ← factory class
```

```typescript
// IBorrowType.ts
interface IBorrowType {
  getDueDays(): number
  isRenewable(): boolean
  getDescription(): string
}

// BorrowFactory.ts
class BorrowFactory {
  static create(type: BorrowType): IBorrowType {
    switch (type) {
      case BorrowType.BOOK:      return new BookBorrow()
      case BorrowType.MAGAZINE:  return new MagazineBorrow()
      case BorrowType.THESIS:    return new ThesisBorrow()
    }
  }
}
```

---

## Repository Pattern — Code Structure

```
backend/src/
└── repositories/
    ├── BookRepository.ts      ← Sprint 1
    ├── UserRepository.ts      ← Sprint 1
    └── BorrowRepository.ts    ← Sprint 2 (new)
```

```typescript
// BorrowRepository.ts
class BorrowRepository {
  async create(studentId: number, bookId: number, type: BorrowType)
  async findById(id: number)
  async findAllPending()
  async findActiveByStudent(studentId: number)
  async findHistoryByStudent(studentId: number)
  async updateStatus(id: number, status: BorrowStatus, dueDate?: Date)
}
```

---

## API Endpoints — Sprint 2

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| POST | `/api/borrows` | ✅ | Student | Request a borrow |
| GET | `/api/borrows/pending` | ✅ | Librarian | View all pending requests |
| PUT | `/api/borrows/:id/approve` | ✅ | Librarian | Approve borrow request |
| PUT | `/api/borrows/:id/reject` | ✅ | Librarian | Reject borrow request |
| PUT | `/api/borrows/:id/return` | ✅ | Librarian | Record book return |
| GET | `/api/borrows/my` | ✅ | Student | View my borrow history |

---

## Borrow Lifecycle

```
Student requests borrow
        ↓
  Status: PENDING
        ↓
Librarian reviews
   ↙          ↘
APPROVED      REJECTED
   ↓
BorrowFactory sets due date
   ↓
Book quantity decreases
   ↓
Student returns book
   ↓
Status: RETURNED
Book quantity increases
   ↓
Check if late?
  ↙     ↘
YES      NO
Fine    Done
added
```

---

## Sprint 2 — Definition of Done

A story is **Done** when:
- [ ] Code is written and works locally
- [ ] Factory Pattern correctly creates borrow types with right due dates
- [ ] Repository Pattern used for all DB operations (no raw Prisma in controllers)
- [ ] Feature branch created and pushed to GitHub
- [ ] Pull Request reviewed by at least 1 teammate
- [ ] PR merged to `develop`
- [ ] No console errors or warnings

---

## New Branches This Sprint

```
develop
├── feature/borrowing        ← main branch for this sprint
│   ├── Backend: BorrowFactory + BorrowRepository + API endpoints
│   └── Frontend: Borrow request + Librarian dashboard + Student history
```

---

*Document maintained by: Product Owner — Sherif*
*Last updated: April 2026*
