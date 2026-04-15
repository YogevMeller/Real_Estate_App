// ─────────────────────────────────────────────────────────────────────────────
// Hebrew Natural-Language Search Parser for Agenta
// Extracts structured filters from free-text queries like:
//   "4 חדרים בתל אביב עד 3 מיליון עם מרפסת ומעלית קומה גבוהה"
// ─────────────────────────────────────────────────────────────────────────────

import { ISRAEL_CITIES } from "./israelCities";

export type ParsedSearch = {
  city?: string;
  roomsMin?: number;
  roomsMax?: number;
  priceMin?: number;
  priceMax?: number;
  sqmMin?: number;
  sqmMax?: number;
  floorMin?: number;
  floorMax?: number;
  tags: string[];
  residual: string;  // leftover text after extraction (for DB text search)
};

// ── Price detection ──────────────────────────────────────────────────────────
// Handles: "עד 3 מיליון", "2-4 מיליון", "מעל 2M", "1.5-3 מיליון", "עד 3M",
//          "תקציב 2 עד 4 מיליון", "בין 2 ל-3 מיליון", "3000000"

function parseHebrewNumber(s: string): number | null {
  const cleaned = s.replace(/,/g, "").trim();
  const num = parseFloat(cleaned);
  if (isNaN(num)) return null;
  return num;
}

function toShekels(value: number, unit: string): number {
  const u = unit.trim().toLowerCase();
  if (u.includes("מיליון") || u === "m" || u === "מ") return value * 1_000_000;
  if (u.includes("אלף") || u === "k" || u === "א") return value * 1_000;
  // If no unit and value is small, assume millions
  if (value < 100) return value * 1_000_000;
  return value;
}

const PRICE_PATTERNS = [
  // "בין X ל-Y מיליון" / "בין X ל Y מיליון"
  /בין\s+([\d.,]+)\s*(?:ל-?|ל\s*)([\d.,]+)\s*(מיליון|אלף|m|k|מ|א)?/i,
  // "X עד Y מיליון" / "X-Y מיליון"
  /([\d.,]+)\s*(?:עד|-)\s*([\d.,]+)\s*(מיליון|אלף|m|k|מ|א)/i,
  // "עד X מיליון" / "מתחת ל-X מיליון"
  /(?:עד|מתחת\s*ל-?|לא\s*יותר\s*מ-?)\s*([\d.,]+)\s*(מיליון|אלף|m|k|מ|א)/i,
  // "מעל X מיליון" / "מ-X מיליון" / "לפחות X מיליון"
  /(?:מעל|מ-|לפחות|מינימום)\s*([\d.,]+)\s*(מיליון|אלף|m|k|מ|א)/i,
  // "X מיליון" (standalone)
  /([\d.,]+)\s*(מיליון|m)/i,
];

function detectPrice(text: string): { min?: number; max?: number; matched: string } {
  // Pattern: "בין X ל-Y מיליון"
  let m = text.match(/בין\s+([\d.,]+)\s*(?:ל-?|ל\s*)([\d.,]+)\s*(מיליון|אלף|m|k|מ|א)?/i);
  if (m) {
    const unit = m[3] || "מיליון";
    const v1 = parseHebrewNumber(m[1]);
    const v2 = parseHebrewNumber(m[2]);
    if (v1 !== null && v2 !== null) {
      return { min: toShekels(v1, unit), max: toShekels(v2, unit), matched: m[0] };
    }
  }

  // Pattern: "X עד Y מיליון" / "X-Y מיליון"
  m = text.match(/([\d.,]+)\s*(?:עד|-)\s*([\d.,]+)\s*(מיליון|אלף|m|k|מ|א)/i);
  if (m) {
    const v1 = parseHebrewNumber(m[1]);
    const v2 = parseHebrewNumber(m[2]);
    if (v1 !== null && v2 !== null) {
      return { min: toShekels(v1, m[3]), max: toShekels(v2, m[3]), matched: m[0] };
    }
  }

  // Pattern: "עד X מיליון"
  m = text.match(/(?:עד|מתחת\s*ל-?|לא\s*יותר\s*מ-?)\s*([\d.,]+)\s*(מיליון|אלף|m|k|מ|א)/i);
  if (m) {
    const v = parseHebrewNumber(m[1]);
    if (v !== null) return { max: toShekels(v, m[2]), matched: m[0] };
  }

  // Pattern: "מעל X מיליון"
  m = text.match(/(?:מעל|מ-|לפחות|מינימום)\s*([\d.,]+)\s*(מיליון|אלף|m|k|מ|א)/i);
  if (m) {
    const v = parseHebrewNumber(m[1]);
    if (v !== null) return { min: toShekels(v, m[2]), matched: m[0] };
  }

  return { matched: "" };
}

