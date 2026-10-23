import { useCallback, useState } from "react";

export type GeolocationState = "idle" | "locating" | "located" | "error";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Asks the browser for the device's position on demand (never automatically,
 * so nobody gets a permission prompt they didn't ask for).
 */
export function useGeolocation(initialState: GeolocationState = "idle") {
  const [state, setState] = useState<GeolocationState>(initialState);
  const [error, setError] = useState<string | null>(null);

  const locate = useCallback((onLocated: (coords: Coordinates) => void) => {
    if (!("geolocation" in navigator)) {
      setState("error");
      setError("Your browser can't share its location. Choose a city instead.");
      return;
    }

    setState("locating");
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState("located");
        onLocated({ latitude: position.coords.latitude, longitude: position.coords.longitude });
      },
      (err) => {
        setState("error");
        setError(
          err.code === err.PERMISSION_DENIED
            ? "Location access was blocked. Choose a city instead."
            : "Couldn't get your location. Choose a city instead.",
        );
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }, []);

  return { state, error, locate };
}
