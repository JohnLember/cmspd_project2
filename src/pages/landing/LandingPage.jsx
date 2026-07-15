import {
  Accessibility,
  ArrowRight,
  BarChart3,
  IdCard,
  Mail,
  MapPin,
  Mic,
  ShieldCheck,
  Clock,
  Users,
} from "lucide-react";
import { Link } from "react-router";
import LandingFooter from "../../components/landing/LandingFooter.jsx";
import LandingHeader from "../../components/landing/LandingHeader.jsx";
import LandingSection from "../../components/landing/LandingSection.jsx";

const portals = [
  {
    role: "PDAO Staff",
    detail: "Process registrations, approve applications, and monitor barangay reports.",
    icon: ShieldCheck,
  },
  {
    role: "PWD Beneficiary",
    detail: "Access your Digital ID, profile, and official announcements.",
    icon: IdCard,
  },
  {
    role: "Guardian",
    detail: "Stay informed about the ward you care for.",
    icon: Users,
  },
];

const services = [
  {
    title: "Online application",
    detail:
      "Submit a PWD registration from any device, with guided steps and built-in validation.",
    icon: ArrowRight,
  },
  {
    title: "Per-barangay reporting",
    detail:
      "Registered PWDs summarized by barangay and disability type, with CSV and print export.",
    icon: BarChart3,
  },
  {
    title: "Guardian access",
    detail:
      "Carers get their own linked account to follow a ward's status and ID.",
    icon: Users,
  },
  {
    title: "Voice navigation",
    detail:
      "Move through the beneficiary portal and dictate forms by voice, hands-free.",
    icon: Mic,
  },
];

const steps = [
  {
    title: "Submit your application",
    detail:
      "Fill in the online form with your details and disability information. It takes a few minutes.",
  },
  {
    title: "PDAO reviews and approves",
    detail:
      "Staff verify your requirements and approve your registration with an official digital signature.",
  },
  {
    title: "Receive your Digital ID",
    detail:
      "Your account is created automatically. Sign in to view and print your Digital PWD ID.",
  },
];