// ── Rooms detection ──────────────────────────────────────────────────────────
// "4 חדרים", "3-5 חדרים", "3 עד 5 חדרים"

function detectRooms(text: string): { min?: number; max?: number; matched: string } {
  // Range: "3-5 חדרים" or "3 עד 5 חדרים"
  let m = text.match(/([\d])\s*(?:-|עד)\s*([\d])\s*חד/);
  if (m) return { min: parseInt(m[1]), max: parseInt(m[2]), matched: m[0] };

  // Exact: "4 חדרים"
  m = text.match(/([\d])\s*חד/);
  if (m) return { min: parseInt(m[1]), matched: m[0] };

  return { matched: "" };
}

// ── Sqm detection ────────────────────────────────────────────────────────────
// "100 מטר", "80-120 מ״ר", "מעל 90 מ״ר"

function detectSqm(text: string): { min?: number; max?: number; matched: string } {
  // Range
  let m = text.match(/([\d]+)\s*(?:-|עד)\s*([\d]+)\s*(?:מ[״"׳']ר|מטר|sqm)/);
  if (m) return { min: parseInt(m[1]), max: parseInt(m[2]), matched: m[0] };

  // "עד X מ״ר"
  m = text.match(/(?:עד)\s*([\d]+)\s*(?:מ[״"׳']ר|מטר|sqm)/);
  if (m) return { max: parseInt(m[1]), matched: m[0] };

  // "מעל X מ״ר"
  m = text.match(/(?:מעל|לפחות)\s*([\d]+)\s*(?:מ[״"׳']ר|מטר|sqm)/);
  if (m) return { min: parseInt(m[1]), matched: m[0] };

  // "X מ״ר"
  m = text.match(/([\d]+)\s*(?:מ[״"׳']ר|מטר)/);
  if (m) return { min: parseInt(m[1]), matched: m[0] };

  return { matched: "" };
}

// ── Floor detection ──────────────────────────────────────────────────────────
// "קומה 3", "קומה גבוהה", "קומות 2-5", "קומה נמוכה"

function detectFloor(text: string): { min?: number; max?: number; matched: string } {
  // "קומה גבוהה"
  let m = text.match(/קומה\s*גבוהה/);
  if (m) return { min: 5, matched: m[0] };

  // "קומה נמוכה"
  m = text.match(/קומה\s*נמוכה/);
  if (m) return { max: 2, matched: m[0] };

  // "קומות X-Y"
  m = text.match(/קומ(?:ה|ות)\s*([\d]+)\s*(?:-|עד)\s*([\d]+)/);
  if (m) return { min: parseInt(m[1]), max: parseInt(m[2]), matched: m[0] };

  // "קומה X"
  m = text.match(/קומה\s*([\d]+)/);
  if (m) return { min: parseInt(m[1]), max: parseInt(m[1]), matched: m[0] };

  return { matched: "" };
}

// ── City detection ───────────────────────────────────────────────────────────
// Sort by length descending so "תל אביב-יפו" matches before "תל אביב"
const SORTED_CITIES = [...ISRAEL_CITIES].sort((a, b) => b.length - a.length);

function detectCity(text: string): { city?: string; matched: string } {
  // Check for "ב" prefix (common Hebrew preposition: "בתל אביב")
  for (const c of SORTED_CITIES) {
    const idx = text.indexOf(c);
    if (idx >= 0) {
      return { city: c, matched: c };
    }
    // "ב" prefix
    const withPrefix = "ב" + c;
    const idx2 = text.indexOf(withPrefix);
    if (idx2 >= 0) {
      return { city: c, matched: withPrefix };
    }
  }
  return { matched: "" };
}

// ── Semantic tag detection ───────────────────────────────────────────────────

export const SEMANTIC_TAGS = [
  { label: "שקט", icon: "🌿", keywords: ["שקט", "שקטה", "שקטות", "רחוב שקט"] },
  { label: "ליד גן ילדים", icon: "🧒", keywords: ["גן ילדים", "ילדים", "גני"] },
  { label: "ליד תחנת רכבת", icon: "🚆", keywords: ["רכבת", "תחנת רכבת", "רכבת קלה"] },
  { label: "חניה", icon: "🚗", keywords: ["חניה", "חנייה", "parking"] },
  { label: "מעלית", icon: "🛗", keywords: ["מעלית"] },
  { label: "מרפסת", icon: "🌅", keywords: ["מרפסת", "מרפסות"] },
  { label: "מטבח פתוח", icon: "🏗️", keywords: ["מטבח פתוח", "open plan", "גבס", "פוטנציאל מטבח"] },
  { label: "תקרה גבוהה", icon: "⬆️", keywords: ["תקרה גבוהה", "תקרה 3", "גובה תקרה"] },
  { label: "אור טבעי", icon: "☀️", keywords: ["אור טבעי", "שמש", "דרומה", "דרום", "מואר"] },
  { label: "חדש / משופץ", icon: "✨", keywords: ["חדש", "חדשה", "שופץ", "שיפוץ", "משופץ", "חדש מקבלן"] },
  { label: "ליד הים", icon: "🌊", keywords: ["ים", "חוף", "קו ראשון"] },
  { label: "ליד פארק", icon: "🌳", keywords: ["פארק", "גינה", "ירוק", "שטח ירוק"] },
  { label: "משפחות", icon: "👨‍👩‍👧", keywords: ["משפחה", "משפחות", "ילדים", "family", "עגלות"] },
  { label: "השקעה", icon: "📈", keywords: ["השקעה", "תשואה", "investment", "משקיעים"] },
  { label: "LiDAR מאומת", icon: "📐", keywords: ["lidar", "סריקה", "מאומת", "לידאר"] },
  { label: "מחסן", icon: "📦", keywords: ["מחסן", "אחסון"] },
  { label: "ממ״ד", icon: "🛡️", keywords: ["ממד", "ממ״ד", "מרחב מוגן"] },
  { label: "נגיש", icon: "♿", keywords: ["נגיש", "נגישות", "כיסא גלגלים"] },
] as const;

function detectTags(text: string): string[] {
  const lower = text.toLowerCase();
  return SEMANTIC_TAGS
    .filter((tag) => tag.keywords.some((kw) => lower.includes(kw)))
    .map((t) => t.label);
}

// ── Main parser ──────────────────────────────────────────────────────────────

export function parseSearchQuery(text: string): ParsedSearch {
  if (!text.trim()) return { tags: [], residual: "" };

  let remaining = text;

  const priceResult = detectPrice(remaining);
  if (priceResult.matched) remaining = remaining.replace(priceResult.matched, " ");

  const roomsResult = detectRooms(remaining);
  if (roomsResult.matched) remaining = remaining.replace(roomsResult.matched, " ");

  const sqmResult = detectSqm(remaining);
  if (sqmResult.matched) remaining = remaining.replace(sqmResult.matched, " ");

  const floorResult = detectFloor(remaining);
  if (floorResult.matched) remaining = remaining.replace(floorResult.matched, " ");

  const cityResult = detectCity(remaining);
  if (cityResult.matched) remaining = remaining.replace(cityResult.matched, " ");

  const tags = detectTags(text); // detect on original text

  // Clean up residual
  const residual = remaining
    .replace(/\s+/g, " ")
    .replace(/[,،\-–—]/g, " ")
    .trim();

  return {
    city: cityResult.city,
    roomsMin: roomsResult.min,
    roomsMax: roomsResult.max,
    priceMin: priceResult.min,
    priceMax: priceResult.max,
    sqmMin: sqmResult.min,
    sqmMax: sqmResult.max,
    floorMin: floorResult.min,
    floorMax: floorResult.max,
    tags,
    residual,
  };
}
