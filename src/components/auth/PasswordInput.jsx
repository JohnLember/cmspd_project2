import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function PasswordInput({
  id,
  label,
  error,
  register,
  placeholder,
  autoComplete = "current-password",
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label
        className="mb-2 block text-sm font-medium text-[color:var(--gov-text)]"
        htmlFor={id}
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          {...register}
          className="gov-input pr-12"
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="absolute right-1 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-[var(--radius-sm)] text-[color:var(--gov-muted)] transition-colors hover:text-[color:var(--gov-text)]"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
        >
          {visible ? (
            <EyeOff className="h-[1.15rem] w-[1.15rem]" aria-hidden="true" />
          ) : (
            <Eye className="h-[1.15rem] w-[1.15rem]" aria-hidden="true" />
          )}
        </button>
      </div>
      {error ? (
        <p
          id={`${id}-error`}
          className="mt-2 text-xs font-medium text-[color:var(--gov-danger-fg)]"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
