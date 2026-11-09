# Design System & Guidelines — Zaika Restaurant (Teesri Manzil)

Visual specification, design tokens, color palette, typography, and structural guidelines for **Zaika Restaurant, Nahan** (Hotel City Heart, 3rd Floor).

---

## 1. Brand Concept & Aesthetic Direction

- **Atmosphere:** Contemporary heritage hill-station dining. Sophisticated North Indian & Mughlai restaurant perched on the 3rd floor overlooking Chaugan Ground.
- **Palette Identity:** Pale sage canvas, deep alpine ink, surface moss accents, and gingham rose action accents.
- **Aesthetic Core:** Editorial typography paired with structured bento grids and architectural floor-by-floor vertical wayfinding.
- **Strict Quality Rule:** 1:1 fidelity to reference `Main.dc.html`. No unsolicited generic templates, gradients, or stock UI.

---

## 2. Color Tokens

```css
:root {
  --color-canvas: #F1F3EC;            /* Page background, pale sage */
  --color-surface: #E4EAE1;           /* Panels, bento tiles, hours box, notes */
  --color-surface-2: #D9E3D6;         /* House dish tile, lift doors */
  --color-ink: #1F3A31;               /* Primary typography, deep green */
  --color-ink-muted: #56675E;         /* Secondary typography, micro labels */
  --color-rule: rgba(31, 58, 49, 0.10);        /* Hairline borders */
  --color-rule-strong: rgba(31, 58, 49, 0.20); /* Strong borders and button outlines */
  --color-action: #B52F45;            /* Gingham rose: CTAs, active states, cart stepper */
  --color-action-ink: #FFF8F5;        /* Contrast text on action elements */
  --color-veg: #2E7D4F;               /* Veg food indicator mark */
  --color-nonveg: #B0412E;            /* Non-veg food indicator mark */
}
```

---

## 3. Typography & Font Stack

### Display Font: **Boska** (Fontshare)
- `fonts/boska-400.woff2` (Normal 400)
- `fonts/boska-400-italic.woff2` (Italic 400)
- `fonts/boska-500.woff2` (Medium 500)
- `fonts/boska-500-italic.woff2` (Medium 500 Italic)
- `fonts/boska-700.woff2` (Bold 700 - Hero giant "3")

### Body Font: **General Sans** (Fontshare)
- `fonts/general-sans-400.woff2` (Regular 400)
- `fonts/general-sans-500.woff2` (Medium 500)
- `fonts/general-sans-600.woff2` (Semibold 600)

### Typographic Scales:
- **Hero Giant '3':** `clamp(180px, 28vw, 360px)`, Boska 700, image-fill parallax
- **Section Headings (H2):** `clamp(2.25rem, 4vw, 3.5rem)`, line-height `1.08`, Boska 500
- **Dish Names:** Boska 24px–28px, letter-spacing `-0.015em`
- **Micro Labels:** General Sans 12px, font-weight 600, `letter-spacing: 0.08em`, uppercase
- **Body Text:** General Sans 17px, line-height `1.6`, `letter-spacing: -0.01em`

---

## 4. Spacing, Grid & Layout System

- **Base Grid:** 8-point spatial system:
  - `--s1`: 8px
  - `--s2`: 16px
  - `--s3`: 24px
  - `--s4`: 32px
  - `--s6`: 48px
  - `--s8`: 64px
  - `--s12`: 96px
  - `--s16`: 128px
- **Page Container (`.wrap`):** `max-width: 1360px; margin: 0 auto; padding-inline: 48px;` (24px on mobile ≤900px).
- **Responsive Breakpoint:** Exactly **900px** (`@media (max-width: 900px)`).

---

## 5. UI Micro-Interactions & Components

1. **Top Bar:** Sticky, translucent canvas with `backdrop-filter: blur(12px)`.
2. **Floor Indicator:** Sticky/fixed elevator indicator tracking G, 1, 2, 3 via IntersectionObserver.
3. **Lift Doors (`.doors`):** Animated shutter panels revealing imagery.
4. **Interactive Cart:** Real-time dish counter (`OrderTicket`), drawer (`OrderSlip`), and quantity stepper (`AddControl`).
5. **Menu Filter & Live Search:** Dual-mode navigation with category chips/directory list and real-time live search.
6. **Live Hours Badge (`status.ts`):** Evaluates IST (`Asia/Kolkata`) hours for lunch and dinner sittings.

