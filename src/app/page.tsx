import Link from "next/link";
import { Search, Sparkles, TrendingUp, ShieldCheck, ArrowLeft, Building, Scan } from "lucide-react";
import Navbar from "@/components/Navbar";
import PropertyCard from "@/components/PropertyCard";
import { properties } from "@/lib/mockData";

export default function Home() {
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
          <div className="flex items-center bg-white rounded-2xl shadow-lg border border-gray-100 px-5 py-4 gap-3 focus-within:border-amber focus-within:ring-2 focus-within:ring-amber/20 transition-all">
            <button className="bg-amber text-white px-5 py-2 rounded-xl font-medium text-sm hover:bg-amber/90 transition-colors shrink-0">
              חיפוש
            </button>
            <input
              type="text"
              placeholder="4 חדרים עם פוטנציאל שיפוץ ליד תחנת הרכבת הקלה"
              className="flex-1 text-navy text-base bg-transparent outline-none placeholder-gray-400 text-right"
              dir="rtl"
            />
            <Search className="w-5 h-5 text-gray-400 shrink-0" />
          </div>
          {/* Popular tags */}
          <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
            <span className="text-gray-400 text-sm">פופולרי:</span>
            {["פוטנציאל מטבח פתוח", "ליד הרכבת הקלה", "תקרה גבוהה", "ללא מתווך"].map((tag) => (
              <button
                key={tag}
                className="text-sm bg-white border border-gray-200 text-navy/70 px-3.5 py-1.5 rounded-full hover:border-amber hover:text-amber transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
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
        <div className="grid grid-cols-3 gap-6">
          {properties.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="mx-6 mb-16 rounded-3xl bg-gradient-to-l from-amber to-yellow-400 text-center py-16 px-8">
        <h2 className="text-3xl font-bold text-white">צור פרופיל קונה</h2>
        <p className="text-white/80 mt-2 text-base">קבל התאמות נכסים אישיות והתראות מיידיות</p>
        <button className="mt-8 bg-white text-amber font-semibold px-8 py-3.5 rounded-2xl hover:scale-105 transition-transform shadow-lg">
          התחל עכשיו
        </button>
      </section>
    </div>
  );
}
