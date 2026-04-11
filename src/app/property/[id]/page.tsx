"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin, Maximize2, Building, CalendarDays, Video, DollarSign,
  Layers, Zap, Sun, Wind, CheckCircle2, Train, GraduationCap,
  Trees, ShoppingBag, ChevronRight, Shield, Clock, TrendingUp,
  Scan, Info, ArrowUpRight, X, Heart, Bus, Bike, Baby,
  Stethoscope, Pill, Dumbbell, Book, Users, Coffee, Star, ThumbsUp, MessageSquare
} from "lucide-react";
import Navbar from "@/components/Navbar";
import FloorPlan from "@/components/FloorPlan";
import ChatWidget from "@/components/ChatWidget";
import PriceChart from "@/components/PriceChart";
import OpenPlanVisualizer from "@/components/OpenPlanVisualizer";
import { properties, reviews, NeighborhoodItem } from "@/lib/mockData";

// ── Icon map for neighborhood items ──────────────────────────────
const TYPE_ICONS: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  kindergarten: { icon: Baby,        color: "text-pink-500",   bg: "bg-pink-50",   label: "גן ילדים" },
  school:       { icon: GraduationCap, color: "text-blue-500", bg: "bg-blue-50",   label: "בית ספר" },
  highschool:   { icon: GraduationCap, color: "text-blue-600", bg: "bg-blue-50",   label: "תיכון" },
  university:   { icon: Book,         color: "text-purple-500", bg: "bg-purple-50", label: "אוניברסיטה" },
  clinic:       { icon: Stethoscope,  color: "text-red-500",   bg: "bg-red-50",    label: "קופת חולים" },
  doctor:       { icon: Stethoscope,  color: "text-red-400",   bg: "bg-red-50",    label: "רופא משפחה" },
  hospital:     { icon: Shield,       color: "text-red-600",   bg: "bg-red-50",    label: "בית חולים" },
  pharmacy:     { icon: Pill,         color: "text-green-500", bg: "bg-green-50",  label: "בית מרקחת" },
  dental:       { icon: Stethoscope,  color: "text-teal-500",  bg: "bg-teal-50",   label: "שיניים" },
  women:        { icon: Heart,        color: "text-pink-400",  bg: "bg-pink-50",   label: "בריאות האישה" },
  train:        { icon: Train,        color: "text-navy",      bg: "bg-slate-50",  label: "רכבת" },
  metro:        { icon: Train,        color: "text-amber",     bg: "bg-amber-light",label: "רכבת קלה" },
  bus:          { icon: Bus,          color: "text-gray-500",  bg: "bg-gray-50",   label: "אוטובוס" },
  bike:         { icon: Bike,         color: "text-green-500", bg: "bg-green-50",  label: "אופניים" },
  scooter:      { icon: Zap,          color: "text-yellow-500",bg: "bg-yellow-50", label: "קורקינט" },
  supermarket:  { icon: ShoppingBag,  color: "text-orange-500",bg: "bg-orange-50", label: "סופרמרקט" },
  minimarket:   { icon: ShoppingBag,  color: "text-orange-400",bg: "bg-orange-50", label: "מינימרקט" },
  mall:         { icon: ShoppingBag,  color: "text-purple-500",bg: "bg-purple-50", label: "קניון" },
  market:       { icon: Coffee,       color: "text-amber",     bg: "bg-amber-light",label: "שוק" },
  restaurants:  { icon: Coffee,       color: "text-amber",     bg: "bg-amber-light",label: "מסעדות" },
  furniture:    { icon: ShoppingBag,  color: "text-gray-500",  bg: "bg-gray-50",   label: "רהיטים" },
  park:         { icon: Trees,        color: "text-green-500", bg: "bg-green-50",  label: "גן / פארק" },
  beach:        { icon: Sun,          color: "text-blue-400",  bg: "bg-blue-50",   label: "חוף ים" },
  sport:        { icon: Dumbbell,     color: "text-gray-500",  bg: "bg-gray-50",   label: "ספורט" },
  library:      { icon: Book,         color: "text-indigo-500",bg: "bg-indigo-50", label: "ספריה" },
  community:    { icon: Users,        color: "text-teal-500",  bg: "bg-teal-50",   label: "קהילה" },
  synagogue:    { icon: Star,         color: "text-yellow-500",bg: "bg-yellow-50", label: "בית כנסת" },
  playground:   { icon: Baby,         color: "text-pink-400",  bg: "bg-pink-50",   label: "גן שעשועים" },
  gym:          { icon: Dumbbell,     color: "text-gray-600",  bg: "bg-gray-50",   label: "חדר כושר" },
  pool:         { icon: Dumbbell,     color: "text-blue-400",  bg: "bg-blue-50",   label: "בריכה" },
  culture:      { icon: Star,         color: "text-purple-400",bg: "bg-purple-50", label: "תרבות" },
};

