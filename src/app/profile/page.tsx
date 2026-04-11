"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Heart, Calendar, Eye, MessageSquare, MapPin, Settings,
  Star, Clock, CheckCircle2, ChevronLeft, TrendingUp,
  Maximize2, User, Bell, LogOut, Home, Search,
  CalendarDays, ArrowUpRight, Edit3, Shield, Plus,
  X, Brain, ThumbsUp,
} from "lucide-react";
import { properties, reviews } from "@/lib/mockData";

// ── Mock user data ─────────────────────────────────────────────────────────────
const MOCK_USER = {
  firstName: "רועי",
  lastName: "כהן",
  email: "roi@example.com",
  phone: "050-1234567",
  memberSince: "ינואר 2025",
  initials: "R",
  verified: true,
};

const UPCOMING_VISITS = [
  {
    id: "v1", propertyId: "arlozorov-45",
    address: "רח׳ ארלוזורוב 45", city: "תל אביב",
    date: "15 באפריל 2026", time: "14:00", seller: "ירון",
    status: "confirmed", rooms: 4, sqm: 87, price: 3200000,
  },
  {
    id: "v2", propertyId: "rothschild-120",
    address: "שד׳ רוטשילד 120", city: "תל אביב",
    date: "18 באפריל 2026", time: "16:30", seller: "שרה",
    status: "pending", rooms: 5, sqm: 120, price: 4500000,
  },
];

const VISIT_HISTORY = [
  {
    id: "h1", propertyId: "dizengoff-78",
    address: "רח׳ דיזנגוף 78", city: "תל אביב",
    date: "5 באפריל 2026", rating: 4, hasReview: true,
    rooms: 3, sqm: 75, price: 2800000,
  },
  {
    id: "h2", propertyId: "ben-yehuda-234",
    address: "רח׳ בן יהודה 234", city: "תל אביב",
    date: "28 במרץ 2026", rating: 2, hasReview: false,
    rooms: 3, sqm: 68, price: 2600000,
  },
  {
    id: "h3", propertyId: "arlozorov-45",
    address: "רח׳ אלנבי 56", city: "תל אביב",
    date: "12 במרץ 2026", rating: 5, hasReview: true,
    rooms: 4, sqm: 90, price: 3100000,
  },
];

const MY_REVIEWS = [
  {
    id: "mr1", propertyId: "dizengoff-78",
    address: "רח׳ דיזנגוף 78", city: "תל אביב",
    date: "6 באפריל 2026", rating: 4, helpful: 12,
    text: "דירה מרווחת עם אור טבעי מצוין. המטבח קטן קצת אבל הסלון מאוד גדול. המיקום פנטסטי — קרוב לכל מה שצריך.",
  },
  {
    id: "mr2", propertyId: "arlozorov-45",
    address: "רח׳ אלנבי 56", city: "תל אביב",
    date: "13 במרץ 2026", rating: 5, helpful: 8,
    text: "דירה מושלמת! שופצה לאחרונה, תקרות גבוהות ויש אפשרות להרחיב את המטבח. המוכר היה מאוד שקוף ומועיל.",
  },
];

