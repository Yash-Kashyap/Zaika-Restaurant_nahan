# Zaika Restaurant (Teesri Manzil) — Astro Website

A pixel-faithful, high-performance static website for **Zaika Restaurant, Nahan (Hotel City Heart, 3rd Floor)** built with Astro and Tailwind CSS.

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Start development server
```bash
npm run dev
```
Open `http://localhost:4321` in your browser.

### 3. Build for production
```bash
npm run build
```
The static site is generated into the `dist/` folder.

### 4. Preview production build locally
```bash
npm run preview
```

---

## 🛠 Project Structure

```
zaika-astro/
├── public/
│   ├── fonts/           # Boska & General Sans (WOFF2)
│   ├── images/          # Restaurant interior & tandoor dishes
│   ├── favicon.svg      # Boska italic brand monogram
│   └── robots.txt
├── src/
│   ├── components/      # Standalone Astro sections (Hero, Lobby, Bento, Menu, Drawer, etc.)
│   ├── data/
│   │   ├── menu.json    # Full 198 menu items across 13 categories
│   │   └── site.ts      # Owner details, phone, hours, and external links
│   ├── layouts/
│   │   └── BaseLayout.astro # Head, metadata, font preloads, SEO & JSON-LD schema
│   ├── scripts/
│   │   ├── cart.ts      # Interactive order slip & WhatsApp order generation
│   │   ├── floors.ts    # Elevator wayfinding & IntersectionObserver triggers
│   │   ├── menu.ts      # Real-time search & category filtering
│   │   └── status.ts    # Real-time IST opening hours calculator
│   └── styles/
│       └── global.css   # Tailwind v4 theme tokens & component styles
└── astro.config.mjs
```

---

## ✏️ Updating Restaurant Information

### Contact Numbers, Hours & Links
Edit [`src/data/site.ts`](file:///src/data/site.ts):
- **Phone & Call CTAs:** Update `phone` and `phoneHref`
- **WhatsApp:** Update `whatsappRaw` and `whatsappDisplay`
- **Hours:** Update `hours.day` and `hours.night`
- **External Links:** Google Maps, Zomato, District, and JustDial URLs

### Menu Items & Prices
Edit [`src/data/menu.json`](file:///src/data/menu.json):
- Add, remove, or modify items across any of the 13 categories.
- Each item supports `n` (name), `p` (price), `d` (description), and `t` ("v" for veg, "n" for non-veg).

---

## 🚢 Deployment

### Netlify
1. Connect the repository or upload the `dist/` directory.
2. Build command: `npm run build`
3. Publish directory: `dist`

### Vercel
1. Import the project into Vercel.
2. Framework Preset: **Astro**
3. Build command: `npm run build`
4. Output directory: `dist`
