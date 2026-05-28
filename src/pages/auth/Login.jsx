import { useForm } from "react-hook-form";

export default function Login() {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values) => {
    console.log("Login submit", values);
  };

  return (
    <div className="gov-card rounded-2xl p-6">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="text-sm font-medium" htmlFor="email">
            Email address
          </label>
          <input
            id="email"
            type="email"
            {...register("email", { required: true })}
            className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm text-[color:var(--gov-text)]"
            placeholder="name@pdao.gov.ph"
            aria-required="true"
          />
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            {...register("password", { required: true })}
            className="mt-2 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3 text-sm text-[color:var(--gov-text)]"
            placeholder="Enter your password"
            aria-required="true"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-[color:var(--gov-primary)] px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
        >
          Sign in
        </button>
        <p className="text-xs text-[color:var(--gov-muted)]">
          Forgot access? Use the reset link or contact the PDAO helpdesk.
        </p>
      </form>
    </div>
  );
}
