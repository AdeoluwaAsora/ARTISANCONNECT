/**
 * Approximate city-centre coordinates, used as a fallback location when a
 * customer posts a job without sharing their device location. Good enough to
 * place a job in the right city; replace with real geocoding of the street
 * address once a maps API key exists (see ArtisansMapView.tsx).
 */
export interface City {
  name: string;
  latitude: number;
  longitude: number;
}

export const CITIES: City[] = [
  { name: "Aba", latitude: 5.1066, longitude: 7.3667 },
  { name: "Abeokuta", latitude: 7.1475, longitude: 3.3619 },
  { name: "Abuja", latitude: 9.0765, longitude: 7.3986 },
  { name: "Akure", latitude: 7.2526, longitude: 5.1931 },
  { name: "Asaba", latitude: 6.198, longitude: 6.7313 },
  { name: "Benin City", latitude: 6.335, longitude: 5.6037 },
  { name: "Calabar", latitude: 4.9757, longitude: 8.3417 },
  { name: "Enugu", latitude: 6.4584, longitude: 7.5464 },
  { name: "Ibadan", latitude: 7.3775, longitude: 3.947 },
  { name: "Ilorin", latitude: 8.4966, longitude: 4.5426 },
  { name: "Jos", latitude: 9.8965, longitude: 8.8583 },
  { name: "Kaduna", latitude: 10.5105, longitude: 7.4165 },
  { name: "Kano", latitude: 12.0022, longitude: 8.592 },
  { name: "Lagos", latitude: 6.5244, longitude: 3.3792 },
  { name: "Onitsha", latitude: 6.149, longitude: 6.7857 },
  { name: "Osogbo", latitude: 7.7827, longitude: 4.5418 },
  { name: "Owerri", latitude: 5.484, longitude: 7.0351 },
  { name: "Port Harcourt", latitude: 4.8156, longitude: 7.0498 },
  { name: "Uyo", latitude: 5.0377, longitude: 7.9128 },
  { name: "Warri", latitude: 5.516, longitude: 5.75 },
];

export function findCity(name: string): City | undefined {
  return CITIES.find((c) => c.name === name);
}
