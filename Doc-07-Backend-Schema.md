# Doc 07: Backend Schema & API Contracts — Eswari Sound System

## 1. Database Entity Models (Prisma ORM)

```prisma
model Package {
  id          String    @id @default(uuid())
  slug        String    @unique
  name        String
  category    String    // "audio" | "lighting" | "combo"
  description String
  features    String    // JSON encoded array of string features
  price       Int       // In paise (e.g., 2500000 = ₹25,000)
  image       String?
  isPopular   Boolean   @default(false)
  sortOrder   Int       @default(0)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  bookings    Booking[]
}

model Booking {
  id                String   @id @default(uuid())
  packageId         String
  package           Package  @relation(fields: [packageId], references: [id])

  customerName      String
  customerEmail     String
  customerPhone     String

  eventDate         DateTime
  venueAddress      String
  eventType         String?

  status            String   @default("PENDING")      // PENDING | CONFIRMED | COMPLETED | CANCELLED
  paymentStatus     String   @default("UNPAID")       // UNPAID | ADVANCE_PAID | FULLY_PAID

  totalAmount       Int      // In paise
  advanceAmount     Int      // Strictly 25% of total
  balanceAmount     Int      // Remaining 75%

  razorpayOrderId   String?
  razorpayPaymentId String?

  notes             String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

model Inquiry {
  id           String    @id @default(uuid())
  name         String
  email        String
  phone        String
  eventType    String?
  eventDate    DateTime?
  venue        String?
  message      String

  status       String    @default("NEW")          // NEW | QUOTED | ACCEPTED | DECLINED
  quoteAmount  Int?      // In paise
  quoteDetails String?
  adminNotes   String?

  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}

model Availability {
  id        String   @id @default(uuid())
  date      DateTime @unique
  isBlocked Boolean  @default(true)
  reason    String?  // "booked" | "maintenance" | "holiday"
  createdAt DateTime @default(now())
}
```

---

## 2. API Endpoints Specification

| Method | Endpoint | Description | Auth / Security |
|---|---|---|---|
| `GET` | `/api/packages` | Retrieve active packages list | Public (Cached) |
| `GET` | `/api/availability?month=YYYY-MM` | Check booked/blacked out calendar dates | Public |
| `POST` | `/api/bookings/create` | Validate slot & initiate draft booking | Server-side price check |
| `POST` | `/api/razorpay/order` | Generate Razorpay order for 25% advance | Rate limited |
| `POST` | `/api/razorpay/verify` | Verify signature & confirm date reservation | Cryptographic HMAC-SHA256 |
| `POST` | `/api/inquiries` | Submit custom event quote request | Zod validation |
| `GET` | `/api/my-bookings?phone=...` | Retrieve customer booking history & status | OTP / Phone verify |
| `POST` | `/api/admin/availability/block` | Blackout specific dates or holidays | Admin session token |