type TabType = "saved" | "upcoming" | "history" | "reviews";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabType>("upcoming");
  const [reviewModal, setReviewModal] = useState<typeof VISIT_HISTORY[0] | null>(null);

  const savedProperties = properties;

  const STATS = [
    { icon: Heart, label: "נכסים שמורים", value: savedProperties.length, color: "text-rose-500 bg-rose-50" },
    { icon: CalendarDays, label: "ביקורים קרובים", value: UPCOMING_VISITS.length, color: "text-blue-500 bg-blue-50" },
    { icon: Eye, label: "ביקורים כולל", value: VISIT_HISTORY.length, color: "text-purple-500 bg-purple-50" },
    { icon: MessageSquare, label: "חוות דעת", value: MY_REVIEWS.length, color: "text-amber bg-amber-light" },
  ];

  const NAV_ITEMS: { key: TabType; label: string; icon: React.ComponentType<{ className?: string }>; count?: number }[] = [
    { key: "saved", label: "נכסים שמורים", icon: Heart, count: savedProperties.length },
    { key: "upcoming", label: "ביקורים קרובים", icon: CalendarDays, count: UPCOMING_VISITS.length },
    { key: "history", label: "היסטוריית ביקורים", icon: Eye, count: VISIT_HISTORY.length },
    { key: "reviews", label: "חוות דעת שלי", icon: MessageSquare, count: MY_REVIEWS.length },
  ];

  return (
    <div className="min-h-screen bg-cream">
      {/* Top nav */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber rounded-lg flex items-center justify-center">
              <Home className="w-4 h-4 text-white" />
            </div>
            <span className="text-navy font-bold text-base tracking-tight">Agenta</span>
          </Link>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/search" className="text-navy/60 hover:text-navy transition-colors">חיפוש</Link>
            <Link href="/matches" className="text-navy/60 hover:text-navy transition-colors">התאמות</Link>
            <Link href="/sell" className="text-navy/60 hover:text-navy transition-colors">מכירה</Link>
            <button className="relative w-8 h-8 flex items-center justify-center rounded-full hover:bg-amber-light transition-colors">
              <Bell className="w-4 h-4 text-navy/60" />
              <span className="absolute top-1 left-1 w-2 h-2 bg-amber rounded-full" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-screen-xl mx-auto px-6 py-8">
        <div className="flex gap-7">

          {/* ── RIGHT SIDEBAR (first child = rightmost in RTL) ── */}
          <aside className="w-72 shrink-0">
            <div className="sticky top-22 space-y-4" style={{ top: "80px" }}>

              {/* User card */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-amber to-yellow-400 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-sm">
                      {MOCK_USER.initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h2 className="font-bold text-navy text-lg leading-tight">
                          {MOCK_USER.firstName} {MOCK_USER.lastName}
                        </h2>
                        {MOCK_USER.verified && (
                          <Shield className="w-3.5 h-3.5 text-green-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-gray-400 text-xs mt-0.5">{MOCK_USER.email}</p>
                      <p className="text-gray-400 text-xs">{MOCK_USER.phone}</p>
                    </div>
                  </div>
                  <Link href="/profile/settings"
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
                    <Settings className="w-4 h-4 text-gray-400" />
                  </Link>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-gray-400 pt-3 border-t border-gray-50">
                  <Clock className="w-3.5 h-3.5" />
                  <span>חבר מאז {MOCK_USER.memberSince}</span>
                </div>
              </div>

              {/* Stats */}
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

              {/* Navigation */}
              <div className="bg-white rounded-2xl border border-gray-100 p-2">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setActiveTab(item.key)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-right ${
                      activeTab === item.key
                        ? "bg-amber text-white"
                        : "text-navy/70 hover:bg-gray-50 hover:text-navy"
                    }`}
                  >
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

              {/* Quick links */}
              <div className="bg-white rounded-2xl border border-gray-100 p-2">
                <Link href="/profile/preferences"
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-navy/70 hover:bg-gray-50 hover:text-navy transition-all">
                  <Edit3 className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>עדכן העדפות חיפוש</span>
                </Link>
                <Link href="/matches"
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-navy/70 hover:bg-gray-50 hover:text-navy transition-all">
                  <Brain className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>ההתאמות שלי</span>
                </Link>
                <Link href="/search"
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-navy/70 hover:bg-gray-50 hover:text-navy transition-all">
                  <Search className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>חיפוש נכסים</span>
                </Link>
                <Link href="/profile/settings"
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-navy/70 hover:bg-gray-50 hover:text-navy transition-all">
                  <Settings className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>הגדרות חשבון</span>
                </Link>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-50 transition-all">
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span>התנתק</span>
                </button>
              </div>
            </div>
          </aside>

          {/* ── MAIN CONTENT ── */}
          <main className="flex-1 min-w-0 space-y-5">

            {/* ─── SAVED PROPERTIES ─── */}
            {activeTab === "saved" && (
              <div>
                <SectionHeader
                  title={`נכסים שמורים (${savedProperties.length})`}
                  sub="נכסים שסימנת כמועדפים"
                  action={<Link href="/search" className="flex items-center gap-1 text-sm text-amber font-medium hover:text-amber/80"><Plus className="w-4 h-4" />חפש נכסים נוספים</Link>}
                />
                <div className="grid grid-cols-3 gap-4">
                  {savedProperties.map((p) => (
                    <div key={p.id} className="bg-white rounded-2xl border border-gray-100 hover:border-amber/30 hover:shadow-md transition-all overflow-hidden group">
                      <div className="relative h-40 bg-amber-light overflow-hidden">
                        <Image src={p.photos[0]} alt={p.address} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-navy/40 to-transparent" />
                        <button className="absolute top-2.5 left-2.5 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors">
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
              </div>
            )}

            {/* ─── UPCOMING VISITS ─── */}
            {activeTab === "upcoming" && (
              <div>
                <SectionHeader
                  title={`ביקורים קרובים (${UPCOMING_VISITS.length})`}
                  sub="צפיות שקבעת עם מוכרים"
                />

                {/* Calendar hint */}
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center gap-3 mb-5">
                  <CalendarDays className="w-5 h-5 text-blue-500 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-navy">יש לך {UPCOMING_VISITS.length} ביקורים השבוע</p>
                    <p className="text-xs text-gray-500 mt-0.5">הביקור הקרוב — {UPCOMING_VISITS[0].address}, {UPCOMING_VISITS[0].date} בשעה {UPCOMING_VISITS[0].time}</p>
                  </div>
                  <button className="text-xs text-blue-600 font-medium hover:text-blue-700">סנכרן ליומן</button>
                </div>

                <div className="space-y-3">
                  {UPCOMING_VISITS.map((v) => (
                    <div key={v.id} className="bg-white rounded-2xl border border-gray-100 hover:border-amber/20 transition-all p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin className="w-4 h-4 text-amber shrink-0" />
                            <h3 className="font-semibold text-navy">{v.address}, {v.city}</h3>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-2 flex-wrap">
                            <span className="flex items-center gap-1.5">
                              <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                              {v.date}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-gray-400" />
                              {v.time}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-gray-400" />
                              עם {v.seller}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-3 text-xs text-navy/60">
                            <span>{v.rooms} חד׳</span>
                            <span>·</span>
                            <span>{v.sqm} מ״ר</span>
                            <span>·</span>
                            <span>₪{(v.price / 1000000).toFixed(1)}M</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            v.status === "confirmed"
                              ? "bg-green-100 text-green-600"
                              : "bg-gray-100 text-gray-500"
                          }`}>
                            {v.status === "confirmed" ? "מאושר" : "ממתין לאישור"}
                          </span>
                          <Link href={`/property/${v.propertyId}`}
                            className="flex items-center gap-1 text-xs text-amber font-medium hover:text-amber/80 transition-colors">
                            פרטים <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-50">
                        <button className="flex items-center gap-1.5 text-xs border border-gray-200 text-navy px-3 py-2 rounded-xl hover:border-amber hover:text-amber transition-colors">
                          <Edit3 className="w-3.5 h-3.5" />שנה שעה
                        </button>
                        <button className="flex items-center gap-1.5 text-xs border border-gray-200 text-navy px-3 py-2 rounded-xl hover:border-amber hover:text-amber transition-colors">
                          <MessageSquare className="w-3.5 h-3.5" />שלח הודעה למוכר
                        </button>
                        <button className="flex items-center gap-1.5 text-xs text-red-400 px-3 py-2 rounded-xl hover:bg-red-50 transition-colors mr-auto">
                          <X className="w-3.5 h-3.5" />בטל ביקור
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── VISIT HISTORY ─── */}
            {activeTab === "history" && (
              <div>
                <SectionHeader
                  title={`היסטוריית ביקורים (${VISIT_HISTORY.length})`}
                  sub="נכסים שביקרת בהם בעבר"
                />
                <div className="space-y-3">
                  {VISIT_HISTORY.map((v) => (
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
                              {v.date}
                            </div>
                            <div className="flex gap-0.5">
                              {[1,2,3,4,5].map((s) => (
                                <Star key={s} className={`w-3.5 h-3.5 ${s <= v.rating ? "text-amber fill-amber" : "text-gray-200"}`} />
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-xs text-navy/60">
                            <span>{v.rooms} חד׳</span>
                            <span>·</span>
                            <span>{v.sqm} מ״ר</span>
                            <span>·</span>
                            <span>₪{(v.price / 1000000).toFixed(1)}M</span>
                          </div>
                        </div>
                        <div className="shrink-0">
                          {v.hasReview ? (
                            <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                              <CheckCircle2 className="w-3 h-3" />נכתבה חוות דעת
                            </span>
                          ) : (
                            <button
                              onClick={() => setReviewModal(v)}
                              className="flex items-center gap-1 text-xs bg-amber text-white px-3 py-1.5 rounded-full hover:bg-amber/90 transition-colors font-medium">
                              <Edit3 className="w-3 h-3" />השאר חוות דעת
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── MY REVIEWS ─── */}
            {activeTab === "reviews" && (
              <div>
                <SectionHeader
                  title={`חוות דעת שלי (${MY_REVIEWS.length})`}
                  sub="ביקורות שכתבת על נכסים"
                />
                <div className="space-y-4">
                  {MY_REVIEWS.map((r) => (
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
                            <span className="text-xs text-gray-400">{r.date}</span>
                          </div>
                        </div>
                        <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-amber transition-colors">
                          <Edit3 className="w-3.5 h-3.5" />ערוך
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed mt-3">{r.text}</p>
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>{r.helpful} אנשים מצאו את זה מועיל</span>
                        </div>
                        <Link href={`/property/${r.propertyId}`}
                          className="text-xs text-amber font-medium hover:text-amber/80 flex items-center gap-1">
                          לנכס <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </main>
        </div>
      </div>

      {/* ── Review write modal ── */}
      {reviewModal && (
        <WriteReviewModal visit={reviewModal} onClose={() => setReviewModal(null)} />
      )}
    </div>
  );
}

// ── Section header ─────────────────────────────────────────────────────────────
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

// ── Write review modal ─────────────────────────────────────────────────────────
const REVIEW_TAGS = [
  "רועש מהרחוב", "זקוק לשיפוץ", "תמונות לא מדויקות",
  "קטן מהציפיות", "גדול מהציפיות", "שכנים נחמדים",
  "בניין מוזנח", "אור טבעי מצוין", "שקט מאוד",
];

function WriteReviewModal({ visit, onClose }: {
  visit: typeof VISIT_HISTORY[0];
  onClose: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);

  const toggleTag = (t: string) =>
    setTags((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);

  if (done) {
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center" onClick={(e) => e.stopPropagation()}>
          <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-navy mb-2">תודה!</h3>
          <p className="text-gray-500 text-sm">חוות הדעת שלך פורסמה ותעזור לקונים אחרים.</p>
          <div className="flex items-center gap-2 mt-4 p-3 bg-amber-light rounded-xl text-sm text-navy/80">
            <Brain className="w-4 h-4 text-amber shrink-0" />
            ה-AI שלך למד מהפידבק ומעדכן את ציוני ההתאמה שלך
          </div>
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
                <button key={s}
                  onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(s)}
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
            disabled={rating === 0}
            onClick={() => setDone(true)}
            className={`w-full py-3.5 rounded-2xl font-semibold text-sm transition-all ${
              rating > 0 ? "bg-amber text-white hover:bg-amber/90 shadow-md" : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}>
            פרסם חוות דעת
          </button>
        </div>
      </div>
    </div>
  );
}
