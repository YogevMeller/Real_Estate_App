"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bell, Home, User, Settings, LogOut, Heart, CalendarDays, ChevronDown, SlidersHorizontal, Search, Info, Sparkles } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getUserAlerts, markAlertsRead, type AlertView } from "@/lib/supabase/queries";

type NavUser = { id: string; firstName: string; lastName: string; email: string; initials: string } | null;

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

export default function Navbar() {
  const path = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [user, setUser] = useState<NavUser>(null);
  const [alerts, setAlerts] = useState<AlertView[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const active = (href: string) =>
    path === href ? "text-amber font-semibold" : "text-navy/70 hover:text-navy font-medium";

  // Load real session + alerts
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        const meta = data.user.user_metadata;
        const firstName = meta?.first_name || meta?.full_name?.split(" ")[0] || "";
        const lastName = meta?.last_name || meta?.full_name?.split(" ").slice(1).join(" ") || "";
        const u = {
          id: data.user.id,
          firstName,
          lastName,
          email: data.user.email || "",
          initials: (firstName[0] || data.user.email?.[0] || "?").toUpperCase(),
        };
        setUser(u);
        getUserAlerts(data.user.id, 5).then(setAlerts);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const meta = session.user.user_metadata;
        const firstName = meta?.first_name || meta?.full_name?.split(" ")[0] || "";
        const lastName = meta?.last_name || "";
        const u = {
          id: session.user.id,
          firstName, lastName,
          email: session.user.email || "",
          initials: (firstName[0] || session.user.email?.[0] || "?").toUpperCase(),
        };
        setUser(u);
        getUserAlerts(session.user.id, 5).then(setAlerts);
      } else {
        setUser(null);
        setAlerts([]);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setAlerts([]);
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  const handleMarkRead = async () => {
    if (!user) return;
    await markAlertsRead(user.id);
    setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
  };

  const unreadCount = alerts.filter((a) => !a.isRead).length;

  const toggleMenu = () => { setMenuOpen((v) => !v); setNotifOpen(false); };
  const toggleNotif = () => { setNotifOpen((v) => !v); setMenuOpen(false); };

  return (
    <nav dir="ltr" className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-full px-8 h-16 flex items-center justify-between">

        {/* ── Logo — rightmost ── */}
        <Link href="/" className="flex items-center gap-2.5 group order-last">
          <div className="w-9 h-9 bg-amber rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <Home className="w-5 h-5 text-white" />
          </div>
          <span className="text-navy font-bold text-lg tracking-tight">Agenta</span>
        </Link>

        {/* ── Nav links + actions — leftmost ── */}
        <div className="flex items-center gap-6 order-first">

          {user ? (
            /* ═══════════════════ AUTHENTICATED NAV ═══════════════════ */
            <>
              {/* User avatar + dropdown */}
              <div className="relative flex items-center gap-1" ref={menuRef}>
                <button
                  type="button"
                  onClick={toggleMenu}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="תפריט משתמש"
                >
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`} />
                </button>

                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="w-9 h-9 bg-gradient-to-br from-amber to-yellow-400 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm hover:opacity-80 transition-opacity"
                  aria-label="עבור לפרופיל"
                >
                  {user.initials}
                </Link>

                {menuOpen && (
                  <div className="absolute left-0 top-full mt-2 w-56 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden z-[200]" dir="rtl">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="font-semibold text-navy text-sm">{user.firstName} {user.lastName}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{user.email}</div>
                    </div>
                    <div className="py-1">
                      <NavMenuItem href="/profile" icon={User} label="הפרופיל שלי" onClick={() => setMenuOpen(false)} />
                      <NavMenuItem href="/profile/preferences" icon={SlidersHorizontal} label="העדפות חיפוש" onClick={() => setMenuOpen(false)} />
                      <NavMenuItem href="/profile" icon={Heart} label="נכסים שמורים" onClick={() => setMenuOpen(false)} />
                      <NavMenuItem href="/profile" icon={CalendarDays} label="ביקורים קרובים" onClick={() => setMenuOpen(false)} />
                      <NavMenuItem href="/profile/settings" icon={Settings} label="הגדרות" onClick={() => setMenuOpen(false)} />
                    </div>
                    <div className="border-t border-gray-100 py-1">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-50 transition-colors">
                        <LogOut className="w-4 h-4 shrink-0" />
                        התנתק
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Bell — real alerts */}
              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  onClick={toggleNotif}
                  className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-amber-light transition-colors"
                  aria-label="התראות"
                >
                  <Bell className="w-5 h-5 text-navy/70" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber rounded-full" />
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute left-0 top-full mt-2 w-80 bg-white rounded-2xl border border-gray-100 shadow-xl z-[200] overflow-hidden" dir="rtl">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <span className="font-semibold text-navy text-sm">התראות</span>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <>
                            <span className="text-xs bg-amber text-white px-2 py-0.5 rounded-full font-medium">
                              {unreadCount} חדשות
                            </span>
                            <button onClick={handleMarkRead} className="text-xs text-amber hover:text-amber/80 transition-colors">
                              סמן הכל כנקרא
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                      {alerts.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-gray-400">אין התראות</div>
                      ) : (
                        alerts.map((a) => (
                          <div
                            key={a.id}
                            className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${!a.isRead ? "bg-amber-light/30" : ""}`}
                          >
                            <div className="flex items-start gap-2.5">
                              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!a.isRead ? "bg-amber" : "bg-gray-200"}`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-navy leading-snug">{a.title}</p>
                                {a.description && <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{a.description}</p>}
                                <p className="text-xs text-gray-400 mt-1">{timeAgo(a.createdAt)}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="border-t border-gray-100 p-2">
                      <Link
                        href="/matches"
                        onClick={() => setNotifOpen(false)}
                        className="block text-center text-xs text-amber font-medium py-2 hover:text-amber/80 transition-colors"
                      >
                        לכל ההתראות ←
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Authenticated links */}
              <div className="flex items-center gap-7">
                <Link href="/sell" className={`text-sm transition-colors ${active("/sell")}`}>מכירה</Link>
                <Link href="/matches" className={`text-sm transition-colors ${active("/matches")}`}>התאמות</Link>
                <Link href="/search" className={`text-sm transition-colors ${active("/search")}`}>חיפוש</Link>
              </div>
            </>
          ) : (
            /* ═══════════════════ PUBLIC NAV ═══════════════════ */
            <>
              <Link
                href="/auth"
                className="flex items-center gap-2 px-4 py-2 bg-amber text-white rounded-xl text-sm font-semibold hover:bg-amber/90 transition-colors shadow-sm"
              >
                <User className="w-4 h-4" />
                התחבר / הרשם
              </Link>

              <div className="flex items-center gap-7">
                <Link href="/search" className={`flex items-center gap-1.5 text-sm transition-colors ${active("/search")}`}>
                  <Search className="w-3.5 h-3.5" />חיפוש דירות
                </Link>
                <Link href="/about" className={`flex items-center gap-1.5 text-sm transition-colors ${active("/about")}`}>
                  <Info className="w-3.5 h-3.5" />אודות
                </Link>
                <a href="/#how-it-works" onClick={(e) => { e.preventDefault(); const el = document.getElementById("how-it-works"); if (el) { el.scrollIntoView({ behavior: "smooth" }); } else { window.location.href = "/#how-it-works"; } }} className="flex items-center gap-1.5 text-sm text-navy/70 hover:text-navy font-medium transition-colors cursor-pointer">
                  <Sparkles className="w-3.5 h-3.5" />איך זה עובד
                </a>
              </div>
            </>
          )}

        </div>
      </div>
    </nav>
  );
}

function NavMenuItem({ href, icon: Icon, label, badge, onClick }: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <Link href={href} onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 text-sm text-navy/80 hover:bg-gray-50 hover:text-navy transition-colors">
      <Icon className="w-4 h-4 text-gray-400 shrink-0" />
      <span className="flex-1">{label}</span>
      {badge && (
        <span className="text-xs bg-amber text-white px-1.5 py-0.5 rounded-full font-medium">{badge}</span>
      )}
    </Link>
  );
}
