import { useState } from "react";
import { Link } from "react-router";
import { submitApplication } from "../../services/supabase/applications.js";

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

  const [formData, setFormData] = useState({
    // Step 0: Application Details
    appType: "",
    // Step 1: Personal Information
    firstName: "",
    lastName: "",
    middleName: "",
    suffix: "",
    birthdate: "",
    gender: "",
    civilStatus: "",
    // Step 2: Disability Profile
    disabilityTypes: [],
    disabilityDetail: "",
    causeInborn: [],
    causeInbornOther: "",
    causeAcquired: [],
    causeAcquiredOther: "",
    // Step 3: Address & Contact
    street: "",
    barangay: "",
    municipality: "",
    province: "",
    postal: "",
    contactNumber: "",
    emailAddress: "",
    // Step 4: Education & Employment
    education: "",
    employmentStatus: "",
    employmentType: "",
    employmentCategory: "",
    occupation: "",
    occupationOther: "",
    // Step 5: Family & References
    orgAffiliated: "",
    contactPerson: "",
    telNos: "",
    officeAddress: "",
    sssNo: "",
    gisNo: "",
    pagibigNo: "",
    psnNo: "",
    philhealthNo: "",
    fatherLast: "",
    fatherFirst: "",
    fatherMiddle: "",
    motherLast: "",
    motherFirst: "",
    motherMiddle: "",
    guardianLast: "",
    guardianFirst: "",
    guardianMiddle: "",
    accomplishedBy: "",
    accompLast: "",
    accompFirst: "",
    accompMiddle: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e, fieldName) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const currentArray = prev[fieldName] || [];
      if (checked) {
        return { ...prev, [fieldName]: [...currentArray, value] };
      } else {
        return { ...prev, [fieldName]: currentArray.filter((v) => v !== value) };
      }
    });
  };

  const goNext = () =>
    setActiveStep((current) => Math.min(current + 1, steps.length - 1));
  const goPrevious = () => setActiveStep((current) => Math.max(current - 1, 0));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [applicationNumber, setApplicationNumber] = useState("");

  const handleSubmit = async () => {
    // Only ever runs from an explicit Submit click on the last step.
    if (activeStep !== steps.length - 1 || isSubmitting) return;

    setSubmitError("");
    setIsSubmitting(true);
    try {
      const { applicationNumber: reference, error } = await submitApplication(
        formData
      );
      if (error) throw error;
      setApplicationNumber(reference);
      setIsSubmitted(true);
    } catch (error) {
      setSubmitError(
        error?.message || "Unable to submit your application. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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

          <form className="mt-6 space-y-6" onSubmit={(e) => e.preventDefault()}>
            {activeStep === 0 ? (
              <fieldset className="space-y-4">
                <legend className="text-sm font-semibold text-[color:var(--gov-text)]">
                  Application details
                </legend>
                <div>
                  <p className="text-sm font-medium">Application type</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <label className="flex items-center gap-2 rounded-2xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm">
                      <input
                        type="radio"
                        name="appType"
                        value="new"
                        checked={formData.appType === "new"}
                        onChange={handleInputChange}
                        className="h-4 w-4"
                      />
                      New Applicant
                    </label>
                    <label className="flex items-center gap-2 rounded-2xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm">
                      <input
                        type="radio"
                        name="appType"
                        value="renewal"
                        checked={formData.appType === "renewal"}
                        onChange={handleInputChange}
                        className="h-4 w-4"
                      />
                      Renewal
                    </label>
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
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
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
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
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
                      name="middleName"
                      value={formData.middleName}
                      onChange={handleInputChange}
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
                      name="suffix"
                      value={formData.suffix}
                      onChange={handleInputChange}
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
                      name="birthdate"
                      value={formData.birthdate}
                      onChange={handleInputChange}
                      className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium" htmlFor="gender">
                      Sex
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                    >
                      <option value="">Select sex</option>
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="prefer-not">Prefer not to say</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium" htmlFor="civil-status">
                      Civil status
                    </label>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <label className="flex items-center gap-2 rounded-2xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm">
                        <input
                          type="radio"
                          name="civilStatus"
                          value="single"
                          checked={formData.civilStatus === "single"}
                          onChange={handleInputChange}
                          className="h-4 w-4"
                        />
                        Single
                      </label>
                      <label className="flex items-center gap-2 rounded-2xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm">
                        <input
                          type="radio"
                          name="civilStatus"
                          value="married"
                          checked={formData.civilStatus === "married"}
                          onChange={handleInputChange}
                          className="h-4 w-4"
                        />
                        Married
                      </label>
                      <label className="flex items-center gap-2 rounded-2xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm">
                        <input
                          type="radio"
                          name="civilStatus"
                          value="widowed"
                          checked={formData.civilStatus === "widowed"}
                          onChange={handleInputChange}
                          className="h-4 w-4"
                        />
                        Widowed
                      </label>
                      <label className="flex items-center gap-2 rounded-2xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm">
                        <input
                          type="radio"
                          name="civilStatus"
                          value="separated"
                          checked={formData.civilStatus === "separated"}
                          onChange={handleInputChange}
                          className="h-4 w-4"
                        />
                        Separated
                      </label>
                      <label className="flex items-center gap-2 rounded-2xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm">
                        <input
                          type="radio"
                          name="civilStatus"
                          value="cohabitation"
                          checked={formData.civilStatus === "cohabitation"}
                          onChange={handleInputChange}
                          className="h-4 w-4"
                        />
                        Cohabitation (Live-in)
                      </label>
                    </div>
                  </div>
                </div>
              </fieldset>
            ) : null}

            {activeStep === 2 ? (
              <fieldset className="space-y-4">
                <legend className="text-sm font-semibold text-[color:var(--gov-text)]">
                  Disability profile
                </legend>
                <div className="grid gap-4">
                  <div>
                    <p className="text-sm font-medium">Type of disability</p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {[
                        { value: "deaf", label: "Deaf or Hard of Hearing" },
                        { value: "intellectual", label: "Intellectual Disability" },
                        { value: "learning", label: "Learning Disability" },
                        { value: "mental", label: "Mental Disability" },
                        { value: "physical", label: "Physical Disability (Orthopedic)" },
                        { value: "psychosocial", label: "Psychosocial Disability" },
                        { value: "speech", label: "Speech and Language Impairment" },
                        { value: "visual", label: "Visual Disability" },
                        { value: "cancer", label: "Cancer (RA11215)" },
                        { value: "rare", label: "Rare Disease (RA10747)" },
                        { value: "other", label: "Other" },
                      ].map((item) => (
                        <label
                          key={item.value}
                          className="flex items-center gap-2 rounded-2xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={formData.disabilityTypes.includes(item.value)}
                            onChange={(e) => {
                              handleCheckboxChange(e, "disabilityTypes");
                              if (item.value === "other" && !e.target.checked) {
                                setFormData((prev) => ({
                                  ...prev,
                                  disabilityDetail: "",
                                }));
                              }
                            }}
                            value={item.value}
                            className="h-4 w-4"
                          />
                          {item.label}
                        </label>
                      ))}
                    </div>
                  </div>
                  {formData.disabilityTypes.includes("other") ? (
                    <div>
                      <label className="text-sm font-medium" htmlFor="disability-detail">
                        Other disability details
                      </label>
                      <input
                        id="disability-detail"
                        type="text"
                        name="disabilityDetail"
                        value={formData.disabilityDetail}
                        onChange={handleInputChange}
                        className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                        placeholder="Specify if applicable"
                      />
                    </div>
                  ) : null}
                  <div>
                    <p className="text-sm font-medium">
                      Cause of disability (Cognitive / Inborn)
                    </p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {[
                        { value: "autism", label: "Autism" },
                        { value: "adhd", label: "ADHD" },
                        { value: "cerebral-palsy", label: "Cerebral Palsy" },
                        { value: "down-syndrome", label: "Down Syndrome" },
                        { value: "other", label: "Other" },
                      ].map((item) => (
                        <label
                          key={item.value}
                          className="flex items-center gap-2 rounded-2xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={formData.causeInborn.includes(item.value)}
                            onChange={(e) => {
                              handleCheckboxChange(e, "causeInborn");
                              if (item.value === "other" && !e.target.checked) {
                                setFormData((prev) => ({
                                  ...prev,
                                  causeInbornOther: "",
                                }));
                              }
                            }}
                            value={item.value}
                            className="h-4 w-4"
                          />
                          {item.label}
                        </label>
                      ))}
                    </div>
                  </div>
                  {formData.causeInborn.includes("other") ? (
                    <div>
                      <label className="text-sm font-medium" htmlFor="cause-inborn-other">
                        Other inborn cause details
                      </label>
                      <input
                        id="cause-inborn-other"
                        type="text"
                        name="causeInbornOther"
                        value={formData.causeInbornOther}
                        onChange={handleInputChange}
                        className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                        placeholder="Specify if applicable"
                      />
                    </div>
                  ) : null}
                  <div>
                    <p className="text-sm font-medium">
                      Cause of disability (Acquired)
                    </p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {[
                        { value: "chronic-illness", label: "Chronic Illness" },
                        { value: "cerebral-palsy", label: "Cerebral Palsy" },
                        { value: "injury", label: "Injury" },
                        { value: "other", label: "Other" },
                      ].map((item) => (
                        <label
                          key={item.value}
                          className="flex items-center gap-2 rounded-2xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={formData.causeAcquired.includes(item.value)}
                            onChange={(e) => {
                              handleCheckboxChange(e, "causeAcquired");
                              if (item.value === "other" && !e.target.checked) {
                                setFormData((prev) => ({
                                  ...prev,
                                  causeAcquiredOther: "",
                                }));
                              }
                            }}
                            value={item.value}
                            className="h-4 w-4"
                          />
                          {item.label}
                        </label>
                      ))}
                    </div>
                  </div>
                  {formData.causeAcquired.includes("other") ? (
                    <div>
                      <label className="text-sm font-medium" htmlFor="cause-acquired-other">
                        Other acquired cause details
                      </label>
                      <input
                        id="cause-acquired-other"
                        type="text"
                        name="causeAcquiredOther"
                        value={formData.causeAcquiredOther}
                        onChange={handleInputChange}
                        className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                        placeholder="Specify if applicable"
                      />
                    </div>
                  ) : null}
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
                      name="street"
                      value={formData.street}
                      onChange={handleInputChange}
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
                      name="barangay"
                      value={formData.barangay}
                      onChange={handleInputChange}
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
                      name="municipality"
                      value={formData.municipality}
                      onChange={handleInputChange}
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
                      name="province"
                      value={formData.province}
                      onChange={handleInputChange}
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
                      name="postal"
                      value={formData.postal}
                      onChange={handleInputChange}
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
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleInputChange}
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
                      name="emailAddress"
                      value={formData.emailAddress}
                      onChange={handleInputChange}
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
                      name="education"
                      value={formData.education}
                      onChange={handleInputChange}
                      className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                    >
                      <option value="">Select attainment</option>
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
                      name="employmentStatus"
                      value={formData.employmentStatus}
                      onChange={handleInputChange}
                      className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                    >
                      <option value="">Select status</option>
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
                      name="employmentType"
                      value={formData.employmentType}
                      onChange={handleInputChange}
                      className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                    >
                      <option value="">Select type</option>
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
                      name="employmentCategory"
                      value={formData.employmentCategory}
                      onChange={handleInputChange}
                      className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                    >
                      <option value="">Select category</option>
                      <option value="government">Government</option>
                      <option value="private">Private</option>
                      <option value="ngo">NGO / Cooperative</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-sm font-medium">Occupation</p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {[
                        { value: "managers", label: "Managers" },
                        { value: "professionals", label: "Professionals" },
                        {
                          value: "technicians",
                          label: "Technicians and Associate Professionals",
                        },
                        { value: "clerical", label: "Clerical Support Workers" },
                        { value: "service-sales", label: "Service and Sales Workers" },
                        {
                          value: "skilled-agri",
                          label: "Skilled Agricultural, Forestry and Fishery Workers",
                        },
                        {
                          value: "craft-trade",
                          label: "Craft and Related Trade Workers",
                        },
                        {
                          value: "plant-machine",
                          label: "Plant and Machine Operators and Assemblers",
                        },
                        { value: "elementary", label: "Elementary Occupations" },
                        { value: "armed-forces", label: "Armed Forces Occupations" },
                      ].map((item) => (
                        <label
                          key={item.value}
                          className="flex items-center gap-2 rounded-2xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                        >
                          <input
                            type="radio"
                            name="occupation"
                            value={item.value}
                            checked={formData.occupation === item.value}
                            onChange={handleInputChange}
                            className="h-4 w-4"
                          />
                          {item.label}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium" htmlFor="occupation-other">
                      Other, specify
                    </label>
                    <input
                      id="occupation-other"
                      type="text"
                      name="occupationOther"
                      value={formData.occupationOther}
                      onChange={handleInputChange}
                      className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                    />
                  </div>
                </div>
              </fieldset>
            ) : null}

            {activeStep === 5 ? (
              <fieldset className="space-y-4">
                <legend className="text-sm font-semibold text-[color:var(--gov-text)]">
                  Family, organization, and references
                </legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium" htmlFor="org-affiliated">
                      Organization affiliated
                    </label>
                    <input
                      id="org-affiliated"
                      type="text"
                      name="orgAffiliated"
                      value={formData.orgAffiliated}
                      onChange={handleInputChange}
                      className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                      placeholder="Organization name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium" htmlFor="contact-person">
                      Contact person
                    </label>
                    <input
                      id="contact-person"
                      type="text"
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={handleInputChange}
                      className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium" htmlFor="tel-nos">
                      Tel. nos.
                    </label>
                    <input
                      id="tel-nos"
                      type="tel"
                      name="telNos"
                      value={formData.telNos}
                      onChange={handleInputChange}
                      className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium" htmlFor="office-address">
                      Office address
                    </label>
                    <input
                      id="office-address"
                      type="text"
                      name="officeAddress"
                      value={formData.officeAddress}
                      onChange={handleInputChange}
                      className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium" htmlFor="sss-no">
                      SSS no.
                    </label>
                    <input
                      id="sss-no"
                      type="text"
                      name="sssNo"
                      value={formData.sssNo}
                      onChange={handleInputChange}
                      className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium" htmlFor="gis-no">
                      GIS no.
                    </label>
                    <input
                      id="gis-no"
                      type="text"
                      name="gisNo"
                      value={formData.gisNo}
                      onChange={handleInputChange}
                      className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium" htmlFor="pagibig-no">
                      PAG-IBIG no.
                    </label>
                    <input
                      id="pagibig-no"
                      type="text"
                      name="pagibigNo"
                      value={formData.pagibigNo}
                      onChange={handleInputChange}
                      className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium" htmlFor="psn-no">
                      PSN no.
                    </label>
                    <input
                      id="psn-no"
                      type="text"
                      name="psnNo"
                      value={formData.psnNo}
                      onChange={handleInputChange}
                      className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium" htmlFor="philhealth-no">
                      PhilHealth no.
                    </label>
                    <input
                      id="philhealth-no"
                      type="text"
                      name="philhealthNo"
                      value={formData.philhealthNo}
                      onChange={handleInputChange}
                      className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="text-sm font-medium" htmlFor="father-last">
                      Father's name (last name)
                    </label>
                    <input
                      id="father-last"
                      type="text"
                      name="fatherLast"
                      value={formData.fatherLast}
                      onChange={handleInputChange}
                      className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium" htmlFor="father-first">
                      Father's name (first name)
                    </label>
                    <input
                      id="father-first"
                      type="text"
                      name="fatherFirst"
                      value={formData.fatherFirst}
                      onChange={handleInputChange}
                      className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium" htmlFor="father-middle">
                      Father's name (middle name)
                    </label>
                    <input
                      id="father-middle"
                      type="text"
                      name="fatherMiddle"
                      value={formData.fatherMiddle}
                      onChange={handleInputChange}
                      className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="text-sm font-medium" htmlFor="mother-last">
                      Mother's name (last name)
                    </label>
                    <input
                      id="mother-last"
                      type="text"
                      name="motherLast"
                      value={formData.motherLast}
                      onChange={handleInputChange}
                      className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium" htmlFor="mother-first">
                      Mother's name (first name)
                    </label>
                    <input
                      id="mother-first"
                      type="text"
                      name="motherFirst"
                      value={formData.motherFirst}
                      onChange={handleInputChange}
                      className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium" htmlFor="mother-middle">
                      Mother's name (middle name)
                    </label>
                    <input
                      id="mother-middle"
                      type="text"
                      name="motherMiddle"
                      value={formData.motherMiddle}
                      onChange={handleInputChange}
                      className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="text-sm font-medium" htmlFor="guardian-last">
                      Guardian's name (last name)
                    </label>
                    <input
                      id="guardian-last"
                      type="text"
                      name="guardianLast"
                      value={formData.guardianLast}
                      onChange={handleInputChange}
                      className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium" htmlFor="guardian-first">
                      Guardian's name (first name)
                    </label>
                    <input
                      id="guardian-first"
                      type="text"
                      name="guardianFirst"
                      value={formData.guardianFirst}
                      onChange={handleInputChange}
                      className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium" htmlFor="guardian-middle">
                      Guardian's name (middle name)
                    </label>
                    <input
                      id="guardian-middle"
                      type="text"
                      name="guardianMiddle"
                      value={formData.guardianMiddle}
                      onChange={handleInputChange}
                      className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium">Accomplished by</p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      { value: "applicant", label: "Applicant" },
                      { value: "guardian", label: "Guardian" },
                      { value: "representative", label: "Representative" },
                    ].map((item) => (
                      <label
                        key={item.value}
                        className="flex items-center gap-2 rounded-2xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                      >
                        <input
                          type="radio"
                          name="accomplishedBy"
                          value={item.value}
                          checked={formData.accomplishedBy === item.value}
                          onChange={handleInputChange}
                          className="h-4 w-4"
                        />
                        {item.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="text-sm font-medium" htmlFor="accomp-last">
                      Accomplished by (last name)
                    </label>
                    <input
                      id="accomp-last"
                      type="text"
                      name="accompLast"
                      value={formData.accompLast}
                      onChange={handleInputChange}
                      className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium" htmlFor="accomp-first">
                      Accomplished by (first name)
                    </label>
                    <input
                      id="accomp-first"
                      type="text"
                      name="accompFirst"
                      value={formData.accompFirst}
                      onChange={handleInputChange}
                      className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium" htmlFor="accomp-middle">
                      Accomplished by (middle name)
                    </label>
                    <input
                      id="accomp-middle"
                      type="text"
                      name="accompMiddle"
                      value={formData.accompMiddle}
                      onChange={handleInputChange}
                      className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm"
                    />
                  </div>
                </div>
              </fieldset>
            ) : null}

            {submitError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {submitError}
              </div>
            ) : null}

            {isSubmitted ? (
              <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-4 text-sm text-green-700">
                <p className="font-semibold">Application submitted</p>
                <p className="mt-1">
                  Please keep your application number. You will need it to follow
                  up on your application.
                </p>
                <div className="mt-3 rounded-xl border border-green-300 bg-white px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-700">
                    Application number
                  </p>
                  <p className="mt-1 text-lg font-bold tracking-wider text-green-800">
                    {applicationNumber}
                  </p>
                </div>
                <p className="mt-3 text-xs">
                  PDAO staff will review your application and provide updates
                  through the portal and official channels.
                </p>
              </div>
            ) : (
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
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="rounded-full bg-[color:var(--gov-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isSubmitting ? "Submitting..." : "Submit application"}
                    </button>
                  )}
                </div>
              </div>
            )}
          </form>
        </section>
      </div>
    </div>
  );
}
