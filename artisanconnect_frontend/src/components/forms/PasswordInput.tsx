import { forwardRef, useState } from "react";
import type { InputHTMLAttributes } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import styles from "./PasswordInput.module.css";

export interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  /** Pass the live field value (e.g. via RHF's `watch`) to render a strength meter. */
  strengthValue?: string;
}

function getStrength(value: string): { score: number; label: string } {
  if (!value) return { score: 0, label: "" };

  let score = 0;
  if (value.length >= 8) score++;
  if (/[A-Z]/.test(value)) score++;
  if (/[a-z]/.test(value)) score++;
  if (/[0-9]/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;

  const labels = ["Very weak", "Weak", "Fair", "Good", "Strong"];
  return { score, label: labels[Math.min(score - 1, labels.length - 1)] ?? "" };
}

/** Password field with visibility toggle and, optionally, a live strength meter. */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, strengthValue, id, className, ...rest }, ref) => {
    const [visible, setVisible] = useState(false);
    const inputId = id ?? rest.name;
    const errorId = error ? `${inputId}-error` : undefined;
    const { score, label: strengthLabel } = getStrength(strengthValue ?? "");

    return (
      <div className={styles.field}>
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
        <div className={styles.inputWrap}>
          <input
            ref={ref}
            id={inputId}
            type={visible ? "text" : "password"}
            className={[styles.input, error ? styles.inputError : "", className ?? ""]
              .filter(Boolean)
              .join(" ")}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={errorId}
            {...rest}
          />
          <button
            type="button"
            className={styles.toggle}
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
          >
            {visible ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </button>
        </div>

        {strengthValue !== undefined && strengthValue.length > 0 && (
          <div className={styles.strength}>
            <div className={styles.strengthBars}>
              {[0, 1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className={[
                    styles.strengthBar,
                    i < score ? styles[`level${score}`] : "",
                  ].join(" ")}
                />
              ))}
            </div>
            <span className={styles.strengthLabel}>{strengthLabel}</span>
          </div>
        )}

        {error && (
          <span id={errorId} className={styles.error} role="alert">
            {error}
          </span>
        )}
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";
