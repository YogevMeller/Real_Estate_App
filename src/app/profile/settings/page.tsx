"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ChevronRight, User, Bell, Shield, CreditCard,
  Home, Save, CheckCircle2, Upload, X, Eye, EyeOff, ArrowRight,
} from "lucide-react";

const SECTIONS = [
  { key: "personal", label: "מידע אישי", icon: User },
  { key: "notifications", label: "התראות", icon: Bell },
  { key: "security", label: "אבטחה", icon: Shield },
  { key: "verification", label: "אימות זהות", icon: CreditCard },
];

export default function SettingsPage() {
  const [section, setSection] = useState("personal");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="min-h-screen bg-cream" dir="rtl">
      {/* Top nav */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber rounded-lg flex items-center justify-center">
              <Home className="w-4 h-4 text-white" />
            </div>
            <span className="text-navy font-bold text-base tracking-tight">Agenta</span>
          </Link>
          <span className="text-gray-300">/</span>
          <Link href="/profile" className="text-sm text-gray-400 hover:text-navy transition-colors flex items-center gap-1">
            <ChevronRight className="w-4 h-4" />חזרה לפרופיל
          </Link>
        </div>
      </nav>

      <div className="max-w-screen-xl mx-auto px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy">הגדרות</h1>
            <p className="text-gray-400 text-sm mt-1">נהל את החשבון וההעדפות שלך</p>
          </div>
          <Link href="/profile"
            className="flex items-center gap-2 bg-white border border-gray-200 text-navy text-sm font-medium px-4 py-2.5 rounded-xl hover:border-amber hover:text-amber transition-colors shadow-sm">
            <ArrowRight className="w-4 h-4" />
            חזרה לפרופיל
          </Link>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-56 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-2 sticky top-20">
              {SECTIONS.map((s) => (
                <button key={s.key} onClick={() => setSection(s.key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-right ${
                    section === s.key ? "bg-amber text-white" : "text-navy/70 hover:bg-gray-50 hover:text-navy"
                  }`}>
                  <s.icon className={`w-4 h-4 shrink-0 ${section === s.key ? "text-white" : "text-gray-400"}`} />
                  {s.label}
                </button>
              ))}
            </div>
          </aside>

          {/* Content */}
          <div className="flex-1 max-w-2xl space-y-5">

            {section === "personal" && <PersonalSection onSave={handleSave} saved={saved} />}
            {section === "notifications" && <NotificationsSection onSave={handleSave} saved={saved} />}
            {section === "security" && <SecuritySection onSave={handleSave} saved={saved} />}
            {section === "verification" && <VerificationSection />}

          </div>
        </div>
      </div>
    </div>
  );
}

// ── Personal ─────────────────────────────────────────────────────────────────
function PersonalSection({ onSave, saved }: { onSave: () => void; saved: boolean }) {
  const [form, setForm] = useState({
    firstName: "רועי", lastName: "כהן",
    email: "roi@example.com", phone: "050-1234567",
  });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-amber-light rounded-xl flex items-center justify-center">
          <User className="w-4 h-4 text-amber" />
        </div>
        <h2 className="text-lg font-bold text-navy">מידע אישי</h2>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
        <div className="w-16 h-16 bg-gradient-to-br from-amber to-yellow-400 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow">
          R
        </div>
        <div>
          <button className="flex items-center gap-2 text-sm text-amber font-medium hover:text-amber/80 transition-colors">
            <Upload className="w-4 h-4" />העלה תמונת פרופיל
          </button>
          <p className="text-xs text-gray-400 mt-1">JPG, PNG עד 2MB</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="שם פרטי" value={form.firstName} onChange={set("firstName")} />
          <Field label="שם משפחה" value={form.lastName} onChange={set("lastName")} />
        </div>
        <Field label="אימייל" type="email" value={form.email} onChange={set("email")} />
        <Field label="טלפון נייד" type="tel" value={form.phone} onChange={set("phone")} />
      </div>

      <SaveButton onSave={onSave} saved={saved} />
    </div>
  );
}

// ── Notifications ─────────────────────────────────────────────────────────────
function NotificationsSection({ onSave, saved }: { onSave: () => void; saved: boolean }) {
  const [prefs, setPrefs] = useState({
    emailMatches: true,
    pushMatches: true,
    emailVisits: true,
    pushVisits: true,
    priceDrops: true,
    weeklyReport: false,
    newNeighborhood: false,
    aiInsights: true,
  });

  const toggle = (k: keyof typeof prefs) => setPrefs((p) => ({ ...p, [k]: !p[k] }));

  const groups = [
    {
      title: "התאמות",
      items: [
        { key: "emailMatches", label: "התאמה חדשה — אימייל" },
        { key: "pushMatches", label: "התאמה חדשה — push" },
      ],
    },
    {
      title: "ביקורים",
      items: [
        { key: "emailVisits", label: "תזכורת ביקור — אימייל" },
        { key: "pushVisits", label: "תזכורת ביקור — push" },
      ],
    },
    {
      title: "שוק ונכסים",
      items: [
        { key: "priceDrops", label: "ירידת מחיר בנכסים שמורים" },
        { key: "weeklyReport", label: "דוח שבועי — מגמות שוק" },
        { key: "newNeighborhood", label: "נכסים חדשים בשכונות שמורות" },
        { key: "aiInsights", label: "תובנות AI על פרופיל שלך" },
      ],
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-amber-light rounded-xl flex items-center justify-center">
          <Bell className="w-4 h-4 text-amber" />
        </div>
        <h2 className="text-lg font-bold text-navy">העדפות התראות</h2>
      </div>
      <div className="space-y-6">
        {groups.map((g) => (
          <div key={g.title}>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{g.title}</p>
            <div className="space-y-2">
              {g.items.map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between py-2.5 px-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-navy">{label}</span>
                  <Toggle value={prefs[key as keyof typeof prefs]} onChange={() => toggle(key as keyof typeof prefs)} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <SaveButton onSave={onSave} saved={saved} />
    </div>
  );
}

// ── Security ─────────────────────────────────────────────────────────────────
function SecuritySection({ onSave, saved }: { onSave: () => void; saved: boolean }) {
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-amber-light rounded-xl flex items-center justify-center">
          <Shield className="w-4 h-4 text-amber" />
        </div>
        <h2 className="text-lg font-bold text-navy">אבטחה</h2>
      </div>
      <div className="space-y-4">
        {[
          { key: "current", label: "סיסמה נוכחית" },
          { key: "new", label: "סיסמה חדשה" },
          { key: "confirm", label: "אישור סיסמה חדשה" },
        ].map(({ key, label }) => (
          <div key={key}>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
            <div className="relative">
              <input
                type={show[key as keyof typeof show] ? "text" : "password"}
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 pl-10 text-sm text-navy focus:outline-none focus:border-amber transition-colors"
              />
              <button
                onClick={() => setShow((s) => ({ ...s, [key]: !s[key as keyof typeof show] }))}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy">
                {show[key as keyof typeof show] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        ))}
      </div>
      <SaveButton onSave={onSave} saved={saved} label="עדכן סיסמה" />
    </div>
  );
}

// ── Verification ─────────────────────────────────────────────────────────────
function VerificationSection() {
  const [idFile, setIdFile] = useState<File | null>(null);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 bg-amber-light rounded-xl flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-amber" />
          </div>
          <h2 className="text-lg font-bold text-navy">אימות זהות</h2>
        </div>

        {/* Status */}
        <div className="flex items-center gap-3 p-4 bg-amber-light rounded-2xl mb-5">
          <div className="w-8 h-8 bg-amber rounded-xl flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-navy">זהות לא מאומתת</p>
            <p className="text-xs text-gray-500 mt-0.5">קונים מאומתים מקבלים עדיפות ממוכרים ויכולים לקבוע ביקורים מהר יותר</p>
          </div>
        </div>

        {/* ID number */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">מספר תעודת זהות</label>
          <input type="text" maxLength={9} placeholder="9 ספרות"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-navy focus:outline-none focus:border-amber transition-colors" />
          <p className="text-xs text-gray-400 mt-1">נשמר מוצפן ולא נחשף</p>
        </div>

        {/* ID photo upload */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">תמונת תעודת זהות</label>
          <div className="border-2 border-dashed border-gray-200 rounded-2xl p-5 text-center hover:border-amber/40 transition-colors">
            {idFile ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-navy">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  {idFile.name}
                </div>
                <button onClick={() => setIdFile(null)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100">
                  <X className="w-3.5 h-3.5 text-gray-400" />
                </button>
              </div>
            ) : (
              <label className="cursor-pointer block">
                <input type="file" accept="image/*" className="hidden"
                  onChange={(e) => e.target.files?.[0] && setIdFile(e.target.files[0])} />
                <p className="text-sm font-medium text-navy">לחץ להעלאת תמונת ת.ז.</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG עד 5MB</p>
              </label>
            )}
          </div>
        </div>

        <button className="mt-5 w-full bg-amber text-white font-semibold py-3 rounded-2xl hover:bg-amber/90 transition-all shadow-sm text-sm">
          שלח לאימות
        </button>
      </div>

      {/* Benefits */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <p className="text-sm font-semibold text-navy mb-3">יתרונות קונה מאומת</p>
        <div className="space-y-2.5">
          {[
            "קביעת ביקורים מהירה — מוכרים מאשרים קונים מאומתים תחילה",
            "גישה לנכסים בלעדיים",
            "תג ״קונה מאומת״ על הפרופיל שלך",
            "אמינות גבוהה יותר בשיחות עם מוכרים",
          ].map((b) => (
            <div key={b} className="flex items-start gap-2 text-sm text-gray-600">
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              <span>{b}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function Field({ label, value, onChange, type = "text" }: {
  label: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
      <input type={type} value={value} onChange={onChange}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-navy bg-gray-50 focus:bg-white focus:outline-none focus:border-amber transition-all" />
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange}
      className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${value ? "bg-amber" : "bg-gray-200"}`}>
      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );
}

function SaveButton({ onSave, saved, label = "שמור שינויים" }: {
  onSave: () => void; saved: boolean; label?: string;
}) {
  return (
    <button onClick={onSave}
      className={`mt-6 flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-sm transition-all shadow-sm ${
        saved ? "bg-green-500 text-white" : "bg-amber text-white hover:bg-amber/90"
      }`}>
      {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
      {saved ? "נשמר!" : label}
    </button>
  );
}
