import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FiList, FiMap } from "react-icons/fi";
import { usePageTitle } from "@/hooks/usePageTitle";
import { artisansApi } from "@/services/mockArtisans";
import {
  ArtisanFilters,
  defaultFilters,
  type ArtisanFilterState,
} from "@/features/artisans/components/ArtisanFilters";
import { ArtisanCard } from "@/features/artisans/components/ArtisanCard";
import { ArtisansMapView } from "@/features/artisans/components/ArtisansMapView";
import styles from "./FindArtisansPage.module.css";

export function FindArtisansPage() {
  usePageTitle("Find artisans");
  const [filters, setFilters] = useState<ArtisanFilterState>(defaultFilters);
  const [view, setView] = useState<"list" | "map">("list");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const { data: artisans, isLoading } = useQuery({
    queryKey: ["artisans", "nearby", filters],
    queryFn: () =>
      artisansApi.getNearby({
        trade: filters.trade || undefined,
        maxDistanceKm: filters.maxDistanceKm ? Number(filters.maxDistanceKm) : undefined,
        minRating: filters.minRating ? Number(filters.minRating) : undefined,
        verifiedOnly: filters.verifiedOnly || undefined,
        onlineOnly: filters.onlineOnly || undefined,
      }),
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
        <div className={styles.resultsHeader}>
          <p className="body-sm">
            {isLoading ? "Searching…" : `${artisans?.length ?? 0} artisans found`}
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

        {isLoading ? (
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
