import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agenta — נדל״ן שקוף לחלוטין",
  description: "מודיעין נכסים מבוסס AI. תוכניות קומה מדויקות. אפס עמלות.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // ─── RTL ARCHITECTURE — READ BEFORE TOUCHING ─────────────────────────────
    // dir="rtl" lives HERE and ONLY here. Every page inherits it automatically.
    //
    // RULES:
    // 1. NEVER add dir="rtl" to individual page wrappers — it is already global.
    // 2. For LTR components (Navbar, etc.) add dir="ltr" on that element only.
    //    The Navbar's <nav dir="ltr"> is the canonical example.
    // 3. Flex in RTL: items flow RIGHT→LEFT (first child = rightmost).
    //    • Sidebar-on-right layout: plain flex + sidebar FIRST in DOM ✓
    //    • Image-left card: flex + dir="ltr"  OR  flex-row-reverse
    //      (RTL + row-reverse = double-reversal = visual LTR order)
    // 4. CSS physical props (left/right, top/bottom) are unaffected by dir.
    // ─────────────────────────────────────────────────────────────────────────
    <html lang="he" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-cream min-h-screen">{children}</body>
    </html>
  );
}
