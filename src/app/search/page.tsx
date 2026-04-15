"use client";
import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import {
  Search, SlidersHorizontal, MapPin, Maximize2, Building, X, Scan,
  ChevronDown, Loader2, Sparkles, Brain, ChevronUp, RotateCcw,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { getProperties, type PropertyView, type PropertyFilters } from "@/lib/supabase/queries";
import { ISRAEL_CITIES } from "@/lib/israelCities";
import { parseSearchQuery, SEMANTIC_TAGS } from "@/lib/searchNLP";

const CITIES = ["הכל", ...ISRAEL_CITIES];

// ── Range Slider Component ───────────────────────────────────────────────────

function RangeSlider({
  label,
  min,
  max,
  step,
  value,
  onChange,
  format,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: [number, number];
  onChange: (v: [number, number]) => void;
  format: (v: number) => string;
}) {
  const [local, setLocal] = useState(value);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => { setLocal(value); }, [value]);

  const commit = (v: [number, number]) => {
    setLocal(v);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => onChange(v), 200);
  };

  const pctLow = ((local[0] - min) / (max - min)) * 100;
  const pctHigh = ((local[1] - min) / (max - min)) * 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-navy/70">{label}</span>
        <span className="text-xs text-amber font-semibold">
          {format(local[0])} – {format(local[1])}
        </span>
      </div>
      <div className="relative h-6 flex items-center">
        {/* Track */}
        <div className="absolute w-full h-1.5 bg-gray-100 rounded-full" />
        {/* Active range */}
        <div
          className="absolute h-1.5 bg-amber rounded-full"
          style={{ left: `${pctLow}%`, width: `${pctHigh - pctLow}%` }}
        />
        {/* Min thumb */}
        <input
          type="range"
          min={min} max={max} step={step}
          value={local[0]}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v <= local[1]) commit([v, local[1]]);
          }}
          className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-amber [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:cursor-pointer z-20"
        />
        {/* Max thumb */}
        <input
          type="range"
          min={min} max={max} step={step}
          value={local[1]}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v >= local[0]) commit([local[0], v]);
          }}
          className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-amber [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:cursor-pointer z-30"
        />
      </div>
    </div>
  );
}

// ── Tag → DB filter mapping ──────────────────────────────────────────────────

function tagToFilters(tags: string[]): Partial<PropertyFilters> {
  const f: Partial<PropertyFilters> = {};
  for (const tag of tags) {
    switch (tag) {
      case "מעלית": f.elevator = true; break;
      case "מרפסת": f.balcony = true; break;
      case "חניה": f.parking = true; break;
      case "מחסן": f.storage = true; break;
      case "תקרה גבוהה": f.ceilingHeightMin = 3; break;
      case "מטבח פתוח": f.kitchenWall = "drywall"; break;
    }
  }
  return f;
}

// ── URL sync helpers ─────────────────────────────────────────────────────────

function paramsToState(sp: URLSearchParams) {
  return {
    query: sp.get("q") || "",
    city: sp.get("city") || "הכל",
    roomsMin: sp.get("rmin") || "",
    roomsMax: sp.get("rmax") || "",
    priceRange: [
      Number(sp.get("pmin")) || 500_000,
      Number(sp.get("pmax")) || 10_000_000,
    ] as [number, number],
    sqmRange: [
      Number(sp.get("smin")) || 20,
      Number(sp.get("smax")) || 300,
    ] as [number, number],
    floorRange: [
      Number(sp.get("fmin")) || 0,
      Number(sp.get("fmax")) || 30,
    ] as [number, number],
    activeTags: sp.get("tags")?.split(",").filter(Boolean) || [],
    sort: sp.get("sort") || "חדש ביותר",
  };
}

function stateToParams(state: ReturnType<typeof paramsToState>): string {
  const p = new URLSearchParams();
  if (state.query) p.set("q", state.query);
  if (state.city !== "הכל") p.set("city", state.city);
  if (state.roomsMin) p.set("rmin", state.roomsMin);
  if (state.roomsMax) p.set("rmax", state.roomsMax);
  if (state.priceRange[0] !== 500_000) p.set("pmin", String(state.priceRange[0]));
  if (state.priceRange[1] !== 10_000_000) p.set("pmax", String(state.priceRange[1]));
  if (state.sqmRange[0] !== 20) p.set("smin", String(state.sqmRange[0]));
  if (state.sqmRange[1] !== 300) p.set("smax", String(state.sqmRange[1]));
  if (state.floorRange[0] !== 0) p.set("fmin", String(state.floorRange[0]));
  if (state.floorRange[1] !== 30) p.set("fmax", String(state.floorRange[1]));
  if (state.activeTags.length) p.set("tags", state.activeTags.join(","));
  if (state.sort !== "חדש ביותר") p.set("sort", state.sort);
  return p.toString();
}

