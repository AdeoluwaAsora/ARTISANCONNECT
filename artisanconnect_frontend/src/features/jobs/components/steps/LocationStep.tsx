import type { FieldErrors, UseFormRegister, UseFormSetValue } from "react-hook-form";
import { FiCheckCircle, FiCrosshair } from "react-icons/fi";
import { Input, Select } from "@/components/forms";
import { Button } from "@/components/ui";
import type { PostJobFormValues } from "@/features/jobs/schemas";
import { CITIES } from "@/lib/cities";
import { useGeolocation } from "@/hooks/useGeolocation";
import styles from "./steps.module.css";

const cityOptions = CITIES.map((c) => ({ value: c.name, label: c.name }));

interface LocationStepProps {
  register: UseFormRegister<PostJobFormValues>;
  errors: FieldErrors<PostJobFormValues>;
  setValue: UseFormSetValue<PostJobFormValues>;
  hasCoordinates: boolean;
}

export function LocationStep({ register, errors, setValue, hasCoordinates }: LocationStepProps) {
  const { state: locateState, error: locateError, locate } = useGeolocation(
    hasCoordinates ? "located" : "idle",
  );

  const useCurrentLocation = () =>
    locate(({ latitude, longitude }) => {
      setValue("latitude", latitude);
      setValue("longitude", longitude);
    });

  return (
    <div className={styles.stepFields}>
      <Input
        label="Street address"
        placeholder="e.g. 14 Admiralty Way, Lekki Phase 1"
        error={errors.address?.message}
        {...register("address")}
      />
      <Select
        label="City"
        placeholder="Select a city"
        options={cityOptions}
        error={errors.city?.message}
        {...register("city")}
      />

      <div className={styles.locateRow}>
        <Button
          type="button"
          variant="outline"
          size="sm"
          leftIcon={<FiCrosshair />}
          onClick={useCurrentLocation}
          isLoading={locateState === "locating"}
        >
          {locateState === "located" ? "Update my location" : "Use my current location"}
        </Button>
        {locateState === "located" && (
          <span className={styles.locateOk}>
            <FiCheckCircle aria-hidden="true" /> Exact location captured
          </span>
        )}
      </div>
      {locateError && (
        <p className={styles.locateError} role="status">
          {locateError}
        </p>
      )}

      <p className="body-sm">
        Sharing your location helps nearby artisans find this job. If you skip it, we'll use the
        centre of your city. Your exact address is only shared with the artisan once you accept
        their bid.
      </p>
    </div>
  );
}
