import { Select, Checkbox } from "@/components/forms";
import { Card } from "@/components/ui";
import { TRADE_LABELS, type TradeName } from "@/types/api";
import styles from "./ArtisanFilters.module.css";

// A minimum-rating filter returns once Reviews & Ratings exists.
export interface ArtisanFilterState {
  /** Backend trade name, e.g. "AcTechnician"; "" for all trades. */
  trade: string;
  /** "" means the server's default radius (50 km). */
  maxDistanceKm: string;
  verifiedOnly: boolean;
  onlineOnly: boolean;
}

export const defaultFilters: ArtisanFilterState = {
  trade: "",
  maxDistanceKm: "",
  verifiedOnly: false,
  onlineOnly: false,
};

const tradeOptions = (Object.keys(TRADE_LABELS) as TradeName[]).map((name) => ({
  value: name,
  label: TRADE_LABELS[name],
}));

const distanceOptions = [
  { value: "1", label: "Within 1 km" },
  { value: "3", label: "Within 3 km" },
  { value: "5", label: "Within 5 km" },
  { value: "10", label: "Within 10 km" },
  { value: "25", label: "Within 25 km" },
  { value: "100", label: "Within 100 km" },
];

export interface ArtisanFiltersProps {
  value: ArtisanFilterState;
  onChange: (next: ArtisanFilterState) => void;
}

export function ArtisanFilters({ value, onChange }: ArtisanFiltersProps) {
  return (
    <Card className={styles.panel}>
      <h3 className={`heading-sm ${styles.heading}`}>Filters</h3>

      <Select
        label="Trade"
        placeholder="All trades"
        options={tradeOptions}
        value={value.trade}
        onChange={(e) => onChange({ ...value, trade: e.target.value })}
      />

      <Select
        label="Distance"
        placeholder="Within 50 km"
        options={distanceOptions}
        value={value.maxDistanceKm}
        onChange={(e) => onChange({ ...value, maxDistanceKm: e.target.value })}
      />

      <div className={styles.checkboxes}>
        <Checkbox
          label="Verified only"
          checked={value.verifiedOnly}
          onChange={(e) => onChange({ ...value, verifiedOnly: e.target.checked })}
        />
        <Checkbox
          label="Online only"
          checked={value.onlineOnly}
          onChange={(e) => onChange({ ...value, onlineOnly: e.target.checked })}
        />
      </div>

      <button
        type="button"
        className={styles.reset}
        onClick={() => onChange(defaultFilters)}
      >
        Reset filters
      </button>
    </Card>
  );
}