function WalkBadge({ min, future }: { min: number; future?: boolean }) {
  const color = future ? "bg-amber text-white" : min <= 3 ? "bg-green-100 text-green-700" : min <= 8 ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-500";
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${color}`}>
      {future ? "עתידי" : `${min} דק׳`}
    </span>
  );
}

function NeighborhoodSection({ title, items, emoji }: { title: string; items: NeighborhoodItem[]; emoji: string }) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? items : items.slice(0, 4);
  return (
    <div>
      <h3 className="flex items-center gap-2 text-sm font-bold text-navy mb-2">
        <span>{emoji}</span>{title}
        <span className="text-xs text-gray-400 font-normal">({items.length} מקומות)</span>
      </h3>
      <div className="space-y-1.5">
        {shown.map((item) => {
          const meta = TYPE_ICONS[item.type] ?? { icon: MapPin, color: "text-gray-500", bg: "bg-gray-50", label: item.type };
          const Icon = meta.icon;
          return (
            <div key={item.name} className="flex items-center gap-2.5 bg-gray-50 rounded-xl px-3 py-2.5 hover:bg-amber-light/40 transition-colors">
              <div className={`w-7 h-7 ${meta.bg} rounded-lg flex items-center justify-center shrink-0`}>
                <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-navy font-medium truncate">{item.name}</span>
                  {item.rating && (
                    <span className="text-xs text-amber font-semibold flex items-center gap-0.5 shrink-0">
                      ★ {item.rating}
                    </span>
                  )}
                </div>
                {item.note && <p className="text-xs text-gray-400 truncate">{item.note}</p>}
              </div>
              <WalkBadge min={item.walkMin} future={item.future} />
            </div>
          );
        })}
      </div>
      {items.length > 4 && (
        <button onClick={() => setExpanded(!expanded)}
          className="mt-2 text-xs text-amber font-medium hover:text-amber/80 transition-colors w-full text-center py-1">
          {expanded ? "הצג פחות ↑" : `הצג עוד ${items.length - 4} מקומות ↓`}
        </button>
      )}
    </div>
  );
}

export default function PropertyPage({ params }: { params: { id: string } }) {
  const property = properties.find((p) => p.id === params.id) ?? properties[0];
  const [activePhoto, setActivePhoto] = useState(0);
  const [highlightDrywall, setHighlightDrywall] = useState(false);
  const [floorPlanTab, setFloorPlanTab] = useState<"lidar" | "interactive">("lidar");
  const [showSchedule, setShowSchedule] = useState(false);
  const [showOffer, setShowOffer] = useState(false);

  const formatPrice = `₪${(property.price / 1000000).toFixed(1)}M`;
  const pricePerSqm = Math.round(property.price / property.sqm).toLocaleString("he-IL");
  const hasDrywall = property.floorPlan.drywallPoints.length > 0;

  return (
    <div className="min-h-screen bg-cream" dir="rtl">
      <Navbar />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 pt-4">
        <Link href="/" className="flex items-center gap-1 text-gray-400 hover:text-amber text-sm transition-colors w-fit">
          <ChevronRight className="w-4 h-4" />חזרה לרשימה
        </Link>
      </div>

      {/* Title bar */}
      <div className="max-w-7xl mx-auto px-6 pt-2 pb-4">
        <div className="flex flex-row-reverse items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-navy">{property.address}</h1>
            <div className="flex flex-row-reverse items-center gap-1.5 mt-1 text-gray-400 text-sm">
              <MapPin className="w-3.5 h-3.5" /><span>{property.city}</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-2xl font-bold text-navy">{formatPrice}</div>
            <div className="text-xs text-gray-400">₪{pricePerSqm}/מ״ר</div>
          </div>
        </div>

        {/* Quick stat pills */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {[
            { val: `${property.rooms} חדרים`, icon: Layers },
            { val: `${property.sqm} מ״ר`, icon: Maximize2 },
            { val: `קומה ${property.floor}/${property.totalFloors}`, icon: Building },
            ...(property.elevator ? [{ val: "מעלית", icon: CheckCircle2 }] : []),
            ...(property.balcony ? [{ val: "מרפסת", icon: Sun }] : []),
            ...(property.storage ? [{ val: "מחסן", icon: Building }] : []),
          ].map((s) => (
            <div key={s.val} className="flex items-center gap-1.5 bg-white border border-gray-200 text-navy text-xs font-medium px-3 py-1.5 rounded-full">
              <s.icon className="w-3.5 h-3.5 text-amber" />{s.val}
            </div>
          ))}
        </div>
      </div>

      {/* Main layout — flex-row-reverse cancels RTL reversal, giving visual LTR column order */}
      <div className="max-w-7xl mx-auto px-6 pb-20 flex flex-row-reverse gap-6">
        {/* ── Left column ── */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* ── Photo Gallery ── */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="relative" style={{ height: "420px" }}>
              <Image
                src={property.photos[activePhoto]}
                alt={property.address}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/30 to-transparent" />

              {/* LiDAR badge */}
              <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-navy/80 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full">
                <Scan className="w-3.5 h-3.5 text-amber" />
                {activePhoto === 1 ? "תוכנית קומה LiDAR מקורית" : "מאומת LiDAR"}
              </div>

              {/* Photo counter */}
              <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full">
                {activePhoto + 1} / {property.photos.length}
              </div>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-2 p-3 bg-gray-50 border-t border-gray-100">
              {property.photos.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActivePhoto(i)}
                  className={`relative w-20 h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                    activePhoto === i ? "border-amber scale-105 shadow-md" : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image src={src} alt="" fill className="object-cover" />
                  {i === 1 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <Scan className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              ))}
              <div className="text-xs text-gray-400 self-center mr-1">
                {property.photos.length > 1 && "LiDAR ·"}
              </div>
            </div>
          </div>

          {/* ── Key highlights bar ── */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "שנת בנייה", val: property.yearBuilt.toString(), color: "text-navy" },
              { label: "ועד בית", val: `₪${property.hoa}/חודש`, color: "text-navy" },
              { label: "מחיר למ״ר", val: `₪${pricePerSqm}`, color: "text-amber" },
              { label: "תקרה", val: `${property.structural.ceilingHeight}מ׳`, color: property.structural.ceilingHeight >= 3 ? "text-green-600" : "text-navy" },
            ].map((h) => (
              <div key={h.label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
                <div className={`text-lg font-bold ${h.color}`}>{h.val}</div>
                <div className="text-xs text-gray-400 mt-0.5">{h.label}</div>
              </div>
            ))}
          </div>

          {/* ── Property details grid ── */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="text-base font-bold text-navy mb-4 flex items-center gap-2">
              <Info className="w-4 h-4 text-amber" />פרטי הנכס
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "חניה", val: property.parking, good: property.parking.includes("מקורה") },
                { label: "מיזוג אוויר", val: property.ac, good: true },
                { label: "מים חמים", val: property.hotWater, good: true },
                { label: "קיר מטבח", val: property.structural.kitchenWall, good: hasDrywall, highlight: hasDrywall },
                { label: "אור טבעי", val: property.structural.naturalLight, good: true },
                { label: "כיוון", val: property.structural.facing, good: false },
                { label: "חלונות", val: `${property.structural.windows} חלונות`, good: property.structural.windows >= 5 },
                { label: "מרפסת", val: property.balcony ? "כן" : "לא", good: property.balcony },
                { label: "מחסן", val: property.storage ? "כן" : "לא", good: property.storage },
              ].map((d) => (
                <div key={d.label} className={`rounded-xl p-3 border ${d.highlight ? "border-amber/30 bg-amber-light/40" : "border-gray-100 bg-gray-50"}`}>
                  <div className="text-xs text-gray-400 mb-1">{d.label}</div>
                  <div className={`text-sm font-semibold leading-tight ${d.highlight ? "text-amber" : "text-navy"}`}>{d.val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── LiDAR Floor Plan ── */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-navy flex items-center gap-2">
                  <Scan className="w-4 h-4 text-amber" />תוכנית קומה — LiDAR
                </h2>
                <p className="text-gray-400 text-xs mt-0.5">נמדד ב-{property.scanDate} · דיוק מילימטרי</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-50 rounded-xl p-1 mb-4 w-fit">
              {[
                { key: "lidar", label: "📐 תמונה מקורית" },
                { key: "interactive", label: "🖱️ אינטראקטיבי" },
              ].map((t) => (
                <button key={t.key} onClick={() => setFloorPlanTab(t.key as "lidar" | "interactive")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    floorPlanTab === t.key ? "bg-white text-navy shadow-sm" : "text-gray-400 hover:text-navy"
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>

            {floorPlanTab === "lidar" ? (
              <div className="relative w-full bg-white rounded-xl overflow-hidden border border-gray-100">
                <Image src="/lidar.jpg" alt="תוכנית קומה LiDAR" width={800} height={600} className="w-full h-auto object-contain" />
                <div className="absolute top-3 right-3 bg-navy/70 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5">
                  <Scan className="w-3 h-3 text-amber" />סריקת LiDAR מקורית
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex flex-wrap gap-1.5">
                    {property.floorPlan.rooms.map((r) => (
                      <span key={r.id} className="text-xs bg-amber-light text-navy px-2.5 py-1 rounded-full font-medium">
                        {r.name} · {r.sqm} מ״ר
                      </span>
                    ))}
                    <span className="text-xs bg-navy text-white px-2.5 py-1 rounded-full font-medium">
                      סה״כ {property.floorPlan.totalSqm} מ״ר
                    </span>
                  </div>
                  {hasDrywall && (
                    <button onClick={() => setHighlightDrywall(!highlightDrywall)}
                      className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all font-medium ${
                        highlightDrywall ? "bg-amber text-white border-amber" : "bg-white text-amber border-amber/40 hover:bg-amber-light"
                      }`}>
                      <Zap className="w-3.5 h-3.5" />{highlightDrywall ? "קיר מודגש" : "הדגש קיר גבס"}
                    </button>
                  )}
                </div>
                <FloorPlan floorPlan={property.floorPlan} highlightDrywall={highlightDrywall} />
              </>
            )}
          </div>

          {/* ── Open Plan Simulator ── */}
          {hasDrywall && <OpenPlanVisualizer />}

          {/* ── Structural Intelligence ── */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="text-base font-bold text-navy mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber" />נתוני מבנה
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "קיר המטבח", value: property.structural.kitchenWall, highlight: hasDrywall, icon: Zap },
                { label: "גובה תקרה", value: `${property.structural.ceilingHeight} מ׳`, highlight: property.structural.ceilingHeight >= 3, icon: Layers },
                { label: "חלונות", value: `${property.structural.windows} חלונות`, highlight: false, icon: Wind },
                { label: "אור טבעי", value: property.structural.naturalLight, highlight: true, icon: Sun },
                { label: "כיוון", value: property.structural.facing, highlight: false, icon: Trees },
                { label: "מעלית", value: property.elevator ? "כן — גישה ישירה לקומה" : "אין מעלית", highlight: property.elevator, icon: CheckCircle2 },
              ].map((item) => (
                <div key={item.label} className={`rounded-xl p-3.5 border ${item.highlight ? "border-amber/20 bg-amber-light/30" : "border-gray-100 bg-gray-50"}`}>
                  <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1.5">
                    <item.icon className="w-3.5 h-3.5" />{item.label}
                  </div>
                  <div className={`font-semibold text-sm ${item.highlight ? "text-amber" : "text-navy"}`}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── NEIGHBORHOOD INTELLIGENCE ── */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="text-base font-bold text-navy mb-1 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber" />מידע שכונה — לזוג צעיר
            </h2>
            <p className="text-xs text-gray-400 mb-5">כל המרחקים הם הליכה ברגל, אלא אם צוין אחרת</p>

            <div className="space-y-6">
              <NeighborhoodSection title="חינוך וילדים" emoji="🎓" items={property.neighborhood.education} />
              <div className="border-t border-gray-100" />
              <NeighborhoodSection title="בריאות ורפואה" emoji="🏥" items={property.neighborhood.health} />
              <div className="border-t border-gray-100" />
              <NeighborhoodSection title="תחבורה ציבורית" emoji="🚆" items={property.neighborhood.transit} />
              <div className="border-t border-gray-100" />
              <NeighborhoodSection title="קניות ומסחר" emoji="🛒" items={property.neighborhood.shopping} />
              <div className="border-t border-gray-100" />
              <NeighborhoodSection title="פארקים וטבע" emoji="🌳" items={property.neighborhood.parks} />
              <div className="border-t border-gray-100" />
              <NeighborhoodSection title="קהילה ופנאי" emoji="🏘️" items={property.neighborhood.community} />
            </div>
          </div>

          {/* ── Price History ── */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-navy flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber" />היסטוריית מחיר
              </h2>
              <div className="flex items-center gap-1 text-green-600 text-sm font-semibold bg-green-50 px-2.5 py-1 rounded-full">
                <ArrowUpRight className="w-3.5 h-3.5" />+23% מאז 2022
              </div>
            </div>
            <PriceChart data={property.priceHistory} />
          </div>

          {/* ── Building Transactions ── */}
          {property.buildingTransactions.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="text-base font-bold text-navy mb-1 flex items-center gap-2">
                <Building className="w-4 h-4 text-amber" />עסקאות בבניין
              </h2>
              <p className="text-gray-400 text-xs mb-4">נתוני ממשלה — עסקאות שהושלמו באותו בניין</p>
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-right text-xs text-gray-400">
                      <th className="px-4 py-2.5 font-medium">תאריך</th>
                      <th className="px-4 py-2.5 font-medium">קומה</th>
                      <th className="px-4 py-2.5 font-medium">שטח</th>
                      <th className="px-4 py-2.5 font-medium text-left">מחיר</th>
                      <th className="px-4 py-2.5 font-medium text-left">למ״ר</th>
                    </tr>
                  </thead>
                  <tbody>
                    {property.buildingTransactions.map((tx, i) => (
                      <tr key={i} className="border-t border-gray-50 hover:bg-amber-light/20 transition-colors">
                        <td className="px-4 py-3 text-navy font-medium">{tx.date}</td>
                        <td className="px-4 py-3 text-gray-500">{tx.floor}</td>
                        <td className="px-4 py-3 text-gray-500">{tx.sqm} מ״ר</td>
                        <td className="px-4 py-3 text-navy font-semibold text-left">₪{(tx.price / 1000000).toFixed(2)}M</td>
                        <td className="px-4 py-3 text-gray-400 text-xs text-left">₪{Math.round(tx.price / tx.sqm).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 p-3 bg-amber-light rounded-xl text-xs text-navy/70">
                <span className="font-semibold text-navy">💡 תובנת שוק:</span> מחיר הנכס הזה (₪{pricePerSqm}/מ״ר) נמוך{" "}
                ממוצע הבניין — לפי נתוני ממשלת ישראל. פוטנציאל למשא ומתן.
              </div>
            </div>
          )}

          {/* ── About ── */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="text-base font-bold text-navy mb-3">על הנכס</h2>
            <p className="text-gray-600 text-sm leading-relaxed">{property.description}</p>
          </div>

          {/* ── Reviews ── */}
          <ReviewsSection propertyId={property.id} />

          {/* ── Seller ── */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">מוכר</h3>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-amber rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">
                {property.seller.initials}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-navy">{property.seller.name}</span>
                  {property.seller.verified && (
                    <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />בעלים מאומת
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-gray-400 text-sm mt-0.5">
                  <Clock className="w-3.5 h-3.5" />{property.seller.responseTime}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right sidebar ── */}
        <div className="w-72 shrink-0">
          <div className="sticky top-20 space-y-4">
            {/* Actions */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-2.5">
              <button onClick={() => setShowSchedule(true)}
                className="w-full flex items-center justify-center gap-2 bg-amber hover:bg-amber/90 text-white font-semibold py-3.5 rounded-xl transition-all shadow-sm">
                <CalendarDays className="w-4 h-4" />תיאום ביקור
              </button>
              <button className="w-full flex items-center justify-center gap-2 border border-gray-200 text-navy hover:border-amber hover:text-amber font-medium py-3 rounded-xl transition-all text-sm">
                <Video className="w-4 h-4" />סיור תלת-ממדי
              </button>
              <button onClick={() => setShowOffer(true)}
                className="w-full flex items-center justify-center gap-2 border border-gray-200 text-navy hover:border-amber hover:text-amber font-medium py-3 rounded-xl transition-all text-sm">
                <DollarSign className="w-4 h-4" />הגשת הצעה
              </button>
            </div>

            {/* Key highlights */}
            <div className="bg-amber-light rounded-2xl p-4">
              <p className="text-xs font-bold text-navy/60 uppercase tracking-wider mb-3">✨ נקודות מפתח</p>
              <div className="space-y-2">
                {[
                  hasDrywall && "פוטנציאל מטבח פתוח (+₪150K)",
                  `תקרות ${property.structural.ceilingHeight}מ׳ — גבוהות`,
                  property.parking.includes("מקורה") && "חניה מקורה כלולה",
                  "גן ילדים ברחוב — 1 דק׳",
                  "גן שעשועים ממש ליד",
                  "רכבת ב-2 דק׳ הליכה",
                  "רכבת קלה ב-2027",
                  "ללא עמלות מתווך",
                ].filter(Boolean).map((h) => (
                  <div key={h as string} className="flex items-start gap-2 text-sm text-navy/80">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber shrink-0 mt-1.5" />
                    {h}
                  </div>
                ))}
              </div>
            </div>

            {/* Neighborhood score summary */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <p className="text-xs font-bold text-navy/60 uppercase tracking-wider mb-3">ציון שכונה</p>
              {[
                { label: "חינוך", score: 95, emoji: "🎓" },
                { label: "בריאות", score: 90, emoji: "🏥" },
                { label: "תחבורה", score: 98, emoji: "🚆" },
                { label: "קניות", score: 85, emoji: "🛒" },
                { label: "פארקים", score: 88, emoji: "🌳" },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-2 mb-2 last:mb-0">
                  <span className="text-xs w-5">{s.emoji}</span>
                  <span className="text-xs text-gray-500 w-14 shrink-0">{s.label}</span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber rounded-full" style={{ width: `${s.score}%` }} />
                  </div>
                  <span className="text-xs font-bold text-navy w-7 text-left">{s.score}</span>
                </div>
              ))}
            </div>

            {/* Chat */}
            <ChatWidget propertyName={property.address.split(" ")[1] || property.address} />
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      {showSchedule && (
        <div className="fixed inset-0 bg-navy/50 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => setShowSchedule(false)}>
          <div className="bg-white rounded-2xl p-7 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()} dir="rtl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-navy">תיאום ביקור</h2>
              <button onClick={() => setShowSchedule(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <p className="text-gray-400 text-sm mb-5">{property.address} · {property.city}</p>
            <div className="space-y-2.5">
              {[
                { label: "ערב שני", time: "18:00–21:00", available: true },
                { label: "בוקר שלישי", time: "09:00–12:00", available: false },
                { label: "בוקר שישי", time: "09:00–13:00", available: true },
                { label: "אחר צהריים שישי", time: "14:00–17:00", available: true },
              ].map((slot) => (
                <button key={slot.label} disabled={!slot.available}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                    slot.available ? "border-gray-200 hover:border-amber hover:bg-amber-light text-navy" : "border-gray-100 text-gray-300 cursor-not-allowed"
                  }`}>
                  <span>{slot.time}</span><span>{slot.label}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setShowSchedule(false)} className="w-full mt-5 bg-amber text-white font-semibold py-3 rounded-xl hover:bg-amber/90 transition-colors">
              אישור ביקור
            </button>
          </div>
        </div>
      )}

      {/* Offer Modal */}
      {showOffer && (
        <div className="fixed inset-0 bg-navy/50 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => setShowOffer(false)}>
          <div className="bg-white rounded-2xl p-7 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()} dir="rtl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-navy">הגשת הצעה</h2>
              <button onClick={() => setShowOffer(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <p className="text-gray-400 text-sm mb-5">מחיר מבוקש: {formatPrice}</p>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">הצעתך (₪)</label>
                <input type="text" defaultValue="3,100,000" className="w-full mt-1.5 border border-gray-200 rounded-xl px-4 py-3 text-navy font-medium text-lg focus:outline-none focus:border-amber text-right" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">הודעה למוכר</label>
                <textarea rows={3} placeholder="אנחנו מאוד אוהבים את הדירה..." className="w-full mt-1.5 border border-gray-200 rounded-xl px-4 py-3 text-navy text-sm focus:outline-none focus:border-amber resize-none text-right" />
              </div>
            </div>
            <div className="mt-3 p-3 bg-amber-light rounded-xl text-xs text-navy/70">
              <span className="font-semibold text-navy">💡 נתוני שוק:</span> דירות דומות בבניין נמכרו ב-₪3.05M–₪3.4M. הצעתך בטווח הסביר.
            </div>
            <button onClick={() => setShowOffer(false)} className="w-full mt-5 bg-amber text-white font-semibold py-3 rounded-xl hover:bg-amber/90">
              שליחת הצעה למוכר
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Reviews Section ───────────────────────────────────────────────────────────
function ReviewsSection({ propertyId }: { propertyId: string }) {
  const propertyReviews = reviews.filter((r) => r.propertyId === propertyId);
  const [showAll, setShowAll] = useState(false);

  if (propertyReviews.length === 0) return null;

  const avgRating = propertyReviews.reduce((s, r) => s + r.rating, 0) / propertyReviews.length;
  const displayed = showAll ? propertyReviews : propertyReviews.slice(0, 2);

  const ratingCounts = [5, 4, 3, 2, 1].map((n) => ({
    n,
    count: propertyReviews.filter((r) => r.rating === n).length,
  }));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-amber" />
        <h2 className="text-base font-bold text-navy">חוות דעת מבקרים</h2>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{propertyReviews.length} ביקורות</span>
      </div>

      {/* Rating summary */}
      <div className="flex items-center gap-5 mb-5 p-4 bg-gray-50 rounded-2xl">
        <div className="text-center">
          <div className="text-4xl font-bold text-navy">{avgRating.toFixed(1)}</div>
          <div className="flex gap-0.5 mt-1 justify-center">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(avgRating) ? "text-amber fill-amber" : "text-gray-300"}`} />
            ))}
          </div>
          <div className="text-xs text-gray-400 mt-1">מ-{propertyReviews.length} ביקורות</div>
        </div>
        <div className="flex-1 space-y-1.5">
          {ratingCounts.map(({ n, count }) => (
            <div key={n} className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-3">{n}</span>
              <Star className="w-3 h-3 text-amber fill-amber shrink-0" />
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber rounded-full"
                  style={{ width: `${propertyReviews.length > 0 ? (count / propertyReviews.length) * 100 : 0}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 w-4">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Review cards */}
      <div className="space-y-4">
        {displayed.map((review) => (
          <div key={review.id} className="border border-gray-100 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${review.reviewer.bg}`}>
                {review.reviewer.initials}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-navy text-sm">{review.reviewer.name}</span>
                  {review.verified && (
                    <span className="flex items-center gap-0.5 text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />ביקור מאומת
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-3 h-3 ${s <= review.rating ? "text-amber fill-amber" : "text-gray-300"}`} />
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">{review.visitDate}</span>
                  <span className="text-xs text-gray-300">·</span>
                  <span className="text-xs text-gray-400">ציון התאמה {review.matchScore}%</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-3">
              {review.tags.map((t) => (
                <span key={t} className="text-xs bg-gray-50 border border-gray-100 text-navy/60 px-2 py-0.5 rounded-full">{t}</span>
              ))}
            </div>

            <p className="text-sm text-gray-600 leading-relaxed mt-2">{review.text}</p>

            <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-navy transition-colors mt-3">
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>{review.helpful} מצאו זאת מועיל</span>
            </button>
          </div>
        ))}
      </div>

      {propertyReviews.length > 2 && (
        <button
          onClick={() => setShowAll((v) => !v)}
          className="mt-4 w-full text-sm text-amber font-medium py-2.5 border border-amber/30 rounded-xl hover:bg-amber-light transition-colors">
          {showAll ? "הצג פחות" : `הצג את כל ${propertyReviews.length} הביקורות`}
        </button>
      )}
    </div>
  );
}
