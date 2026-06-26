import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

// Controlled password input with a show/hide eye toggle.
export default function PasswordField({
  id,
  label,
  required = false,
  hint,
  value,
  onChange,
  placeholder,
  autoComplete = "new-password",
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label className="mb-2 block text-sm font-medium" htmlFor={id}>
        {label}
        {required ? (
          <span className="text-[color:var(--gov-danger-fg)]"> *</span>
        ) : null}
      </label>
      {hint ? (
        <p className="-mt-1 mb-2 text-xs text-[color:var(--gov-muted)]">{hint}</p>
      ) : null}
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          className="gov-input pr-12"
          placeholder={placeholder}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
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
    </div>
  );
}
