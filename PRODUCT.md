# Product

## Register

product

## Users

Three distinct audiences, one civic platform serving the Persons with Disability Affairs Office (PDAO) of the **Municipality of Loreto, Agusan del Sur**:

- **PDAO staff** — local government workers processing PWD registrations at a desk, often on modest hardware and variable connectivity. They live in the application queue, approval wizard, and per-barangay reports. Their job: move applications through a lifecycle accurately and produce trustworthy records.
- **PWD beneficiaries** — persons with disabilities (visual, hearing, mobility, cognitive, psychosocial, and more) accessing their Digital ID, profile, and announcements. Often on mobile, sometimes assisted, sometimes using voice navigation or screen readers. Their job: see their status and carry a valid digital ID.
- **Guardians** — family members or carers of a PWD ward, viewing the ward's details and ID. Their job: stay informed on behalf of someone they support.

## Product Purpose

CMSPD digitizes a paper-based PWD registration and monitoring process for one municipal PDAO. It replaces slow document shuffling with an online intake form, a staff dashboard with a real application lifecycle, a digital-signature approval flow that provisions accounts, a printable Digital PWD ID, per-barangay × disability-type reporting, and broadcast announcements. Success = a PDAO clerk processes a registration end-to-end without paper, and a beneficiary can pull up a valid ID on their phone.

## Brand Personality

**Trustworthy, clear, dignified.** This is a government service for a vulnerable population — it must feel official and reliable without being cold or bureaucratic. Civic-blue identity (it represents a real LGU). Voice is plain, respectful, and instructive — never clever. The interface should read as *competent public infrastructure*: the kind of tool a citizen trusts with their identity and a clerk trusts with their workload.

## Anti-references

- **Startup/SaaS marketing gloss** — no gradient hero metrics, no "10x your workflow," no playful mascots. This is government, not a growth product.
- **The tiny-uppercase-tracked eyebrow above every section** — currently overused (`PDAO Central`, `Provincial Government Portal`, `Settings`). Civic ≠ kicker-on-everything.
- **Ghost cards** — 1px border + a wide soft drop shadow on the same element. Pick one elevation language.
- **Generic admin-template dashboards** — identical icon+number+label card grids repeated endlessly.
- **Decorative-only color** — saturated accents on inactive states, color that doesn't carry meaning.

## Design Principles

1. **Dignity through clarity.** Every screen states plainly where the user is, what's happening, and what to do next. No jargon, no surprises. Respect is shown by never making the user feel lost.
2. **Accessibility is the spec, not a pass.** Users are persons with disabilities. WCAG 2.1 AA is the floor: ≥4.5:1 body contrast, visible focus on every interactive element, ≥44px touch targets, full reduced-motion support, real keyboard and screen-reader paths.
3. **Earned familiarity.** Standard affordances done well — the tool disappears into the task. A clerk fluent in any LGU system should trust this on sight.
4. **One civic identity, three portals.** PDAO, PWD, and Guardian share a single design language (tokens, components, shell). They differ in content and density, never in vocabulary.
5. **State over decoration.** Color, motion, and elevation communicate status (pending/approved/rejected, verified/unverified, loading/error) — never ornament.

## Accessibility & Inclusion

- **Target: WCAG 2.1 AA + PWD-specific extras.**
- Body text ≥4.5:1; large/bold text ≥3:1; placeholders meet body contrast (no faint gray).
- Visible `:focus-visible` ring on every interactive element, never `outline: none` without a replacement.
- Interactive touch targets ≥44×44px (buttons, nav items, toggles, form controls).
- Full `prefers-reduced-motion: reduce` alternative for every animation (crossfade or instant).
- Honors `prefers-color-scheme`; light/dark both pass contrast.
- Semantic HTML, labelled controls, meaningful `alt`, status messages announced (`aria-live` where status changes).
- Works with the existing voice-navigation and dictation features (Chrome/Edge Web Speech API).
