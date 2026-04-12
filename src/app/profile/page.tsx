"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Heart, Eye, MessageSquare, MapPin, Settings,
  Star, Clock, CheckCircle2, TrendingUp,
  Maximize2, User, Search,
  CalendarDays, ArrowUpRight, Edit3, Shield, Plus,
  X, Brain, ThumbsUp, Loader2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/client";
import {
  getSavedProperties, getUserVisits, getUserReviews, cancelVisit, submitReview, toggleSaveProperty,
  type PropertyView, type VisitView, type ReviewView,
} from "@/lib/supabase/queries";

type ProfileUser = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  memberSince: string;
  initials: string;
  verified: boolean;
};

type TabType = "saved" | "upcoming" | "history" | "reviews";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabType>("upcoming");
  const [reviewModal, setReviewModal] = useState<VisitView | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Data from DB
  const [profileUser, setProfileUser] = useState<ProfileUser>({
    firstName: "", lastName: "", email: "", phone: "",
    memberSince: "", initials: "?", verified: false,
  });
  const [savedProps, setSavedProps] = useState<PropertyView[]>([]);
  const [upcomingVisits, setUpcomingVisits] = useState<VisitView[]>([]);
  const [pastVisits, setPastVisits] = useState<VisitView[]>([]);
  const [myReviews, setMyReviews] = useState<ReviewView[]>([]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setUserId(user.id);

      // Profile info
      const { data: profile } = await supabase
        .from("profiles").select("*").eq("id", user.id).single() as { data: Record<string, string | boolean | null> | null; error: unknown };
      const firstName = (profile?.first_name as string) || user.user_metadata?.first_name || "";
      const lastName = (profile?.last_name as string) || user.user_metadata?.last_name || "";
      const createdAt = profile?.created_at as string | null;
      setProfileUser({
        firstName, lastName,
        email: user.email || "",
        phone: (profile?.phone as string) || "",
        memberSince: createdAt ? new Date(createdAt).toLocaleDateString("he-IL", { month: "long", year: "numeric" }) : "",
        initials: (firstName[0] || user.email?.[0] || "?").toUpperCase(),
        verified: (profile?.is_verified as boolean) || false,
      });

      // Parallel data fetch
      const [saved, upcoming, past, reviews] = await Promise.all([
        getSavedProperties(user.id),
        getUserVisits(user.id, "upcoming"),
        getUserVisits(user.id, "past"),
        getUserReviews(user.id),
      ]);
      setSavedProps(saved);
      setUpcomingVisits(upcoming);
      setPastVisits(past);
      setMyReviews(reviews);
      setLoading(false);
    })();
  }, []);

  const handleCancelVisit = async (id: string) => {
    setUpcomingVisits((prev) => prev.filter((v) => v.id !== id));
    await cancelVisit(id);
    showToast("הביקור בוטל");
  };

  const handleUnsave = async (propertyId: string) => {
    if (!userId) return;
    setSavedProps((prev) => prev.filter((p) => p.id !== propertyId));
    await toggleSaveProperty(userId, propertyId, false);
    showToast("הנכס הוסר מהשמורים");
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" });
  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });

  const STATS = [
    { icon: Heart, label: "נכסים שמורים", value: savedProps.length, color: "text-rose-500 bg-rose-50" },
    { icon: CalendarDays, label: "ביקורים קרובים", value: upcomingVisits.length, color: "text-blue-500 bg-blue-50" },
    { icon: Eye, label: "ביקורים כולל", value: pastVisits.length, color: "text-purple-500 bg-purple-50" },
    { icon: MessageSquare, label: "חוות דעת", value: myReviews.length, color: "text-amber bg-amber-light" },
  ];

  const NAV_ITEMS: { key: TabType; label: string; icon: React.ComponentType<{ className?: string }>; count?: number }[] = [
    { key: "saved", label: "נכסים שמורים", icon: Heart, count: savedProps.length },
    { key: "upcoming", label: "ביקורים קרובים", icon: CalendarDays, count: upcomingVisits.length },
    { key: "history", label: "היסטוריית ביקורים", icon: Eye, count: pastVisits.length },
    { key: "reviews", label: "חוות דעת שלי", icon: MessageSquare, count: myReviews.length },
  ];

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
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] bg-navy text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-amber shrink-0" />
          {toast}
        </div>
      )}
      <Navbar />

      <div className="max-w-screen-xl mx-auto px-6 py-8">
        <div className="flex gap-7">

          {/* ── RIGHT SIDEBAR ── */}
          <aside className="w-72 shrink-0">
            <div className="sticky top-22 space-y-4" style={{ top: "80px" }}>

              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-amber to-yellow-400 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-sm">
                      {profileUser.initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h2 className="font-bold text-navy text-lg leading-tight">
                          {profileUser.firstName} {profileUser.lastName}
                        </h2>
                        {profileUser.verified && <Shield className="w-3.5 h-3.5 text-green-500 shrink-0" />}
                      </div>
                      <p className="text-gray-400 text-xs mt-0.5">{profileUser.email}</p>
                      {profileUser.phone && <p className="text-gray-400 text-xs">{profileUser.phone}</p>}
                    </div>
                  </div>
                  <Link href="/profile/settings"
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
                    <Settings className="w-4 h-4 text-gray-400" />
                  </Link>
                </div>
                {profileUser.memberSince && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 pt-3 border-t border-gray-50">
                    <Clock className="w-3.5 h-3.5" />
                    <span>חבר מאז {profileUser.memberSince}</span>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-4">
                <div className="grid grid-cols-2 gap-3">
                  {STATS.map((s) => (
                    <div key={s.label} className="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-xl">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${s.color}`}>
                        <s.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-lg font-bold text-navy leading-none">{s.value}</div>
                        <div className="text-xs text-gray-400 leading-tight mt-0.5">{s.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-2">
                {NAV_ITEMS.map((item) => (
                  <button key={item.key} onClick={() => setActiveTab(item.key)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-right ${
                      activeTab === item.key ? "bg-amber text-white" : "text-navy/70 hover:bg-gray-50 hover:text-navy"
                    }`}>
                    <item.icon className={`w-4 h-4 shrink-0 ${activeTab === item.key ? "text-white" : "text-gray-400"}`} />
                    <span className="flex-1">{item.label}</span>
                    {item.count !== undefined && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-normal ${
                        activeTab === item.key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                      }`}>{item.count}</span>
                    )}
                  </button>
                ))}
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-2">
                <Link href="/profile/preferences" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-navy/70 hover:bg-gray-50 hover:text-navy transition-all">
                  <Edit3 className="w-4 h-4 text-gray-400 shrink-0" /><span>עדכן העדפות חיפוש</span>
                </Link>
                <Link href="/matches" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-navy/70 hover:bg-gray-50 hover:text-navy transition-all">
                  <Brain className="w-4 h-4 text-gray-400 shrink-0" /><span>ההתאמות שלי</span>
                </Link>
                <Link href="/search" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-navy/70 hover:bg-gray-50 hover:text-navy transition-all">
                  <Search className="w-4 h-4 text-gray-400 shrink-0" /><span>חיפוש נכסים</span>
                </Link>
                <Link href="/profile/settings" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-navy/70 hover:bg-gray-50 hover:text-navy transition-all">
                  <Settings className="w-4 h-4 text-gray-400 shrink-0" /><span>הגדרות חשבון</span>
                </Link>
              </div>
            </div>
          </aside>

          {/* ── MAIN CONTENT ── */}
          <main className="flex-1 min-w-0 space-y-5">

            {/* ─── SAVED PROPERTIES ─── */}
            {activeTab === "saved" && (
              <div>
                <SectionHeader
                  title={`נכסים שמורים (${savedProps.length})`}
                  sub="נכסים שסימנת כמועדפים"
                  action={<Link href="/search" className="flex items-center gap-1 text-sm text-amber font-medium hover:text-amber/80"><Plus className="w-4 h-4" />חפש נכסים נוספים</Link>}
                />
                {savedProps.length === 0 ? (
                  <div className="text-center py-16 text-gray-400 text-sm">
                    <Heart className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p>אין נכסים שמורים עדיין</p>
                    <Link href="/search" className="text-amber hover:text-amber/80 mt-2 inline-block">חפש נכסים</Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4">
                    {savedProps.map((p) => (
                      <div key={p.id} className="bg-white rounded-2xl border border-gray-100 hover:border-amber/30 hover:shadow-md transition-all overflow-hidden group">
                        <div className="relative h-40 bg-amber-light overflow-hidden">
                          <Image src={p.photos[0] || "/lidar.jpg"} alt={p.address} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-gradient-to-t from-navy/40 to-transparent" />
                          <button onClick={() => handleUnsave(p.id)}
                            className="absolute top-2.5 left-2.5 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors" title="הסר מהשמורים">
                            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                          </button>
                          <div className="absolute bottom-2.5 right-2.5">
                            <span className="text-white font-bold text-sm drop-shadow">₪{(p.price / 1000000).toFixed(1)}M</span>
                          </div>
                        </div>
                        <div className="p-3.5">
                          <h3 className="font-semibold text-navy text-sm">{p.address}</h3>
                          <div className="flex items-center gap-1 text-gray-400 text-xs mt-0.5">
                            <MapPin className="w-3 h-3" />{p.city}
                          </div>
                          <div className="flex items-center gap-2 mt-2 text-xs text-navy/60">
                            <span>{p.rooms} חד׳</span>
                            <span>·</span>
                            <span className="flex items-center gap-0.5"><Maximize2 className="w-3 h-3" />{p.sqm} מ״ר</span>
                          </div>
                          <Link href={`/property/${p.id}`}
                            className="mt-3 flex items-center justify-center gap-1 w-full py-2 rounded-xl bg-gray-50 hover:bg-amber-light hover:text-amber text-xs font-medium text-navy/60 transition-all border border-gray-100">
                            <TrendingUp className="w-3.5 h-3.5" />לנכס
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ─── UPCOMING VISITS ─── */}
            {activeTab === "upcoming" && (
              <div>
                <SectionHeader title={`ביקורים קרובים (${upcomingVisits.length})`} sub="צפיות שקבעת עם מוכרים" />
                {upcomingVisits.length > 0 ? (
                  <>
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center gap-3 mb-5">
                      <CalendarDays className="w-5 h-5 text-blue-500 shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-navy">יש לך {upcomingVisits.length} ביקורים קרובים</p>
                        <p className="text-xs text-gray-500 mt-0.5">הביקור הקרוב — {upcomingVisits[0].address}, {formatDate(upcomingVisits[0].scheduledAt)}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {upcomingVisits.map((v) => (
                        <div key={v.id} className="bg-white rounded-2xl border border-gray-100 hover:border-amber/20 transition-all p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <MapPin className="w-4 h-4 text-amber shrink-0" />
                                <h3 className="font-semibold text-navy">{v.address}, {v.city}</h3>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-500 mt-2 flex-wrap">
                                <span className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5 text-gray-400" />{formatDate(v.scheduledAt)}</span>
                                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-gray-400" />{formatTime(v.scheduledAt)}</span>
                                {v.sellerName && <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-gray-400" />עם {v.sellerName}</span>}
                              </div>
                              <div className="flex items-center gap-3 mt-3 text-xs text-navy/60">
                                <span>{v.rooms} חד׳</span><span>·</span><span>{v.sqm} מ״ר</span><span>·</span><span>₪{(v.price / 1000000).toFixed(1)}M</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2 shrink-0">
                              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                v.status === "confirmed" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"
                              }`}>
                                {v.status === "confirmed" ? "מאושר" : "ממתין לאישור"}
                              </span>
                              <Link href={`/property/${v.propertyId}`}
                                className="flex items-center gap-1 text-xs text-amber font-medium hover:text-amber/80 transition-colors">
                                פרטים <ArrowUpRight className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-50">
                            <button onClick={() => showToast("בקשת שינוי שעה נשלחה למוכר")}
                              className="flex items-center gap-1.5 text-xs border border-gray-200 text-navy px-3 py-2 rounded-xl hover:border-amber hover:text-amber transition-colors">
                              <Edit3 className="w-3.5 h-3.5" />שנה שעה
                            </button>
                            <button onClick={() => handleCancelVisit(v.id)}
                              className="flex items-center gap-1.5 text-xs text-red-400 px-3 py-2 rounded-xl hover:bg-red-50 transition-colors mr-auto">
                              <X className="w-3.5 h-3.5" />בטל ביקור
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-16 text-gray-400 text-sm">
                    <CalendarDays className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p>אין ביקורים קרובים</p>
                  </div>
                )}
              </div>
            )}

            {/* ─── VISIT HISTORY ─── */}
            {activeTab === "history" && (
              <div>
                <SectionHeader title={`היסטוריית ביקורים (${pastVisits.length})`} sub="נכסים שביקרת בהם בעבר" />
                {pastVisits.length === 0 ? (
                  <div className="text-center py-16 text-gray-400 text-sm">
                    <Eye className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p>אין היסטוריית ביקורים</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pastVisits.map((v) => (
                      <div key={v.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-200 transition-all">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <MapPin className="w-4 h-4 text-amber shrink-0" />
                              <h3 className="font-semibold text-navy">{v.address}, {v.city}</h3>
                            </div>
                            <div className="flex items-center gap-3 mt-2">
                              <div className="flex items-center gap-1 text-xs text-gray-400">
                                <CalendarDays className="w-3.5 h-3.5" />
                                {formatDate(v.scheduledAt)}
                              </div>
                            </div>
                            <div className="flex items-center gap-3 mt-2 text-xs text-navy/60">
                              <span>{v.rooms} חד׳</span><span>·</span><span>{v.sqm} מ״ר</span><span>·</span><span>₪{(v.price / 1000000).toFixed(1)}M</span>
                            </div>
                          </div>
                          <button onClick={() => setReviewModal(v)}
                            className="flex items-center gap-1 text-xs bg-amber text-white px-3 py-1.5 rounded-full hover:bg-amber/90 transition-colors font-medium">
                            <Edit3 className="w-3 h-3" />השאר חוות דעת
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ─── MY REVIEWS ─── */}
            {activeTab === "reviews" && (
              <div>
                <SectionHeader title={`חוות דעת שלי (${myReviews.length})`} sub="ביקורות שכתבת על נכסים" />
                {myReviews.length === 0 ? (
                  <div className="text-center py-16 text-gray-400 text-sm">
                    <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p>עוד לא כתבת חוות דעת</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myReviews.map((r) => (
                      <div key={r.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1.5">
                              <MapPin className="w-4 h-4 text-amber shrink-0" />
                              <span className="font-semibold text-navy">{r.address}, {r.city}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex gap-0.5">
                                {[1,2,3,4,5].map((s) => (
                                  <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? "text-amber fill-amber" : "text-gray-200"}`} />
                                ))}
                              </div>
                              <span className="text-xs text-gray-400">{formatDate(r.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        {r.text && <p className="text-sm text-gray-600 leading-relaxed mt-3">{r.text}</p>}
                        {r.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {r.tags.map((t) => (
                              <span key={t} className="text-xs bg-amber-light text-amber px-2 py-0.5 rounded-full">{t}</span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                          <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>{r.helpfulCount} אנשים מצאו את זה מועיל</span>
                          </div>
                          <Link href={`/property/${r.propertyId}`}
                            className="text-xs text-amber font-medium hover:text-amber/80 flex items-center gap-1">
                            לנכס <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </main>
        </div>
      </div>

      {/* ── Review write modal ── */}
      {reviewModal && userId && (
        <WriteReviewModal
          visit={reviewModal}
          userId={userId}
          onClose={() => setReviewModal(null)}
          onSubmitted={(review) => {
            setMyReviews((prev) => [review, ...prev]);
            showToast("חוות הדעת פורסמה");
          }}
        />
      )}
    </div>
  );
}

function SectionHeader({ title, sub, action }: { title: string; sub: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between mb-5">
      <div>
        <h2 className="text-xl font-bold text-navy">{title}</h2>
        <p className="text-gray-400 text-sm mt-0.5">{sub}</p>
      </div>
      {action}
    </div>
  );
}

const REVIEW_TAGS = [
  "רועש מהרחוב", "זקוק לשיפוץ", "תמונות לא מדויקות",
  "קטן מהציפיות", "גדול מהציפיות", "שכנים נחמדים",
  "בניין מוזנח", "אור טבעי מצוין", "שקט מאוד",
];

function WriteReviewModal({ visit, userId, onClose, onSubmitted }: {
  visit: VisitView;
  userId: string;
  onClose: () => void;
  onSubmitted: (review: ReviewView) => void;
}) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  const toggleTag = (t: string) =>
    setTags((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);

  const handleSubmit = async () => {
    if (rating === 0 || saving) return;
    setSaving(true);
    await submitReview({
      propertyId: visit.propertyId,
      reviewerId: userId,
      visitId: visit.id,
      rating,
      text: text || undefined,
      tags,
    });
    onSubmitted({
      id: crypto.randomUUID(),
      propertyId: visit.propertyId,
      address: visit.address,
      city: visit.city,
      rating,
      text: text || null,
      tags,
      helpfulCount: 0,
      createdAt: new Date().toISOString(),
    });
    setSaving(false);
    setDone(true);
  };

  if (done) {
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center" onClick={(e) => e.stopPropagation()}>
          <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-navy mb-2">תודה!</h3>
          <p className="text-gray-500 text-sm">חוות הדעת שלך פורסמה ותעזור לקונים אחרים.</p>
          <button onClick={onClose} className="mt-5 w-full bg-navy text-white py-3 rounded-2xl font-medium text-sm">סגור</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-3xl">
          <div>
            <h3 className="text-lg font-bold text-navy">כתיבת חוות דעת</h3>
            <p className="text-xs text-gray-400 mt-0.5">{visit.address}, {visit.city}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        <div className="p-6 space-y-5" dir="rtl">
          <div>
            <label className="block text-sm font-semibold text-navy mb-3">דירוג כללי</label>
            <div className="flex gap-2">
              {[1,2,3,4,5].map((s) => (
                <button key={s} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)} onClick={() => setRating(s)}
                  className="transition-transform hover:scale-110">
                  <Star className={`w-8 h-8 ${s <= (hover || rating) ? "text-amber fill-amber" : "text-gray-300"}`} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-navy mb-3">מה שמת לב?</label>
            <div className="flex flex-wrap gap-2">
              {REVIEW_TAGS.map((t) => (
                <button key={t} onClick={() => toggleTag(t)}
                  className={`px-3 py-1.5 rounded-full text-xs border-2 transition-all ${
                    tags.includes(t) ? "border-amber bg-amber text-white" : "border-gray-200 text-navy/60 hover:border-amber/40"
                  }`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-navy mb-2">כתוב את חוות דעתך</label>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4}
              placeholder="ספר לקונים אחרים מה מצאת בביקור..."
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm text-navy placeholder-gray-300 resize-none focus:outline-none focus:border-amber transition-colors" />
          </div>
          <button
            disabled={rating === 0 || saving}
            onClick={handleSubmit}
            className={`w-full py-3.5 rounded-2xl font-semibold text-sm transition-all ${
              rating > 0 ? "bg-amber text-white hover:bg-amber/90 shadow-md" : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}>
            {saving ? "שומר..." : "פרסם חוות דעת"}
          </button>
        </div>
      </div>
    </div>
  );
}