// ── Format helpers ───────────────────────────────────────────────────────────

const fmtPrice = (v: number) => {
  if (v >= 1_000_000) return `₪${(v / 1_000_000).toFixed(1)}M`;
  return `₪${(v / 1_000).toFixed(0)}K`;
};

const fmtSqm = (v: number) => `${v} מ״ר`;
const fmtFloor = (v: number) => (v === 0 ? "קרקע" : `קומה ${v}`);

// ═══════════════════════════════════════════════════════════════════════════════
// Search Page
// ═══════════════════════════════════════════════════════════════════════════════

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cream">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 text-amber animate-spin" />
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Init state from URL
  const init = paramsToState(searchParams);
  const [query, setQuery] = useState(init.query);
  const [city, setCity] = useState(init.city);
  const [roomsMin, setRoomsMin] = useState(init.roomsMin);
  const [roomsMax, setRoomsMax] = useState(init.roomsMax);
  const [priceRange, setPriceRange] = useState<[number, number]>(init.priceRange);
  const [sqmRange, setSqmRange] = useState<[number, number]>(init.sqmRange);
  const [floorRange, setFloorRange] = useState<[number, number]>(init.floorRange);
  const [activeTags, setActiveTags] = useState<string[]>(init.activeTags);
  const [sort, setSort] = useState(init.sort);

  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults] = useState<PropertyView[]>([]);
  const [loading, setLoading] = useState(true);

  // NLP parsed state (from free-text)
  const [parsed, setParsed] = useState(parseSearchQuery(init.query));

  // Parse query on change
  useEffect(() => {
    if (query.length > 1) {
      const p = parseSearchQuery(query);
      setParsed(p);

      // Auto-fill filters from NLP (only if user hasn't manually changed them)
      if (p.city && city === "הכל") setCity(p.city);
      if (p.roomsMin && !roomsMin) setRoomsMin(String(p.roomsMin));
      if (p.roomsMax && !roomsMax) setRoomsMax(String(p.roomsMax));
      if (p.priceMin || p.priceMax) {
        setPriceRange([p.priceMin || 500_000, p.priceMax || 10_000_000]);
      }
      if (p.sqmMin || p.sqmMax) {
        setSqmRange([p.sqmMin || 20, p.sqmMax || 300]);
      }
      if (p.floorMin !== undefined || p.floorMax !== undefined) {
        setFloorRange([p.floorMin || 0, p.floorMax || 30]);
      }
      // Add detected tags
      if (p.tags.length > 0) {
        setActiveTags(prev => {
          const merged = new Set([...prev, ...p.tags]);
          return Array.from(merged);
        });
      }
    } else {
      setParsed({ tags: [], residual: "" });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // Sync state → URL
  useEffect(() => {
    const qs = stateToParams({ query, city, roomsMin, roomsMax, priceRange, sqmRange, floorRange, activeTags, sort });
    const current = searchParams.toString();
    if (qs !== current) {
      router.replace(`/search${qs ? `?${qs}` : ""}`, { scroll: false });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, city, roomsMin, roomsMax, priceRange, sqmRange, floorRange, activeTags, sort]);

  // Fetch properties
  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const tagFilters = tagToFilters(activeTags);

      const filters: PropertyFilters = {
        city: city === "הכל" ? undefined : city,
        roomsMin: roomsMin ? parseInt(roomsMin) : undefined,
        roomsMax: roomsMax ? parseInt(roomsMax) : undefined,
        priceMin: priceRange[0] !== 500_000 ? priceRange[0] : undefined,
        priceMax: priceRange[1] !== 10_000_000 ? priceRange[1] : undefined,
        sqmMin: sqmRange[0] !== 20 ? sqmRange[0] : undefined,
        sqmMax: sqmRange[1] !== 300 ? sqmRange[1] : undefined,
        floorMin: floorRange[0] !== 0 ? floorRange[0] : undefined,
        floorMax: floorRange[1] !== 30 ? floorRange[1] : undefined,
        search: parsed.residual || undefined,
        ...tagFilters,
      };

      let data = await getProperties(filters);

      // Sort
      switch (sort) {
        case "מחיר: נמוך לגבוה": data = [...data].sort((a, b) => a.price - b.price); break;
        case "מחיר: גבוה לנמוך": data = [...data].sort((a, b) => b.price - a.price); break;
        case "הכי הרבה חדרים": data = [...data].sort((a, b) => b.rooms - a.rooms); break;
        case "הכי קטן": data = [...data].sort((a, b) => a.sqm - b.sqm); break;
        case "הכי גדול": data = [...data].sort((a, b) => b.sqm - a.sqm); break;
      }

      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [city, roomsMin, roomsMax, priceRange, sqmRange, floorRange, sort, activeTags, parsed.residual]);

  useEffect(() => {
    const timer = setTimeout(fetchProperties, 300);
    return () => clearTimeout(timer);
  }, [fetchProperties]);

  const toggleTag = (tag: string) => {
    setActiveTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  };

  const clearAll = () => {
    setQuery("");
    setCity("הכל");
    setRoomsMin("");
    setRoomsMax("");
    setPriceRange([500_000, 10_000_000]);
    setSqmRange([20, 300]);
    setFloorRange([0, 30]);
    setActiveTags([]);
    setSort("חדש ביותר");
    setParsed({ tags: [], residual: "" });
  };

  const hasActiveFilters = query || city !== "הכל" || roomsMin || roomsMax ||
    priceRange[0] !== 500_000 || priceRange[1] !== 10_000_000 ||
    sqmRange[0] !== 20 || sqmRange[1] !== 300 ||
    floorRange[0] !== 0 || floorRange[1] !== 30 ||
    activeTags.length > 0;

  const formatCardPrice = (p: number) =>
    p >= 1_000_000 ? `₪${(p / 1_000_000).toFixed(1)}M` : `₪${(p / 1_000).toFixed(0)}K`;

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />

      {/* ── Search bar — sticky ── */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">

          {/* Semantic search bar */}
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 focus-within:border-amber focus-within:ring-2 focus-within:ring-amber/20 transition-all">
            <Brain className="w-5 h-5 text-amber shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='חפש בשפה חופשית: "4 חדרים שקט בתל אביב עד 3 מיליון 100 מ״ר"'
              className="flex-1 bg-transparent text-navy text-sm outline-none placeholder-gray-400 text-right"
              dir="rtl"
            />
            {query && (
              <button onClick={clearAll}>
                <X className="w-4 h-4 text-gray-400 hover:text-navy transition-colors" />
              </button>
            )}
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
          </div>

          {/* NLP detected entities */}
          {(parsed.tags.length > 0 || parsed.city || parsed.priceMin || parsed.priceMax || parsed.roomsMin || parsed.sqmMin || parsed.sqmMax || parsed.floorMin) && (
            <div className="flex items-center gap-2 mt-3 flex-wrap" dir="rtl">
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber" />זוהה אוטומטית:
              </span>
              {parsed.city && (
                <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-medium">
                  📍 {parsed.city}
                </span>
              )}
              {parsed.roomsMin && (
                <span className="text-xs bg-purple-50 text-purple-600 px-2.5 py-1 rounded-full font-medium">
                  🏠 {parsed.roomsMin}{parsed.roomsMax ? `-${parsed.roomsMax}` : ""} חדרים
                </span>
              )}
              {(parsed.priceMin || parsed.priceMax) && (
                <span className="text-xs bg-green-50 text-green-600 px-2.5 py-1 rounded-full font-medium">
                  💰 {parsed.priceMin ? fmtPrice(parsed.priceMin) : ""}
                  {parsed.priceMin && parsed.priceMax ? " – " : ""}
                  {parsed.priceMax ? (parsed.priceMin ? fmtPrice(parsed.priceMax) : `עד ${fmtPrice(parsed.priceMax)}`) : "+"}
                </span>
              )}
              {(parsed.sqmMin || parsed.sqmMax) && (
                <span className="text-xs bg-orange-50 text-orange-600 px-2.5 py-1 rounded-full font-medium">
                  📐 {parsed.sqmMin ? `${parsed.sqmMin}` : ""}
                  {parsed.sqmMin && parsed.sqmMax ? "–" : ""}
                  {parsed.sqmMax ? `${parsed.sqmMax}` : "+"} מ״ר
                </span>
              )}
              {(parsed.floorMin !== undefined || parsed.floorMax !== undefined) && parsed.floorMin !== undefined && (
                <span className="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full font-medium">
                  🏢 {parsed.floorMax !== undefined && parsed.floorMax !== parsed.floorMin
                    ? `קומות ${parsed.floorMin}–${parsed.floorMax}`
                    : parsed.floorMin >= 5 ? "קומה גבוהה" : `קומה ${parsed.floorMin}`}
                </span>
              )}
              {parsed.tags.map((tag) => {
                const st = SEMANTIC_TAGS.find((t) => t.label === tag);
                return (
                  <span key={tag} className="text-xs bg-amber text-white px-2.5 py-1 rounded-full font-medium">
                    {st?.icon} {tag}
                  </span>
                );
              })}
            </div>
          )}

          {/* ── Quick filters row ── */}
          <div className="flex items-center gap-3 mt-3">
            {/* City */}
            <div className="relative">
              <select value={city} onChange={(e) => setCity(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-8 text-sm text-navy focus:outline-none focus:border-amber cursor-pointer">
                {CITIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <ChevronDown className="absolute left-2.5 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Rooms */}
            <div className="relative">
              <select
                value={roomsMin ? (roomsMax ? `${roomsMin}-${roomsMax}` : roomsMin) : "הכל"}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "הכל") { setRoomsMin(""); setRoomsMax(""); }
                  else if (v.includes("-")) { const [a, b] = v.split("-"); setRoomsMin(a); setRoomsMax(b); }
                  else if (v === "6") { setRoomsMin("6"); setRoomsMax(""); }
                  else { setRoomsMin(v); setRoomsMax(v); }
                }}
                className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-8 text-sm text-navy focus:outline-none focus:border-amber cursor-pointer">
                <option value="הכל">חדרים</option>
                <option value="2">2 חד׳</option>
                <option value="3">3 חד׳</option>
                <option value="3-4">3-4 חד׳</option>
                <option value="4">4 חד׳</option>
                <option value="4-5">4-5 חד׳</option>
                <option value="5">5 חד׳</option>
                <option value="6">6+ חד׳</option>
              </select>
              <ChevronDown className="absolute left-2.5 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Sort */}
            <div className="relative">
              <select value={sort} onChange={(e) => setSort(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pl-7 text-sm text-navy focus:outline-none focus:border-amber cursor-pointer">
                {["חדש ביותר", "מחיר: נמוך לגבוה", "מחיר: גבוה לנמוך", "הכי הרבה חדרים", "הכי קטן", "הכי גדול"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <ChevronDown className="absolute left-2 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Advanced toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                showFilters || activeTags.length > 0
                  ? "bg-navy text-white border-navy"
                  : "bg-white border-gray-200 text-navy hover:border-amber"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              סינון מתקדם
              {activeTags.length > 0 && (
                <span className="bg-amber text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {activeTags.length}
                </span>
              )}
              {showFilters ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {/* Clear */}
            {hasActiveFilters && (
              <button onClick={clearAll} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-400 transition-colors">
                <RotateCcw className="w-3.5 h-3.5" />
                נקה הכל
              </button>
            )}
          </div>

          {/* ── Advanced filters panel ── */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-5" dir="rtl">
              {/* Range sliders */}
              <div className="grid grid-cols-3 gap-6">
                <RangeSlider
                  label="טווח מחירים"
                  min={500_000} max={10_000_000} step={100_000}
                  value={priceRange} onChange={setPriceRange}
                  format={fmtPrice}
                />
                <RangeSlider
                  label="שטח (מ״ר)"
                  min={20} max={300} step={5}
                  value={sqmRange} onChange={setSqmRange}
                  format={fmtSqm}
                />
                <RangeSlider
                  label="קומה"
                  min={0} max={30} step={1}
                  value={floorRange} onChange={setFloorRange}
                  format={fmtFloor}
                />
              </div>

              {/* Feature tags */}
              <div>
                <span className="text-xs font-medium text-navy/70 mb-2 block">תכונות</span>
                <div className="flex items-center gap-2 flex-wrap">
                  {SEMANTIC_TAGS.map((tag) => (
                    <button key={tag.label}
                      onClick={() => toggleTag(tag.label)}
                      className={`text-xs px-3 py-1.5 rounded-full border-2 transition-all flex items-center gap-1.5 ${
                        activeTags.includes(tag.label)
                          ? "border-amber bg-amber text-white"
                          : "border-gray-200 text-navy/70 hover:border-amber hover:text-amber"
                      }`}>
                      <span>{tag.icon}</span>
                      {tag.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Results header ── */}
      <div className="max-w-7xl mx-auto px-6 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-navy font-semibold text-lg">{results.length}</span>
          <span className="text-gray-400 text-sm">
            נכסים נמצאו{city !== "הכל" ? ` ב${city}` : ""}
          </span>

          {/* Active filter pills */}
          {activeTags.length > 0 && (
            <div className="flex items-center gap-1.5 mr-2">
              {activeTags.slice(0, 3).map((tag) => {
                const st = SEMANTIC_TAGS.find((t) => t.label === tag);
                return (
                  <button key={tag} onClick={() => toggleTag(tag)}
                    className="flex items-center gap-1 text-xs bg-amber/10 text-amber border border-amber/20 px-2 py-0.5 rounded-full hover:bg-amber/20 transition-colors">
                    {st?.icon} {tag}
                    <X className="w-3 h-3" />
                  </button>
                );
              })}
              {activeTags.length > 3 && (
                <span className="text-xs text-gray-400">+{activeTags.length - 3}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Results grid ── */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 text-amber animate-spin" />
            <span className="text-sm text-gray-400">מחפש נכסים...</span>
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((p) => (
              <Link key={p.id} href={`/property/${p.id}`} className="group">
                <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-amber/40 hover:shadow-xl transition-all duration-300">
                  {/* Image */}
                  <div className="relative h-52 overflow-hidden bg-amber-light">
                    <Image
                      src={p.photos[0] || "/lidar.jpg"}
                      alt={p.address}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/50 to-transparent" />
                    <div className="absolute top-3 right-3 flex flex-col gap-1.5">
                      <span className="flex items-center gap-1 bg-navy/80 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                        <Scan className="w-3 h-3 text-amber" />
                        LiDAR
                      </span>
                    </div>
                    <div className="absolute bottom-3 right-3">
                      <span className="text-white font-bold text-xl drop-shadow-sm">{formatCardPrice(p.price)}</span>
                      <span className="text-white/70 text-xs mr-2">₪{Math.round(p.price / p.sqm).toLocaleString()}/מ״ר</span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-navy text-base group-hover:text-amber transition-colors">{p.address}</h3>
                    <div className="flex items-center gap-1 mt-1 text-gray-400 text-sm">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{p.city}</span>
                    </div>

                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <span className="text-xs bg-gray-50 border border-gray-100 text-navy px-2 py-1 rounded-lg">{p.rooms} חדרים</span>
                      <span className="text-xs bg-gray-50 border border-gray-100 text-navy px-2 py-1 rounded-lg flex items-center gap-1">
                        <Maximize2 className="w-3 h-3" />{p.sqm} מ״ר
                      </span>
                      <span className="text-xs bg-gray-50 border border-gray-100 text-navy px-2 py-1 rounded-lg">קומה {p.floor}/{p.totalFloors}</span>
                      {p.elevator && (
                        <span className="text-xs bg-gray-50 border border-gray-100 text-navy px-2 py-1 rounded-lg">🛗 מעלית</span>
                      )}
                      {p.balcony && (
                        <span className="text-xs bg-gray-50 border border-gray-100 text-navy px-2 py-1 rounded-lg">🌅 מרפסת</span>
                      )}
                    </div>

                    <div className="mt-3 flex items-center gap-2 bg-amber-light rounded-xl px-3 py-2">
                      <div className="w-5 h-5 bg-amber rounded-full flex items-center justify-center shrink-0">
                        <span className="text-white text-[8px] font-bold">AI</span>
                      </div>
                      <span className="text-xs text-navy/70">שאל את הסוכן כל שאלה ←</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <Building className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-navy">לא נמצאו נכסים</h3>
            <p className="text-gray-400 mt-1 text-sm">נסה לשנות את הסינון או להרחיב את החיפוש</p>
            {hasActiveFilters && (
              <button onClick={clearAll} className="mt-4 inline-flex items-center gap-2 text-amber text-sm font-medium hover:text-amber/80 transition-colors">
                <RotateCcw className="w-4 h-4" />
                נקה את כל הסינונים
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