const faqs = [
  {
    question: "How do I register as a PWD beneficiary?",
    answer:
      "Use the Apply button to submit the online application form. PDAO staff review your requirements and, once approved, your beneficiary account and Digital ID are created automatically.",
  },
  {
    question: "Can a guardian manage a beneficiary's account?",
    answer:
      "Yes. When guardian details are provided on an approved application, a linked guardian account is created so the carer can follow the ward's status and Digital ID.",
  },
  {
    question: "Is the portal accessible for users with disabilities?",
    answer:
      "Accessibility is a core requirement: strong contrast, large touch targets, full keyboard support, reduced-motion options, and voice navigation in the beneficiary portal.",
  },
  {
    question:
      "Why do I need a medical certificate, certificate of indigency, and birth certificate?",
    answer:
      "The medical certificate or disability assessment, issued by a licensed physician, confirms the type and cause of the disability. The birth certificate verifies identity, age, and Loreto residency for the applicant. The certificate of indigency, issued by your barangay, supports fee-waived transactions and priority assistance for qualified beneficiaries. Bring these along with a valid government-issued ID and a recent 2x2 photo when applying.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[color:var(--gov-bg)] text-[color:var(--gov-text)]">
      <LandingHeader />

      <main className="space-y-20 px-4 pb-20 pt-12 sm:px-6 sm:space-y-24">
        {/* Hero */}
        <section className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="gov-stagger space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--gov-primary-soft)] px-3 py-1 text-sm font-medium text-[color:var(--gov-primary)]">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              Municipality of Loreto · Agusan del Sur
            </span>
            <h1 className="text-4xl font-semibold leading-[1.1] tracking-[-0.02em] text-[color:var(--gov-text)] sm:text-5xl">
              Inclusive PWD services, managed with clarity and care
            </h1>
            <p className="max-w-xl text-lg text-[color:var(--gov-muted)]">
              The official PDAO portal for registering Persons with Disabilities,
              issuing Digital IDs, and monitoring assistance across every barangay
              in Loreto.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/beneficiary-apply" className="btn btn-primary h-12 px-6 text-base">
                Become a beneficiary
                <ArrowRight className="h-[1.15rem] w-[1.15rem]" aria-hidden="true" />
              </Link>
              <Link to="/auth/login" className="btn btn-secondary h-12 px-6 text-base">
                Access the portal
              </Link>
            </div>
          </div>

          <div className="rounded-[var(--radius-xl)] border border-[color:var(--gov-border)] bg-[color:var(--gov-card)] p-6 sm:p-7">
            <h2 className="text-sm font-semibold text-[color:var(--gov-text)]">
              One platform, three roles
            </h2>
            <ul className="mt-5 space-y-4">
              {portals.map((portal) => (
                <li key={portal.role} className="flex items-start gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[var(--radius-md)] bg-[color:var(--gov-primary-soft)] text-[color:var(--gov-primary)]">
                    <portal.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-semibold text-[color:var(--gov-text)]">
                      {portal.role}
                    </p>
                    <p className="mt-0.5 text-sm text-[color:var(--gov-muted)]">
                      {portal.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* About */}
        <LandingSection
          id="about"
          title="About the program"
          subtitle="A single, trusted system for the PDAO office, beneficiaries, and their guardians — replacing slow, paper-based processing with secure digital records."
        >
          <div className="grid gap-5 md:grid-cols-3">
            <div className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[color:var(--gov-border)] bg-[color:var(--gov-card)] p-6 md:col-span-2">
              <ShieldCheck className="h-6 w-6 text-[color:var(--gov-primary)]" aria-hidden="true" />
              <h3 className="text-lg font-semibold">A single source of truth</h3>
              <p className="text-[color:var(--gov-muted)]">
                Registration, approvals, Digital IDs, and reporting live in one
                place. Every record carries a secure audit trail, and access is
                governed by role so citizen data stays private and visible only to
                authorized personnel.
              </p>
            </div>
            <div className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[color:var(--gov-border)] bg-[color:var(--gov-card)] p-6">
              <Accessibility className="h-6 w-6 text-[color:var(--gov-primary)]" aria-hidden="true" />
              <h3 className="text-lg font-semibold">Built to be accessible</h3>
              <p className="text-[color:var(--gov-muted)]">
                Strong contrast, large targets, keyboard support, and voice
                navigation keep the system usable for everyone it serves.
              </p>
            </div>
          </div>
        </LandingSection>

        {/* Services */}
        <LandingSection
          id="services"
          title="What you can do"
          subtitle="Practical tools for the whole community, from first application to everyday access."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            {services.map((service) => (
              <div
                key={service.title}
                className="flex items-start gap-4 rounded-[var(--radius-lg)] border border-[color:var(--gov-border)] bg-[color:var(--gov-card)] p-6"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[var(--radius-md)] bg-[color:var(--gov-primary-soft)] text-[color:var(--gov-primary)]">
                  <service.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-semibold text-[color:var(--gov-text)]">
                    {service.title}
                  </h3>
                  <p className="mt-1 text-sm text-[color:var(--gov-muted)]">
                    {service.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </LandingSection>

        {/* How to apply — a genuine ordered sequence */}
        <LandingSection
          id="apply"
          title="How to apply"
          subtitle="Three steps from application to a valid Digital PWD ID."
        >
          <ol className="grid gap-5 md:grid-cols-3">
            {steps.map((step, index) => (
              <li
                key={step.title}
                className="relative flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[color:var(--gov-border)] bg-[color:var(--gov-card)] p-6"
              >
                <span
                  className="grid h-10 w-10 place-items-center rounded-full bg-[color:var(--gov-primary)] text-base font-semibold text-[color:var(--gov-on-primary)]"
                  aria-hidden="true"
                >
                  {index + 1}
                </span>
                <h3 className="font-semibold text-[color:var(--gov-text)]">
                  {step.title}
                </h3>
                <p className="text-sm text-[color:var(--gov-muted)]">{step.detail}</p>
              </li>
            ))}
          </ol>
          <div className="mt-2">
            <Link to="/beneficiary-apply" className="btn btn-primary h-12 px-6 text-base">
              Start your application
              <ArrowRight className="h-[1.15rem] w-[1.15rem]" aria-hidden="true" />
            </Link>
          </div>
        </LandingSection>

        {/* FAQ */}
        <LandingSection
          id="faq"
          title="Frequently asked questions"
          subtitle="Quick answers for citizens, guardians, and barangay partners."
        >
          <div className="divide-y divide-[color:var(--gov-border)] overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--gov-border)] bg-[color:var(--gov-card)]">
            {faqs.map((item) => (
              <details key={item.question} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 font-medium text-[color:var(--gov-text)] transition-colors hover:bg-[color:var(--gov-surface)]">
                  {item.question}
                  <span
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[color:var(--gov-border)] text-[color:var(--gov-muted)] transition-transform duration-[var(--dur)] group-open:rotate-45"
                    aria-hidden="true"
                  >
                    +
                  </span>
                </summary>
                <p className="faq-answer px-6 pb-5 text-[color:var(--gov-muted)]">{item.answer}</p>
              </details>
            ))}
          </div>
        </LandingSection>

        {/* Contact */}
        <LandingSection
          id="contact"
          title="Contact the PDAO office"
          subtitle="Reach the program office for assistance and coordination."
        >
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-[var(--radius-lg)] border border-[color:var(--gov-border)] bg-[color:var(--gov-card)] p-6">
              <h3 className="font-semibold text-[color:var(--gov-text)]">
                PDAO — Municipality of Loreto
              </h3>
              <ul className="mt-4 space-y-3 text-[color:var(--gov-muted)]">
                <li className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 shrink-0 text-[color:var(--gov-primary)]" aria-hidden="true" />
                  Municipal Hall, Loreto, Agusan del Sur
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="h-5 w-5 shrink-0 text-[color:var(--gov-primary)]" aria-hidden="true" />
                  pdao@loreto.gov.ph
                </li>
                <li className="flex items-center gap-3">
                  <Clock className="h-5 w-5 shrink-0 text-[color:var(--gov-primary)]" aria-hidden="true" />
                  Monday – Friday, 8:00 AM – 5:00 PM
                </li>
              </ul>
            </div>
            <div className="flex flex-col justify-center gap-4 rounded-[var(--radius-lg)] border border-[color:var(--gov-border)] bg-[color:var(--gov-card)] p-6">
              <h3 className="text-lg font-semibold text-[color:var(--gov-text)]">
                Ready to get started?
              </h3>
              <p className="text-[color:var(--gov-muted)]">
                Submit a new application, or sign in if you already have an account.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/beneficiary-apply" className="btn btn-primary">
                  Apply now
                </Link>
                <Link to="/auth/login" className="btn btn-secondary">
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </LandingSection>
      </main>

      <LandingFooter />
    </div>
  );
}
