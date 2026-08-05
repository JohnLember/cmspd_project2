# Design

Visual system for CMSPD — a civic monitoring portal for PDAO Loreto, Agusan del Sur. One identity across three portals (PDAO / PWD / Guardian) plus public landing + intake. Register: **product**. Accessibility target: **WCAG 2.1 AA + PWD extras**.

## Theme

Light by default, full dark mode via `.dark` on `<html>`, honoring `prefers-color-scheme`. The mood is **competent public infrastructure**: a clerk at a municipal desk and a beneficiary on a phone both trust it instantly. Calm civic-blue identity, generous whitespace, restrained color, state-driven accents. Not a SaaS dashboard, not a marketing site — government software done with care.

Color strategy: **Restrained** — tinted neutrals + a single civic-blue accent reserved for primary actions, current selection, and state. A cooler second neutral layer (`--gov-surface`) separates chrome (sidebars, navbar) from content (`--gov-bg`).

## Color

All tokens authored in **OKLCH**, preserving the established civic-blue identity (legacy `#1d4ed8`). Defined in `src/index.css` under `:root` and `.dark`.

**Light:**
- `--gov-bg` — app canvas, cool near-white (oklch ~0.985 0.004 240)
- `--gov-surface` — chrome / panels, pure white
- `--gov-card` — content cards, faint cool tint
- `--gov-text` — primary ink, slate-950 (~0.21 0.04 257), ≥12:1 on bg
- `--gov-muted` — secondary text, slate-600 calibrated to ≥4.6:1 on bg/card
- `--gov-border` — hairlines (~0.92 0.006 247)
- `--gov-primary` — civic blue `#1d4ed8` → oklch(0.488 0.217 264), action + selection
- `--gov-primary-hover`, `--gov-primary-active` — darker steps for state
- `--gov-accent` — sky cyan, info / status dot only
- `--gov-ring` — focus ring (primary at higher chroma)

**Semantic state** (both themes, each with `-fg` and `-soft` background):
- `--gov-success` (green), `--gov-warning` (amber), `--gov-danger` (red), `--gov-info` (sky)

**Dark:** same roles re-pitched on a deep slate canvas; primary lightens to oklch(~0.7 0.16 264) for contrast on dark. State colors lighten accordingly.

**Rule:** muted gray never carries body text on a colored fill; use the fill's own darker hue or a transparency of the ink. Placeholders use `--gov-muted` (AA), never lighter.

## Data visualization

Charts get their **own** color slots (`--chart-*` in `src/index.css`), never the `--gov-*` state tokens. The semantic tokens are tuned for badge text on a soft fill; used as large chart fills they read harsh and over-saturated. Chart steps sit lower in chroma (~0.11–0.17 vs 0.21) and inside a controlled lightness band.

- **Categorical** — `--chart-1` … `--chart-10`, assigned in **fixed order and never cycled**. A type keeps its color when a filter drops other types. `--chart-neutral` / `--chart-neutral-faint` carry "Other" and "Unspecified"; an 11th category folds to neutral rather than getting a generated hue. Mapped in `constants/disability.js`.
- **Binary state** — `--chart-received` (blue) / `--chart-pending` (amber). Deliberately **not** green/amber: the blue–yellow axis survives protanopia (adjacent ΔE 27 vs 7). Semantics are carried by the legend wording, not the hue.
- **Chrome** — `--chart-grid` for gridlines, `--chart-cursor` for the hover band. Recessive by design.
- **Dark mode is selected, not flipped.** The same hues are re-pitched into the dark lightness band (L 0.48–0.67) against `--gov-card`; light steps sit in L 0.43–0.77.
- **Every slot is validated, not eyeballed** — lightness band, chroma floor, adjacent-pair CVD separation (deutan/protan/tritan), normal-vision floor, and ≥3:1 non-text contrast against the card surface, per mode.
- **Marks** — 4px radius on the data-end only, `maxBarSize` 40, a 2px `--gov-card` stroke between stacked segments so neighbors stay separable, legend always present for ≥2 series.

## Elevation (replaces the ghost-card pattern)

