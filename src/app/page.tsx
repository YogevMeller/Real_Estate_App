"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Sparkles, ShieldCheck, ArrowLeft, Scan, Loader2, Brain, MessageCircle, BarChart3, Eye, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import PropertyCard from "@/components/PropertyCard";
import { getProperties, type PropertyView } from "@/lib/supabase/queries";

export default function Home() {
  const [properties, setProperties] = useState<PropertyView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProperties(undefined, 6).then((data) => {
      setProperties(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <h1 className="text-6xl font-bold leading-tight tracking-tight">
          <span className="text-navy">נדל״ן,</span>
          <br />
          <span className="text-amber">שקוף לחלוטין</span>
        </h1>
        <p className="mt-5 text-gray-500 text-lg">
          מודיעין נכסים מבוסס AI · תוכניות קומה מדויקות · אפס עמלות תיווך
        </p>

        {/* Search bar */}
        <div className="mt-10 relative max-w-2xl mx-auto">
          <Link href="/search" className="flex items-center bg-white rounded-2xl shadow-lg border border-gray-100 px-5 py-4 gap-3 hover:border-amber hover:ring-2 hover:ring-amber/20 transition-all">
            <div className="bg-amber text-white px-5 py-2 rounded-xl font-medium text-sm shrink-0">
              חיפוש
            </div>
            <span className="flex-1 text-gray-400 text-base text-right">
              4 חדרים עם פוטנציאל שיפוץ ליד תחנת הרכבת הקלה
            </span>
            <Search className="w-5 h-5 text-gray-400 shrink-0" />
          </Link>
          <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
            <span className="text-gray-400 text-sm">פופולרי:</span>
            {["פוטנציאל מטבח פתוח", "ליד הרכבת הקלה", "תקרה גבוהה", "ללא מתווך"].map((tag) => (
              <Link key={tag} href="/search"
                className="text-sm bg-white border border-gray-200 text-navy/70 px-3.5 py-1.5 rounded-full hover:border-amber hover:text-amber transition-colors">
                {tag}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="max-w-5xl mx-auto px-6 pb-20" id="how-it-works">
        <div className="grid grid-cols-3 gap-8 text-center">
          {[
            {
              icon: Sparkles,
              title: "סוכני AI לכל נכס",
              desc: "לכל נכס סוכן AI ייעודי עם ידע מלא על המבנה, השכונה וכל שאלה אפשרית",
            },
            {
              icon: Scan,
              title: "תוכניות LiDAR",
              desc: "תוכניות קומה בדיוק מילימטרי הנוצרות מסריקת תלת-ממד של הנכס",
            },
            {
              icon: ShieldCheck,
              title: "התאמה חכמה",
              desc: "התראות בזמן אמת כאשר נכס חדש תואם בדיוק את הדרישות שלך",
            },
          ].map((f) => (
            <div key={f.title} className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-amber-light rounded-2xl flex items-center justify-center">
                <f.icon className="w-8 h-8 text-amber" />
              </div>
              <h3 className="font-semibold text-navy text-base">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recently Listed */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-navy">נכסים שפורסמו לאחרונה</h2>
          <Link href="/search" className="text-amber font-medium text-sm flex items-center gap-1 hover:gap-2 transition-all">
            <ArrowLeft className="w-4 h-4" />
            לכל הנכסים
          </Link>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-amber animate-spin" />
          </div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-3 gap-6">
            {properties.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400 text-sm">
            <p>אין נכסים פורסמו עדיין. נכסים חדשים יופיעו כאן.</p>
          </div>
        )}
      </section>

      {/* ── How it works ── */}
      <section className="max-w-5xl mx-auto px-6 pb-20" id="how-it-works">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-amber-light text-amber text-sm font-medium px-4 py-1.5 rounded-full mb-4">
            <Brain className="w-4 h-4" />
            טכנולוגיה שמשנה את שוק הנדל״ן
          </div>
          <h2 className="text-3xl font-bold text-navy">איך Agenta עובד?</h2>
          <p className="text-gray-500 mt-2 max-w-xl mx-auto">שילוב של סריקת LiDAR, בינה מלאכותית, ושקיפות מלאה — כדי שתקבל את ההחלטה הכי חכמה.</p>
        </div>

        <div className="space-y-5">
          {[
            { num: "01", title: "סריקת LiDAR תלת-ממדית", desc: "כל נכס נסרק בטכנולוגיית LiDAR מתקדמת שיוצרת מפה תלת-ממדית מדויקת למילימטר. התוצאה: תוכנית קומה אמיתית, לא שרטוט ידני.", icon: Scan, color: "bg-blue-50 text-blue-600" },
            { num: "02", title: "ניתוח AI של המבנה", desc: "האלגוריתם מנתח את הסריקה ומזהה אוטומטית: קירות גבס שניתנים להריסה, כיווני אוויר ושמש, ומצב התשתיות.", icon: Brain, color: "bg-amber-light text-amber" },
            { num: "03", title: "סוכן AI ייעודי לכל נכס", desc: "לכל דירה יש סוכן AI אישי עם ידע מלא על הנכס, השכונה, היסטוריית המחירים, והסביבה. שאל אותו כל שאלה — מ״האם ניתן לפתוח את המטבח?״ ועד ״מה זמן הנסיעה בשעת שיא?״", icon: MessageCircle, color: "bg-green-50 text-green-600" },
            { num: "04", title: "התאמה חכמה לפרופיל שלך", desc: "המערכת סורקת כל נכס חדש ומדרגת אותו לפי 30+ קריטריונים: תקציב, מיקום, גודל, ותגיות כמו ״רחוב שקט״ או ״ליד גן ילדים״.", icon: Sparkles, color: "bg-purple-50 text-purple-600" },
            { num: "05", title: "שקיפות מלאה — אפס תיווך", desc: "אין מתווכים, אין עמלות. כל המידע גלוי: היסטוריית מחירים, עסקאות בבניין, ביקורות קונים, ונתוני שכונה אמיתיים.", icon: ShieldCheck, color: "bg-rose-50 text-rose-600" },
          ].map((step) => (
            <div key={step.num} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-all">
              <div className="flex items-start gap-5">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${step.color}`}>
                  <step.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-300 font-bold">{step.num}</span>
                    <h3 className="text-lg font-bold text-navy">{step.title}</h3>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed mt-1">{step.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-3 gap-4 mt-10">
          {[
            { icon: Eye, title: "תוכנית קומה אמיתית", desc: "סריקת LiDAR ברזולוציה של 1 מ״מ" },
            { icon: BarChart3, title: "היסטוריית מחירים", desc: "גרף מחירים ועסקאות עד 10 שנים" },
            { icon: CheckCircle2, title: "ביקורות מאומתות", desc: "רק קונים שביקרו בפועל יכולים לדרג" },
          ].map((f) => (
            <div key={f.title} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100">
              <div className="w-9 h-9 bg-amber-light rounded-lg flex items-center justify-center shrink-0">
                <f.icon className="w-4 h-4 text-amber" />
              </div>
              <div>
                <h4 className="font-semibold text-navy text-sm">{f.title}</h4>
                <p className="text-gray-400 text-xs mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="mx-6 mb-16 rounded-3xl bg-gradient-to-l from-amber to-yellow-400 text-center py-16 px-8">
        <h2 className="text-3xl font-bold text-white">צור פרופיל קונה</h2>
        <p className="text-white/80 mt-2 text-base">קבל התאמות נכסים אישיות והתראות מיידיות</p>
        <Link href="/onboarding" className="mt-8 inline-block bg-white text-amber font-semibold px-8 py-3.5 rounded-2xl hover:scale-105 transition-transform shadow-lg">
          התחל עכשיו
        </Link>
      </section>
    </div>
  );
}
