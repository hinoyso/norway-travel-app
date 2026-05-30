# 🇳🇴 Norway Travel App

A premium mobile-first PWA travel planner built for a personal Norway trip. Upload an Excel itinerary and get a beautiful, offline-capable day-by-day travel app.

---

## ✨ Features

- **Excel upload** — import your trip itinerary from .xlsx
- **Day-by-day timeline** — beautiful activity cards with time, address, notes
- **Live weather** — real Norwegian weather via Open-Meteo (no API key needed)
- **Google Maps** integration — embedded maps, driving/walking/transit directions
- **Route optimization** — nearest-neighbor TSP for daily activity ordering
- **PWA** — install on iPhone/Android home screen, works offline
- **Dark mode** — full system-aware dark theme
- **Auth** — email/password + magic link via Supabase

---

## 🚀 Setup (Step-by-Step)

### 1. Install Node.js

Download and install from: https://nodejs.org (choose LTS version)

Verify: `node --version` and `npm --version` in terminal

### 2. Install dependencies

```bash
cd norway-travel
npm install
```

### 3. Set up Supabase

1. Create a free project at https://supabase.com
2. Go to **SQL Editor** and paste + run the contents of `supabase/schema.sql`
3. In **Settings → API**, copy your Project URL and anon key

### 4. Set up Google Maps API

1. Go to https://console.cloud.google.com
2. Create a project → Enable these APIs:
   - Maps JavaScript API
   - Directions API
   - Geocoding API
3. Create an API Key under **Credentials**
4. (Optional) Restrict key to your domain

### 5. Create environment file

```bash
cp .env.example .env.local
```

Fill in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 6. Generate Excel template (optional)

```bash
npx ts-node scripts/generate-template.ts
```

This creates `public/template.xlsx` — a sample itinerary you can download from the app.

### 7. Run development server

```bash
npm run dev
```

Open http://localhost:3000

---

## 📱 Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Or connect your GitHub repo to Vercel and add environment variables in the Vercel dashboard.

**Required environment variables in Vercel:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- `NEXT_PUBLIC_APP_URL` (your Vercel URL)

---

## 📋 Excel Format

Your Excel file should have these columns (case-insensitive):

| Column | Required | Example |
|--------|----------|---------|
| Date | ✅ | 2024-07-01 |
| Day Number | — | 1 |
| City | ✅ | Oslo |
| Activity Name | ✅ | Vigeland Park |
| Description | — | Sculpture park... |
| Start Time | — | 09:00 |
| End Time | — | 11:00 |
| Address | — | Nobels gate 32, Oslo |
| Notes | — | Free entry |

Download the template from the Admin page in the app.

---

## 🗂 Project Structure

```
norway-travel/
├── app/
│   ├── (auth)/login/          # Login screen
│   ├── (dashboard)/           # Main app screens
│   │   ├── page.tsx           # Home
│   │   ├── days/              # Full itinerary list
│   │   ├── day/[id]/          # Day detail
│   │   ├── activity/[id]/     # Activity detail
│   │   ├── map/               # Full route map
│   │   └── settings/          # Settings
│   ├── admin/                 # Upload page
│   └── api/                   # API routes
├── components/
│   ├── activity/              # Activity cards & timeline
│   ├── maps/                  # Map embed & nav buttons
│   ├── navigation/            # Bottom nav & headers
│   ├── trip/                  # Trip hero & day cards
│   ├── upload/                # Excel uploader
│   ├── weather/               # Weather display
│   └── ui/                    # shadcn primitives
├── lib/
│   ├── excel/parser.ts        # xlsx parsing
│   ├── maps/directions.ts     # Google Maps client
│   ├── maps/optimize.ts       # Route optimization (TSP)
│   ├── supabase/              # Supabase clients
│   ├── types/index.ts         # TypeScript types
│   ├── weather/client.ts      # Open-Meteo client
│   └── utils.ts               # Shared utilities
├── hooks/                     # React hooks
├── store/tripStore.ts         # Zustand store
└── supabase/schema.sql        # Database schema
```

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | TailwindCSS + shadcn/ui |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Maps | Google Maps JS API |
| Weather | Open-Meteo (free) |
| Animation | Framer Motion |
| State | Zustand |
| PWA | next-pwa |
| Deployment | Vercel |

---

## 🔒 Security Notes

- All data is row-level secured per user in Supabase
- Google Maps API key should be restricted to your domain
- The service role key is only used server-side (never exposed to browser)

---

*Built with love for a special Norway adventure* 🏔️
