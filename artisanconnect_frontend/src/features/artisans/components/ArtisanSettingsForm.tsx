import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { FiCheckCircle, FiCrosshair } from "react-icons/fi";
import { Checkbox, Input, Select, Textarea } from "@/components/forms";
import { Button, Card } from "@/components/ui";
import { artisansApi } from "@/api/artisansApi";
import { useGeolocation } from "@/hooks/useGeolocation";
import { CITIES, findCity } from "@/lib/cities";
import { TRADE_LABELS, TradeValue, isTradeName, type TradeName } from "@/types/api";
import type { MyProfileResult } from "@/types/artisan";
import styles from "./ArtisanSettingsForm.module.css";

const tradeOptions = (Object.keys(TRADE_LABELS) as TradeName[]).map((name) => ({
  value: name,
  label: TRADE_LABELS[name],
}));

const cityOptions = CITIES.map((c) => ({ value: c.name, label: c.name }));

// Mirrors UpdateArtisanProfileCommandValidator on the backend.
const settingsSchema = z.object({
  trade: z.string().refine((value): boolean => isTradeName(value), "Select your trade"),
  yearsOfExperience: z
    .number({ invalid_type_error: "Enter years of experience" })
    .int("Use whole years")
    .min(0, "Must be 0 or more")
    .max(70, "Enter a realistic number of years"),
  hourlyRate: z
    .number({ invalid_type_error: "Enter a number" })
    .positive("Must be more than zero")
    .optional(),
  bio: z.string().max(1000, "Keep your bio under 1,000 characters"),
  isAvailable: z.boolean(),
  city: z.string(),
});

type SettingsValues = z.infer<typeof settingsSchema>;

interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface ArtisanSettingsFormProps {
  profile: MyProfileResult;
}

export function ArtisanSettingsForm({ profile }: ArtisanSettingsFormProps) {
  const queryClient = useQueryClient();
  const artisan = profile.artisanProfile!;

  // Exact device coordinates, if the artisan shared them. Without them, the
  // chosen city's centre is used. Starts from what's saved.
  const savedCoords: Coordinates | null =
    artisan.latitude !== null && artisan.longitude !== null
      ? { latitude: artisan.latitude, longitude: artisan.longitude }
      : null;
  const savedCity = artisan.city ? findCity(artisan.city) : undefined;
  const savedIsExact =
    savedCoords !== null &&
    !(savedCity && savedCity.latitude === savedCoords.latitude && savedCity.longitude === savedCoords.longitude);

  const [gpsCoords, setGpsCoords] = useState<Coordinates | null>(savedIsExact ? savedCoords : null);
  const { state: locateState, error: locateError, locate } = useGeolocation(savedIsExact ? "located" : "idle");
  const [gpsChanged, setGpsChanged] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saved">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      trade: artisan.trade,
      yearsOfExperience: artisan.yearsOfExperience,
      hourlyRate: artisan.hourlyRate ?? undefined,
      bio: artisan.bio ?? "",
      isAvailable: artisan.isAvailable,
      city: artisan.city ?? "",
    },
  });

  const city = watch("city");
  const hasLocation = gpsCoords !== null || findCity(city) !== undefined;

  const onSubmit = async (values: SettingsValues) => {
    setSaveError(null);
    setSaveState("idle");

    const cityCentre = findCity(values.city);
    const coords = gpsCoords ?? (cityCentre ? { latitude: cityCentre.latitude, longitude: cityCentre.longitude } : null);

    try {
      const updated = await artisansApi.updateMyProfile({
        trade: TradeValue[values.trade as TradeName],
        yearsOfExperience: values.yearsOfExperience,
        bio: values.bio.trim() || null,
        hourlyRate: values.hourlyRate ?? null,
        isAvailable: values.isAvailable,
        latitude: coords?.latitude ?? null,
        longitude: coords?.longitude ?? null,
        city: values.city || null,
      });
      queryClient.setQueryData(["me"], updated);
      await queryClient.invalidateQueries({ queryKey: ["artisans"] });
      reset(values);
      setGpsChanged(false);
      setSaveState("saved");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Couldn't save your changes. Please try again.");
    }
  };

  return (
    <Card className={styles.card}>
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        <section className={styles.section}>
          <h3 className="heading-sm">Account</h3>
          <p className="body-sm">
            {profile.firstName} {profile.lastName} · {profile.email}
          </p>
        </section>

        <section className={styles.section}>
          <h3 className="heading-sm">Work details</h3>
          <div className={styles.row}>
            <Select label="Primary trade" options={tradeOptions} error={errors.trade?.message} {...register("trade")} />
            <Input
              label="Years of experience"
              type="number"
              min={0}
              error={errors.yearsOfExperience?.message}
              {...register("yearsOfExperience", { valueAsNumber: true })}
            />
          </div>
          <Input
            label="Hourly rate (₦), optional"
            type="number"
            min={0}
            error={errors.hourlyRate?.message}
            {...register("hourlyRate", { setValueAs: (v) => (v === "" || v === null ? undefined : Number(v)) })}
          />
          <Textarea
            label="Bio"
            placeholder="Tell customers about your experience and the kind of jobs you do."
            error={errors.bio?.message}
            {...register("bio")}
          />
          <Checkbox label="Available for new jobs (shows you as online)" {...register("isAvailable")} />
        </section>

        <section className={styles.section}>
          <h3 className="heading-sm">Service location</h3>
          <p className="body-sm">
            Customers searching nearby see how far you are, never your exact location. Without a
            location you won't appear in nearby search.
          </p>
          <Select label="City" placeholder="Select a city" options={cityOptions} {...register("city")} />
          <div className={styles.locateRow}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<FiCrosshair />}
              isLoading={locateState === "locating"}
              onClick={() =>
                locate((coords) => {
                  setGpsCoords(coords);
                  setGpsChanged(true);
                })
              }
            >
              {gpsCoords ? "Update exact location" : "Use my exact location"}
            </Button>
            {gpsCoords && (
              <span className={styles.ok}>
                <FiCheckCircle aria-hidden="true" /> Exact location set
              </span>
            )}
          </div>
          {locateError && (
            <p className={styles.warning} role="status">
              {locateError}
            </p>
          )}
          {!hasLocation && (
            <p className={styles.warning}>Choose a city or share your location to appear in search.</p>
          )}
        </section>

        {saveError && (
          <p className={styles.error} role="alert">
            {saveError}
          </p>
        )}

        <div className={styles.actions}>
          {saveState === "saved" && !isDirty && !gpsChanged && (
            <span className={styles.ok}>
              <FiCheckCircle aria-hidden="true" /> Saved
            </span>
          )}
          <Button type="submit" isLoading={isSubmitting}>
            Save changes
          </Button>
        </div>
      </form>
    </Card>
  );
}
