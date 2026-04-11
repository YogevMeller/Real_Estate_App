"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye, EyeOff, Home, CheckCircle2, ArrowLeft,
  Phone, Mail, Lock, User, CreditCard, Upload, X
} from "lucide-react";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("register");

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 py-12" dir="rtl">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 mb-8 group">
        <div className="w-10 h-10 bg-amber rounded-xl flex items-center justify-center shadow group-hover:scale-105 transition-transform">
          <Home className="w-5 h-5 text-white" />
        </div>
        <span className="text-navy font-bold text-xl tracking-tight">Agenta</span>
      </Link>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl w-full max-w-md overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {[
            { key: "register", label: "הרשמה" },
            { key: "login", label: "כניסה" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setMode(t.key as "login" | "register")}
              className={`flex-1 py-4 text-sm font-semibold transition-all border-b-2 -mb-px ${
                mode === t.key
                  ? "text-amber border-amber"
                  : "text-gray-400 border-transparent hover:text-navy"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-7">
          {mode === "register" ? <RegisterForm /> : <LoginForm onSwitchToRegister={() => setMode("register")} />}
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-6 text-center max-w-xs leading-relaxed">
        בהרשמה אתה מסכים ל<span className="text-amber cursor-pointer">תנאי השימוש</span> ו<span className="text-amber cursor-pointer">מדיניות הפרטיות</span> של Agenta
      </p>
    </div>
  );
}

// ── Register Form ─────────────────────────────────────────────────────────────
function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState<"details" | "id">("details");
  const [showPass, setShowPass] = useState(false);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    firstName: "", lastName: "", phone: "", email: "",
    password: "", idNumber: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const detailsValid = form.firstName && form.lastName && form.phone && form.email && form.password.length >= 6;

  if (step === "id") {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-navy">אימות זהות</h2>
          <p className="text-gray-400 text-sm mt-1">כדי להגן על המוכרים, אנחנו מאמתים קונים ברציניות</p>
        </div>

        {/* ID Number */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">מספר תעודת זהות</label>
          <div className="relative">
            <CreditCard className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text" maxLength={9} placeholder="9 ספרות"
              value={form.idNumber} onChange={set("idNumber")}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-navy text-sm focus:outline-none focus:border-amber transition-colors text-right"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">נשמר מוצפן ולא נחשף למוכרים</p>
        </div>

        {/* ID Photo — optional */}
        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-5 text-center hover:border-amber/40 transition-colors">
          {idFile ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-navy">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                {idFile.name}
              </div>
              <button onClick={() => setIdFile(null)}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100">
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>
          ) : (
            <>
              <label className="cursor-pointer block">
                <input type="file" accept="image/*" className="hidden"
                  onChange={(e) => e.target.files?.[0] && setIdFile(e.target.files[0])} />
                <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-navy">צלם / העלה תמונת תעודת זהות</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG עד 5MB</p>
              </label>
            </>
          )}
        </div>

        <div className="bg-amber-light rounded-2xl p-3 text-xs text-navy/70 leading-relaxed">
          <span className="font-semibold text-navy">🔒 למה אנחנו מבקשים זאת?</span> פלטפורמת P2P ישירה — המוכרים פותחים את ביתם לבקרים. אימות זהות מגן על כולם.
        </div>

        <button
          onClick={() => router.push("/onboarding")}
          className="w-full bg-amber text-white font-semibold py-3.5 rounded-2xl hover:bg-amber/90 transition-all shadow-md hover:scale-[1.01]">
          סיום הרשמה — המשך לפרופיל
        </button>

        <button
          onClick={() => router.push("/onboarding")}
          className="w-full text-gray-400 text-sm hover:text-navy transition-colors py-1">
          דלג על העלאת תמונה — אמת מאוחר יותר
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-navy">יצירת חשבון</h2>
        <p className="text-gray-400 text-sm mt-0.5">מצא את הדירה המושלמת עם AI</p>
      </div>

      {/* Name row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">שם פרטי</label>
          <div className="relative">
            <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="ישראל" value={form.firstName} onChange={set("firstName")}
              className="w-full border border-gray-200 rounded-xl px-3 py-3 pr-9 text-navy text-sm focus:outline-none focus:border-amber transition-colors" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">שם משפחה</label>
          <input type="text" placeholder="ישראלי" value={form.lastName} onChange={set("lastName")}
            className="w-full border border-gray-200 rounded-xl px-3 py-3 text-navy text-sm focus:outline-none focus:border-amber transition-colors" />
        </div>
      </div>

      {/* Phone */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">טלפון נייד</label>
        <div className="relative">
          <Phone className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="tel" placeholder="050-000-0000" value={form.phone} onChange={set("phone")}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-navy text-sm focus:outline-none focus:border-amber transition-colors" />
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">אימייל</label>
        <div className="relative">
          <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="email" placeholder="your@email.com" value={form.email} onChange={set("email")}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-navy text-sm focus:outline-none focus:border-amber transition-colors" />
        </div>
      </div>

      {/* Password */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">סיסמה</label>
        <div className="relative">
          <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type={showPass ? "text" : "password"}
            placeholder="לפחות 6 תווים"
            value={form.password} onChange={set("password")}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 pl-10 text-navy text-sm focus:outline-none focus:border-amber transition-colors"
          />
          <button onClick={() => setShowPass((v) => !v)}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy">
            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {form.password.length > 0 && form.password.length < 6 && (
          <p className="text-xs text-red-400 mt-1">סיסמה צריכה להיות לפחות 6 תווים</p>
        )}
      </div>

      <button
        disabled={!detailsValid}
        onClick={() => setStep("id")}
        className={`w-full py-3.5 rounded-2xl font-semibold text-sm transition-all ${
          detailsValid
            ? "bg-amber text-white hover:bg-amber/90 shadow-md hover:scale-[1.01]"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        }`}>
        המשך לאימות זהות
        <ArrowLeft className="inline-block w-4 h-4 mr-2" />
      </button>

      <div className="flex items-center gap-3 my-1">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-xs text-gray-400">או</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      <button className="w-full border border-gray-200 py-3 rounded-2xl text-sm text-navy font-medium hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
        <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
        כניסה עם Google
      </button>
    </div>
  );
}

// ── Login Form ────────────────────────────────────────────────────────────────
function LoginForm({ onSwitchToRegister }: { onSwitchToRegister: () => void }) {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-navy">ברוך שובך</h2>
        <p className="text-gray-400 text-sm mt-0.5">ה-AI שלך ממתין עם עדכונים חדשים</p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">אימייל</label>
        <div className="relative">
          <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="email" placeholder="your@email.com" value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-navy text-sm focus:outline-none focus:border-amber transition-colors" />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">סיסמה</label>
          <button className="text-xs text-amber hover:text-amber/80">שכחתי סיסמה</button>
        </div>
        <div className="relative">
          <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type={showPass ? "text" : "password"}
            placeholder="הסיסמה שלך"
            value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 pl-10 text-navy text-sm focus:outline-none focus:border-amber transition-colors"
          />
          <button onClick={() => setShowPass((v) => !v)}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy">
            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <button
        onClick={() => router.push("/matches")}
        className="w-full bg-amber text-white font-semibold py-3.5 rounded-2xl hover:bg-amber/90 transition-all shadow-md hover:scale-[1.01] text-sm">
        כניסה
      </button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-xs text-gray-400">או</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      <button className="w-full border border-gray-200 py-3 rounded-2xl text-sm text-navy font-medium hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
        <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
        כניסה עם Google
      </button>

      <p className="text-center text-sm text-gray-400">
        עדיין אין לך חשבון?{" "}
        <button onClick={onSwitchToRegister} className="text-amber font-semibold hover:text-amber/80">הירשם עכשיו</button>
      </p>
    </div>
  );
}
