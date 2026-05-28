import {
  Accessibility,
  BadgeCheck,
  BarChart3,
  BookOpen,
  Building2,
  FileCheck2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Link } from "react-router";
import LandingFooter from "../../components/landing/LandingFooter.jsx";
import LandingHeader from "../../components/landing/LandingHeader.jsx";
import LandingSection from "../../components/landing/LandingSection.jsx";

const stats = [
  { label: "Registered PWDs", value: "2,418" },
  { label: "Partner Barangays", value: "42" },
  { label: "Active Subsidies", value: "1,042" },
  { label: "Cases resolved on time", value: "96%" },
];

const faqs = [
  {
    question: "How do I register a PWD profile?",
    answer:
      "PDAO staff will assist with registration. The portal will allow secure digital submission of requirements and status tracking.",
  },
  {
    question: "Can guardians manage multiple PWD profiles?",
    answer:
      "Yes. Guardian accounts can link multiple PWD profiles with verified consent and approval.",
  },
  {
    question: "Will the portal send SMS or email alerts?",
    answer:
      "Yes. Official SMS and email alerts will be activated once government messaging services are connected.",
  },
];

const blogItems = [
  {
    title: "Barangay readiness roadmap",
    excerpt:
      "A 6-month rollout plan to align barangay coordinators with the PWD monitoring workflow.",
  },
  {
    title: "Inclusive analytics in action",
    excerpt:
      "How accessibility-first dashboards improve subsidy distribution accuracy and timeliness.",
  },
  {
    title: "Building trust with secure data",
    excerpt:
      "Governance and data privacy practices designed for public service platforms.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[color:var(--gov-bg)] text-[color:var(--gov-text)]">
      <LandingHeader />

      <main className="space-y-20 px-6 pb-20">
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-40 right-0 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(29,78,216,0.18),_transparent_70%)]" />
            <div className="absolute bottom-0 left-10 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(14,165,233,0.18),_transparent_70%)]" />
          </div>
          <div className="mx-auto grid w-full max-w-6xl gap-10 pt-12 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-3 py-1 text-xs font-semibold text-[color:var(--gov-muted)]">
                <Sparkles className="h-3.5 w-3.5 text-[color:var(--gov-accent)]" />
                Official PDAO service platform
              </div>
              <h1 className="text-4xl font-semibold leading-tight lg:text-5xl">
                Deliver inclusive PWD services with clarity, speed, and accountability
              </h1>
              <p className="text-base text-[color:var(--gov-muted)]">
                This government-grade portal centralizes PWD registration,
                assistance tracking, and barangay coordination so every case is
                visible, verified, and supported on time.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/auth/login"
                  className="rounded-full bg-[color:var(--gov-primary)] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                >
                  Access the portal
                </Link>
              </div>
              <div className="flex flex-wrap gap-6 text-sm text-[color:var(--gov-muted)]">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                    Accredited
                  </p>
                  <p className="text-sm font-semibold text-[color:var(--gov-text)]">
                    <span className="inline-flex items-center gap-2">
                      <BadgeCheck className="h-4 w-4 text-[color:var(--gov-accent)]" />
                      PDAO office network
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                    Coverage
                  </p>
                  <p className="text-sm font-semibold text-[color:var(--gov-text)]">
                    <span className="inline-flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-[color:var(--gov-accent)]" />
                      Province-wide barangays
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <div className="gov-card relative overflow-hidden rounded-3xl p-6">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),_transparent_60%)]" />
              <div className="relative space-y-5">
                <h2 className="text-lg font-semibold">Operational snapshot</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {stats.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] p-4"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--gov-muted)]">
                        {item.label}
                      </p>
                      <p className="mt-2 text-2xl font-semibold">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <LandingSection
          id="problem"
          title="The challenge"
          subtitle="Fragmented records, delayed assistance, and limited visibility across barangays slow down service delivery."
        >
          <div className="grid gap-6 lg:grid-cols-3">
            {[
              {
                title: "Disconnected data",
                detail:
                  "Paper-based records delay updates and weaken coordination between PDAO, barangays, and guardians.",
                icon: FileCheck2,
              },
              {
                title: "Limited analytics",
                detail:
                  "Without consolidated reporting, subsidy distribution and disability classifications are harder to track.",
                icon: BarChart3,
              },
              {
                title: "Access barriers",
                detail:
                  "PWD citizens need interfaces that prioritize accessibility, clarity, and reliable updates.",
                icon: Accessibility,
              },
            ].map((item) => (
              <div key={item.title} className="gov-card rounded-2xl p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[color:var(--gov-surface)]">
                    <item.icon className="h-5 w-5 text-[color:var(--gov-primary)]" />
                  </span>
                  <h3 className="text-base font-semibold">{item.title}</h3>
                </div>
                <p className="mt-3 text-sm text-[color:var(--gov-muted)]">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </LandingSection>

        <LandingSection
          id="about"
          title="About the program"
          subtitle="Built for PDAO offices to coordinate care, track assistance, and deliver inclusive services."
        >
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="gov-card rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[color:var(--gov-surface)]">
                  <ShieldCheck className="h-5 w-5 text-[color:var(--gov-primary)]" />
                </span>
                <h3 className="text-base font-semibold">Mission-driven coordination</h3>
              </div>
              <p className="mt-3 text-sm text-[color:var(--gov-muted)]">
                The portal unifies registration, subsidy management, and
                reporting so every stakeholder has a single, trusted source of
                truth. It supports accessibility-first experiences and secure
                data handling.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-[color:var(--gov-muted)]">
                <li className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-[color:var(--gov-accent)]" />
                  Centralized PWD profiles and guardian links
                </li>
                <li className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-[color:var(--gov-accent)]" />
                  Barangay-level reporting and monitoring
                </li>
                <li className="flex items-center gap-2">
                  <FileCheck2 className="h-4 w-4 text-[color:var(--gov-accent)]" />
                  Secure audit trails for compliance
                </li>
              </ul>
            </div>
            <div className="gov-card rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[color:var(--gov-surface)]">
                  <Accessibility className="h-5 w-5 text-[color:var(--gov-primary)]" />
                </span>
                <h3 className="text-base font-semibold">Accessibility focus</h3>
              </div>
              <p className="mt-3 text-sm text-[color:var(--gov-muted)]">
                WCAG-inspired layouts, larger typography, and high-contrast
                interfaces keep the system inclusive for PWD users.
              </p>
              <div className="mt-4 rounded-2xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] p-4 text-xs text-[color:var(--gov-muted)]">
                Voice recognition placeholders and keyboard navigation readiness
                are part of the roadmap.
              </div>
            </div>
          </div>
        </LandingSection>

        <LandingSection
          id="social-proof"
          title="Voices from the field"
          subtitle="Designed with frontline staff and partner barangays in mind."
        >
          <div className="grid gap-6 lg:grid-cols-3">
            {[
              {
                name: "PDAO Operations",
                quote:
                  "Unified dashboards help us validate subsidies faster and keep barangay teams aligned.",
                icon: Building2,
              },
              {
                name: "Barangay Coordinators",
                quote:
                  "We finally have a single portal to track updates without manual follow-ups.",
                icon: Users,
              },
              {
                name: "Guardian Support",
                quote:
                  "Notifications and digital IDs reduce repeated visits and save time.",
                icon: ShieldCheck,
              },
            ].map((item) => (
              <div key={item.name} className="gov-card rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[color:var(--gov-surface)]">
                    <item.icon className="h-5 w-5 text-[color:var(--gov-primary)]" />
                  </span>
                </div>
                <p className="text-sm text-[color:var(--gov-muted)]">“{item.quote}”</p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--gov-accent)]">
                  {item.name}
                </p>
              </div>
            ))}
          </div>
        </LandingSection>

        <LandingSection
          id="stats"
          title="Program stats"
          subtitle="Key figures that guide resource allocation and planning."
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((item) => (
              <div key={item.label} className="gov-card rounded-2xl p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--gov-muted)]">
                  {item.label}
                </p>
                <p className="mt-2 text-2xl font-semibold">{item.value}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[color:var(--gov-accent)]">
                  Updated quarterly
                </p>
              </div>
            ))}
          </div>
        </LandingSection>

        <LandingSection
          id="blogs"
          title="Latest insights"
          subtitle="Guides and updates for barangay partners and PDAO teams."
        >
          <div className="grid gap-6 lg:grid-cols-3">
            {blogItems.map((item) => (
              <div key={item.title} className="gov-card rounded-2xl p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[color:var(--gov-surface)]">
                    <BookOpen className="h-5 w-5 text-[color:var(--gov-primary)]" />
                  </span>
                  <h3 className="text-base font-semibold">{item.title}</h3>
                </div>
                <p className="mt-3 text-sm text-[color:var(--gov-muted)]">
                  {item.excerpt}
                </p>
                <button
                  type="button"
                  className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--gov-accent)]"
                >
                  Read more
                </button>
              </div>
            ))}
          </div>
        </LandingSection>

        <LandingSection
          id="faq"
          title="Frequently asked questions"
          subtitle="Quick answers for citizens and barangay partners."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            {faqs.map((item) => (
              <div key={item.question} className="gov-card rounded-2xl p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[color:var(--gov-surface)]">
                    <ShieldCheck className="h-5 w-5 text-[color:var(--gov-primary)]" />
                  </span>
                  <h3 className="text-base font-semibold">{item.question}</h3>
                </div>
                <p className="mt-3 text-sm text-[color:var(--gov-muted)]">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </LandingSection>

        <LandingSection
          id="contact"
          title="Contact PDAO"
          subtitle="Reach the program office for assistance and coordination."
        >
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="gov-card rounded-2xl p-6">
              <form className="grid gap-4">
                <div>
                  <label className="text-sm font-medium" htmlFor="contact-name">
                    Full name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm text-[color:var(--gov-text)]"
                    placeholder="Juan Dela Cruz"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium" htmlFor="contact-email">
                    Email address
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm text-[color:var(--gov-text)]"
                    placeholder="name@example.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium" htmlFor="contact-message">
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    rows="4"
                    className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm text-[color:var(--gov-text)]"
                    placeholder="How can we help your barangay?"
                  />
                </div>
                <button
                  type="button"
                  className="rounded-xl bg-[color:var(--gov-primary)] px-4 py-3 text-sm font-semibold text-white"
                >
                  Submit inquiry
                </button>
              </form>
            </div>
            <div className="gov-card rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[color:var(--gov-surface)]">
                  <MapPin className="h-5 w-5 text-[color:var(--gov-primary)]" />
                </span>
                <h3 className="text-base font-semibold">Program office</h3>
              </div>
              <p className="mt-3 text-sm text-[color:var(--gov-muted)]">
                Provincial Capitol Complex, PDAO Office, City of Batangas
              </p>
              <div className="mt-4 space-y-2 text-sm text-[color:var(--gov-muted)]">
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-[color:var(--gov-accent)]" />
                  Hotline: (043) 123-4567
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[color:var(--gov-accent)]" />
                  Email: support@pdao.gov.ph
                </p>
                <p>Office hours: Monday - Friday, 8:00 AM - 5:00 PM</p>
              </div>
            </div>
          </div>
        </LandingSection>
      </main>

      <LandingFooter />
    </div>
  );
}
