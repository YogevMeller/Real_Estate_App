import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agenta — נדל״ן שקוף לחלוטין",
  description: "מודיעין נכסים מבוסס AI. תוכניות קומה מדויקות. אפס עמלות.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // dir="rtl" removed from html — each page handles dir on its own content containers
    // This prevents RTL from reversing flex-row layouts globally
    <html lang="he">
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
