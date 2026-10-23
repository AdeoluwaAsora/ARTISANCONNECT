/** "Chidi Okafor" -> "CO". At most two letters; "?" for an empty name. */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.length === 0
    ? "?"
    : parts
        .slice(0, 2)
        .map((p) => p[0]!.toUpperCase())
        .join("");
}
