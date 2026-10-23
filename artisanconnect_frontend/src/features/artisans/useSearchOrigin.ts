import { useCallback, useEffect, useState } from "react";
import { findCity } from "@/lib/cities";
import type { SearchOrigin } from "@/types/artisan";

const STORAGE_KEY = "artisanconnect.searchOrigin";
const CHANGE_EVENT = "artisanconnect:search-origin";

function readStored(): SearchOrigin | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SearchOrigin>;
    if (
      typeof parsed.latitude === "number" &&
      typeof parsed.longitude === "number" &&
      typeof parsed.label === "string" &&
      (parsed.source === "gps" || parsed.source === "city")
    ) {
      return parsed as SearchOrigin;
    }
  } catch {
    // Storage blocked or corrupted: behave as if nothing was saved.
  }
  return null;
}

function writeStored(origin: SearchOrigin | null) {
  try {
    if (origin) localStorage.setItem(STORAGE_KEY, JSON.stringify(origin));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage unavailable: the origin still works for this page view.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/**
 * Where nearby-artisan distances are measured from: the device's GPS position
 * or a chosen city's centre. Remembered in this browser so the search page and
 * dashboard agree, and every open component updates when it changes.
 */
export function useSearchOrigin() {
  const [origin, setOriginState] = useState<SearchOrigin | null>(() => readStored());

  useEffect(() => {
    const sync = () => setOriginState(readStored());
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const setOrigin = useCallback((next: SearchOrigin | null) => {
    setOriginState(next);
    writeStored(next);
  }, []);

  const setFromGps = useCallback(
    (latitude: number, longitude: number) =>
      setOrigin({ latitude, longitude, label: "your location", source: "gps" }),
    [setOrigin],
  );

  const setFromCity = useCallback(
    (cityName: string) => {
      const city = findCity(cityName);
      if (city) {
        setOrigin({ latitude: city.latitude, longitude: city.longitude, label: city.name, source: "city" });
      }
    },
    [setOrigin],
  );

  return { origin, setFromGps, setFromCity };
}