Pick **one** language per element — never 1px border + wide shadow together.
- `--elev-0` flat: border only (`1px solid --gov-border`) — default for most cards.
- `--elev-1` raised: soft 1-layer shadow, no border — dropdowns, popovers.
- `--elev-2` overlay: 2-layer shadow — modals, dialogs.
Cards (`.gov-card`) default to **flat border** elevation. Shadow is reserved for things that genuinely float.

## Typography

One family, multiple weights — **Public Sans** (UI: headings, labels, buttons, body, data). **Source Sans 3** as the system fallback companion. No display/body pairing (product register). Fixed **rem** scale, not fluid clamp.

Scale (ratio ~1.2):
- `--text-xs` 0.75rem · `--text-sm` 0.875rem · `--text-base` 1rem (16px floor for body) · `--text-lg` 1.125rem · `--text-xl` 1.25rem · `--text-2xl` 1.5rem · `--text-3xl` 1.875rem · `--text-4xl` 2.25rem (page/hero ceiling, product).
- Weights: 400 body, 500 medium (labels/nav), 600 semibold (headings), 700 reserved.
- Headings letter-spacing -0.01 to -0.02em (never below -0.04em). Body 0, line-height 1.5; headings 1.2 with `text-wrap: balance`. Prose capped 65–75ch.

## Components

Shared vocabulary, identical across all four surfaces:
- **Buttons** — primary (solid civic-blue), secondary (border, surface fill), ghost (text). All ≥44px tall, `--radius-md` (10px), states: default/hover/focus-visible/active/disabled/loading. One shape everywhere.
- **Inputs / selects / textarea** — surface fill, 1px border, 44px min height, visible focus ring, error variant (danger border + helper text + `aria-invalid`).
- **Cards** — flat border, `--radius-lg` (14px), no nested cards.
- **Sidebar nav** — chrome surface, active item = primary fill + white text, hover = subtle tint, focus ring; ≥44px rows with icon + label.
- **Badges / status pills** — semantic soft bg + matching fg (pending=warning, approved=success, rejected=danger, verified=success, unverified=muted).
- **Stat tiles** — number + label + optional delta; restrained, not the gradient hero-metric cliché; varied, not an identical grid.
- **Tables** — dense, zebra-free, hairline row borders, sticky header, sortable affordances, responsive (stack/scroll on mobile).
- **Skeletons** for loading (not centered spinners), **empty states** that teach.
- **Modals** — used sparingly (approval wizard earns it); `<dialog>`/portal, focus-trapped, `--elev-2`, backdrop, Esc + click-out to close.

## Radius

`--radius-sm` 8px (inputs, small) · `--radius-md` 10px (buttons) · `--radius-lg` 14px (cards) · `--radius-xl` 20px (large panels) · `--radius-full` pills/avatars. Cards never exceed 16px. No 24/32px+ on cards.

## Spacing

4px base scale (`--space-1`=4 … `--space-16`=64). Vary section rhythm; don't apply uniform gaps. Page gutters: 16px mobile, 24px tablet, 32px desktop.

## Motion

Tokens: `--ease-out` cubic-bezier(0.22,1,0.36,1) (out-expo-ish), durations `--dur-fast` 120ms / `--dur` 180ms / `--dur-slow` 240ms. Product motion conveys state only — hover/focus/selection feedback, status changes, skeleton shimmer, modal/menu enter-exit, list stagger on first load. No orchestrated page-load choreography. Every animation has a `@media (prefers-reduced-motion: reduce)` crossfade/instant fallback. Never animate layout props; transform/opacity/filter only.

## Focus & Targets (AA + PWD extras)

- `:focus-visible` → 2px `--gov-ring` ring + 2px offset on every interactive element. Never bare `outline: none`.
- Min interactive size 44×44px.
- Z-index scale (semantic): `--z-dropdown` 1000 · `--z-sticky` 1100 · `--z-backdrop` 1200 · `--z-modal` 1300 · `--z-toast` 1400 · `--z-tooltip` 1500. No arbitrary 9999.

## Print

Digital ID print path preserved: hide `header`/`aside`, white bg, exact color adjust.
