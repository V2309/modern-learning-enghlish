/**
 * Normalizes text for dictation comparison.
 * - Converts to lowercase
 * - Normalizes Unicode
 * - Standardizes apostrophes
 * - Removes non-alphanumeric punctuation (except apostrophes and spaces)
 * - Trims and collapses multiple spaces
 */
export function normalizeText(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[’‘`]/g, "'") // Standardize apostrophes
    .replace(/[^a-z0-9\s']/g, " ") // Replace punctuation/special chars with space (e.g. hyphens, periods)
    .trim()
    .replace(/\s+/g, " "); // Collapse multiple spaces
}
