import { FiCrosshair, FiMapPin } from "react-icons/fi";
import { Select } from "@/components/forms";
import { Button, Card } from "@/components/ui";
import { CITIES } from "@/lib/cities";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useSearchOrigin } from "@/features/artisans/useSearchOrigin";
import styles from "./SearchOriginPicker.module.css";

const cityOptions = CITIES.map((c) => ({ value: c.name, label: c.name }));

/** "Searching near …" with a GPS button and a city fallback. */
export function SearchOriginPicker() {
  const { origin, setFromGps, setFromCity } = useSearchOrigin();
  const { state, error, locate } = useGeolocation();

  return (
    <Card className={styles.panel}>
      <p className={styles.current}>
        <FiMapPin aria-hidden="true" />
        {origin ? (
          <>
            Searching near <strong>{origin.label}</strong>
          </>
        ) : (
          "Choose where to search from"
        )}
      </p>

      <div className={styles.controls}>
        <Button
          type="button"
          variant={origin?.source === "gps" ? "outline" : "primary"}
          size="sm"
          leftIcon={<FiCrosshair />}
          isLoading={state === "locating"}
          onClick={() => locate(({ latitude, longitude }) => setFromGps(latitude, longitude))}
        >
          {origin?.source === "gps" ? "Update my location" : "Use my location"}
        </Button>
        <div className={styles.city}>
          <Select
            label="Or pick a city"
            placeholder="Select a city"
            options={cityOptions}
            value={origin?.source === "city" ? origin.label : ""}
            onChange={(e) => setFromCity(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <p className={styles.error} role="status">
          {error}
        </p>
      )}
    </Card>
  );
}
