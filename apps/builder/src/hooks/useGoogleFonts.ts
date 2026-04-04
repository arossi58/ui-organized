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

/** Inject a Google Fonts CSS link into <head> for a given family + weights. */
export function loadGoogleFont(family: string, weights: number[]): void {
  const id = `gf-${family.replace(/\s+/g, "-")}`;
  if (document.getElementById(id)) return;

  const weightsStr = weights.join(";");
  const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weightsStr}&display=swap`;

  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = url;
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

// ─── Fallback list (shown when API key is missing) ────────────────────────────

const FALLBACK_FONTS: GoogleFont[] = [
  { family: "Roboto", variants: ["regular","100","300","500","700","900"], files: {} },
  { family: "Open Sans", variants: ["regular","300","500","600","700","800"], files: {} },
  { family: "Lato", variants: ["regular","100","300","700","900"], files: {} },
  { family: "Montserrat", variants: ["regular","100","200","300","500","600","700","800","900"], files: {} },
  { family: "Oswald", variants: ["regular","200","300","500","600","700"], files: {} },
  { family: "Inter", variants: ["regular","100","200","300","500","600","700","800","900"], files: {} },
  { family: "Poppins", variants: ["regular","100","200","300","500","600","700","800","900"], files: {} },
  { family: "Raleway", variants: ["regular","100","200","300","500","600","700","800","900"], files: {} },
  { family: "Nunito", variants: ["regular","200","300","600","700","800","900"], files: {} },
  { family: "Playfair Display", variants: ["regular","500","600","700","800","900"], files: {} },
  { family: "Merriweather", variants: ["regular","300","700","900"], files: {} },
  { family: "Source Sans 3", variants: ["regular","200","300","600","700","900"], files: {} },
  { family: "PT Sans", variants: ["regular","700"], files: {} },
  { family: "Ubuntu", variants: ["regular","300","500","700"], files: {} },
  { family: "Noto Sans", variants: ["regular","100","200","300","500","600","700","800","900"], files: {} },
  { family: "DM Sans", variants: ["regular","100","200","300","500","600","700","800","900"], files: {} },
  { family: "Mulish", variants: ["regular","200","300","500","600","700","800","900"], files: {} },
  { family: "Figtree", variants: ["regular","300","500","600","700","800","900"], files: {} },
  { family: "Plus Jakarta Sans", variants: ["regular","200","300","500","600","700","800"], files: {} },
  { family: "Work Sans", variants: ["regular","100","200","300","500","600","700","800","900"], files: {} },
];
