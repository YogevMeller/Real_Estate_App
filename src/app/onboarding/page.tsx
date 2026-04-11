"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, ChevronRight, Home, MapPin, Building,
  TrendingUp, Sparkles, CheckCircle2, ArrowLeft,
  Train, Car, Users, Sun, Briefcase, Heart,
  ShoppingBag, Shield, Wrench, Search, X,
} from "lucide-react";
import Navbar from "@/components/Navbar";

// ── Step config ───────────────────────────────────────────────────────────────
const STEPS = [
  { title: "פרטים אישיים", icon: Users },
  { title: "תקציב ומימון", icon: TrendingUp },
  { title: "מיקום", icon: MapPin },
  { title: "הדירה עצמה", icon: Building },
  { title: "אורח חיים", icon: Heart },
  { title: "סיכום", icon: Sparkles },
];

// ── City search data ──────────────────────────────────────────────────────────
const ISRAEL_CITIES = [
  "תל אביב-יפו", "ירושלים", "חיפה", "ראשון לציון", "פתח תקווה",
  "אשדוד", "נתניה", "באר שבע", "בני ברק", "חולון",
  "רמת גן", "אשקלון", "רחובות", "בת ים", "בית שמש",
  "כפר סבא", "הרצליה", "חדרה", "מודיעין", "לוד",
  "רמלה", "נצרת", "עכו", "אילת", "רמת השרון",
  "הוד השרון", "יהוד", "גבעתיים", "קריית אונו", "אור יהודה",
  "נס ציונה", "גבעת שמואל", "קריית גת", "טבריה", "נהריה",
  "ראש העין", "מזכרת בתיה", "אלעד", "טירת כרמל", "קריית ביאליק",
];

// ── Semantic tags ─────────────────────────────────────────────────────────────
const LIFESTYLE_TAGS = [
  { label: "ידידותי לעגלות", icon: "🛒", cat: "family" },
  { label: "ליד גן ילדים / פארק", icon: "🧒", cat: "family" },
  { label: "בית ספר מצוין בשכונה", icon: "🏫", cat: "family" },
  { label: "שכונה בטוחה", icon: "🛡️", cat: "family" },
  { label: "קהילה משפחתית", icon: "👨‍👩‍👧", cat: "family" },
  { label: "רחוב שקט", icon: "🌿", cat: "quiet" },
  { label: "רחק מכביש ראשי", icon: "🔇", cat: "quiet" },
  { label: "בניין שקט", icon: "🏢", cat: "quiet" },
  { label: "ליד תחנת רכבת / מטרו", icon: "🚆", cat: "transit" },
  { label: "ליד תחנת אוטובוס", icon: "🚌", cat: "transit" },
  { label: "נגישות לאופניים / קורקינט", icon: "🚲", cat: "transit" },
  { label: "חניה פרטית חובה", icon: "🚗", cat: "transit" },
  { label: "ליד מרכז מסחרי / שוק", icon: "🛍️", cat: "commercial" },
  { label: "ליד מסעדות / בתי קפה", icon: "☕", cat: "commercial" },
  { label: "ליד חוף ים", icon: "🌊", cat: "nature" },
  { label: "ליד פארק גדול", icon: "🌳", cat: "nature" },
  { label: "נוף פתוח / ירוק", icon: "🌅", cat: "nature" },
  { label: "פוטנציאל מטבח פתוח", icon: "🏗️", cat: "apartment" },
  { label: "תקרה גבוהה", icon: "⬆️", cat: "apartment" },
  { label: "הרבה אור טבעי", icon: "☀️", cat: "apartment" },
  { label: "בניין חדש / שופץ", icon: "✨", cat: "apartment" },
  { label: "קרוב למשפחה", icon: "👨‍👩‍👦", cat: "personal" },
  { label: "קרוב לעבודה", icon: "💼", cat: "personal" },
  { label: "שכונה צעירה ודינמית", icon: "🎉", cat: "personal" },
  { label: "פוטנציאל השבחה", icon: "📈", cat: "investment" },
];

