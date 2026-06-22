# CMSPD — Community Monitoring System for Persons with Disabilities

A web-based platform for the **Persons with Disability Affairs Office (PDAO)** of
**Loreto, Agusan del Sur**. It digitizes PWD registration and document
processing, lets beneficiaries and their guardians access their records online,
and gives PDAO staff a monitoring dashboard, per-barangay reports, and a digital
PWD ID.

> Capstone project: *"A Web-based Community Monitoring System for Persons with
> Disabilities that enhances data management, monitoring, and accessibility of
> services for improved efficiency and inclusivity."*

---

## Problems addressed

1. **No digital platform** — PDAO relied on slow, paper-based processing of PWD
   documents.
2. **Limited information** — PWDs lacked timely, accurate updates.
3. **Insufficient community support** — limited participation/inclusion for PWDs
   who need assistance.

## Objectives

1. Analyze the manual system and establish requirements for a digital platform.
2. Provide a visualization dashboard plus **reports of registered PWDs per
   barangay, classified by disability type**.
3. Develop a **guardian module**, notifications, **digital-signature
   authentication**, and **voice-recognition** integration.

---

## Tech stack

- **Frontend:** React 19 + Vite, React Router, Tailwind CSS v4
- **Forms / UI:** react-hook-form, react-toastify, lucide-react, Recharts
- **Backend:** Supabase — Postgres + Row Level Security (RLS), Auth, Storage,
  Edge Functions (Deno)
- **External API:** [PSGC API](https://psgc.gitlab.io/api) for Philippine
  barangay data (Loreto, Agusan del Sur)

---

## Roles

| Role | Portal | How accounts are created |
|------|--------|--------------------------|
| **PDAO** staff | `/app` (dashboard, applications, PWD management, reports, announcements) | Provisioned in Supabase Auth (`user_metadata.role = "pdao"`) |
| **PWD** beneficiary | `/app/pwd-beneficiary` | Auto-created when PDAO approves an application |
| **Guardian** | `/app/guardian` | Auto-created on approval when guardian details are provided; linked to the PWD ward |

Roles come from the authenticated user's `user_metadata.role`; routes are guarded
by `ProtectedRoute`.

---

## Key features

### Public
- **Beneficiary application form** (`/beneficiary-apply`) — multi-step intake with
  per-step validation, required-field markers, PH mobile / email format checks,
  a fixed locality (Municipality of Loreto / Agusan del Sur / 8507), a **barangay
  dropdown from the PSGC API**, and **voice dictation** (Web Speech API) that
  types into the focused field.

### PDAO
- **Dashboard** — live application counts (total / pending / approved / rejected),
  applications-per-month chart, recent activity.
- **Applications** — real queue with search/filter; status as a lifecycle
  (pending → Approve/Reject; approved is locked; rejected can be reconsidered).
- **Approval wizard** — a 3-step modal: (1) PWD signature, (2) Processing &
  Approving Officer names, (3) Approving Officer signature. On approval it
  creates the PWD account + profile, assigns the PWD ID number, stores both
  signatures, and auto-creates/links the guardian.
- **PWD Management** — registered PWD profiles with a detail view and the
  **Digital ID** (front/back replica of the physical PWD ID).
- **Reports** — registered PWDs **per barangay × disability type** cross-tab,
  charts, filtered **CSV export**, and print / save-as-PDF.
- **Announcements** — post/edit/delete advisories broadcast to PWDs and guardians.

### PWD beneficiary
- Dashboard, **Digital ID** (printable / save-as-PDF), **Announcements**, and
  **Profile management** (avatar upload, personal info, separate account settings,
  and personal-email / mobile fields with verification status).
- **Voice navigation** — a floating mic to move around the portal by voice.

### Guardian
- Dashboard listing linked ward(s) with their details and Digital ID, plus the
  announcements feed.

### Digital signature & ID
- The PWD signs at approval (XP-Pen / mouse / touch); the approving officer signs
  too. Both are stored; the Digital ID shows the PWD signature, the approving
  officer's signature, and the officer's underlined name.
- **PWD ID number** format: `RR-PP-MM-BB-NNNNNN` (e.g. `16-03-05-05-000012`) —
  Region / Province / Municipality (Loreto) / barangay code (PSGC) / serial.

---

## Data model (Supabase `public` schema)

- **applications** — submitted intake forms (full form snapshot in `data` jsonb,
  status, `approval` record with signatures + officers).
- **profiles** — one per PWD account (personal info, avatar, `pwd_id_number`,
  verification flags, link to source application).
- **ward_links** — guardian ↔ PWD ward relationships.
- **announcements** — PDAO broadcasts.

All tables use **RLS**: PWDs see only their own data, guardians see their wards,
PDAO sees everything; writes that provision accounts run in Edge Functions with
the service-role key.

### Edge Functions
- **approve-application** — verifies the caller is PDAO, creates the PWD auth
  account + profile, assigns the PWD ID number, stores the approval (signatures +
  officers), and auto-creates/links the guardian.
- **create-guardian** — manual guardian creation + linking (PDAO only).

---

## Getting started

### Prerequisites
- Node.js 20+ and npm
- A Supabase project

### Environment
Create a `.env` file in the project root:

```bash
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
VITE_PSGC_API_URL=https://psgc.gitlab.io/api
```

> Only `VITE_`-prefixed values are exposed to the browser — never put service-role
> keys or third-party secrets (SMS/email providers) here. Those belong in Supabase
> Edge Function secrets.

### Install & run

```bash
npm install      # install dependencies
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # production build
npm run preview  # preview the production build
npm run lint     # run ESLint
```

Voice features and signature capture need **Chrome or Edge** over `localhost`/HTTPS
(and microphone permission for voice).

---

## Project structure

```
src/
├── components/      # UI, charts, cards, applications, pwd, reports components
├── constants/       # navigation, disability labels, etc.
├── context/         # Auth context/provider
├── hooks/           # useSpeechRecognition (Web Speech API)
├── layouts/         # Dashboard / PWD / Guardian / Auth layouts
├── pages/           # route pages (auth, dashboard, applications, reports, …)
├── routes/          # AppRouter + ProtectedRoute
└── services/supabase/  # client + auth, applications, profile, guardians, announcements
```

---

## Status

Built: digital intake & processing, PDAO dashboard/reports, PWD management +
Digital ID, guardian module, announcements, digital-signature authentication, and
voice recognition (dictation + navigation).

Planned: **email + SMS notifications** and **OTP verification** of the personal
email (Resend) and mobile number (Semaphore), implemented via Edge Functions.
