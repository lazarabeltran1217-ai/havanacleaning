/**
 * Locale-aware content loading helpers.
 * Used to pick the right language variant from database records.
 */

/**
 * Pick the localized value: prefer the `es` variant when locale is "es",
 * falling back to the `en` value when the Spanish variant is empty/null.
 */
export function localized<T>(en: T, es: T | null | undefined, locale: string): T {
  return locale === "es" && es != null ? es : en;
}

/**
 * Build a locale-aware content map from Content model rows.
 * Uses `dataEs` when locale is "es" and the field exists, else `dataEn`.
 */
export function buildContentMap(
  rows: { key: string; dataEn: unknown; dataEs?: unknown | null }[],
  locale: string,
): Record<string, unknown> {
  const map: Record<string, unknown> = {};
  for (const row of rows) {
    if (locale === "es" && row.dataEs != null) {
      map[row.key] = row.dataEs;
    } else {
      map[row.key] = row.dataEn;
    }
  }
  return map;
}