const TAG_CATS: Record<string, string> = {
  family: "👨‍👩‍👧 משפחה וילדים",
  quiet: "🌿 שקט ואיכות חיים",
  transit: "🚆 תחבורה ונגישות",
  commercial: "🛍️ מסחר ופנאי",
  nature: "🌳 טבע וסביבה",
  apartment: "🏠 מאפייני דירה",
  personal: "💛 אישי",
  investment: "📈 השקעה",
};

// ── Must-have features ────────────────────────────────────────────────────────
const MUST_FEATURES = [
  { key: "elevator", label: "מעלית", icon: Building },
  { key: "parking", label: "חניה", icon: Car },
  { key: "balcony", label: "מרפסת", icon: Sun },
  { key: "storage", label: "מחסן", icon: ShoppingBag },
  { key: "safeRoom", label: "ממ\"ד", icon: Shield },
  { key: "ac", label: "מזגן בכל חדר", icon: Sparkles },
  { key: "renovated", label: "שופץ לאחרונה", icon: Wrench },
  { key: "openPlan", label: "תוכנית פתוחה", icon: Home },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  // ── Step 0: Personal ──
  const [familyStatus, setFamilyStatus] = useState<"single" | "couple" | "family" | "">("");
  const [kidsCount, setKidsCount] = useState(0);
  const [planningKids, setPlanningKids] = useState(false);
  const [partnerWork, setPartnerWork] = useState("");
  const [myWork, setMyWork] = useState("");

  // ── Step 1: Budget ──
  const [budgetMax, setBudgetMax] = useState(3500000);
  const [equity, setEquity] = useState(30);
  const [mortgageApproved, setMortgageApproved] = useState<boolean | null>(null);
  const [purpose, setPurpose] = useState<"primary" | "investment">("primary");
  const [moveTimeline, setMoveTimeline] = useState("");

  // ── Step 2: Location ──
  const [citySearch, setCitySearch] = useState("");
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [locationPriority, setLocationPriority] = useState<string[]>([]);

  // ── Step 3: Apartment ──
  const [rooms, setRooms] = useState(3);
  const [sqmMin, setSqmMin] = useState(70);
  const [floorPref, setFloorPref] = useState<"any" | "low" | "high">("any");
  const [mustFeatures, setMustFeatures] = useState<string[]>([]);
  const [maxRenovation, setMaxRenovation] = useState<"none" | "light" | "full">("light");

  // ── Step 4: Lifestyle ──
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [freeText, setFreeText] = useState("");
  const [importanceWork, setImportanceWork] = useState(3);
  const [importanceSchool, setImportanceSchool] = useState(3);
  const [importanceTransit, setImportanceTransit] = useState(3);
  const [importanceNature, setImportanceNature] = useState(3);

  // ── City helpers ──
  const filteredCities = ISRAEL_CITIES.filter(
    (c) => c.includes(citySearch) && !selectedCities.includes(c)
  ).slice(0, 6);

  const addCity = (c: string) => {
    setSelectedCities((prev) => [...prev, c]);
    setCitySearch("");
    setShowCityDropdown(false);
  };

  const removeCity = (c: string) =>
    setSelectedCities((prev) => prev.filter((x) => x !== c));

  const toggleFeature = (k: string) =>
    setMustFeatures((prev) => prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]);

  const toggleTag = (t: string) =>
    setSelectedTags((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);

  const toggleLocationPriority = (t: string) =>
    setLocationPriority((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);

  const formatPrice = (n: number) =>
    n >= 1000000 ? `₪${(n / 1000000).toFixed(1)}M` : `₪${(n / 1000).toFixed(0)}K`;

  const canNext = () => {
    if (step === 0) return familyStatus !== "";
    if (step === 1) return budgetMax > 0 && moveTimeline !== "";
    if (step === 2) return selectedCities.length > 0;
    return true;
  };

  const tagsByCategory = Object.entries(TAG_CATS).map(([cat, catLabel]) => ({
    cat,
    catLabel,
    tags: LIFESTYLE_TAGS.filter((t) => t.cat === cat),
  }));

  const totalTags = selectedTags.length + mustFeatures.length + (familyStatus === "family" || planningKids ? 2 : 0);

  return (
    <div className="min-h-screen bg-cream" dir="rtl">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 pt-8 pb-20">

        {/* Progress bar */}
        <div className="mb-7">
          <div className="flex items-center gap-1 mb-2">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="flex items-center flex-1 last:flex-none">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0 ${
                    i < step ? "bg-green-500" : i === step ? "bg-amber shadow-md" : "bg-gray-200"
                  }`}>
                    {i < step
                      ? <CheckCircle2 className="w-4 h-4 text-white" />
                      : <Icon className={`w-4 h-4 ${i === step ? "text-white" : "text-gray-400"}`} />
                    }
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 rounded-full ${i < step ? "bg-green-400" : "bg-gray-200"}`} />
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 text-center">
            שלב {step + 1} מתוך {STEPS.length} — <span className="text-navy font-medium">{STEPS[step].title}</span>
          </p>
        </div>

        {/* ──────────────────────────── STEP 0: Personal ──────────────────────────── */}
        {step === 0 && (
          <div className="bg-white rounded-3xl border border-gray-100 p-7 space-y-6">
            <StepHeader icon={Users} title="ספר לנו קצת עליכם" sub="ה-AI מתאים את ההמלצות לסיטואציה שלך" />

            {/* Family status */}
            <div>
              <label className="block text-sm font-semibold text-navy mb-3">מי מחפש דירה?</label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { val: "single", label: "יחיד/ה", icon: "🧑" },
                  { val: "couple", label: "זוג", icon: "👫" },
                  { val: "family", label: "משפחה עם ילדים", icon: "👨‍👩‍👧" },
                ].map(({ val, label, icon }) => (
                  <button key={val} onClick={() => setFamilyStatus(val as typeof familyStatus)}
                    className={`py-3.5 rounded-2xl border-2 text-sm font-medium text-center transition-all ${
                      familyStatus === val ? "border-amber bg-amber-light text-navy" : "border-gray-100 bg-gray-50 text-navy/60 hover:border-gray-300"
                    }`}>
                    <div className="text-2xl mb-1">{icon}</div>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Kids */}
            {familyStatus === "family" && (
              <div>
                <label className="block text-sm font-semibold text-navy mb-3">כמה ילדים?</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, "5+"].map((n) => (
                    <button key={n} onClick={() => setKidsCount(typeof n === "number" ? n : 5)}
                      className={`w-12 h-12 rounded-2xl font-semibold text-sm transition-all ${
                        kidsCount === (typeof n === "number" ? n : 5)
                          ? "bg-amber text-white shadow-md scale-105"
                          : "bg-gray-50 border border-gray-200 text-navy hover:border-amber"
                      }`}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Planning kids */}
            {(familyStatus === "couple" || familyStatus === "single") && (
              <ToggleRow
                label="מתכננים ילדים בשנים הקרובות?"
                sub="ישפיע על המלצות גנים, שטח ודירות גדולות יותר"
                value={planningKids}
                onChange={setPlanningKids}
              />
            )}

            {/* Work proximity */}
            {(familyStatus === "couple" || familyStatus === "family") && (
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-navy">איפה עובדים? (לא חובה)</label>
                <div className="relative">
                  <Briefcase className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="הכתובת / אזור שלך" value={myWork}
                    onChange={(e) => setMyWork(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm text-navy focus:outline-none focus:border-amber transition-colors" />
                </div>
                <div className="relative">
                  <Briefcase className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="הכתובת / אזור של הפרטנר" value={partnerWork}
                    onChange={(e) => setPartnerWork(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm text-navy focus:outline-none focus:border-amber transition-colors" />
                </div>
                <p className="text-xs text-gray-400">נחשב זמן נסיעה לכל נכס אוטומטית</p>
              </div>
            )}
          </div>
        )}

        {/* ──────────────────────────── STEP 1: Budget ──────────────────────────── */}
        {step === 1 && (
          <div className="bg-white rounded-3xl border border-gray-100 p-7 space-y-6">
            <StepHeader icon={TrendingUp} title="תקציב ומימון" sub="נמצא נכסים שבאמת בטווח שלך, כולל עלויות נלוות" />

            {/* Max budget */}
            <div>
              <label className="block text-sm font-semibold text-navy mb-1">תקציב מקסימלי לרכישה</label>
              <div className="text-3xl font-bold text-amber mb-4">{formatPrice(budgetMax)}</div>
              <input type="range" min={500000} max={10000000} step={100000}
                value={budgetMax} onChange={(e) => setBudgetMax(Number(e.target.value))}
                className="w-full accent-amber h-2 rounded-full" />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>₪500K</span><span>₪10M</span>
              </div>
            </div>

            {/* Equity */}
            <div>
              <label className="block text-sm font-semibold text-navy mb-1">
                הון עצמי זמין —{" "}
                <span className="text-amber">{equity}%</span>
                <span className="text-gray-400 font-normal"> ({formatPrice(budgetMax * equity / 100)})</span>
              </label>
              <input type="range" min={10} max={100} step={5}
                value={equity} onChange={(e) => setEquity(Number(e.target.value))}
                className="w-full accent-amber h-2 rounded-full" />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>10%</span><span>100% (ללא משכנתא)</span>
              </div>
              {equity < 25 && (
                <p className="text-xs text-amber mt-1.5">⚠️ בנק ישראל מחייב לפחות 25% הון עצמי לדירה ראשונה</p>
              )}
            </div>

            {/* Mortgage */}
            <div>
              <label className="block text-sm font-semibold text-navy mb-3">האם יש אישור עקרוני למשכנתא?</label>
              <div className="flex gap-2.5">
                {[
                  { val: true, label: "כן, יש אישור" },
                  { val: false, label: "עדיין לא" },
                ].map(({ val, label }) => (
                  <button key={String(val)} onClick={() => setMortgageApproved(val)}
                    className={`flex-1 py-3 rounded-2xl border-2 text-sm font-medium transition-all ${
                      mortgageApproved === val ? "border-amber bg-amber-light text-navy" : "border-gray-200 text-gray-400 hover:border-gray-300"
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
              {mortgageApproved === false && (
                <p className="text-xs text-gray-400 mt-2">💡 קונים עם אישור עקרוני מקבלים עדיפות ממוכרים</p>
              )}
            </div>

            {/* Purpose */}
            <div>
              <label className="block text-sm font-semibold text-navy mb-3">מטרת הרכישה</label>
              <div className="flex gap-2.5">
                {[
                  { val: "primary", label: "בית מגורים", icon: Home },
                  { val: "investment", label: "השקעה", icon: TrendingUp },
                ].map(({ val, label, icon: Icon }) => (
                  <button key={val} onClick={() => setPurpose(val as typeof purpose)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border-2 text-sm font-medium transition-all ${
                      purpose === val ? "border-amber bg-amber-light text-navy" : "border-gray-200 text-gray-400 hover:border-gray-300"
                    }`}>
                    <Icon className="w-4 h-4" />{label}
                  </button>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div>
              <label className="block text-sm font-semibold text-navy mb-3">מתי אתם רוצים להיכנס לדירה?</label>
              <div className="grid grid-cols-2 gap-2">
                {["עד 3 חודשים", "3–6 חודשים", "6–12 חודשים", "יותר משנה"].map((t) => (
                  <button key={t} onClick={() => setMoveTimeline(t)}
                    className={`py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                      moveTimeline === t ? "border-amber bg-amber-light text-navy" : "border-gray-100 text-navy/60 hover:border-gray-300"
                    }`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ──────────────────────────── STEP 2: Location ──────────────────────────── */}
        {step === 2 && (
          <div className="bg-white rounded-3xl border border-gray-100 p-7 space-y-6">
            <StepHeader icon={MapPin} title="איפה לחפש?" sub="הקלד כל עיר או אזור בישראל" />

            {/* City search */}
            <div>
              <label className="block text-sm font-semibold text-navy mb-2">ערים מועדפות</label>
              <div className="relative">
                <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="הקלד שם עיר..."
                  value={citySearch}
                  onChange={(e) => { setCitySearch(e.target.value); setShowCityDropdown(true); }}
                  onFocus={() => setShowCityDropdown(true)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm text-navy focus:outline-none focus:border-amber transition-colors"
                />
                {showCityDropdown && citySearch && filteredCities.length > 0 && (
                  <div className="absolute top-full right-0 left-0 mt-1 bg-white border border-gray-200 rounded-2xl shadow-lg z-20 overflow-hidden">
                    {filteredCities.map((c) => (
                      <button key={c} onClick={() => addCity(c)}
                        className="w-full text-right px-4 py-2.5 text-sm text-navy hover:bg-amber-light transition-colors flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-amber shrink-0" />{c}
                      </button>
                    ))}
                    {/* Allow typing custom city not in list */}
                    {!ISRAEL_CITIES.includes(citySearch) && (
                      <button onClick={() => addCity(citySearch)}
                        className="w-full text-right px-4 py-2.5 text-sm text-amber font-medium hover:bg-amber-light transition-colors border-t border-gray-100">
                        + הוסף "{citySearch}"
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Selected cities */}
              {selectedCities.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedCities.map((c) => (
                    <span key={c} className="flex items-center gap-1.5 bg-amber-light text-navy text-sm px-3 py-1.5 rounded-full font-medium">
                      <MapPin className="w-3 h-3 text-amber" />
                      {c}
                      <button onClick={() => removeCity(c)} className="hover:text-red-400 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Location priorities */}
            <div>
              <label className="block text-sm font-semibold text-navy mb-3">מה הכי חשוב לך במיקום?</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "קרוב לעבודה שלי", icon: Briefcase },
                  { label: "קרוב לעבודה של הפרטנר", icon: Briefcase },
                  { label: "קרוב להורים / משפחה", icon: Heart },
                  { label: "תחבורה ציבורית טובה", icon: Train },
                  { label: "פחות חשוב — גמיש לגמרי", icon: MapPin },
                ].map(({ label, icon: Icon }) => (
                  <button key={label} onClick={() => toggleLocationPriority(label)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border-2 text-sm transition-all ${
                      locationPriority.includes(label)
                        ? "border-amber bg-amber text-white"
                        : "border-gray-200 text-navy/70 hover:border-amber/40"
                    }`}>
                    <Icon className="w-3.5 h-3.5" />{label}
                  </button>
                ))}
              </div>
            </div>

            {/* Flexibility */}
            <div className="bg-amber-light rounded-2xl p-4 text-sm text-navy/80">
              <p className="font-semibold text-navy mb-1">💡 טיפ</p>
              <p>ניתן לציין מספר ערים ולסנן אחר כך. קונים שמגמישים את המיקום מוצאים נכסים טובים יותר בעד 25% פחות.</p>
            </div>
          </div>
        )}

        {/* ──────────────────────────── STEP 3: Apartment ──────────────────────────── */}
        {step === 3 && (
          <div className="bg-white rounded-3xl border border-gray-100 p-7 space-y-6">
            <StepHeader icon={Building} title="הדירה עצמה" sub="מה המינימום שאתה מוכן לקבל?" />

            {/* Rooms */}
            <div>
              <label className="block text-sm font-semibold text-navy mb-3">מינימום חדרים</label>
              <div className="flex gap-2">
                {[1, 1.5, 2, 2.5, 3, 3.5, 4, 5].map((r) => (
                  <button key={r} onClick={() => setRooms(r)}
                    className={`flex-1 h-11 rounded-xl font-semibold text-xs transition-all ${
                      rooms === r ? "bg-amber text-white shadow-md" : "bg-gray-50 border border-gray-200 text-navy hover:border-amber"
                    }`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Min sqm */}
            <div>
              <label className="block text-sm font-semibold text-navy mb-1">
                שטח מינימלי — <span className="text-amber">{sqmMin} מ״ר</span>
              </label>
              <input type="range" min={30} max={200} step={5}
                value={sqmMin} onChange={(e) => setSqmMin(Number(e.target.value))}
                className="w-full accent-amber h-2 rounded-full" />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>30 מ״ר</span><span>200 מ״ר</span>
              </div>
            </div>

            {/* Floor preference */}
            <div>
              <label className="block text-sm font-semibold text-navy mb-3">העדפת קומה</label>
              <div className="flex gap-2.5">
                {[
                  { val: "any", label: "לא משנה" },
                  { val: "low", label: "קומות נמוכות (1–3)" },
                  { val: "high", label: "קומות גבוהות" },
                ].map(({ val, label }) => (
                  <button key={val} onClick={() => setFloorPref(val as typeof floorPref)}
                    className={`flex-1 py-2.5 rounded-xl border-2 text-xs font-medium transition-all ${
                      floorPref === val ? "border-amber bg-amber-light text-navy" : "border-gray-200 text-navy/60 hover:border-gray-300"
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Must features */}
            <div>
              <label className="block text-sm font-semibold text-navy mb-3">
                מה חייב להיות בדירה?
                <span className="text-gray-400 font-normal mr-1">(בחר את המחויבים)</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {MUST_FEATURES.map(({ key, label, icon: Icon }) => (
                  <button key={key} onClick={() => toggleFeature(key)}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 text-xs font-medium transition-all ${
                      mustFeatures.includes(key)
                        ? "border-amber bg-amber-light text-navy"
                        : "border-gray-100 bg-gray-50 text-navy/60 hover:border-amber/30"
                    }`}>
                    <Icon className={`w-4 h-4 ${mustFeatures.includes(key) ? "text-amber" : "text-gray-400"}`} />
                    {label}
                    {mustFeatures.includes(key) && <CheckCircle2 className="w-3 h-3 text-amber" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Renovation willingness */}
            <div>
              <label className="block text-sm font-semibold text-navy mb-3">
                <Wrench className="inline-block w-4 h-4 text-amber ml-1" />
                כמה שיפוץ אתה מוכן לקחת על עצמך?
              </label>
              <div className="space-y-2">
                {[
                  { val: "none", label: "לא בכלל — רק מפתח ונכנסים", sub: "מוגבל יותר, אבל ללא כאב ראש" },
                  { val: "light", label: "שיפוץ קל בסדר (צבע, ריצוף)", sub: "הכי שכיח — גמיש ומחיר טוב" },
                  { val: "full", label: "שיפוץ מלא אם המחיר שווה", sub: "פוטנציאל הרבה יותר גדול" },
                ].map(({ val, label, sub }) => (
                  <button key={val} onClick={() => setMaxRenovation(val as typeof maxRenovation)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-2 text-sm text-right transition-all ${
                      maxRenovation === val ? "border-amber bg-amber-light" : "border-gray-100 hover:border-gray-200"
                    }`}>
                    <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                      maxRenovation === val ? "border-amber bg-amber" : "border-gray-300"
                    }`}>
                      {maxRenovation === val && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-navy">{label}</div>
                      <div className="text-xs text-gray-400">{sub}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ──────────────────────────── STEP 4: Lifestyle ──────────────────────────── */}
        {step === 4 && (
          <div className="bg-white rounded-3xl border border-gray-100 p-7 space-y-6">
            <StepHeader icon={Heart} title="אורח חיים והעדפות" sub="ה-AI ישתמש בזה כדי לסנן את הנכסים המדויקים לך" />

            {/* Importance sliders */}
            <div>
              <label className="block text-sm font-semibold text-navy mb-4">כמה חשוב לך כל אחד מאלה? (1–5)</label>
              <div className="space-y-4">
                {[
                  { label: "קרוב לעבודה (זמן נסיעה)", val: importanceWork, set: setImportanceWork, icon: "💼" },
                  { label: "בתי ספר / גנים איכותיים", val: importanceSchool, set: setImportanceSchool, icon: "🏫" },
                  { label: "תחבורה ציבורית טובה", val: importanceTransit, set: setImportanceTransit, icon: "🚆" },
                  { label: "ירוק, פארקים, טבע", val: importanceNature, set: setImportanceNature, icon: "🌳" },
                ].map(({ label, val, set: setVal, icon }) => (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-navy">{icon} {label}</span>
                      <ImportanceDots value={val} onChange={setVal} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags by category */}
            <div>
              <label className="block text-sm font-semibold text-navy mb-1">
                בחר תגיות שמתאימות לך
                {selectedTags.length > 0 && <span className="mr-2 text-amber font-normal">({selectedTags.length} נבחרו)</span>}
              </label>
              <p className="text-xs text-gray-400 mb-4">ה-AI ישתמש בתגיות אלה למציאת נכסים מתאימים</p>
              <div className="space-y-4">
                {tagsByCategory.map(({ catLabel, tags }) => (
                  <div key={catLabel}>
                    <p className="text-xs font-semibold text-gray-500 mb-2">{catLabel}</p>
                    <div className="flex flex-wrap gap-2">
                      {tags.map(({ label, icon }) => (
                        <button key={label} onClick={() => toggleTag(label)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border-2 transition-all ${
                            selectedTags.includes(label)
                              ? "border-amber bg-amber text-white"
                              : "border-gray-200 bg-white text-navy/70 hover:border-amber/40"
                          }`}>
                          <span>{icon}</span>{label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Free text */}
            <div>
              <label className="block text-sm font-semibold text-navy mb-2">ספר לנו בחופשיות</label>
              <textarea
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                placeholder="למשל: אנחנו זוג עם תינוק ומחפשים שכונה שקטה עם גן קרוב. חשוב לנו שיהיה מקום לגדול..."
                rows={3}
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm text-navy placeholder-gray-300 resize-none focus:outline-none focus:border-amber transition-colors"
              />
              <p className="text-xs text-gray-400 mt-1">ה-AI קורא ומוסיף לפרופיל שלך</p>
            </div>
          </div>
        )}

        {/* ──────────────────────────── STEP 5: Summary ──────────────────────────── */}
        {step === 5 && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl border border-gray-100 p-7">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-green-100 rounded-2xl flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-navy">הפרופיל שלך מוכן</h2>
                  <p className="text-gray-400 text-sm">ה-AI מחפש עבורך עכשיו</p>
                </div>
              </div>

              <div className="space-y-0 divide-y divide-gray-50">
                <SummaryRow icon="👨‍👩‍👧" label="פרופיל" value={
                  familyStatus === "family" ? `משפחה עם ${kidsCount} ילדים` :
                  familyStatus === "couple" ? (planningKids ? "זוג — מתכננים ילדים" : "זוג") : "יחיד/ה"
                } />
                <SummaryRow icon="💰" label="תקציב" value={`עד ${formatPrice(budgetMax)} · ${equity}% הון עצמי`} />
                <SummaryRow icon="📅" label="כניסה" value={moveTimeline || "—"} />
                <SummaryRow icon="📍" label="ערים" value={selectedCities.join(", ") || "—"} />
                <SummaryRow icon="🏠" label="דירה" value={`${rooms}+ חדרים, ${sqmMin}+ מ״ר`} />
                {mustFeatures.length > 0 && (
                  <SummaryRow icon="✅" label="חובה" value={mustFeatures.map((k) => MUST_FEATURES.find((f) => f.key === k)?.label).join(", ")} />
                )}
                <SummaryRow icon="🔨" label="שיפוץ" value={
                  maxRenovation === "none" ? "ללא שיפוץ" :
                  maxRenovation === "light" ? "שיפוץ קל בסדר" : "שיפוץ מלא אם שווה"
                } />
              </div>

              {(selectedTags.length > 0) && (
                <div className="mt-4 pt-4 border-t border-gray-50">
                  <p className="text-xs text-gray-400 mb-2">תגיות ({selectedTags.length})</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTags.slice(0, 8).map((t) => (
                      <span key={t} className="text-xs bg-amber-light text-amber px-2.5 py-1 rounded-full">{t}</span>
                    ))}
                    {selectedTags.length > 8 && (
                      <span className="text-xs text-gray-400 py-1">+{selectedTags.length - 8} נוספות</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* AI teaser */}
            <div className="bg-gradient-to-l from-amber to-yellow-400 rounded-3xl p-6 text-white">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold">AI</span>
                </div>
                <span className="font-semibold">סוכן Agenta</span>
              </div>
              <p className="text-sm text-white/90 leading-relaxed">
                מצאתי <strong>3 נכסים</strong> שתואמים לפרופיל שלך —
                הגבוה ביניהם בציון <strong>94%</strong>.
                ₪285K פחות מהתקציב שלך, גן ממש מתחת לבניין, ופוטנציאל מטבח פתוח.
              </p>
              <p className="text-xs text-white/60 mt-2">מבוסס על {totalTags + 3} קריטריונים</p>
            </div>
          </div>
        )}

        {/* Nav buttons */}
        <div className="flex items-center justify-between mt-6">
          {step > 0 ? (
            <button onClick={() => setStep((s) => s - 1)}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-navy transition-colors px-3 py-2">
              <ChevronRight className="w-4 h-4" />חזרה
            </button>
          ) : <div />}

          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canNext()}
              className={`flex items-center gap-2 px-7 py-3 rounded-2xl font-semibold text-sm transition-all ${
                canNext()
                  ? "bg-amber text-white hover:bg-amber/90 hover:scale-[1.02] shadow-md"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}>
              המשך
              <ChevronLeft className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => router.push("/matches")}
              className="flex items-center gap-2 bg-navy text-white px-8 py-3 rounded-2xl font-semibold text-sm hover:bg-navy/90 hover:scale-[1.02] shadow-md transition-all">
              <ArrowLeft className="w-4 h-4" />
              ראה את ההתאמות שלי
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Helper components ─────────────────────────────────────────────────────────

function StepHeader({ icon: Icon, title, sub }: { icon: React.ComponentType<{ className?: string }>; title: string; sub: string }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 bg-amber-light rounded-2xl flex items-center justify-center">
          <Icon className="w-5 h-5 text-amber" />
        </div>
        <h2 className="text-2xl font-bold text-navy">{title}</h2>
      </div>
      <p className="text-gray-400 text-sm">{sub}</p>
    </div>
  );
}

function ToggleRow({ label, sub, value, onChange }: {
  label: string; sub?: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
      <div>
        <div className="text-sm font-medium text-navy">{label}</div>
        {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
      </div>
      <button onClick={() => onChange(!value)}
        className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${value ? "bg-amber" : "bg-gray-200"}`}>
        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? "translate-x-6" : "translate-x-0.5"}`} />
      </button>
    </div>
  );
}

function ImportanceDots({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} onClick={() => onChange(n)}
          className={`w-6 h-6 rounded-full border-2 transition-all ${
            n <= value ? "bg-amber border-amber" : "border-gray-300 hover:border-amber/50"
          }`}
        />
      ))}
    </div>
  );
}

function SummaryRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <span className="text-lg shrink-0 w-7 text-center">{icon}</span>
      <div className="flex-1">
        <span className="text-xs text-gray-400">{label}: </span>
        <span className="text-sm font-medium text-navy">{value}</span>
      </div>
    </div>
  );
}
