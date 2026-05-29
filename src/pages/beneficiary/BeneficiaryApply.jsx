import { useState } from "react";
import { Link } from "react-router";

const requirements = [
  "Barangay certificate or endorsement",
  "Valid government-issued ID",
  "Medical certificate or disability assessment",
  "Recent 2x2 photo",
];

export default function BeneficiaryApply() {
  const steps = [
    { title: "Application Details", description: "Application type" },
    { title: "Personal Information", description: "Basic identity" },
    { title: "Disability Profile", description: "Type and cause" },
    { title: "Address & Contact", description: "Location and reach" },
    { title: "Education & Employment", description: "Background" },
    { title: "Family & References", description: "Contacts" },
  ];
  const [activeStep, setActiveStep] = useState(0);

  const goNext = () =>
    setActiveStep((current) => Math.min(current + 1, steps.length - 1));
  const goPrevious = () => setActiveStep((current) => Math.max(current - 1, 0));

  return (
    <div className="min-h-screen bg-[color:var(--gov-bg)] px-6 py-10 text-[color:var(--gov-text)]">
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <header className="gov-card rounded-3xl p-6 lg:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--gov-accent)]">
            PWD Beneficiary Application
          </p>
          <h1 className="mt-2 text-3xl font-semibold">
            Apply to become a PWD beneficiary
          </h1>
          <p className="mt-3 text-sm text-[color:var(--gov-muted)]">
            Submit your request for assistance. PDAO staff will review your
            application and provide updates through the portal and official
            communication channels.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/auth/login"
              className="rounded-full bg-[color:var(--gov-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5"
            >
              Sign in to submit
            </Link>
            <Link
              to="/"
              className="rounded-full border border-[color:var(--gov-border)] px-5 py-2.5 text-sm font-semibold text-[color:var(--gov-text)] transition hover:-translate-y-0.5"
            >
              Back to landing page
            </Link>
          </div>
        </header>

        <section className="gov-card rounded-3xl p-6 lg:p-8">
          <h2 className="text-xl font-semibold">Prepare these requirements</h2>
          <p className="mt-2 text-sm text-[color:var(--gov-muted)]">
            These documents are required for validation. Digital copies will be
            accepted once online submission is enabled.
          </p>
          <ul className="mt-4 space-y-3 text-sm text-[color:var(--gov-muted)]">
            {requirements.map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="gov-card rounded-3xl p-6 lg:p-8">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Application form</h2>
              <p className="mt-2 text-sm text-[color:var(--gov-muted)]">
                Complete each section to submit your request. Required fields
                will be validated once online submission is enabled.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {steps.map((step, index) => (
                <button
                  key={step.title}
                  type="button"
                  onClick={() => setActiveStep(index)}
                  className={`rounded-2xl border px-4 py-3 text-left text-xs font-semibold transition ${
                    activeStep === index
                      ? "border-[color:var(--gov-primary)] bg-[color:var(--gov-surface)] text-[color:var(--gov-text)]"
                      : "border-[color:var(--gov-border)] bg-[color:var(--gov-card)] text-[color:var(--gov-muted)]"
                  }`}
                  aria-pressed={activeStep === index}
                >
                  <span className="text-[color:var(--gov-accent)]">
                    Step {index + 1}
                  </span>
                  <div className="mt-1 text-sm text-[color:var(--gov-text)]">
                    {step.title}
                  </div>
                  <div className="mt-1 text-xs">{step.description}</div>
                </button>
              ))}
            </div>
          </div>

          <form className="mt-6 space-y-6">
            {activeStep === 0 ? (
              <fieldset className="space-y-4">
                <legend className="text-sm font-semibold text-[color:var(--gov-text)]">
                  Application details
                </legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium" htmlFor="app-type">
                      Application type
                    </label>
                    <select
                      id="app-type"
                      className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Select type
                      </option>
                      <option value="new">New Applicant</option>
                      <option value="renewal">Renewal</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium" htmlFor="app-date">
                      Date of application
                    </label>
                    <input
                      id="app-date"
                      type="date"
                      className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                    />
                  </div>
                </div>
              </fieldset>
            ) : null}

            {activeStep === 1 ? (
              <fieldset className="space-y-4">
                <legend className="text-sm font-semibold text-[color:var(--gov-text)]">
                  Personal information
                </legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium" htmlFor="first-name">
                      First name
                    </label>
                    <input
                      id="first-name"
                      type="text"
                      className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                      placeholder="Juan"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium" htmlFor="last-name">
                      Last name
                    </label>
                    <input
                      id="last-name"
                      type="text"
                      className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                      placeholder="Dela Cruz"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium" htmlFor="middle-name">
                      Middle name
                    </label>
                    <input
                      id="middle-name"
                      type="text"
                      className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium" htmlFor="suffix">
                      Suffix
                    </label>
                    <input
                      id="suffix"
                      type="text"
                      className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                      placeholder="Jr., Sr., III"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium" htmlFor="birthdate">
                      Birthdate
                    </label>
                    <input
                      id="birthdate"
                      type="date"
                      className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium" htmlFor="gender">
                      Sex
                    </label>
                    <select
                      id="gender"
                      className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Select sex
                      </option>
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="prefer-not">Prefer not to say</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium" htmlFor="civil-status">
                      Civil status
                    </label>
                    <select
                      id="civil-status"
                      className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Select status
                      </option>
                      <option value="single">Single</option>
                      <option value="married">Married</option>
                      <option value="widowed">Widowed</option>
                      <option value="separated">Separated</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium" htmlFor="nationality">
                      Nationality
                    </label>
                    <input
                      id="nationality"
                      type="text"
                      className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                      placeholder="Filipino"
                    />
                  </div>
                </div>
              </fieldset>
            ) : null}

            {activeStep === 2 ? (
              <fieldset className="space-y-4">
                <legend className="text-sm font-semibold text-[color:var(--gov-text)]">
                  Disability profile
                </legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium" htmlFor="disability-type">
                      Type of disability
                    </label>
                    <select
                      id="disability-type"
                      className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Select type
                      </option>
                      <option value="physical">Physical</option>
                      <option value="visual">Visual</option>
                      <option value="hearing">Hearing</option>
                      <option value="speech">Speech</option>
                      <option value="psychosocial">Psychosocial</option>
                      <option value="intellectual">Intellectual</option>
                      <option value="multiple">Multiple</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium" htmlFor="disability-detail">
                      Other disability details
                    </label>
                    <input
                      id="disability-detail"
                      type="text"
                      className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                      placeholder="Specify if applicable"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium" htmlFor="cause-inborn">
                      Cause of disability (Cognitive / Inborn)
                    </label>
                    <select
                      id="cause-inborn"
                      className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Select cause
                      </option>
                      <option value="congenital">Congenital</option>
                      <option value="autism">Autism</option>
                      <option value="down-syndrome">Down Syndrome</option>
                      <option value="cerebral-palsy">Cerebral Palsy</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium" htmlFor="cause-acquired">
                      Cause of disability (Acquired)
                    </label>
                    <select
                      id="cause-acquired"
                      className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Select cause
                      </option>
                      <option value="illness">Illness</option>
                      <option value="injury">Injury</option>
                      <option value="accident">Accident</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </fieldset>
            ) : null}

            {activeStep === 3 ? (
              <fieldset className="space-y-4">
                <legend className="text-sm font-semibold text-[color:var(--gov-text)]">
                  Address and contact
                </legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium" htmlFor="street">
                      Complete address
                    </label>
                    <input
                      id="street"
                      type="text"
                      className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                      placeholder="House no., street, sitio"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium" htmlFor="barangay">
                      Barangay
                    </label>
                    <input
                      id="barangay"
                      type="text"
                      className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium" htmlFor="municipality">
                      Municipality
                    </label>
                    <input
                      id="municipality"
                      type="text"
                      className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                      placeholder="Loreto"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium" htmlFor="province">
                      Province
                    </label>
                    <input
                      id="province"
                      type="text"
                      className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                      placeholder="Agusan del Sur"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium" htmlFor="postal">
                      Postal code
                    </label>
                    <input
                      id="postal"
                      type="text"
                      className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium" htmlFor="contact-number">
                      Mobile number
                    </label>
                    <input
                      id="contact-number"
                      type="tel"
                      className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                      placeholder="09xx xxx xxxx"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium" htmlFor="email-address">
                      Email address
                    </label>
                    <input
                      id="email-address"
                      type="email"
                      className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>
              </fieldset>
            ) : null}

            {activeStep === 4 ? (
              <fieldset className="space-y-4">
                <legend className="text-sm font-semibold text-[color:var(--gov-text)]">
                  Educational and employment background
                </legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium" htmlFor="education">
                      Educational attainment
                    </label>
                    <select
                      id="education"
                      className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Select attainment
                      </option>
                      <option value="none">No formal education</option>
                      <option value="elementary">Elementary</option>
                      <option value="high-school">High School</option>
                      <option value="senior-high">Senior High</option>
                      <option value="college">College</option>
                      <option value="vocational">Vocational</option>
                      <option value="postgrad">Postgraduate</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium" htmlFor="employment-status">
                      Status of employment
                    </label>
                    <select
                      id="employment-status"
                      className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Select status
                      </option>
                      <option value="employed">Employed</option>
                      <option value="self-employed">Self-employed</option>
                      <option value="unemployed">Unemployed</option>
                      <option value="student">Student</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium" htmlFor="employment-type">
                      Types of employment
                    </label>
                    <select
                      id="employment-type"
                      className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Select type
                      </option>
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contractual">Contractual</option>
                      <option value="seasonal">Seasonal</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium" htmlFor="employment-category">
                      Category of employment
                    </label>
                    <select
                      id="employment-category"
                      className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Select category
                      </option>
                      <option value="government">Government</option>
                      <option value="private">Private</option>
                      <option value="ngo">NGO / Cooperative</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium" htmlFor="occupation">
                      Occupation
                    </label>
                    <input
                      id="occupation"
                      type="text"
                      className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                      placeholder="e.g., Farmer, Teacher"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium" htmlFor="occupation-other">
                      Other, specify
                    </label>
                    <input
                      id="occupation-other"
                      type="text"
                      className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                    />
                  </div>
                </div>
              </fieldset>
            ) : null}

            {activeStep === 5 ? (
              <fieldset className="space-y-4">
                <legend className="text-sm font-semibold text-[color:var(--gov-text)]">
                  Family and references
                </legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium" htmlFor="guardian-name">
                      Guardian or family representative
                    </label>
                    <input
                      id="guardian-name"
                      type="text"
                      className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium" htmlFor="guardian-relationship">
                      Relationship
                    </label>
                    <input
                      id="guardian-relationship"
                      type="text"
                      className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                      placeholder="Mother, Father, Spouse"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium" htmlFor="guardian-contact">
                      Guardian contact number
                    </label>
                    <input
                      id="guardian-contact"
                      type="tel"
                      className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium" htmlFor="household-count">
                      Household members
                    </label>
                    <input
                      id="household-count"
                      type="number"
                      min="1"
                      className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium" htmlFor="reference-name">
                      Emergency contact name
                    </label>
                    <input
                      id="reference-name"
                      type="text"
                      className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium" htmlFor="reference-contact">
                      Emergency contact number
                    </label>
                    <input
                      id="reference-contact"
                      type="tel"
                      className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                    />
                  </div>
                </div>
              </fieldset>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={goPrevious}
                className="rounded-full border border-[color:var(--gov-border)] px-4 py-2 text-sm font-semibold text-[color:var(--gov-text)] transition hover:-translate-y-0.5"
                disabled={activeStep === 0}
              >
                Previous
              </button>
              <div className="flex gap-2">
                {activeStep < steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={goNext}
                    className="rounded-full bg-[color:var(--gov-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                  >
                    Next step
                  </button>
                ) : (
                  <button
                    type="button"
                    className="rounded-full bg-[color:var(--gov-primary)] px-4 py-2 text-sm font-semibold text-white opacity-70"
                  >
                    Submit application
                  </button>
                )}
              </div>
            </div>
          </form>
        </section>

        <section className="gov-card rounded-3xl p-6 lg:p-8">
          <h2 className="text-xl font-semibold">Next steps</h2>
          <p className="mt-2 text-sm text-[color:var(--gov-muted)]">
            Online applications will be available once authentication is fully
            enabled. For now, please visit the PDAO office or coordinate with
            your barangay coordinator.
          </p>
        </section>
      </div>
    </div>
  );
}
