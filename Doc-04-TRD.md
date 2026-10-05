# Doc 04: Technical Requirements Document (TRD) — Eswari Sound System

## 1. Technology Stack Architecture

| Layer | Technology | Specifications |
|---|---|---|
| **Frontend Framework** | Next.js 14.2 (App Router) | React 18, Server Components, TypeScript 5.5 |
| **Styling** | Tailwind CSS 3.4 | Custom theme: `#0B0B0F` (ink), `#FFB11A` (amber), `#38BDF8` (haze) |
| **Typography** | Google Fonts | Space Grotesk (Headings), Inter (Body), JetBrains Mono (Tech/Pricing) |
| **Scroll / Canvas Engine** | Custom Canvas + Lenis + GSAP | High-performance frame-scrubber rendering 1600px/960px WebP sequences |
| **Backend & APIs** | Next.js API Routes / Server Actions | Edge & Node.js runtime handlers, Zod schema validation |
| **ORM & Database** | Prisma 5.22 + SQLite (Dev) / PostgreSQL (Prod) | Strict foreign keys, atomic transactions, schema indexing |
| **Payment Gateway** | Razorpay Node.js SDK | Order creation, HMAC-SHA256 signature verification, 25% deposit rule |
| **Email Service** | Resend API | Transactional booking confirmations, invoice PDFs, inquiry notifications |
| **Icons & UI** | Lucide React | High-contrast vector iconography |

---

## 2. Directory Structure

```
eswari-sound-system/
├── app/
│   ├── layout.tsx             # Root layout with fonts, SEO & global shell
│   ├── page.tsx               # Homepage / Canvas frame scrubber stage
│   ├── globals.css            # Tailwind directives, glassmorphic card classes
│   ├── about/                 # Legacy, sound engineers & technical inventory
│   ├── packages/              # Pre-configured sound & lighting packages
│   ├── book/                  # Instant date-lock booking engine (25% advance)
│   ├── inquiry/               # Custom event quotation request form
│   ├── my-bookings/           # Customer booking lookup and receipt viewer
│   ├── contact/               # Location, dispatch hub & telephone details
│   ├── admin/                 # Admin console (calendar, bookings, quotes)
│   └── api/
│       ├── bookings/          # Create & query booking records
│       ├── razorpay/          # Order generation & webhook verification
│       └── inquiries/         # Quote creation & approval
├── components/
│   ├── ui/                    # Navbar, Footer, Buttons, Modal, Toast
│   ├── scroll/                # CanvasScrubber, FramePreloader, OverlaySafeZones
│   ├── booking/               # DatePicker, PackageSelector, SummaryWidget
│   └── admin/                 # CalendarBlackout, BookingsTable, QuoteEditor
├── lib/
│   ├── prisma.ts              # Global Prisma client singleton
│   ├── utils.ts               # cn() merger, formatINR() currency helpers
│   ├── types.ts               # Shared TypeScript schemas & status types
│   └── razorpay.ts            # Payment client instance & verification helpers
├── prisma/
│   ├── schema.prisma          # Database schema (Package, Booking, Inquiry, Availability)
│   └── seed.ts                # Initial production catalog & blackout dates
└── public/
    └── assets/
        ├── images/            # Keyframe stills & equipment close-ups
        ├── Viedos/            # 16:9 master 8-second video clips (01-06)
        └── frames/            # Pre-rendered WebP scrubbing frames
            ├── desktop/       # 1600px, 12fps WebP frames (01_home - 06_book)
            └── mobile/        # 960px, 8fps WebP frames (01_home - 06_book)
```

---

## 3. Environment Variables Specification

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="dev-secret-change-in-production-32chars!!"
ADMIN_EMAIL="admin@eswarisound.com"
ADMIN_PASSWORD_HASH="dev_password_hash"
RAZORPAY_KEY_ID="rzp_test_dev"
RAZORPAY_KEY_SECRET="dev_secret"
RAZORPAY_WEBHOOK_SECRET="dev_webhook_secret"
RESEND_API_KEY="re_dev"
NEXT_PUBLIC_WA_NUMBER="919876543210"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

---

## 4. Key Constraints & Architecture Rules

1. **Single-Provider Integrity:** No vendor signup, no multi-tenant marketplace features, no third-party equipment commissions.
2. **Server-Side Pricing Guarantee:** Client-submitted amounts are never trusted. All booking advance amounts (25%) and total balances are computed exclusively server-side using the canonical `Package` database prices.
3. **Canvas Performance:** Frame scrubbing utilizes double-buffered `canvas.drawImage` inside `requestAnimationFrame` with responsive device pixel ratio clamping (max DPR = 2) to eliminate jank.
