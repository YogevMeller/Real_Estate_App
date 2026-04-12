import Link from "next/link";
import {
  Brain, Scan, ShieldCheck, BarChart3, MessageCircle,
  Eye, Zap, ArrowLeft, CheckCircle2, Sparkles,
} from "lucide-react";
import Navbar from "@/components/Navbar";

const STEPS = [
  {
    num: "01",
    title: "סריקת LiDAR תלת-ממדית",
    desc: "כל נכס נסרק בטכנולוגיית LiDAR מתקדמת שיוצרת מפה תלת-ממדית מדויקת למילימטר. התוצאה: תוכנית קומה אמיתית, לא שרטוט ידני — כולל מידות קירות, גובה תקרות, ומיקום חלונות.",
    icon: Scan,
    color: "bg-blue-50 text-blue-600",
  },
  {
    num: "02",
    title: "ניתוח AI של המבנה",
    desc: "האלגוריתם מנתח את הסריקה ומזהה אוטומטית: קירות גבס שניתנים להריסה (פוטנציאל מטבח פתוח), כיווני אוויר ושמש, נקודות רטיבות פוטנציאליות, ומצב התשתיות.",
    icon: Brain,
    color: "bg-amber-light text-amber",
  },
  {
    num: "03",
    title: "סוכן AI ייעודי לכל נכס",
    desc: "לכל דירה במערכת יש סוכן AI אישי עם ידע מלא על הנכס, השכונה, היסטוריית המחירים, והסביבה. אתה יכול לשאול אותו כל שאלה — מ״האם ניתן לפתוח את המטבח?״ ועד ״מה זמן הנסיעה לתל אביב בשעת שיא?״",
    icon: MessageCircle,
    color: "bg-green-50 text-green-600",
  },
  {
    num: "04",
    title: "התאמה חכמה לפרופיל שלך",
    desc: "מילאת פרופיל קונה? המערכת סורקת כל נכס חדש ומדרגת אותו לפי 30+ קריטריונים: תקציב, מיקום, גודל, ותגיות סמנטיות כמו ״רחוב שקט״ או ״ליד גן ילדים״. כל התאמה מגיעה עם ציון אחוזים והסבר.",
    icon: Sparkles,
    color: "bg-purple-50 text-purple-600",
  },
  {
    num: "05",
    title: "שקיפות מלאה — אפס תיווך",
    desc: "אין מתווכים, אין עמלות. כל המידע גלוי: היסטוריית מחירים, עסקאות בבניין, ביקורות של קונים קודמים, ונתוני שכונה אמיתיים. אתה מקבל החלטה מבוססת נתונים, לא על סמך רושם ראשוני.",
    icon: ShieldCheck,
    color: "bg-rose-50 text-rose-600",
  },
];

const FEATURES = [
  { icon: Eye, title: "תוכנית קומה אמיתית", desc: "סריקת LiDAR ברזולוציה של 1 מ״מ, לא שרטוט קבלן" },
  { icon: Zap, title: "זיהוי קירות גבס", desc: "המערכת מסמנת קירות שניתן להרוס לפתיחת מרחב" },
  { icon: BarChart3, title: "היסטוריית מחירים", desc: "גרף מחירי הנכס ועסקאות בבניין עד 10 שנים אחורה" },
  { icon: Brain, title: "AI שמבין את השוק", desc: "ניתוח מגמות מחירים, חיזוי ערך עתידי, וזיהוי הזדמנויות" },
  { icon: CheckCircle2, title: "ביקורות מאומתות", desc: "רק קונים שביקרו בנכס בפועל יכולים לדרג ולכתוב חוות דעת" },
  { icon: MessageCircle, title: "שאל את הסוכן", desc: "סוכן AI לכל נכס — שואלים שאלה ומקבלים תשובה מבוססת נתונים" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-cream">
      <Navbar />

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-amber-light text-amber text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <Brain className="w-4 h-4" />
          טכנולוגיה שמשנה את שוק הנדל״ן
        </div>
        <h1 className="text-5xl font-bold text-navy leading-tight">
          איך <span className="text-amber">Agenta</span> עובד?
        </h1>
        <p className="mt-4 text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
          שילוב של סריקת LiDAR תלת-ממדית, בינה מלאכותית מתקדמת, ושקיפות מלאה —
          כדי שתקבל את ההחלטה הכי חכמה על הנכס הכי חשוב בחיים שלך.
        </p>
      </section>

      {/* Steps */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="space-y-6">
          {STEPS.map((step, i) => (
            <div key={step.num} className="bg-white rounded-3xl border border-gray-100 p-8 hover:shadow-lg transition-all">
              <div className="flex items-start gap-6">
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${step.color}`}>
                    <step.icon className="w-7 h-7" />
                  </div>
                  <span className="text-xs text-gray-300 font-bold">{step.num}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-navy mb-2">{step.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex justify-center mt-4">
                  <div className="w-0.5 h-6 bg-gray-100 rounded-full" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section className="bg-white border-y border-gray-100 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-navy text-center mb-10">
            מה אתה מקבל עם כל נכס
          </h2>
          <div className="grid grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex items-start gap-3 p-5 bg-gray-50 rounded-2xl">
                <div className="w-10 h-10 bg-amber-light rounded-xl flex items-center justify-center shrink-0">
                  <f.icon className="w-5 h-5 text-amber" />
                </div>
                <div>
                  <h4 className="font-semibold text-navy text-sm">{f.title}</h4>
                  <p className="text-gray-500 text-xs mt-1 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Agent spotlight */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-bl from-navy to-navy/90 rounded-3xl p-10 text-center">
          <div className="w-16 h-16 bg-amber rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
            <span className="text-white text-xl font-bold">AI</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">סוכן AI לכל דירה</h2>
          <p className="text-white/70 max-w-xl mx-auto leading-relaxed mb-4">
            לכל נכס ב-Agenta יש סוכן AI ייעודי שמכיר את הדירה לעומק.
            הוא יודע לענות על שאלות כמו:
          </p>
          <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto text-right">
            {[
              "האם ניתן לפתוח את המטבח לסלון?",
              "מה המרחק הליכה לגן הילדים הקרוב?",
              "כמה שמש נכנסת לסלון בחורף?",
              "מה היסטוריית המחירים של הבניין?",
              "האם יש תוכניות לרכבת קלה בשכונה?",
              "מה ועד הבית כולל ומה לא?",
            ].map((q) => (
              <div key={q} className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2.5">
                <MessageCircle className="w-3.5 h-3.5 text-amber shrink-0" />
                <span className="text-white/90 text-xs">{q}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-6 mb-16 rounded-3xl bg-gradient-to-l from-amber to-yellow-400 text-center py-14 px-8">
        <h2 className="text-3xl font-bold text-white">מוכן למצוא את הדירה המושלמת?</h2>
        <p className="text-white/80 mt-2 text-base">צור פרופיל קונה ותן ל-AI למצוא עבורך</p>
        <div className="flex items-center justify-center gap-4 mt-8">
          <Link href="/onboarding" className="bg-white text-amber font-semibold px-8 py-3.5 rounded-2xl hover:scale-105 transition-transform shadow-lg flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            צור פרופיל קונה
          </Link>
          <Link href="/search" className="bg-white/20 text-white font-semibold px-8 py-3.5 rounded-2xl hover:bg-white/30 transition-colors flex items-center gap-2">
            חפש נכסים
          </Link>
        </div>
      </section>
    </div>
  );
}
