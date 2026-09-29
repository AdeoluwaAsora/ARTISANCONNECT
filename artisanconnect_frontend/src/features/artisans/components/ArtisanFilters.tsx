import { Select, Checkbox } from "@/components/forms";
import { Card } from "@/components/ui";
import styles from "./ArtisanFilters.module.css";

export interface ArtisanFilterState {
  trade: string;
  maxDistanceKm: string;
  minRating: string;
  verifiedOnly: boolean;
  onlineOnly: boolean;
}

export const defaultFilters: ArtisanFilterState = {
  trade: "",
  maxDistanceKm: "",
  minRating: "",
  verifiedOnly: false,
  onlineOnly: false,
};

const tradeOptions = [
  { value: "Electrician", label: "Electrician" },
  { value: "Plumber", label: "Plumber" },
  { value: "Carpenter", label: "Carpenter" },
  { value: "Mechanic", label: "Mechanic" },
  { value: "Painter", label: "Painter" },
  { value: "AC Technician", label: "AC Technician" },
];

const distanceOptions = [
  { value: "1", label: "Within 1 km" },
  { value: "3", label: "Within 3 km" },
  { value: "5", label: "Within 5 km" },
  { value: "10", label: "Within 10 km" },
];

const ratingOptions = [
  { value: "4.5", label: "4.5 and up" },
  { value: "4", label: "4.0 and up" },
  { value: "3.5", label: "3.5 and up" },
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
        placeholder="Any distance"
        options={distanceOptions}
        value={value.maxDistanceKm}
        onChange={(e) => onChange({ ...value, maxDistanceKm: e.target.value })}
      />

      <Select
        label="Minimum rating"
        placeholder="Any rating"
        options={ratingOptions}
        value={value.minRating}
        onChange={(e) => onChange({ ...value, minRating: e.target.value })}
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
