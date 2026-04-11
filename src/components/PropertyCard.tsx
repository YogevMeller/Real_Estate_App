"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Maximize2, TrendingUp, Scan, ChevronLeft, ChevronRight, Zap } from "lucide-react";
import { Property } from "@/lib/mockData";

export default function PropertyCard({ property }: { property: Property }) {
  const [photoIdx, setPhotoIdx] = useState(0);

  const formattedPrice =
    property.price >= 1000000
      ? `₪${(property.price / 1000000).toFixed(1)}M`
      : `₪${(property.price / 1000).toFixed(0)}K`;

  const hasDrywall = property.floorPlan.drywallPoints.length > 0;

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-amber/40 hover:shadow-lg transition-all duration-300 group" dir="rtl">
      {/* Photo gallery */}
      <div className="relative h-52 overflow-hidden bg-amber-light">
        <Image
          src={property.photos[photoIdx]}
          alt={property.address}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/50 via-transparent to-transparent" />

        {/* Photo nav arrows */}
        {property.photos.length > 1 && (
          <>
            <button
              onClick={(e) => { e.preventDefault(); setPhotoIdx((i) => (i + 1) % property.photos.length); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); setPhotoIdx((i) => (i - 1 + property.photos.length) % property.photos.length); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
            {/* Dots */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-1">
              {property.photos.map((_, i) => (
                <button key={i} onClick={(e) => { e.preventDefault(); setPhotoIdx(i); }}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${i === photoIdx ? "bg-white scale-125" : "bg-white/50"}`} />
              ))}
            </div>
          </>
        )}

        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          <span className="flex items-center gap-1 bg-navy/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
            <Scan className="w-3 h-3 text-amber" />
            LiDAR ✓
          </span>
          {hasDrywall && (
            <span className="flex items-center gap-1 bg-amber text-white text-xs px-2 py-1 rounded-full">
              <Zap className="w-3 h-3" />
              פוטנציאל פתוח
            </span>
          )}
        </div>

        {/* Price */}
        <div className="absolute bottom-3 right-3">
          <span className="text-white font-bold text-xl drop-shadow">{formattedPrice}</span>
          <span className="text-white/70 text-xs mr-2">₪{Math.round(property.price / property.sqm).toLocaleString()}/מ״ר</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-navy text-base">{property.address}</h3>
        <div className="flex items-center gap-1 mt-0.5 text-gray-400 text-sm">
          <MapPin className="w-3.5 h-3.5" />
          <span>{property.city}</span>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="text-xs bg-gray-50 border border-gray-100 text-navy px-2.5 py-1 rounded-lg font-medium">{property.rooms} חד׳</span>
          <span className="text-xs bg-gray-50 border border-gray-100 text-navy px-2.5 py-1 rounded-lg font-medium flex items-center gap-1">
            <Maximize2 className="w-3 h-3" />{property.sqm} מ״ר
          </span>
          <span className="text-xs bg-gray-50 border border-gray-100 text-navy px-2.5 py-1 rounded-lg font-medium">קומה {property.floor}/{property.totalFloors}</span>
          {property.elevator && <span className="text-xs bg-gray-50 border border-gray-100 text-navy px-2.5 py-1 rounded-lg font-medium">מעלית</span>}
          {property.balcony && <span className="text-xs bg-gray-50 border border-gray-100 text-navy px-2.5 py-1 rounded-lg font-medium">מרפסת</span>}
        </div>

        {/* Neighborhood quick stats */}
        <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
          <span>🏫 גן {property.neighborhood.education[0]?.walkMin} דק׳</span>
          <span>🏥 מרפאה {property.neighborhood.health[0]?.walkMin} דק׳</span>
          <span>🚆 רכבת {property.neighborhood.transit[0]?.walkMin} דק׳</span>
        </div>

        {/* CTA */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
          <div className="flex items-center gap-1.5 bg-amber-light rounded-lg px-2.5 py-1.5">
            <div className="w-4 h-4 bg-amber rounded-full flex items-center justify-center shrink-0">
              <span className="text-white text-[7px] font-bold">AI</span>
            </div>
            <span className="text-xs text-navy/70">סוכן זמין</span>
          </div>
          <Link href={`/property/${property.id}`}
            className="flex items-center gap-1 text-amber font-semibold text-sm hover:gap-2 transition-all">
            <TrendingUp className="w-4 h-4" />
            לפרטי הנכס
          </Link>
        </div>
      </div>
    </div>
  );
}
