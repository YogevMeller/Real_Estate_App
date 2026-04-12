"use client";
import { useState, useEffect } from "react";
import {
  Bell, CheckCircle2, MapPin, Maximize2, Building, TrendingUp,
  SlidersHorizontal, ChevronLeft, Scan, X, Star,
  Brain, Sparkles, Baby, Loader2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/client";
import {
  getUserMatches, getUserAlerts, markAlertsRead, getBuyerProfile, dismissMatch,
  type MatchView, type AlertView, type BuyerProfileView,
} from "@/lib/supabase/queries";

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  new: { label: "התאמה חדשה", color: "bg-amber text-white", dot: "bg-amber" },
  scheduled: { label: "ביקור מתוכנן", color: "bg-blue-100 text-blue-600", dot: "bg-blue-500" },
  visited: { label: "ביקרת", color: "bg-green-100 text-green-600", dot: "bg-green-500" },
  not_interested: { label: "לא מעניין", color: "bg-gray-100 text-gray-400", dot: "bg-gray-400" },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "עכשיו";
  if (mins < 60) return `לפני ${mins} דקות`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `לפני ${hours} שעות`;
  const days = Math.floor(hours / 24);
  return `לפני ${days} ימים`;
}

export default function MatchesPage() {
  const [tab, setTab] = useState<"matches" | "alerts" | "profile">("matches");
  const [feedbackPropertyId, setFeedbackPropertyId] = useState<string | null>(null);
  const [matches, setMatches] = useState<MatchView[]>([]);
  const [alerts, setAlerts] = useState<AlertView[]>([]);
  const [buyerProfile, setBuyerProfile] = useState<BuyerProfileView | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setUserId(user.id);
      const [m, a, bp] = await Promise.all([
        getUserMatches(user.id),
        getUserAlerts(user.id),
        getBuyerProfile(user.id),
      ]);
      setMatches(m);
      setAlerts(a);
      setBuyerProfile(bp);
      setLoading(false);
    })();
  }, []);

  const handleDismiss = async (matchId: string) => {
    setMatches((prev) => prev.filter((m) => m.id !== matchId));
    await dismissMatch(matchId);
  };

  const handleMarkAllRead = async () => {
    if (!userId) return;
    setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
    await markAlertsRead(userId);
  };

  const unreadAlerts = alerts.filter((a) => !a.isRead).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-cream">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 text-amber animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 pt-8 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-navy">ההתאמות שלי</h1>
            <p className="text-gray-400 mt-0.5">נכסים מותאמים אישית לפרופיל שלך</p>
          </div>
          {unreadAlerts > 0 && (
            <div className="flex items-center gap-2 bg-amber text-white text-sm font-medium px-4 py-2 rounded-full">
              <Bell className="w-4 h-4" />
              {unreadAlerts} התראות חדשות
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-gray-100 rounded-2xl p-1 mb-6 w-fit">
          {[
            { key: "matches" as const, label: "התאמות", count: matches.length },
            { key: "alerts" as const, label: "התראות", count: unreadAlerts || undefined },
            { key: "profile" as const, label: "פרופיל קונה" },
          ].map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
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
            {matches.length === 0 ? (
              <div className="text-center py-24">
                <Sparkles className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-navy">אין התאמות עדיין</h3>
                <p className="text-gray-400 mt-1">ה-AI מחפש עבורך נכסים מתאימים. תוצאות יופיעו כאן בקרוב.</p>
                <Link href="/search" className="inline-flex items-center gap-2 mt-4 bg-amber text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-amber/90 transition-colors">
                  חפש נכסים
                </Link>
              </div>
            ) : (
              matches.map((m) => {
                const p = m.property;
                if (!p) return null;
                const status = STATUS_CONFIG[m.status] ?? STATUS_CONFIG.new;
                const scoreColor =
                  m.score >= 90 ? "text-green-600 bg-green-50 border-green-200" :
                  m.score >= 75 ? "text-amber bg-amber-light border-amber/30" :
                  "text-gray-500 bg-gray-50 border-gray-200";

                return (
                  <div key={m.id} className={`bg-white rounded-2xl border hover:shadow-lg transition-all overflow-hidden ${
                    m.status === "new" ? "border-amber/30" : "border-gray-100"
                  }`}>
                    {m.status === "new" && (
                      <div className="bg-amber px-5 py-2 flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                        <span className="text-white text-xs font-semibold">התאמה חדשה — ה-AI מצא אותה עבורך</span>
                      </div>
                    )}

                    <div className="flex flex-row-reverse">
                      <div className="w-52 shrink-0 relative overflow-hidden">
                        <Image src={p.photos[0] || "/lidar.jpg"} alt={p.address} fill className="object-cover" />
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

                      <div className="flex-1 p-5">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-navy text-lg">{p.address}</h3>
                              <div className={`flex items-center gap-1 text-sm font-bold px-3 py-1 rounded-full border ${scoreColor}`}>
                                <Star className="w-3.5 h-3.5" />
                                {m.score}% התאמה
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-gray-400 text-sm mt-0.5">
                              <MapPin className="w-3.5 h-3.5" />
                              <span>{p.city} · {p.rooms} חדרים · {p.sqm} מ״ר · קומה {p.floor}/{p.totalFloors}</span>
                            </div>
                          </div>
                          <span className="text-navy font-bold text-xl shrink-0 mr-3">₪{(p.price / 1000000).toFixed(1)}M</span>
                        </div>

                        {m.aiSummary && (
                          <div className="mt-3 flex items-start gap-2 bg-amber-light rounded-xl p-3">
                            <div className="w-5 h-5 bg-amber rounded-full flex items-center justify-center shrink-0 mt-0.5">
                              <Brain className="w-3 h-3 text-white" />
                            </div>
                            <p className="text-xs text-navy/80 leading-relaxed">{m.aiSummary}</p>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {m.matchTags.map((tag) => {
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

                        <div className="flex items-center gap-2 mt-4 flex-wrap">
                          <Link href={`/property/${p.id}`}
                            className="flex items-center gap-1.5 bg-amber text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-amber/90 transition-colors">
                            לנכס <ChevronLeft className="w-4 h-4" />
                          </Link>
                          {m.status === "visited" && (
                            <button
                              onClick={() => setFeedbackPropertyId(p.id)}
                              className="text-sm border border-green-200 text-green-600 px-4 py-2 rounded-xl hover:bg-green-50 transition-colors">
                              השאר פידבק
                            </button>
                          )}
                          <button
                            onClick={() => handleDismiss(m.id)}
                            className="text-sm text-gray-400 hover:text-red-400 transition-colors mr-auto">
                            לא מעניין
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="px-5 pb-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              m.score >= 90 ? "bg-green-500" : m.score >= 75 ? "bg-amber" : "bg-gray-400"
                            }`}
                            style={{ width: `${m.score}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 shrink-0">{m.score}% מהדרישות מתקיימות</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── Alerts ── */}
        {tab === "alerts" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-400">
                {unreadAlerts > 0
                  ? <>יש לך <span className="text-navy font-semibold">{unreadAlerts} התראות שלא נקראו</span></>
                  : <span className="text-navy font-semibold">כל ההתראות נקראו</span>
                }
              </p>
              <button
                onClick={handleMarkAllRead}
                className="text-sm text-amber hover:text-amber/80 transition-colors disabled:opacity-40"
                disabled={unreadAlerts === 0}>
                סמן הכל כנקרא
              </button>
            </div>
            {alerts.length === 0 ? (
              <div className="text-center py-16 text-gray-400 text-sm">אין התראות עדיין</div>
            ) : (
              alerts.map((a) => (
                <div key={a.id}
                  className={`bg-white rounded-2xl border p-4 flex items-start gap-4 hover:shadow-md transition-all ${
                    !a.isRead ? "border-amber/30 bg-amber-light/20" : "border-gray-100"
                  }`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    !a.isRead ? "bg-amber text-white" : "bg-gray-100 text-gray-400"
                  }`}>
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-navy text-sm">{a.title}</h4>
                      {!a.isRead && <div className="w-2 h-2 rounded-full bg-amber shrink-0" />}
                    </div>
                    {a.description && <p className="text-gray-500 text-sm mt-0.5">{a.description}</p>}
                    <p className="text-xs text-gray-400 mt-1.5">{timeAgo(a.createdAt)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Profile ── */}
        {tab === "profile" && (
          <div className="space-y-6">
            {buyerProfile ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-amber" />
                  פרופיל הקונה שלך
                </h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {[
                    { label: "תקציב", value: buyerProfile.budgetMax ? `עד ₪${(buyerProfile.budgetMax / 1000000).toFixed(1)}M` : "—", icon: TrendingUp },
                    { label: "חדרים", value: buyerProfile.roomsMin ? `${buyerProfile.roomsMin}+ חדרים` : "—", icon: Building },
                    { label: "ערים", value: buyerProfile.cities.length ? buyerProfile.cities.join(", ") : "—", icon: MapPin },
                    { label: "ילדים", value: buyerProfile.hasKids ? "כן" : "לא", icon: Baby },
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

                {buyerProfile.semanticTags.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-400 mb-2">תגיות חיפוש</p>
                    <div className="flex flex-wrap gap-1.5">
                      {buyerProfile.semanticTags.map((t) => (
                        <span key={t} className="text-xs bg-amber-light text-amber px-2.5 py-1 rounded-full">{t}</span>
                      ))}
                    </div>
                  </div>
                )}

                {buyerProfile.freeText && (
                  <div className="bg-gray-50 rounded-xl p-3 mb-4">
                    <p className="text-xs text-gray-400 mb-1">בחופשיות</p>
                    <p className="text-sm text-navy/70 italic">&ldquo;{buyerProfile.freeText}&rdquo;</p>
                  </div>
                )}

                <Link href="/profile/preferences"
                  className="block w-full text-center border border-amber text-amber font-medium py-3 rounded-xl hover:bg-amber hover:text-white transition-all text-sm">
                  עדכן פרופיל
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center py-12">
                <Sparkles className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-navy mb-2">אין פרופיל קונה עדיין</h3>
                <p className="text-gray-400 text-sm mb-4">מלא את השאלון ליצירת פרופיל מותאם אישית</p>
                <Link href="/onboarding"
                  className="inline-flex items-center gap-2 bg-amber text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-amber/90 transition-colors">
                  צור פרופיל קונה
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      {feedbackPropertyId && (
        <FeedbackModal
          propertyId={feedbackPropertyId}
          userId={userId}
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

function FeedbackModal({ propertyId, userId, onClose }: { propertyId: string; userId: string | null; onClose: () => void }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [matchRating, setMatchRating] = useState(3);
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const toggleTag = (t: string) =>
    setSelectedTags((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);

  const handleSubmit = async () => {
    if (!userId || rating === 0) return;
    const supabase = (await import("@/lib/supabase/client")).createClient();
    await supabase.from("reviews").insert({
      property_id: propertyId,
      reviewer_id: userId,
      rating,
      text: text || null,
      tags: selectedTags,
      match_rating: matchRating,
    } as never);
    setSubmitted(true);
  };

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
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-3xl z-10">
          <div>
            <h3 className="text-lg font-bold text-navy">פידבק לביקור</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6" dir="rtl">
          <div>
            <label className="block text-sm font-semibold text-navy mb-3">כמה אהבת את הנכס?</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s}
                  onMouseEnter={() => setHoverRating(s)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(s)}
                  className="transition-transform hover:scale-110">
                  <Star className={`w-8 h-8 transition-colors ${s <= (hoverRating || rating) ? "text-amber fill-amber" : "text-gray-300"}`} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-navy mb-3">עד כמה ה-AI דייק בהתאמה?</label>
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
          </div>

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

          <div className="flex items-center gap-3 bg-amber-light rounded-2xl p-4">
            <div className="w-8 h-8 bg-amber rounded-xl flex items-center justify-center shrink-0">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-navy">מאמן את ה-AI שלך</p>
              <p className="text-xs text-gray-500">הפידבק ישפר את ציוני ההתאמה בהתאמות הבאות</p>
            </div>
          </div>

          <button
            disabled={rating === 0}
            onClick={handleSubmit}
            className={`w-full py-3.5 rounded-2xl font-semibold text-sm transition-all ${
              rating > 0 ? "bg-amber text-white hover:bg-amber/90 shadow-md" : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}>
            שלח פידבק
          </button>
        </div>
      </div>
    </div>
  );
}
