import { useState } from "react";
import { useForm } from "react-hook-form";
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
    <div className="gov-card rounded-2xl p-6">
      <h2 className="text-lg font-semibold">Reset your password</h2>
      <p className="mt-2 text-sm text-[color:var(--gov-muted)]">
        Enter the email address associated with your account and we will send
        reset instructions through Supabase.
      </p>

      <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="text-sm font-medium" htmlFor="reset-email">
            Email address
          </label>
          <input
            id="reset-email"
            type="email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Enter a valid email address",
              },
            })}
            className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm text-[color:var(--gov-text)]"
            placeholder="name@pdao.gov.ph"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "reset-email-error" : undefined}
          />
          {errors.email ? (
            <p id="reset-email-error" className="mt-2 text-xs text-red-600">
              {errors.email.message}
            </p>
          ) : null}
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">
            {error}
          </div>
        ) : null}

        {message ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700">
            {message}
          </div>
        ) : null}

        <button
          type="submit"
          className="rounded-xl bg-[color:var(--gov-primary)] px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Sending reset link…" : "Send reset link"}
        </button>
      </form>
    </div>
  );
}
