import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { AlertCircle } from "lucide-react";
import PasswordInput from "./PasswordInput.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const roleRedirects = {
  pdao: "/app/pdao",
  guardian: "/app/guardian",
  pwd: "/app/pwd-beneficiary",
};

export default function LoginForm() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [formError, setFormError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
      remember: true,
    },
  });

  const onSubmit = async ({ email, password }) => {
    setFormError("");

    try {
      const user = await signIn({ email, password });
      const redirectPath = roleRedirects[user?.role] || "/app";
      navigate(redirectPath, { replace: true });
    } catch (error) {
      setFormError(error?.message || "Unable to sign in. Please try again.");
    }
  };

  return (
    <div className="flex flex-col rounded-[var(--radius-xl)] border border-[color:var(--gov-border)] bg-[color:var(--gov-card)] p-6 lg:p-9">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-[color:var(--gov-text)]">
          Sign in to your account
        </h2>
        <p className="text-sm text-[color:var(--gov-muted)]">
          Use your authorized account. Sessions are logged for security and
          audit compliance.
        </p>
      </div>

      <form className="mt-7 flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div>
          <label
            className="mb-2 block text-sm font-medium text-[color:var(--gov-text)]"
            htmlFor="email"
          >
            Email address
          </label>
          <input
            id="email"
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
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email ? (
            <p
              id="email-error"
              className="mt-2 text-xs font-medium text-[color:var(--gov-danger-fg)]"
            >
              {errors.email.message}
            </p>
          ) : null}
        </div>

        <PasswordInput
          id="password"
          label="Password"
          placeholder="Enter your password"
          autoComplete="current-password"
          register={register("password", {
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters",
            },
          })}
          error={errors.password?.message}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm text-[color:var(--gov-muted)]">
            <input
              type="checkbox"
              {...register("remember")}
              className="h-4 w-4 rounded border-[color:var(--gov-border-strong)] accent-[color:var(--gov-primary)]"
            />
            Keep me signed in
          </label>
          <Link
            to="/auth/forgot-password"
            className="rounded text-sm font-semibold text-[color:var(--gov-primary)] hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {formError ? (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-[var(--radius-md)] bg-[color:var(--gov-danger-soft)] px-4 py-3 text-sm text-[color:var(--gov-danger-fg)]"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{formError}</span>
          </div>
        ) : null}

        <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
          {isSubmitting ? "Signing in…" : "Sign in"}
        </button>

        <p className="text-center text-xs text-[color:var(--gov-muted)]">
          Need help? Contact the PDAO helpdesk during office hours.
        </p>
      </form>
    </div>
  );
}
