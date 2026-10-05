# Doc 05: Application Flow & User Journeys — Eswari Sound System

## 1. Page Inventory & Routing Matrix

| Route | Type | Purpose | Safe Zone / UI Behavior |
|---|---|---|---|
| `/` | Public (Cinematic) | Pinned canvas scrubbing 6 sections | Overlays strictly inside Doc 01 Safe Zones |
| `/about` | Public | Engineering legacy, crew roster & audio specs | 2-column glass card layout |
| `/packages` | Public | Full equipment catalog & stage setups | Filterable grid (Audio / Lighting / Combo) |
| `/gallery` | Public | Past concert & wedding stage photography | Filterable responsive photo mosaic |
| `/book` | Booking Flow | 3-step instant date lock (25% advance) | Calendar picker -> Details -> Razorpay checkout |
| `/inquiry` | Quotation Flow | Multi-day or custom concert rider builder | Form with acoustic venue specification |
| `/my-bookings` | Customer Portal | Order status, receipt & balance tracker | Phone/Email verification lookup |
| `/admin` | Admin Portal | Blackout calendar, booking manager & quotes | Secure PIN/Password protected dashboard |

---

## 2. Core User Journeys

### Journey 1: Cinematic Scroll Exploration
1. User lands on `/` (Section 01: Dawn empty venue wide shot).
2. Scrolling initiates canvas scrubbing:
   - *Scrub 1 (Home):* Truss warms up, audio crew silhouettes in background. Headline and trust metrics fade in center 60%.
   - *Scrub 2 (About):* Camera pans left revealing line-array stacking. Legacy glass card appears in left 45%.
   - *Scrub 3 (Services):* High-angle shot of lighting grid. 4 service capability cards appear in bottom 35%.
   - *Scrub 4 (Packages):* Slow dolly across stage deck. Pricing package comparison appears in right 42%.
   - *Scrub 5 (Gallery):* Full concert lighting bloom. Visual mosaic overlay appears in center 70%.
   - *Scrub 6 (Book):* Warm tungsten amber glow. Booking calendar card appears in center 55%.
   - *End Loop:* Seamlessly transitions back to Section 01 dawn state.

### Journey 2: Instant 25% Advance Booking Flow
1. User selects a package (e.g., *Premium DJ & Stage Rig* - ₹25,000).
2. User enters event date. System queries `/api/availability` to ensure date is free.
3. User enters event venue location, name, phone, and email.
4. Client requests order creation from `/api/razorpay/create-order`. Server validates package price from DB and calculates 25% advance (₹6,250).
5. Razorpay checkout modal opens. User completes payment via UPI / Card.
6. Razorpay callback hits `/api/razorpay/verify-payment`. Server verifies HMAC signature.
7. Database marks booking as `CONFIRMED`, `paymentStatus: ADVANCE_PAID`, and locks date in `Availability`.
8. User is redirected to confirmation screen with booking ID and downloadable receipt.

### Journey 3: Custom Concert / Festival Quotation Flow
1. User visits `/inquiry` for large festival or corporate setup.
2. User inputs expected audience size (e.g. 5,000+), venue type (Outdoor/Indoor stadium), and multi-day duration.
3. Submission stores inquiry as `status: NEW`.
4. Admin reviews in `/admin`, creates technical quote with itemized inclusions and sets `quoteAmount`.
5. User receives quotation link via email/WhatsApp and can accept and pay deposit directly.

---

## 3. Empty, Loading & Error States

- **Calendar Blocked:** Immediate visual amber warning if a chosen date is already booked or blacked out, offering alternate weekend dates.
- **Canvas Loading:** Minimalistic pulsating amber audio visualizer while initial WebP keyframe sequence preloads in background.
- **Payment Dropped:** If user cancels Razorpay modal, booking state remains `PENDING` with a "Resume Payment" link sent via SMS/Email.
