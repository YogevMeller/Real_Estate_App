"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bell, Home, User, Settings, LogOut, Heart, CalendarDays, ChevronDown, SlidersHorizontal } from "lucide-react";
import { usePathname } from "next/navigation";

const IS_LOGGED_IN = true;
const MOCK_USER = { firstName: "רועי", lastName: "כהן", initials: "R", email: "roi@example.com" };

export default function Navbar() {
  const path = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const active = (href: string) =>
    path === href ? "text-amber font-semibold" : "text-navy/70 hover:text-navy font-medium";

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <nav dir="ltr" className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
      {/*
        dir="ltr" on <nav> isolates it from any parent dir="rtl".
        order-last on Logo → rightmost in LTR flex.
        order-first on nav-links → leftmost in LTR flex.
      */}
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

          {/* User avatar / auth — leftmost item */}
          {IS_LOGGED_IN ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
                <div className="w-9 h-9 bg-gradient-to-br from-amber to-yellow-400 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  {MOCK_USER.initials}
                </div>
              </button>

              {menuOpen && (
                <div className="absolute left-0 top-full mt-2 w-56 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden z-50" dir="rtl">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="font-semibold text-navy text-sm">{MOCK_USER.firstName} {MOCK_USER.lastName}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{MOCK_USER.email}</div>
                  </div>
                  <div className="py-1">
                    <NavMenuItem href="/profile" icon={User} label="הפרופיל שלי" onClick={() => setMenuOpen(false)} />
                    <NavMenuItem href="/profile/preferences" icon={SlidersHorizontal} label="העדפות חיפוש" onClick={() => setMenuOpen(false)} />
                    <NavMenuItem href="/profile?tab=saved" icon={Heart} label="נכסים שמורים" onClick={() => setMenuOpen(false)} />
                    <NavMenuItem href="/profile?tab=upcoming" icon={CalendarDays} label="ביקורים קרובים" badge="2" onClick={() => setMenuOpen(false)} />
                    <NavMenuItem href="/profile/settings" icon={Settings} label="הגדרות" onClick={() => setMenuOpen(false)} />
                  </div>
                  <div className="border-t border-gray-100 py-1">
                    <Link href="/auth" className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-50 transition-colors">
                      <LogOut className="w-4 h-4 shrink-0" />
                      התנתק
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link href="/auth"
              className="flex items-center gap-1.5 bg-amber text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-amber/90 transition-colors shadow-sm">
              <User className="w-4 h-4" />כניסה
            </Link>
          )}

          {/* Bell */}
          <button className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-amber-light transition-colors">
            <Bell className="w-5 h-5 text-navy/70" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber rounded-full" />
          </button>

          {/* Nav links */}
          <div className="flex items-center gap-7">
            <Link href="/sell" className={`text-sm transition-colors ${active("/sell")}`}>מכירה</Link>
            <Link href="/matches" className={`text-sm transition-colors ${active("/matches")}`}>התאמות</Link>
            <Link href="/search" className={`text-sm transition-colors ${active("/search")}`}>חיפוש</Link>
          </div>
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
