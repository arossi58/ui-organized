import { useState, useEffect, useRef } from "react";

export interface GoogleFont {
  family: string;
  variants: string[];  // e.g. ["regular", "500", "600", "700", "italic"]
  files: Record<string, string>;
}

// Simple cache across renders
let cachedFonts: GoogleFont[] | null = null;
let fetchPromise: Promise<GoogleFont[]> | null = null;

/**
 * Parse variant string to numeric weight or null for italic-only entries.
 * "regular" → 400, "italic" → null, "700italic" → null, "500" → 500
 */
function variantToWeight(v: string): number | null {
  if (v === "regular") return 400;
  const num = parseInt(v, 10);
  return isNaN(num) ? null : num;
}

/** Extract sorted unique numeric weights from a font's variants list. */
export function getAvailableWeights(font: GoogleFont): number[] {
  const weights = font.variants
    .map(variantToWeight)
    .filter((w): w is number => w !== null);
  return [...new Set(weights)].sort((a, b) => a - b);
}

async function fetchGoogleFonts(): Promise<GoogleFont[]> {
  if (cachedFonts) return cachedFonts;
  if (fetchPromise) return fetchPromise;

  fetchPromise = (async () => {
    try {
      const res = await fetch(
        "https://www.googleapis.com/webfonts/v1/webfonts?sort=popularity&key=AIzaSyDummyKeyForDisplay",
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { items: GoogleFont[] };
      cachedFonts = data.items;
      return data.items;
    } catch {
      // Return popular fallback list when API key is absent/invalid
      cachedFonts = FALLBACK_FONTS;
      return FALLBACK_FONTS;
    }
  })();

  return fetchPromise;
}

/** Ascending, deduplicated — the order `css2` requires in its `wght@` list. */
export function normalizeWeights(weights: number[]): number[] {
  return [...new Set(weights)].sort((a, b) => a - b);
}

/**
 * The Google Fonts `css2` stylesheet URL for one family and its weights.
 *
 * Exported and shared, because both the live preview and the exported `fonts.ts`
 * need this URL and two implementations would drift. Three things the endpoint
 * cares about, all of them silent failures if you get them wrong:
 *
 * - **One family per request.** An unknown family is dropped from a multi-family
 *   request without an error, so a typo takes that font down and still answers 200.
 * - **Weights ascending.** `wght@700;400` is rejected outright.
 * - **Family name percent-encoded** — `Playfair Display` → `Playfair%20Display`.
 *
 * Note it does *not* validate that the family ships these weights: asking for a
 * weight a family doesn't have is also a 200 with the face quietly omitted, and
 * the browser then synthesises it. That check needs the family's variant list —
 * see `unservableWeights`.
 */
export function googleFontsHref(family: string, weights: number[]): string {
  const wght = normalizeWeights(weights).join(";");
  return `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${wght}&display=swap`;
}

/**
 * Which of `declared` the family cannot actually serve.
 *
 * Google answers 200 and omits the face, so a status check never catches this —
 * the only signal is the family's own variant list.
 */
export function unservableWeights(declared: number[], available: number[]): number[] {
  const have = new Set(available);
  return normalizeWeights(declared).filter((w) => !have.has(w));
}

/**
 * Warn about a family that can't carry the theme's four weight roles.
 *
 * There are two ways to lose the hierarchy, and they need different wording:
 *
 * - **Collapsed** — picking the family snapped several roles onto the same
 *   weight, because it's all the family ships. Anton offers only 400, so Default,
 *   Emphasis, Strong and Heavy all end up at 400 and render identically. This is
 *   what actually happens through the picker, and today it happens in silence.
 * - **Synthesised** — the theme declares weights the family doesn't ship. The
 *   picker can't produce this (it snaps, and its dropdown only offers real
 *   weights), but importing a theme.json can: hand-edited, round-tripped through
 *   Figma, or written when the family had a different variant list. Google
 *   answers 200 and omits the face, so the browser fakes it.
 *
 * Returns null when the family serves every declared weight distinctly.
 */
export function weightCoverageWarning(
  family: string,
  roles: Record<string, number>,
  available: number[],
): string | null {
  if (!family || available.length === 0) return null;

  const declared = Object.values(roles).filter((w) => Number.isFinite(w));
  if (declared.length === 0) return null;

  const missing = unservableWeights(declared, available);
  if (missing.length > 0) {
    const plural = missing.length > 1 ? "s" : "";
    return `${family} does not ship weight${plural} ${listPhrase(missing.map(String))}. The browser will synthesise ${missing.length > 1 ? "them" : "it"}, which reads heavier and looser than a real cut.`;
  }

  // Role order matters for the message: name the roles that lost their identity,
  // not the one that kept it.
  const entries = Object.entries(roles);
  const base = entries[0];
  if (!base) return null;
  const collapsed = entries.slice(1).filter(([, w]) => w === base[1]);
  if (collapsed.length === 0) return null;

  return `${family} ships only weight${normalizeWeights(available).length > 1 ? "s" : ""} ${listPhrase(normalizeWeights(available).map(String))}, so ${listPhrase(collapsed.map(([role]) => capitalize(role)))} render the same as ${capitalize(base[0])}.`;
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/** `["a","b","c"]` → `"a, b and c"`. Shared so the picker and README agree. */
export function listPhrase(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/**
 * Inject (or update) a Google Fonts CSS link in <head> for a family + weights.
 *
 * Keyed by family, but re-points the link if called again with a different
 * weight set — so picking a new weight role actually loads that weight's font
 * file (the old version bailed out on the first link and never updated, which
 * is why weight changes on an already-loaded font didn't render).
 */
export function loadGoogleFont(family: string, weights: number[]): void {
  const id = `gf-${family.replace(/\s+/g, "-")}`;
  const weightsStr = normalizeWeights(weights).join(";");
  const url = googleFontsHref(family, weights);

  const existing = document.getElementById(id) as HTMLLinkElement | null;
  if (existing) {
    if (existing.dataset.weights !== weightsStr) {
      existing.dataset.weights = weightsStr;
      existing.href = url;
    }
    return;
  }

  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = url;
  link.dataset.weights = weightsStr;
  document.head.appendChild(link);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UseGoogleFontsResult {
  fonts: GoogleFont[];
  loading: boolean;
  error: string | null;
}

export function useGoogleFonts(): UseGoogleFontsResult {
  const [fonts, setFonts] = useState<GoogleFont[]>(cachedFonts ?? []);
  const [loading, setLoading] = useState(!cachedFonts);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    if (cachedFonts) {
      setFonts(cachedFonts);
      setLoading(false);
      return;
    }
    fetchGoogleFonts()
      .then((list) => {
        if (mounted.current) {
          setFonts(list);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (mounted.current) {
          setError(String(err));
          setLoading(false);
          setFonts(FALLBACK_FONTS);
        }
      });
    return () => {
      mounted.current = false;
    };
  }, []);

  return { fonts, loading, error };
}

// ─── Curated Figma-available font list ────────────────────────────────────────
//
// Every family below ships in the Google Fonts library, which Figma bundles in
// full — so anything selectable here is guaranteed to resolve to a real font in
// Figma. This is also the fallback used when the Google Fonts API is
// unavailable. Keep this list to Google Fonts only; adding a family that Figma
// can't render would let users pick a font the design tool would substitute.

export const FALLBACK_FONTS: GoogleFont[] = [
  // Sans-serif
  { family: "Inter", variants: ["regular","100","200","300","500","600","700","800","900"], files: {} },
  { family: "Roboto", variants: ["regular","100","300","500","700","900"], files: {} },
  { family: "Open Sans", variants: ["regular","300","500","600","700","800"], files: {} },
  { family: "Lato", variants: ["regular","100","300","700","900"], files: {} },
  { family: "Montserrat", variants: ["regular","100","200","300","500","600","700","800","900"], files: {} },
  { family: "Poppins", variants: ["regular","100","200","300","500","600","700","800","900"], files: {} },
  { family: "Raleway", variants: ["regular","100","200","300","500","600","700","800","900"], files: {} },
  { family: "Nunito", variants: ["regular","200","300","600","700","800","900"], files: {} },
  { family: "Nunito Sans", variants: ["regular","200","300","600","700","800","900"], files: {} },
  { family: "Source Sans 3", variants: ["regular","200","300","600","700","900"], files: {} },
  { family: "PT Sans", variants: ["regular","700"], files: {} },
  { family: "Ubuntu", variants: ["regular","300","500","700"], files: {} },
  { family: "Noto Sans", variants: ["regular","100","200","300","500","600","700","800","900"], files: {} },
  { family: "DM Sans", variants: ["regular","100","200","300","500","600","700","800","900"], files: {} },
  { family: "Mulish", variants: ["regular","200","300","500","600","700","800","900"], files: {} },
  { family: "Figtree", variants: ["regular","300","500","600","700","800","900"], files: {} },
  { family: "Plus Jakarta Sans", variants: ["regular","200","300","500","600","700","800"], files: {} },
  { family: "Work Sans", variants: ["regular","100","200","300","500","600","700","800","900"], files: {} },
  { family: "Rubik", variants: ["regular","300","500","600","700","800","900"], files: {} },
  { family: "Karla", variants: ["regular","200","300","500","600","700","800"], files: {} },
  { family: "Manrope", variants: ["regular","200","300","500","600","700","800"], files: {} },
  { family: "Space Grotesk", variants: ["regular","300","500","600","700"], files: {} },
  { family: "Sora", variants: ["regular","100","200","300","500","600","700","800"], files: {} },
  { family: "Libre Franklin", variants: ["regular","100","200","300","500","600","700","800","900"], files: {} },
  { family: "Barlow", variants: ["regular","100","200","300","500","600","700","800","900"], files: {} },
  { family: "Quicksand", variants: ["regular","300","500","600","700"], files: {} },
  { family: "Josefin Sans", variants: ["regular","100","200","300","500","600","700"], files: {} },
  { family: "Cabin", variants: ["regular","500","600","700"], files: {} },
  { family: "Dosis", variants: ["regular","200","300","500","600","700","800"], files: {} },
  { family: "Titillium Web", variants: ["regular","200","300","600","700","900"], files: {} },
  { family: "Heebo", variants: ["regular","100","200","300","500","600","700","800","900"], files: {} },
  { family: "Assistant", variants: ["regular","200","300","500","600","700","800"], files: {} },
  { family: "Fira Sans", variants: ["regular","100","200","300","500","600","700","800","900"], files: {} },
  { family: "IBM Plex Sans", variants: ["regular","100","200","300","500","600","700"], files: {} },
  { family: "Archivo", variants: ["regular","100","200","300","500","600","700","800","900"], files: {} },
  { family: "Kanit", variants: ["regular","100","200","300","500","600","700","800","900"], files: {} },
  { family: "Oswald", variants: ["regular","200","300","500","600","700"], files: {} },
  { family: "Bebas Neue", variants: ["regular"], files: {} },
  { family: "Anton", variants: ["regular"], files: {} },
  { family: "Comfortaa", variants: ["regular","300","500","600","700"], files: {} },
  // Serif
  { family: "Playfair Display", variants: ["regular","500","600","700","800","900"], files: {} },
  { family: "Merriweather", variants: ["regular","300","700","900"], files: {} },
  { family: "Lora", variants: ["regular","500","600","700"], files: {} },
  { family: "PT Serif", variants: ["regular","700"], files: {} },
  { family: "Bitter", variants: ["regular","100","200","300","500","600","700","800","900"], files: {} },
  { family: "Libre Baskerville", variants: ["regular","700"], files: {} },
  { family: "EB Garamond", variants: ["regular","500","600","700","800"], files: {} },
  { family: "Cormorant Garamond", variants: ["regular","300","500","600","700"], files: {} },
  { family: "Crimson Text", variants: ["regular","600","700"], files: {} },
  { family: "Spectral", variants: ["regular","200","300","500","600","700","800"], files: {} },
  { family: "Domine", variants: ["regular","500","600","700"], files: {} },
  { family: "Zilla Slab", variants: ["regular","300","500","600","700"], files: {} },
  { family: "Roboto Slab", variants: ["regular","100","200","300","500","600","700","800","900"], files: {} },
  { family: "Abril Fatface", variants: ["regular"], files: {} },
  // Monospace
  { family: "IBM Plex Mono", variants: ["regular","100","200","300","500","600","700"], files: {} },
  { family: "JetBrains Mono", variants: ["regular","100","200","300","500","600","700","800"], files: {} },
  { family: "Roboto Mono", variants: ["regular","100","200","300","500","600","700"], files: {} },
  { family: "Source Code Pro", variants: ["regular","200","300","500","600","700","800","900"], files: {} },
  { family: "Space Mono", variants: ["regular","700"], files: {} },
  { family: "Fira Code", variants: ["regular","300","500","600","700"], files: {} },
  // Display / hand
  { family: "Pacifico", variants: ["regular"], files: {} },
  { family: "Dancing Script", variants: ["regular","500","600","700"], files: {} },
  { family: "Caveat", variants: ["regular","500","600","700"], files: {} },
  { family: "Lobster", variants: ["regular"], files: {} },
];
