"use client";
import { useState } from "react";
import { Search, SlidersHorizontal, MapPin, Maximize2, Building, TrendingUp, X, Scan, ChevronDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { properties } from "@/lib/mockData";

const CITIES = ["הכל", "תל אביב", "פתח תקווה", "רמת גן", "הרצליה"];
const PRICE_OPTS = ["הכל", "עד ₪2M", "₪2M–₪3M", "₪3M–₪4M", "₪4M+"];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("הכל");
  const [rooms, setRooms] = useState("הכל");
  const [price, setPrice] = useState("הכל");
  const [showFilters, setShowFilters] = useState(false);
  const [sort, setSort] = useState("חדש ביותר");

  const filtered = properties.filter((p) => {
    if (city !== "הכל" && p.city !== city) return false;
    if (rooms !== "הכל" && p.rooms.toString() !== rooms && !(rooms === "5+" && p.rooms >= 5)) return false;
    return true;
  });

  const formatPrice = (p: number) => `₪${(p / 1000000).toFixed(1)}M`;

  return (
    <div className="min-h-screen bg-cream" dir="rtl">
      <Navbar />

      {/* Search bar - sticky */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus-within:border-amber focus-within:ring-1 focus-within:ring-amber/20 transition-all">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="כתובת, שכונה, או מילת מפתח..."
                className="flex-1 bg-transparent text-navy text-sm outline-none placeholder-gray-400 text-right"
                dir="rtl"
              />
              {query && (
                <button onClick={() => setQuery("")}>
                  <X className="w-4 h-4 text-gray-400 hover:text-navy" />
                </button>
              )}
            </div>

            {/* City */}
            <div className="relative">
              <select value={city} onChange={(e) => setCity(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-8 text-sm text-navy focus:outline-none focus:border-amber cursor-pointer">
                {CITIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <ChevronDown className="absolute left-2.5 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Rooms */}
            <div className="relative">
              <select value={rooms} onChange={(e) => setRooms(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-8 text-sm text-navy focus:outline-none focus:border-amber cursor-pointer">
                <option value="הכל">כל מס׳ חדרים</option>
                {["2", "3", "4", "5+"].map((r) => <option key={r}>{r} חדרים</option>)}
              </select>
              <ChevronDown className="absolute left-2.5 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Price */}
            <div className="relative">
              <select value={price} onChange={(e) => setPrice(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-8 text-sm text-navy focus:outline-none focus:border-amber cursor-pointer">
                {PRICE_OPTS.map((p) => <option key={p}>{p}</option>)}
              </select>
              <ChevronDown className="absolute left-2.5 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Filters */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                showFilters ? "bg-navy text-white border-navy" : "bg-white border-gray-200 text-navy hover:border-amber"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              סינון
            </button>
          </div>

          {/* Advanced filters */}
          {showFilters && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 flex-wrap">
              {["מאומת LiDAR", "פוטנציאל מטבח פתוח", "קיר גבס נשלף", "ליד הרכבת הקלה",
                "תקרה גבוהה (3מ׳+)", "מעלית", "חניה מקורה", "קומה קרקע", "קומה עליונה", "פונה דרומה"].map((tag) => (
                <button key={tag}
                  className="text-xs border border-gray-200 text-navy/70 px-3 py-1.5 rounded-full hover:border-amber hover:text-amber transition-colors">
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Results header */}
      <div className="max-w-7xl mx-auto px-6 pt-6 pb-4 flex items-center justify-between">
        <div>
          <span className="text-navy font-semibold">{filtered.length} נכסים</span>
          <span className="text-gray-400 text-sm mr-2">נמצאו ב{city === "הכל" ? "ישראל" : city}</span>
        </div>
        <div className="relative">
          <select value={sort} onChange={(e) => setSort(e.target.value)}
            className="appearance-none bg-white border border-gray-200 rounded-xl px-3 py-2 pl-7 text-sm text-navy focus:outline-none focus:border-amber cursor-pointer">
            {["חדש ביותר", "מחיר: נמוך לגבוה", "מחיר: גבוה לנמוך", "הכי הרבה חדרים"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <ChevronDown className="absolute left-2 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-3 gap-6">
          {filtered.map((p) => (
            <Link key={p.id} href={`/property/${p.id}`} className="group">
              <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-amber/40 hover:shadow-xl transition-all duration-300">
                {/* Image */}
                <div className="relative h-52 overflow-hidden bg-amber-light">
                  <Image
                    src="/lidar.jpg"
                    alt={p.address}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/50 to-transparent" />
                  <div className="absolute top-3 right-3 flex flex-col gap-1.5">
                    <span className="flex items-center gap-1 bg-navy/80 text-white text-xs px-2 py-1 rounded-full">
                      <Scan className="w-3 h-3 text-amber" />
                      LiDAR
                    </span>
                    {p.structural.kitchenWall.includes("נשלף") && (
                      <span className="bg-amber text-white text-xs px-2 py-1 rounded-full">
                        פוטנציאל מטבח פתוח
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <span className="text-white font-bold text-xl">{formatPrice(p.price)}</span>
                    <span className="text-white/70 text-xs mr-2">₪{Math.round(p.price / p.sqm).toLocaleString()}/מ״ר</span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-navy text-base group-hover:text-amber transition-colors">{p.address}</h3>
                  <div className="flex items-center gap-1 mt-1 text-gray-400 text-sm">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{p.city}</span>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs bg-gray-50 border border-gray-100 text-navy px-2 py-1 rounded-lg">{p.rooms} חדרים</span>
                    <span className="text-xs bg-gray-50 border border-gray-100 text-navy px-2 py-1 rounded-lg flex items-center gap-1">
                      <Maximize2 className="w-3 h-3" />{p.sqm} מ״ר
                    </span>
                    <span className="text-xs bg-gray-50 border border-gray-100 text-navy px-2 py-1 rounded-lg">קומה {p.floor}/{p.totalFloors}</span>
                  </div>

                  <div className="mt-3 flex items-center gap-2 bg-amber-light rounded-xl px-3 py-2">
                    <div className="w-5 h-5 bg-amber rounded-full flex items-center justify-center shrink-0">
                      <span className="text-white text-[8px] font-bold">AI</span>
                    </div>
                    <span className="text-xs text-navy/70">שאל את הסוכן כל שאלה ←</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-24">
            <Building className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-navy">לא נמצאו נכסים</h3>
            <p className="text-gray-400 mt-1">נסה לשנות את הסינון</p>
          </div>
        )}
      </div>
    </div>
  );
}
