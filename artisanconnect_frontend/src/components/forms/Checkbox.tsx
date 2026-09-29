import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import styles from "./Checkbox.module.css";

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: ReactNode;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, id, ...rest }, ref) => {
    const inputId = id ?? rest.name;
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <div className={styles.field}>
        <label className={styles.row} htmlFor={inputId}>
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            className={styles.checkbox}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={errorId}
            {...rest}
          />
          <span className={styles.labelText}>{label}</span>
        </label>
        {error && (
          <span id={errorId} className={styles.error} role="alert">
            {error}
          </span>
        )}
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";
