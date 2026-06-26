# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # start Vite dev server (http://localhost:5173)
npm run build     # production build
npm run preview   # preview the production build locally
npm run lint      # run ESLint
```

There are no tests in this project.

## Environment variables

Requires a `.env` file at the project root:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_PSGC_API_URL=https://psgc.gitlab.io/api   # optional, has default
```

## Architecture

**Stack:** React 19, React Router 7, Tailwind CSS 4 (via `@tailwindcss/vite`), Supabase (auth + database + storage + Edge Functions), Recharts, react-hook-form, react-toastify, lucide-react.

### Role model

There are three user roles, stored in `user_metadata.role` on the Supabase auth user:
- `pdao` — PDAO staff; full admin access (`/app/*`)
- `pwd` — approved PWD beneficiary (`/app/pwd-beneficiary/*`)
- `guardian` — guardian of a PWD ward (`/app/guardian/*`)

No role is assigned at sign-up; roles are set server-side by Edge Functions (`approve-application`, `create-guardian`). `ProtectedRoute` (`src/routes/ProtectedRoute.jsx`) redirects unauthenticated users to `/auth/login` and wrong-role users to `/`.

### Routing

All routes are lazy-loaded via `React.lazy` + `Suspense` in `src/routes/AppRouter.jsx`. Layout structure:

```
/                          → LandingPage (public)
/beneficiary-apply         → BeneficiaryApply (public, unauthenticated application form)
/auth/login                → Login
/auth/forgot-password      → ForgotPassword
/app/*                     → DashboardLayout  (role: pdao)
/app/pwd-beneficiary/*     → PwdLayout        (role: pwd)
/app/guardian/*            → GuardianLayout   (role: guardian)
```

### Context providers

Defined in `src/context/`, mounted in `src/App.jsx` as `ThemeProvider > AuthProvider`:

- **ThemeProvider / ThemeContext** — `"light"` | `"dark"`, persisted to localStorage as `cmspd-theme`, toggled by `toggleTheme()`. Adds/removes `dark` class on `<html>`.
- **AuthProvider / AuthContext** — exposes `{ user, role, isAuthenticated, signIn, logout }`. `user.role` is read from `user_metadata.role`. The provider blocks render until the initial Supabase session resolves.

### Design system / theming

All UI uses CSS custom properties (`--gov-bg`, `--gov-text`, `--gov-surface`, `--gov-border`, `--gov-muted`, `--gov-shadow`, etc.). Dark/light variants switch via the `dark` class on `<html>`. Do not use hard-coded Tailwind colour classes for foreground/background; reference the tokens with the `[color:var(--gov-…)]` / `bg-[color:var(--gov-…)]` arbitrary-value syntax (replace `…` with the token name).

### Supabase service layer

`src/services/supabase/` contains thin wrappers around the Supabase client. Each file owns one domain:

| File | Tables / functions |
|------|--------------------|
| `auth.js` | `supabase.auth.*`, maps session user to `{ id, email, role, fullName, avatarUrl }` |
| `applications.js` | `applications` table, `approve-application` Edge Function |
| `profile.js` | `profiles` table, `avatars` storage bucket, `send-email-otp` / `verify-email-otp` Edge Functions |
| `guardians.js` | `guardian_ward_links` table, `create-guardian` Edge Function |
| `announcements.js` | `announcements` table |

RLS on Supabase enforces role access — never skip the service layer to query Supabase directly from components.

**Key pattern:** anonymous applicants cannot `SELECT` from `applications` after insert (no RLS select policy); `submitApplication` therefore generates the reference number client-side and does not chain `.select()`.

### Edge Functions

Three Supabase Edge Functions handle privileged operations:
- `approve-application` — creates a PWD auth account, links it to the application, stores approval record
- `create-guardian` — creates a guardian auth account and inserts a `guardian_ward_links` row
- `send-email-otp` / `verify-email-otp` — OTP flow via Resend for email verification

### Geographic scope

The system serves **Loreto, Agusan del Sur only**. Barangay lists are fetched from the PSGC API (`src/services/psgc.js`, municipality code `160305000`). Address fields default to Loreto / Agusan del Sur / 8507 and are not editable.

### Speech recognition

`src/hooks/useSpeechRecognition.js` wraps the browser Web Speech API (Chrome/Edge only, requires HTTPS or localhost, one-time microphone permission). Used in `BeneficiaryApply` for voice-assisted form filling.

### Digital ID card

`src/components/pwd/DigitalIdCard.jsx` renders a two-sided PWD ID (front + back). It reads from the `profiles` table joined with `applications.approval` (which stores the approving officer info and signature as a data URL). Emergency contact fields (`contactPerson`, `telNos`) live in `application.data` (the raw JSON form blob), not in top-level profile columns.
