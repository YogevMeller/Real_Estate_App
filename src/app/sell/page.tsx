import { Scan, Zap, TrendingUp, ShieldCheck, CheckCircle2, Smartphone } from "lucide-react";
import Navbar from "@/components/Navbar";

const STEPS = [
  {
    num: "01",
    title: "מלא את השאלון החכם",
    desc: "טופס מודרך של 15 דקות: פרטי מבנה, שיפוצים, חניה, ועד בית, וכל מה שקונה עשוי לשאול. ה-AI שלנו הופך את זה לבסיס הידע של הנכס שלך.",
  },
  {
    num: "02",
    title: "סרוק עם LiDAR",
    desc: "פתח את האפליקציה שלנו על iPhone או iPad Pro וסרוק את הדירה. תוך 5 דקות נייצר תוכנית קומה מדויקת ומודל תלת-ממדי אינטראקטיבי.",
  },
  {
    num: "03",
    title: "סוכן ה-AI שלך עולה לאוויר",
    desc: 'הנכס שלך מקבל סוכן AI ייעודי — ״סוכן [הכתובת]״ — שעונה על שאלות קונים 24/7 עם דיוק של 100%.',
  },
  {
    num: "04",
    title: "קונים מגיעים אליך",
    desc: "קונים תואמים משוחחים עם הסוכן, בוחנים את תוכנית הקומה ומזמינים ביקורים ישירות ביומן שלך. ללא שיחות קרות. ללא עמלות.",
  },
];

export default function SellPage() {
  return (
    <div className="min-h-screen bg-cream">
      <Navbar />

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-20 grid grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-5xl font-bold text-navy leading-tight">
            מכור את הנכס שלך
            <br />
            <span className="text-amber">ללא מתווך</span>
          </h1>
          <p className="text-gray-500 mt-4 text-lg leading-relaxed">
            פלטפורמת נדל״ן מהפכנית מבוססת AI. תוכניות LiDAR מדויקות.
            התאמה ישירה לקונים. אפס עמלות תיווך.
          </p>
          <button className="mt-8 bg-amber text-white font-semibold px-8 py-4 rounded-2xl hover:bg-amber/90 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]">
            פרסם את הנכס שלי
          </button>
          <div className="flex gap-10 mt-10">
            {[
              { value: "0%", label: "עמלות" },
              { value: "15 דק׳", label: "זמן הגדרה" },
              { value: "24/7", label: "סוכן AI" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-bold text-amber">{s.value}</div>
                <div className="text-sm text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-bl from-amber to-yellow-400 rounded-3xl h-96 flex items-center justify-center">
          <div className="text-center text-white">
            <Smartphone className="w-20 h-20 mx-auto mb-4 opacity-80" />
            <p className="font-medium opacity-80 text-sm">סריקת LiDAR בתהליך</p>
            <div className="mt-3 flex justify-center gap-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-white opacity-60 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Why PropData */}
      <section className="bg-white py-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-navy">למה מוכרים בוחרים ב-Agenta</h2>
          <p className="text-gray-400 mt-2">הדרך החכמה יותר למכור נדל״ן</p>
          <div className="grid grid-cols-4 gap-8 mt-12">
            {[
              { icon: Scan, title: "תוכניות LiDAR", desc: "צור תוכניות קומה מדויקות עם הטלפון שלך תוך דקות" },
              { icon: Zap, title: "מודעות מבוססות AI", desc: "כל נכס מקבל סוכן חכם שעונה לקונים 24/7" },
              { icon: TrendingUp, title: "התאמה חכמה", desc: "ה-AI שלנו מתאים באופן פעיל את הנכס לקונים מתאימים" },
              { icon: ShieldCheck, title: "אפס עמלות", desc: "שמור 100% מהתמורה. ללא עלויות נסתרות." },
            ].map((f) => (
              <div key={f.title} className="text-center">
                <div className="w-14 h-14 bg-amber-light rounded-2xl flex items-center justify-center mx-auto">
                  <f.icon className="w-7 h-7 text-amber" />
                </div>
                <h3 className="font-semibold text-navy mt-3 text-sm">{f.title}</h3>
                <p className="text-gray-400 text-xs mt-1.5 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-navy text-center">פרסום ב-4 שלבים פשוטים</h2>
        <p className="text-gray-400 text-center mt-2">מהגדרה לשידור חי תוך פחות מ-20 דקות</p>
        <div className="mt-12 space-y-6">
          {STEPS.map((step) => (
            <div key={step.num} className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-amber rounded-2xl flex items-center justify-center shrink-0 font-bold text-white text-sm">
                {step.num}
              </div>
              <div className="flex-1 bg-white rounded-2xl p-5 border border-gray-100 hover:border-amber/30 transition-colors">
                <h3 className="font-semibold text-navy">{step.title}</h3>
                <p className="text-gray-500 text-sm mt-1.5 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button className="bg-amber text-white font-semibold px-10 py-4 rounded-2xl hover:bg-amber/90 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]">
            התחל לפרסם — בחינם
          </button>
          <p className="text-gray-400 text-sm mt-3 flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            ללא כרטיס אשראי · ביטול בכל עת
          </p>
        </div>
      </section>
    </div>
  );
}
