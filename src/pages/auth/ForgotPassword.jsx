import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import { AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import { sendPasswordReset } from "../../services/supabase/auth.js";

export default function ForgotPassword() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async ({ email }) => {
    setMessage("");
    setError("");

    const { error: resetError } = await sendPasswordReset(email);
    if (resetError) {
      setError(resetError.message || "Unable to send reset link.");
      return;
    }

    setMessage(
      "Reset instructions have been sent. Check your email and follow the link."
    );
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <Link
        to="/auth/login"
        className="mb-6 inline-flex items-center gap-2 rounded text-sm font-medium text-[color:var(--gov-muted)] transition-colors hover:text-[color:var(--gov-primary)]"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to sign in
      </Link>

      <div className="rounded-[var(--radius-xl)] border border-[color:var(--gov-border)] bg-[color:var(--gov-card)] p-6 lg:p-8">
        <h2 className="text-xl font-semibold text-[color:var(--gov-text)]">
          Reset your password
        </h2>
        <p className="mt-2 text-sm text-[color:var(--gov-muted)]">
          Enter the email address associated with your account and we will send
          reset instructions.
        </p>

        <form
          className="mt-7 flex flex-col gap-5"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <div>
            <label
              className="mb-2 block text-sm font-medium text-[color:var(--gov-text)]"
              htmlFor="reset-email"
            >
              Email address
            </label>
            <input
              id="reset-email"
              type="email"
              autoComplete="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address",
                },
              })}
              className="gov-input"
              placeholder="name@pdao.gov.ph"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "reset-email-error" : undefined}
            />
            {errors.email ? (
              <p
                id="reset-email-error"
                className="mt-2 text-xs font-medium text-[color:var(--gov-danger-fg)]"
              >
                {errors.email.message}
              </p>
            ) : null}
          </div>

          {error ? (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-[var(--radius-md)] bg-[color:var(--gov-danger-soft)] px-4 py-3 text-sm text-[color:var(--gov-danger-fg)]"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          ) : null}

          {message ? (
            <div
              role="status"
              className="flex items-start gap-2 rounded-[var(--radius-md)] bg-[color:var(--gov-success-soft)] px-4 py-3 text-sm text-[color:var(--gov-success-fg)]"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{message}</span>
            </div>
          ) : null}

          <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? "Sending reset link…" : "Send reset link"}
          </button>
        </form>
      </div>
    </div>
  );
}
