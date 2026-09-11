# NephroQuest ��

A case-based nephrology learning game — "diagnose-and-manage" simulation for
residents and doctors. Order labs under budget, interpret results while the
patient evolves, manage correctly, get scored on clinical accuracy.

> For medical education only. Not for real patient care.

## Game modes

- **Case Rush** (`/play`) — full patient simulations with:
  - Time + budget cost on every action (no shotgun ordering)
  - Evolving patient state with harm states (delay = deterioration)
  - Diagnosis + staging (KDIGO/CKD) + management phases
  - Scored: accuracy 40 / test efficiency 25 / time 15 / staging 10 / management 10
  - Post-case "your workup vs the expert's" comparison + teaching points
- **Lab Drill** (`/drill`) — timed rapid-fire lab interpretation (10 questions,
  45s each, streak tracking)

## Adding cases

Cases live in `data/cases.ts` as structured data. Each case defines
presentation, history options, orderable tests (with cost/time/results),
expert workup (the minimal sufficient set), diagnosis options, staging
question, management options, harm states, and teaching points.

Adding a case = adding one object to the array. No other code changes needed.

Lab Drill questions live in `data/drill.ts`.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to https://vercel.com → sign in with GitHub
3. "Add New Project" → import this repo
4. Vercel auto-detects Next.js — just click **Deploy**
5. Your app goes live at `your-app.vercel.app`

## Tech

- Next.js 14 (App Router), React 18, no other runtime deps
- Fully client-side — progress stored in localStorage (no DB, no auth)
- TypeScript throughout
