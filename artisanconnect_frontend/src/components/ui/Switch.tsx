import styles from "./Switch.module.css";

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

export function Switch({ checked, onChange, label }: SwitchProps) {
  return (
    <label className={styles.wrapper}>
      <span className={styles.label}>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={[styles.track, checked ? styles.trackOn : ""].join(" ")}
        onClick={() => onChange(!checked)}
      >
        <span className={[styles.thumb, checked ? styles.thumbOn : ""].join(" ")} />
      </button>
    </label>
  );
}
