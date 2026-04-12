"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye, EyeOff, Home, CheckCircle2, ArrowLeft,
  Phone, Mail, Lock, User, CreditCard, Upload, X, AlertCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/Navbar";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("register");
  const [postRegister, setPostRegister] = useState(false);

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl w-full max-w-md overflow-hidden">
        {/* Tabs — hidden after registration */}
        {!postRegister && (
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
        )}

        <div className="p-7">
          {mode === "register"
            ? <RegisterForm onPostRegister={() => setPostRegister(true)} />
            : <LoginForm onSwitchToRegister={() => setMode("register")} />
          }
        </div>
      </div>

      {!postRegister && (
        <p className="text-xs text-gray-400 mt-6 text-center max-w-xs leading-relaxed">
          בהרשמה אתה מסכים ל<span className="text-amber cursor-pointer">תנאי השימוש</span> ו<span className="text-amber cursor-pointer">מדיניות הפרטיות</span> של Agenta
        </p>
      )}
      </div>
    </div>
  );
}

// ── Error banner ──────────────────────────────────────────────────────────────
function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">
      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  );
}

// ── Google OAuth button ───────────────────────────────────────────────────────
function GoogleButton({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="w-full border border-gray-200 py-3 rounded-2xl text-sm text-navy font-medium hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      {loading ? "מתחבר..." : "כניסה עם Google"}
    </button>
  );
}

// ── Register Form ─────────────────────────────────────────────────────────────
function RegisterForm({ onPostRegister }: { onPostRegister: () => void }) {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<"details" | "confirm_email" | "ready">("details");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    firstName: "", lastName: "", phone: "", email: "",
    password: "", idNumber: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const detailsValid =
    form.firstName && form.lastName && form.phone && form.email &&
    form.password.length >= 6;

  const handleRegister = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            first_name: form.firstName,
            last_name: form.lastName,
            phone: form.phone,
          },
        },
      });

      if (signUpError) throw signUpError;
      if (!data.user) throw new Error("לא ניתן ליצור חשבון");

      // Upsert profile row (trigger may have already created it)
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: data.user.id,
        first_name: form.firstName,
        last_name: form.lastName,
        phone: form.phone,
      } as never, { onConflict: "id", ignoreDuplicates: false });

      if (profileError) {
        console.warn("Profile upsert warning:", profileError.message);
      }

      // If email confirmation is required, session won't exist yet
      onPostRegister();
      if (data.session) {
        setStep("ready");
      } else {
        setStep("confirm_email");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "שגיאה בהרשמה";
      if (msg.includes("already registered") || msg.includes("already been registered")) {
        setError("כתובת האימייל כבר רשומה במערכת. נסה להתחבר.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
    if (error) { setError(error.message); setGoogleLoading(false); }
  };

  const handleFinish = async () => {
    setLoading(true);
    // Upload ID photo if provided
    if (idFile) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.storage
          .from("id-documents")
          .upload(`${user.id}/id.${idFile.name.split(".").pop()}`, idFile, { upsert: true });
      }
    }
    setLoading(false);
    router.push("/onboarding");
  };

  // Poll for email confirmation
  useEffect(() => {
    if (step !== "confirm_email") return;
    const interval = setInterval(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email_confirmed_at) {
        clearInterval(interval);
        setStep("ready");
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [step, supabase]);

  if (step === "confirm_email") {
    return (
      <div className="space-y-6 text-center">
        <div className="w-16 h-16 bg-amber-light rounded-full flex items-center justify-center mx-auto">
          <Mail className="w-8 h-8 text-amber" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-navy">בדוק את האימייל שלך</h2>
          <p className="text-gray-400 text-sm mt-2 leading-relaxed">
            שלחנו קישור אימות ל-<span className="text-navy font-medium">{form.email}</span>
            <br />לחץ על הקישור במייל כדי להפעיל את החשבון.
          </p>
        </div>

        {/* Waiting animation */}
        <div className="flex items-center justify-center gap-3 py-2">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-amber animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
            ))}
          </div>
          <span className="text-sm text-gray-400">ממתין לאימות...</span>
        </div>

        <div className="bg-amber-light rounded-2xl p-4 text-xs text-navy/70 leading-relaxed">
          לא קיבלת? בדוק בתיקיית הספאם. הקישור תקף ל-24 שעות.
        </div>

        <button
          onClick={() => setStep("ready")}
          className="w-full text-gray-400 text-xs hover:text-navy transition-colors py-1">
          דלג על האימות — המשך בכל זאת
        </button>
      </div>
    );
  }

  if (step === "ready") {
    return (
      <div className="space-y-6 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-navy">האימייל אומת בהצלחה!</h2>
          <p className="text-gray-400 text-sm mt-1">החשבון שלך מוכן. בוא נבנה את פרופיל הקונה שלך</p>
        </div>

        <button
          onClick={() => { window.location.href = "/onboarding"; }}
          className="w-full bg-amber text-white font-semibold py-3.5 rounded-2xl hover:bg-amber/90 transition-all shadow-md hover:scale-[1.01]">
          התחל לבנות פרופיל קונה <ArrowLeft className="inline-block w-4 h-4 mr-2" />
        </button>

        <p className="text-xs text-gray-400">ניתן לאמת זהות ולהעלות תמונת ת.ז. בכל שלב דרך <span className="text-amber">הגדרות → אימות זהות</span></p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-navy">יצירת חשבון</h2>
        <p className="text-gray-400 text-sm mt-0.5">מצא את הדירה המושלמת עם AI</p>
      </div>

      {error && <ErrorBanner message={error} />}

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

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">טלפון נייד</label>
        <div className="relative">
          <Phone className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="tel" placeholder="050-000-0000" value={form.phone} onChange={set("phone")}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-navy text-sm focus:outline-none focus:border-amber transition-colors" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">אימייל</label>
        <div className="relative">
          <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="email" placeholder="your@email.com" value={form.email} onChange={set("email")}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-navy text-sm focus:outline-none focus:border-amber transition-colors" />
        </div>
      </div>

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
          <button type="button" onClick={() => setShowPass((v) => !v)}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy">
            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {form.password.length > 0 && form.password.length < 6 && (
          <p className="text-xs text-red-400 mt-1">סיסמה צריכה להיות לפחות 6 תווים</p>
        )}
      </div>

      <button
        type="button"
        disabled={!detailsValid || loading}
        onClick={handleRegister}
        className={`w-full py-3.5 rounded-2xl font-semibold text-sm transition-all ${
          detailsValid && !loading
            ? "bg-amber text-white hover:bg-amber/90 shadow-md hover:scale-[1.01]"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        }`}>
        {loading ? "יוצר חשבון..." : <>צור חשבון <ArrowLeft className="inline-block w-4 h-4 mr-2" /></>}
      </button>

      <div className="flex items-center gap-3 my-1">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-xs text-gray-400">או</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      <GoogleButton loading={googleLoading} onClick={handleGoogleRegister} />
    </div>
  );
}

