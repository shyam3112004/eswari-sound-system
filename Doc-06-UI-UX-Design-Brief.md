# Doc 06: UI/UX Design Brief — Eswari Sound System

## 1. Visual Identity & Brand System

| Design Token | Specification | Hex / Value | Usage |
|---|---|---|---|
| **Background (Ink)** | Deep Charcoal Ink | `#0B0B0F` | Global canvas backdrop, footer, page background |
| **Primary (Amber)** | Electric Warm Tungsten | `#FFB11A` | Main CTAs, glowing highlights, pricing callouts |
| **Secondary (Amber Soft)** | Muted Champagne Gold | `#C9A86A` | Sub-badges, border gradients, secondary accents |
| **Atmospheric (Haze)** | Cool Concert Haze | `#38BDF8` | Lighting rig bloom, subtle volumetric haze accents |
| **Surface Dark** | Glass Charcoal | `rgba(15, 15, 23, 0.72)` | Backdrop-filtered cards, modal overlays |
| **Card Borders** | Translucent Wireframe | `rgba(255, 255, 255, 0.08)` | Floating UI borders |
| **Card Borders (Active)** | Amber Wireframe | `rgba(255, 177, 26, 0.25)` | Featured packages, active input focus |

---

## 2. Typography Hierarchy

| Style | Font Family | Weight | Tracking | Purpose |
|---|---|---|---|---|
| **Display H1** | `Space Grotesk` | 800 (Bold) | `-0.03em` | Hero section titles & major stage statements |
| **Section H2** | `Space Grotesk` | 700 (Bold) | `-0.02em` | Section headers & modal titles |
| **Card H3** | `Space Grotesk` | 600 (SemiBold) | `-0.01em` | Package titles & service names |
| **Body** | `Inter` | 400 (Regular) | `0em` | Explanatory copy, feature descriptions |
| **Technical / Money** | `JetBrains Mono` | 500 (Medium) | `+0.05em` | Pricing (₹), dates, wattage, channel counts |

---

## 3. Safe Zone Layout Rules (Coordinated with Doc 01)

To ensure UI overlays never obscure the focal points of the underlying video footage (such as speaker line arrays, rigging truss, and stage decks):

1. **Section 01 (Home / Hero):** Clean center 60% boundary. Outer left and right edges keep speaker stacks and overhead truss unobstructed.
2. **Section 02 (About / Legacy):** Fixed to left 45% column. The right 55% showcases the stage build-up in progress.
3. **Section 03 (Services):** Lower horizontal grid spanning bottom 35%. Top 65% shows flown line arrays and overhead lights.
4. **Section 04 (Packages):** Pinned to right 42% column. Left side allows the wide stage deck to breathe.
5. **Section 05 (Gallery / Work):** Centered 70% glass modal with backdrop blur.
6. **Section 06 (Book / Contact):** Centered 55% interactive calendar and booking widget with warm ambient glow.

---

## 4. Micro-Interactions & Motion Design

- **Glassmorphic Hover Effect:** Cards elevate by `-4px` with an expanded amber glow (`0 0 25px -5px rgba(255, 177, 26, 0.4)`).
- **Button Feedback:** Soft spring scale (`scale(0.96)`) on active press with instantaneous visual feedback.
- **Canvas Scrubbing Smoothness:** Governed by Lenis inertial scrolling with a smoothing factor of `1.0` to eliminate frame judder.
