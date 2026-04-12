"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Edit3, CheckCircle2, Save,
  MapPin, BedDouble, Wallet, Heart, RefreshCw, Brain,
  ChevronDown, X, Plus, Loader2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/client";

type Prefs = {
  maxBudget: number;
  rooms: number;
  cities: string[];
  semanticTags: string[];
  freeText: string;
  purpose: "primary" | "investment";
};

const EMPTY_PREFS: Prefs = {
  maxBudget: 3500000,
  rooms: 3,
  cities: [],
  semanticTags: [],
  freeText: "",
  purpose: "primary",
};

import { ISRAEL_CITIES } from "@/lib/israelCities";

const LIFESTYLE_TAGS = [
  "רחוב שקט", "ליד גן ילדים", "ידידותי לעגלות", "פוטנציאל מטבח פתוח",
  "תקרה גבוהה", "חניה", "מרפסת", "קרוב לים", "קרוב לתחנת רכבת",
  "שכונה ירוקה", "קהילה צעירה", "חיי לילה קרובים", "שקט ממוטורים",
  "ליד פארק", "מסעדות בהליכה", "חדרי לימוד", "בית פאסיבי",
];

export default function PreferencesPage() {
  const [prefs, setPrefs] = useState<Prefs>(EMPTY_PREFS);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cityInput, setCityInput] = useState("");
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase
        .from("buyer_profiles").select("*").eq("user_id", user.id).single() as {
          data: Record<string, unknown> | null; error: unknown;
        };
      if (data) {
        setPrefs({
          maxBudget: (data.budget_max as number) || 3500000,
          rooms: (data.rooms_min as number) || 3,
          cities: (data.cities as string[]) || [],
          semanticTags: (data.semantic_tags as string[]) || [],
          freeText: (data.free_text as string) || "",
          purpose: (data.purpose as "primary" | "investment") || "primary",
        });
      }
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("buyer_profiles").upsert({
        user_id: user.id,
        budget_max: prefs.maxBudget,
        rooms_min: prefs.rooms,
        cities: prefs.cities,
        semantic_tags: prefs.semanticTags,
        free_text: prefs.freeText || null,
        purpose: prefs.purpose,
      } as never, { onConflict: "user_id" });
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const addCity = (city: string) => {
    if (!prefs.cities.includes(city)) {
      setPrefs((p) => ({ ...p, cities: [...p.cities, city] }));
    }
    setCityInput("");
    setShowCityDropdown(false);
  };

  const removeCity = (city: string) =>
    setPrefs((p) => ({ ...p, cities: p.cities.filter((c) => c !== city) }));

  const toggleTag = (tag: string) =>
    setPrefs((p) => ({
      ...p,
      semanticTags: p.semanticTags.includes(tag)
        ? p.semanticTags.filter((t) => t !== tag)
        : [...p.semanticTags, tag],
    }));

  const filteredCities = ISRAEL_CITIES.filter(
    (c) => c.includes(cityInput) && !prefs.cities.includes(c)
  );

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      {/* Breadcrumb */}
      <div className="border-b border-gray-100 bg-white">
        <div className="max-w-screen-xl mx-auto px-6 h-10 flex items-center gap-2 text-sm">
          <Link href="/profile" className="text-gray-400 hover:text-navy transition-colors">פרופיל</Link>
          <span className="text-gray-300">/</span>
          <span className="text-navy font-medium">העדפות חיפוש</span>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-navy">העדפות חיפוש</h1>
          <p className="text-gray-400 text-sm mt-1">עדכן את ההעדפות שלך — ה-AI יתאים את ציוני ההתאמה בהתאם</p>
        </div>

        <div className="grid grid-cols-3 gap-6">

          {/* ── Main editing column (2/3) ── */}
          <div className="col-span-2 space-y-5">

            {/* Budget */}
            <Card icon={Wallet} iconColor="text-emerald-500 bg-emerald-50" title="תקציב מקסימלי">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">₪{(prefs.maxBudget / 1000000).toFixed(1)}M</span>
                  <span className="text-xs text-gray-400">עד ₪8M</span>
                </div>
                <input
                  type="range" min={500000} max={8000000} step={100000}
                  value={prefs.maxBudget}
                  onChange={(e) => setPrefs((p) => ({ ...p, maxBudget: +e.target.value }))}
                  className="w-full accent-amber h-2 rounded-full cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>₪500K</span>
                  <span className="font-semibold text-amber">₪{(prefs.maxBudget / 1000000).toFixed(1)}M</span>
                  <span>₪8M</span>
                </div>
              </div>
            </Card>

            {/* Rooms */}
            <Card icon={BedDouble} iconColor="text-blue-500 bg-blue-50" title="מספר חדרים">
              <div className="flex flex-wrap gap-2">
                {[2, 2.5, 3, 3.5, 4, 4.5, 5, 6].map((r) => (
                  <button
                    key={r}
                    onClick={() => setPrefs((p) => ({ ...p, rooms: r }))}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                      prefs.rooms === r
                        ? "border-amber bg-amber text-white"
                        : "border-gray-200 text-navy/70 hover:border-amber/40"
                    }`}
                  >
                    {r} חד׳
                  </button>
                ))}
              </div>
            </Card>

            {/* Cities */}
            <Card icon={MapPin} iconColor="text-rose-500 bg-rose-50" title="אזורי חיפוש">
              {/* Selected cities */}
              <div className="flex flex-wrap gap-2 mb-3">
                {prefs.cities.map((city) => (
                  <span key={city} className="flex items-center gap-1.5 bg-amber/10 text-amber border border-amber/20 text-sm px-3 py-1.5 rounded-full font-medium">
                    {city}
                    <button onClick={() => removeCity(city)} className="hover:text-red-500 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              {/* City search */}
              <div className="relative">
                <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-amber transition-colors">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                  <input
                    type="text"
                    value={cityInput}
                    onChange={(e) => { setCityInput(e.target.value); setShowCityDropdown(true); }}
                    onFocus={() => setShowCityDropdown(true)}
                    placeholder="הוסף עיר..."
                    className="flex-1 text-sm text-navy bg-transparent outline-none placeholder-gray-300"
                  />
                </div>
                {showCityDropdown && cityInput && (
                  <div className="absolute top-full mt-1 w-full bg-white rounded-xl border border-gray-100 shadow-lg z-10 overflow-hidden max-h-48 overflow-y-auto">
                    {filteredCities.map((city) => (
                      <button key={city} onClick={() => addCity(city)}
                        className="w-full text-right px-4 py-2.5 text-sm text-navy hover:bg-amber-light transition-colors">
                        {city}
                      </button>
                    ))}
                    {!filteredCities.some((c) => c === cityInput) && cityInput.length >= 2 && (
                      <button onClick={() => addCity(cityInput)}
                        className="w-full text-right px-4 py-2.5 text-sm text-amber font-medium hover:bg-amber-light transition-colors flex items-center gap-2">
                        <Plus className="w-3.5 h-3.5" />+ הוסף ״{cityInput}״
                      </button>
                    )}
                  </div>
                )}
              </div>
            </Card>

            {/* Lifestyle tags */}
            <Card icon={Heart} iconColor="text-pink-500 bg-pink-50" title="העדפות סגנון חיים">
              <div className="flex flex-wrap gap-2">
                {LIFESTYLE_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs border-2 transition-all ${
                      prefs.semanticTags.includes(tag)
                        ? "border-amber bg-amber text-white"
                        : "border-gray-200 text-navy/60 hover:border-amber/40"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </Card>

            {/* Purpose */}
            <Card icon={Edit3} iconColor="text-violet-500 bg-violet-50" title="מטרת הרכישה">
              <div className="flex gap-3">
                {([
                  { key: "primary", label: "דירה ראשית", desc: "מגורים" },
                  { key: "investment", label: "השקעה", desc: "להשכרה / פיפ" },
                ] as const).map(({ key, label, desc }) => (
                  <button
                    key={key}
                    onClick={() => setPrefs((p) => ({ ...p, purpose: key }))}
                    className={`flex-1 py-3 px-4 rounded-xl border-2 text-right transition-all ${
                      prefs.purpose === key
                        ? "border-amber bg-amber/5"
                        : "border-gray-200 hover:border-amber/40"
                    }`}
                  >
                    <p className={`font-semibold text-sm ${prefs.purpose === key ? "text-amber" : "text-navy"}`}>{label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                  </button>
                ))}
              </div>
            </Card>

            {/* Free text */}
            <Card icon={Brain} iconColor="text-amber bg-amber-light" title="תיאור חופשי לAI">
              <textarea
                value={prefs.freeText}
                onChange={(e) => setPrefs((p) => ({ ...p, freeText: e.target.value }))}
                rows={4}
                placeholder="ספר לנו מה חשוב לך — ה-AI ילמד מזה..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-navy placeholder-gray-300 resize-none focus:outline-none focus:border-amber transition-colors"
              />
            </Card>

            {/* Save button */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-sm transition-all shadow-sm ${
                  saved ? "bg-green-500 text-white" : "bg-amber text-white hover:bg-amber/90"
                }`}
              >
                {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {saved ? "נשמר!" : "שמור שינויים"}
              </button>
              {saved && (
                <div className="flex items-center gap-2 text-sm text-amber bg-amber-light px-4 py-2.5 rounded-xl">
                  <Brain className="w-4 h-4" />
                  ה-AI מעדכן את ציוני ההתאמה...
                </div>
              )}
            </div>
          </div>

          {/* ── Right sidebar — summary + restart ── */}
          <div className="space-y-4">

            {/* Current summary */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-20">
              <h3 className="font-bold text-navy text-sm mb-4">סיכום פרופיל נוכחי</h3>
              <div className="space-y-3">
                <SummaryRow label="תקציב מקס׳" value={`₪${(prefs.maxBudget / 1000000).toFixed(1)}M`} />
                <SummaryRow label="חדרים" value={`${prefs.rooms} חד׳`} />
                <SummaryRow label="ערים" value={prefs.cities.join(", ")} />
                <SummaryRow label="מטרה" value={prefs.purpose === "primary" ? "דירה ראשית" : "השקעה"} />
                {prefs.semanticTags.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1.5">תגיות</p>
                    <div className="flex flex-wrap gap-1">
                      {prefs.semanticTags.map((t) => (
                        <span key={t} className="text-xs bg-amber-light text-amber px-2 py-0.5 rounded-full">{t}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Restart option */}
              <div className="mt-5 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-3">רוצה להתחיל מחדש לגמרי?</p>
                <Link href="/onboarding"
                  className="flex items-center gap-2 w-full justify-center py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-400 hover:border-amber hover:text-amber transition-all">
                  <RefreshCw className="w-3.5 h-3.5" />
                  מלא שאלון מחדש
                </Link>
              </div>
            </div>

            {/* AI info box */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-4 h-4 text-amber" />
                <span className="text-sm font-semibold text-navy">כיצד ה-AI משתמש בזה?</span>
              </div>
              <ul className="space-y-2 text-xs text-gray-500 leading-relaxed">
                <li>• ציוני ההתאמה מחושבים לפי כל ההעדפות שלך</li>
                <li>• תגיות סגנון חיים מקבלות משקל גבוה יותר</li>
                <li>• שינויים ישפיעו על ההמלצות תוך דקות ספורות</li>
                <li>• ניתן לעדכן בכל עת — ה-AI מסתגל</li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function Card({
  icon: Icon, iconColor, title, children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconColor}`}>
          <Icon className="w-4 h-4" />
        </div>
        <h2 className="font-bold text-navy">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-xs text-gray-400 shrink-0">{label}</span>
      <span className="text-xs font-medium text-navy text-left">{value}</span>
    </div>
  );
}