// ── Login Form ────────────────────────────────────────────────────────────────
function LoginForm({ onSwitchToRegister }: { onSwitchToRegister: () => void }) {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error, data } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // Check if user has completed onboarding
      const { data: bp } = await supabase.from("buyer_profiles").select("id").eq("user_id", data.user.id).single();
      router.push(bp ? "/matches" : "/onboarding");
      router.refresh();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "שגיאה בכניסה";
      if (msg.includes("Invalid login credentials")) {
        setError("אימייל או סיסמה שגויים");
      } else if (msg.includes("Email not confirmed")) {
        setError("יש לאמת את כתובת האימייל לפני הכניסה. בדוק את תיבת הדואר שלך.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
    if (error) { setError(error.message); setGoogleLoading(false); }
  };

  const handleForgotPassword = async () => {
    if (!email) { setError("הכנס את כתובת האימייל כדי לאפס סיסמה"); return; }
    setResetLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/reset`,
    });
    setResetLoading(false);
    if (error) { setError(error.message); return; }
    setResetSent(true);
  };

  if (resetSent) {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-7 h-7 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-navy">מייל נשלח!</h2>
        <p className="text-gray-400 text-sm">בדוק את תיבת הדואר שלך ולחץ על הקישור לאיפוס הסיסמה.</p>
        <button onClick={() => setResetSent(false)} className="text-sm text-amber font-medium hover:text-amber/80">
          חזור לכניסה
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-navy">ברוך שובך</h2>
        <p className="text-gray-400 text-sm mt-0.5">ה-AI שלך ממתין עם עדכונים חדשים</p>
      </div>

      {error && <ErrorBanner message={error} />}

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">אימייל</label>
        <div className="relative">
          <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="email" placeholder="your@email.com" value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-navy text-sm focus:outline-none focus:border-amber transition-colors"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">סיסמה</label>
          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={resetLoading}
            className="text-xs text-amber hover:text-amber/80 transition-colors disabled:opacity-50">
            {resetLoading ? "שולח..." : "שכחתי סיסמה"}
          </button>
        </div>
        <div className="relative">
          <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type={showPass ? "text" : "password"}
            placeholder="הסיסמה שלך"
            value={password} onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 pl-10 text-navy text-sm focus:outline-none focus:border-amber transition-colors"
          />
          <button type="button" onClick={() => setShowPass((v) => !v)}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy">
            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <button
        type="button"
        disabled={!email || !password || loading}
        onClick={handleLogin}
        className={`w-full py-3.5 rounded-2xl font-semibold text-sm transition-all ${
          email && password && !loading
            ? "bg-amber text-white hover:bg-amber/90 shadow-md hover:scale-[1.01]"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        }`}>
        {loading ? "מתחבר..." : "כניסה"}
      </button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-xs text-gray-400">או</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      <GoogleButton loading={googleLoading} onClick={handleGoogle} />

      <p className="text-center text-sm text-gray-400">
        עדיין אין לך חשבון?{" "}
        <button onClick={onSwitchToRegister} className="text-amber font-semibold hover:text-amber/80">
          הירשם עכשיו
        </button>
      </p>
    </div>
  );
}
