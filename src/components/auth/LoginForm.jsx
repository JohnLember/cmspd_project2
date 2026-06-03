import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import PasswordInput from "./PasswordInput.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const roleRedirects = {
  pdao: "/app/pdao",
  guardian: "/app/guardian",
  pwd: "/app/pwd",
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
    <div className="gov-card rounded-3xl p-6 lg:p-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--gov-accent)]">
          Secure sign-in
        </p>
        <h2 className="text-2xl font-semibold">Access your portal account</h2>
        <p className="text-sm text-[color:var(--gov-muted)]">
          Use your authorized government email address. All sessions are logged
          for security and audit compliance.
        </p>
      </div>

      <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="text-sm font-medium" htmlFor="email">
            Email address
          </label>
          <input
            id="email"
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
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email ? (
            <p id="email-error" className="mt-2 text-xs text-red-600">
              {errors.email.message}
            </p>
          ) : null}
        </div>

        <PasswordInput
          id="password"
          label="Password"
          placeholder="Enter your password"
          register={register("password", {
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters",
            },
          })}
          error={errors.password?.message}
        />

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[color:var(--gov-muted)]">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register("remember")}
              className="h-4 w-4 rounded border border-[color:var(--gov-border)]"
            />
            Keep me signed in
          </label>
          <Link
            to="/auth/forgot-password"
            className="font-semibold text-[color:var(--gov-accent)]"
          >
            Forgot password?
          </Link>
        </div>

        {formError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">
            {formError}
          </div>
        ) : null}

        <button
          type="submit"
          className="rounded-xl bg-[color:var(--gov-primary)] px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>

        <div className="rounded-2xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-xs text-[color:var(--gov-muted)]">
          Need assistance? Contact the PDAO helpdesk during office hours.
        </div>
      </form>
    </div>
  );
}
