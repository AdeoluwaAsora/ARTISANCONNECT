import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FiList, FiMap } from "react-icons/fi";
import { usePageTitle } from "@/hooks/usePageTitle";
import { artisansApi } from "@/api/artisansApi";
import {
  ArtisanFilters,
  defaultFilters,
  type ArtisanFilterState,
} from "@/features/artisans/components/ArtisanFilters";
import { ArtisanCard } from "@/features/artisans/components/ArtisanCard";
import { ArtisansMapView } from "@/features/artisans/components/ArtisansMapView";
import { SearchOriginPicker } from "@/features/artisans/components/SearchOriginPicker";
import { useSearchOrigin } from "@/features/artisans/useSearchOrigin";
import styles from "./FindArtisansPage.module.css";

export function FindArtisansPage() {
  usePageTitle("Find artisans");
  const [filters, setFilters] = useState<ArtisanFilterState>(defaultFilters);
  const [view, setView] = useState<"list" | "map">("list");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const { origin } = useSearchOrigin();

  const {
    data: artisans,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["artisans", "nearby", origin, filters],
    queryFn: () =>
      artisansApi.searchNearby(origin!, {
        trade: filters.trade || undefined,
        maxDistanceKm: filters.maxDistanceKm ? Number(filters.maxDistanceKm) : undefined,
        verifiedOnly: filters.verifiedOnly || undefined,
        onlineOnly: filters.onlineOnly || undefined,
      }),
    enabled: origin !== null,
  });

  const toggleSave = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className={styles.page}>
      <div className={styles.filtersColumn}>
        <ArtisanFilters value={filters} onChange={setFilters} />
      </div>

      <div className={styles.resultsColumn}>
        <SearchOriginPicker />

        <div className={styles.resultsHeader}>
          <p className="body-sm">
            {!origin
              ? "Choose a location to see artisans near you"
              : isLoading
                ? "Searching…"
                : `${artisans?.length ?? 0} artisans found`}
          </p>
          <div className={styles.viewToggle}>
            <button
              type="button"
              className={`${styles.toggleButton} ${view === "list" ? styles.toggleActive : ""}`}
              onClick={() => setView("list")}
            >
              <FiList size={16} /> List
            </button>
            <button
              type="button"
              className={`${styles.toggleButton} ${view === "map" ? styles.toggleActive : ""}`}
              onClick={() => setView("map")}
            >
              <FiMap size={16} /> Map
            </button>
          </div>
        </div>

        {!origin ? null : error ? (
          <p className="body-sm" role="alert">
            {error instanceof Error ? error.message : "Couldn't load artisans. Please try again."}
          </p>
        ) : isLoading ? (
          <p className="body-sm">Loading artisans…</p>
        ) : view === "map" ? (
          <ArtisansMapView artisans={artisans ?? []} />
        ) : (
          <div className={styles.grid}>
            {artisans?.map((artisan) => (
              <ArtisanCard
                key={artisan.id}
                artisan={artisan}
                isSaved={savedIds.has(artisan.id)}
                onToggleSave={toggleSave}
              />
            ))}
            {artisans?.length === 0 && (
              <p className="body-sm">No artisans match those filters. Try widening your search.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
