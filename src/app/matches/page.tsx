"use client";
import { useState } from "react";
import {
  Bell, CheckCircle2, MapPin, Maximize2, Building, TrendingUp,
  Zap, SlidersHorizontal, ChevronLeft, Scan, X, Star,
  Calendar, Brain, Sparkles, Baby,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { properties, matchMeta, mockBuyerProfile } from "@/lib/mockData";

const ALERTS = [
  { id: 1, title: "התאמה חדשה בתל אביב", desc: "רחוב ארלוזורוב 45 — 4 חדרים, ₪3.2M. מתאים ל-4 מהדרישות שלך.", time: "לפני 2 דקות", unread: true },
  { id: 2, title: "ירידת מחיר", desc: "רחוב דיזנגוף 78 ירד מ-₪2.95M ל-₪2.8M", time: "לפני שעה", unread: true },
  { id: 3, title: "נכס חדש", desc: "נכס ליד תחנת הרכבת הקלה המועדפת עליך פורסם.", time: "לפני 3 שעות", unread: false },
  { id: 4, title: "ביקור מאושר", desc: "ירון אישר ביקור ביום שני בשעה 19:00 — רחוב ארלוזורוב 45.", time: "אתמול", unread: false },
];

const STATUS_CONFIG = {
  new: { label: "התאמה חדשה", color: "bg-amber text-white", dot: "bg-amber" },
  scheduled: { label: "ביקור מתוכנן", color: "bg-blue-100 text-blue-600", dot: "bg-blue-500" },
  visited: { label: "ביקרת", color: "bg-green-100 text-green-600", dot: "bg-green-500" },
  not_interested: { label: "לא מעניין", color: "bg-gray-100 text-gray-400", dot: "bg-gray-400" },
};

export default function MatchesPage() {
  const [tab, setTab] = useState<"matches" | "alerts" | "profile">("matches");
  const [feedbackPropertyId, setFeedbackPropertyId] = useState<string | null>(null);

  const enriched = properties.map((p) => ({
    ...p,
    meta: matchMeta.find((m) => m.propertyId === p.id) ?? {
      propertyId: p.id, score: 50, aiSummary: "", matchTags: [], status: "new" as const,
    },
  })).sort((a, b) => b.meta.score - a.meta.score);

  return (
    <div className="min-h-screen bg-cream" dir="rtl">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 pt-8 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-navy">ההתאמות שלי</h1>
            <p className="text-gray-400 mt-0.5">נכסים מותאמים אישית לפרופיל של <span className="text-navy font-medium">{mockBuyerProfile.name}</span></p>
          </div>
          <div className="flex items-center gap-2 bg-amber text-white text-sm font-medium px-4 py-2 rounded-full">
            <Bell className="w-4 h-4" />
            2 התראות חדשות
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-gray-100 rounded-2xl p-1 mb-6 w-fit">
          {[
            { key: "matches", label: "התאמות", count: properties.length },
            { key: "alerts", label: "התראות", count: 2 },
            { key: "profile", label: "פרופיל קונה" },
          ].map((t) => (
            <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === t.key ? "bg-navy text-white shadow-sm" : "text-navy/60 hover:text-navy"
              }`}>
              {t.label}
              {t.count !== undefined && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  tab === t.key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                }`}>{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── Matches ── */}
        {tab === "matches" && (
          <div className="space-y-4">
            {enriched.map((p) => {
              const meta = p.meta;
              const status = STATUS_CONFIG[meta.status];
              const scoreColor =
                meta.score >= 90 ? "text-green-600 bg-green-50 border-green-200" :
                meta.score >= 75 ? "text-amber bg-amber-light border-amber/30" :
                "text-gray-500 bg-gray-50 border-gray-200";

              return (
                <div key={p.id} className={`bg-white rounded-2xl border hover:shadow-lg transition-all overflow-hidden ${
                  meta.status === "new" ? "border-amber/30" : "border-gray-100"
                }`}>
                  {/* New match banner */}
                  {meta.status === "new" && (
                    <div className="bg-amber px-5 py-2 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                      <span className="text-white text-xs font-semibold">התאמה חדשה — ה-AI מצא אותה לפני פחות משעה</span>
                    </div>
                  )}

                  <div className="flex flex-row-reverse">
                    {/* Image */}
                    <div className="w-52 shrink-0 relative overflow-hidden">
                      <Image src={p.photos[0]} alt={p.address} fill className="object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-l from-transparent to-navy/20" />
                      <div className="absolute top-3 right-3 flex flex-col gap-1.5">
                        <span className="flex items-center gap-1 bg-navy/80 text-white text-xs px-2 py-0.5 rounded-full">
                          <Scan className="w-3 h-3 text-amber" />LiDAR
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 ${status.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                          {status.label}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-navy text-lg">{p.address}</h3>
                            {/* Score badge */}
                            <div className={`flex items-center gap-1 text-sm font-bold px-3 py-1 rounded-full border ${scoreColor}`}>
                              <Star className="w-3.5 h-3.5" />
                              {meta.score}% התאמה
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-gray-400 text-sm mt-0.5">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{p.city} · {p.rooms} חדרים · {p.sqm} מ״ר · קומה {p.floor}/{p.totalFloors}</span>
                          </div>
                        </div>
                        <span className="text-navy font-bold text-xl shrink-0 mr-3">₪{(p.price / 1000000).toFixed(1)}M</span>
                      </div>

                      {/* AI Summary */}
                      {meta.aiSummary && (
                        <div className="mt-3 flex items-start gap-2 bg-amber-light rounded-xl p-3">
                          <div className="w-5 h-5 bg-amber rounded-full flex items-center justify-center shrink-0 mt-0.5">
                            <Brain className="w-3 h-3 text-white" />
                          </div>
                          <p className="text-xs text-navy/80 leading-relaxed">{meta.aiSummary}</p>
                        </div>
                      )}

                      {/* Match tags */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {meta.matchTags.map((tag) => {
                          const isNeg = tag.includes("✗");
                          return (
                            <span key={tag}
                              className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${
                                isNeg ? "bg-red-50 text-red-400" : "bg-amber-light text-amber"
                              }`}>
                              {tag}
                            </span>
                          );
                        })}
                      </div>

                      {/* Scheduled date */}
                      {meta.scheduledDate && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-blue-600 bg-blue-50 rounded-xl px-3 py-2">
                          <Calendar className="w-4 h-4" />
                          <span>ביקור מתוכנן: <strong>{meta.scheduledDate}</strong></span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-4 flex-wrap">
                        <Link href={`/property/${p.id}`}
                          className="flex items-center gap-1.5 bg-amber text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-amber/90 transition-colors">
                          לנכס <ChevronLeft className="w-4 h-4" />
                        </Link>
                        <button className="text-sm border border-gray-200 text-navy px-4 py-2 rounded-xl hover:border-amber hover:text-amber transition-colors">
                          דבר עם סוכן AI
                        </button>
                        {meta.status === "visited" && (
                          <button
                            onClick={() => setFeedbackPropertyId(p.id)}
                            className="text-sm border border-green-200 text-green-600 px-4 py-2 rounded-xl hover:bg-green-50 transition-colors">
                            השאר פידבק
                          </button>
                        )}
                        <button className="text-sm text-gray-400 hover:text-navy transition-colors mr-auto">
                          לא מעניין
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Match bar */}
                  <div className="px-5 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            meta.score >= 90 ? "bg-green-500" : meta.score >= 75 ? "bg-amber" : "bg-gray-400"
                          }`}
                          style={{ width: `${meta.score}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 shrink-0">{meta.score}% מהדרישות מתקיימות</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Alerts ── */}
        {tab === "alerts" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-400">יש לך <span className="text-navy font-semibold">2 התראות שלא נקראו</span></p>
              <button className="text-sm text-amber hover:text-amber/80">סמן הכל כנקרא</button>
            </div>
            {ALERTS.map((a) => (
              <div key={a.id}
                className={`bg-white rounded-2xl border p-4 flex items-start gap-4 hover:shadow-md transition-all ${
                  a.unread ? "border-amber/30 bg-amber-light/20" : "border-gray-100"
                }`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  a.unread ? "bg-amber text-white" : "bg-gray-100 text-gray-400"
                }`}>
                  <Bell className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-navy text-sm">{a.title}</h4>
                    {a.unread && <div className="w-2 h-2 rounded-full bg-amber shrink-0" />}
                  </div>
                  <p className="text-gray-500 text-sm mt-0.5">{a.desc}</p>
                  <p className="text-xs text-gray-400 mt-1.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Profile ── */}
        {tab === "profile" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-amber" />
                פרופיל הקונה — {mockBuyerProfile.name}
              </h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {[
                  { label: "תקציב", value: `₪${(mockBuyerProfile.budget.min / 1000000).toFixed(1)}M – ₪${(mockBuyerProfile.budget.max / 1000000).toFixed(1)}M`, icon: TrendingUp },
                  { label: "חדרים", value: `${mockBuyerProfile.rooms}+ חדרים`, icon: Building },
                  { label: "ערים", value: mockBuyerProfile.cities.join(", "), icon: MapPin },
                  { label: "ילדים", value: mockBuyerProfile.hasKids ? "כן" : "לא", icon: Baby },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 bg-amber-light rounded-lg flex items-center justify-center shrink-0">
                      <item.icon className="w-4 h-4 text-amber" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">{item.label}</div>
                      <div className="text-sm font-semibold text-navy">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Semantic tags */}
              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-2">תגיות חיפוש</p>
                <div className="flex flex-wrap gap-1.5">
                  {mockBuyerProfile.semanticTags.map((t) => (
                    <span key={t} className="text-xs bg-amber-light text-amber px-2.5 py-1 rounded-full">{t}</span>
                  ))}
                </div>
              </div>

              {/* Free text */}
              {mockBuyerProfile.freeText && (
                <div className="bg-gray-50 rounded-xl p-3 mb-4">
                  <p className="text-xs text-gray-400 mb-1">בחופשיות</p>
                  <p className="text-sm text-navy/70 italic">"{mockBuyerProfile.freeText}"</p>
                </div>
              )}

              <Link href="/onboarding"
                className="block w-full text-center border border-amber text-amber font-medium py-3 rounded-xl hover:bg-amber hover:text-white transition-all text-sm">
                עדכן פרופיל
              </Link>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-navy mb-4">העדפות התראות</h2>
              <div className="space-y-3">
                {[
                  { label: "נכס חדש תואם", enabled: true },
                  { label: "ירידת מחיר בנכסים שמורים", enabled: true },
                  { label: "תזכורות ביקור", enabled: true },
                  { label: "דוחות מגמות שוק (שבועי)", enabled: false },
                  { label: "נכסים חדשים בשכונות שמורות", enabled: false },
                ].map((pref) => (
                  <div key={pref.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-navy">{pref.label}</span>
                    <div className={`w-10 rounded-full transition-colors cursor-pointer relative ${pref.enabled ? "bg-amber" : "bg-gray-200"}`}
                      style={{ height: "22px" }}>
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${pref.enabled ? "translate-x-5" : "translate-x-0.5"}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      {feedbackPropertyId && (
        <FeedbackModal
          propertyId={feedbackPropertyId}
          onClose={() => setFeedbackPropertyId(null)}
        />
      )}
    </div>
  );
}

// ── Feedback Modal ────────────────────────────────────────────────────────────
const FEEDBACK_TAGS = [
  "רועש מהרחוב", "זקוק לשיפוץ", "תמונות לא מדויקות", "קטן מהציפיות",
  "גדול מהציפיות", "שכנים נחמדים", "בניין מוזנח", "נוף חסום",
  "ריח לחות", "אור טבעי מצוין", "שקט מאוד", "שכונה טובה",
];

function FeedbackModal({ propertyId, onClose }: { propertyId: string; onClose: () => void }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [matchRating, setMatchRating] = useState(3);
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const toggleTag = (t: string) =>
    setSelectedTags((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);

  const property = properties.find((p) => p.id === propertyId);

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center" onClick={(e) => e.stopPropagation()}>
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-navy mb-2">תודה על הפידבק!</h3>
          <p className="text-gray-500 text-sm mb-2">הפידבק שלך עוזר ל-AI ללמוד ולשפר את ההתאמות הבאות.</p>
          <div className="flex items-center justify-center gap-2 mt-4 p-3 bg-amber-light rounded-xl">
            <Brain className="w-5 h-5 text-amber" />
            <span className="text-xs text-navy font-medium">ה-AI מעבד את הפידבק שלך כרגע...</span>
          </div>
          <button onClick={onClose} className="mt-5 w-full bg-navy text-white py-3 rounded-2xl font-medium text-sm hover:bg-navy/90 transition-colors">
            סגור
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-3xl z-10">
          <div>
            <h3 className="text-lg font-bold text-navy">פידבק לביקור</h3>
            {property && <p className="text-sm text-gray-400">{property.address}</p>}
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6" dir="rtl">
          {/* Star rating */}
          <div>
            <label className="block text-sm font-semibold text-navy mb-3">כמה אהבת את הנכס?</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s}
                  onMouseEnter={() => setHoverRating(s)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(s)}
                  className="transition-transform hover:scale-110">
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      s <= (hoverRating || rating) ? "text-amber fill-amber" : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                {["", "לא התרשמתי", "בסדר", "טוב", "מאוד טוב", "מושלם!"][rating]}
              </p>
            )}
          </div>

          {/* Match quality */}
          <div>
            <label className="block text-sm font-semibold text-navy mb-3">
              עד כמה ה-AI דייק בהתאמה?
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onClick={() => setMatchRating(s)}
                  className={`flex-1 py-2 rounded-xl border-2 text-xs font-medium transition-all ${
                    matchRating === s ? "border-amber bg-amber text-white" : "border-gray-200 text-gray-400 hover:border-amber/40"
                  }`}>
                  {s}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-300 mt-1 px-1">
              <span>לא דייק</span><span>דייק מאוד</span>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-navy mb-3">מה שמת לב?</label>
            <div className="flex flex-wrap gap-2">
              {FEEDBACK_TAGS.map((t) => (
                <button key={t} onClick={() => toggleTag(t)}
                  className={`px-3 py-1.5 rounded-full text-xs border-2 transition-all ${
                    selectedTags.includes(t)
                      ? "border-amber bg-amber text-white"
                      : "border-gray-200 bg-white text-navy/60 hover:border-amber/40"
                  }`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Free text */}
          <div>
            <label className="block text-sm font-semibold text-navy mb-2">הערות נוספות (אופציונלי)</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              placeholder="כל מה שתרצה לשתף..."
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm text-navy placeholder-gray-300 resize-none focus:outline-none focus:border-amber transition-colors"
            />
          </div>

          {/* AI training note */}
          <div className="flex items-center gap-3 bg-amber-light rounded-2xl p-4">
            <div className="w-8 h-8 bg-amber rounded-xl flex items-center justify-center shrink-0">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-navy">מאמן את ה-AI שלך</p>
              <p className="text-xs text-gray-500">הפידבק ישפר את ציוני ההתאמה בהתאמות הבאות</p>
            </div>
            <div className="flex gap-0.5 mr-auto">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </div>

          <button
            disabled={rating === 0}
            onClick={() => setSubmitted(true)}
            className={`w-full py-3.5 rounded-2xl font-semibold text-sm transition-all ${
              rating > 0
                ? "bg-amber text-white hover:bg-amber/90 hover:scale-[1.01] shadow-md"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}>
            שלח פידבק
          </button>
        </div>
      </div>
    </div>
  );
}
