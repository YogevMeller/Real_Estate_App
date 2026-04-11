"use client";
import { useState } from "react";
import type { Property } from "@/lib/mockData";

interface FloorPlanProps {
  floorPlan: Property["floorPlan"];
  highlightDrywall?: boolean;
}

// ─── Layout constants ─────────────────────────────
const PL = 70;  // padding left  (for dimension lines)
const PT = 55;  // padding top
const PR = 60;  // padding right
const PB = 65;  // padding bottom
const AW = 580; // apartment pixel width
const AH = 420; // apartment pixel height
const W  = PL + AW + PR; // total SVG width  = 710
const H  = PT + AH + PB; // total SVG height = 540

// Apartment origin in SVG coords
const OX = PL;
const OY = PT;

// Wall geometry
const EW = 10; // exterior wall thickness
const IW = 9;  // interior wall thickness

// ─── Room inner fills (in apt-relative coords) ───
// walls are the spaces BETWEEN these rects
const ROOMS = [
  { id: "living",   name: "Living Room", sqm: 32, wm: "5.64", hm: "4.73", x: EW,     y: EW,     w: 292, h: 245 },
  { id: "kitchen",  name: "Kitchen",     sqm: 15, wm: "4.91", hm: "2.64", x: 318,    y: EW,     w: 253, h: 127 },
  { id: "bedroom1", name: "Bedroom 1",   sqm: 18, wm: "4.91", hm: "5.00", x: 318,    y: 153,    w: 253, h: 257 },
  { id: "bedroom2", name: "Bedroom 2",   sqm: 12, wm: "3.00", hm: "2.91", x: EW,     y: 271,    w: 147, h: 139 },
  { id: "bathroom", name: "Bathroom",    sqm: 10, wm: "2.64", hm: "2.91", x: 167,    y: 271,    w: 133, h: 139 },
];

// Room hover color
const ROOM_BASE = "#EDEDED";
const ROOM_HOVER = "#FDE9B5";

// ─── Door gaps (white rects cut into wall areas) ──────────────
// These coordinates are in SVG space (with OX/OY already added)
const DOOR_GAPS = [
  // Entrance: left exterior wall
  { x: OX - EW, y: OY + 185, w: EW + 1, h: 55 },
  // Living → Kitchen: center vertical wall
  { x: OX + 303, y: OY + 63, w: IW + 1, h: 50 },
  // Living → Bedroom 2: bottom-of-living horizontal wall
  { x: OX + 58, y: OY + 261, w: 55, h: IW + 1 },
  // Bedroom 2 → Bathroom: vertical wall between them
  { x: OX + 158, y: OY + 325, w: IW + 1, h: 50 },
  // Kitchen → Bedroom 1: horizontal wall
  { x: OX + 378, y: OY + 141, w: 55, h: IW + 1 },
];

// Room fill color
const FILL = "#EDEDED";

export default function FloorPlan({ floorPlan, highlightDrywall = false }: FloorPlanProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [drywallTip, setDrywallTip] = useState(false);

  // Dimension labels helper
  const Dim = ({ x1, y1, x2, y2, label, rotate }: { x1: number; y1: number; x2: number; y2: number; label: string; rotate?: boolean }) => {
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    return (
      <g>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#888" strokeWidth="0.8" />
        <line x1={x1} y1={y1 - 4} x2={x1} y2={y1 + 4} stroke="#888" strokeWidth="0.8" />
        <line x1={x2} y1={y2 - 4} x2={x2} y2={y2 + 4} stroke="#888" strokeWidth="0.8" />
        <text
          x={mx}
          y={my}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="9"
          fill="#666"
          fontFamily="Inter, sans-serif"
          transform={rotate ? `rotate(-90,${mx},${my})` : undefined}
          dy={rotate ? 0 : -5}
        >
          {label}
        </text>
      </g>
    );
  };

  return (
    <div className="relative w-full bg-white rounded-2xl overflow-hidden border border-gray-100">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        style={{ maxHeight: "560px" }}
      >
        {/* ── White background ── */}
        <rect width={W} height={H} fill="white" />

        {/* ── 1. Black apartment silhouette (walls shown as black) ── */}
        <rect x={OX} y={OY} width={AW} height={AH} fill="#1a1a1a" />

        {/* ── 2. Room fills on top of black ── */}
        {ROOMS.map((r) => (
          <rect
            key={r.id}
            x={OX + r.x}
            y={OY + r.y}
            width={r.w}
            height={r.h}
            fill={hovered === r.id ? ROOM_HOVER : ROOM_BASE}
            className="cursor-pointer transition-colors duration-150"
            onMouseEnter={() => setHovered(r.id)}
            onMouseLeave={() => setHovered(null)}
          />
        ))}

        {/* ── 3. Door gap openings (white cuts in walls) ── */}
        {DOOR_GAPS.map((d, i) => (
          <rect key={i} x={d.x} y={d.y} width={d.w} height={d.h} fill="white" />
        ))}

        {/* ── 4. Door arcs & panels ── */}
        {/* Door 1: Entrance (left wall) — hinge at (OX, OY+240), swings right */}
        <g stroke="#1a1a1a" strokeWidth="1.2" fill="none">
          <line x1={OX} y1={OY + 185} x2={OX} y2={OY + 240} />
          <path d={`M ${OX} ${OY + 185} A 55 55 0 0 1 ${OX + 55} ${OY + 240}`} strokeDasharray="none" />
        </g>

        {/* Door 2: Living → Kitchen (center wall, y=63-113) — hinge top, swings into living */}
        <g stroke="#1a1a1a" strokeWidth="1.2" fill="none">
          <line x1={OX + 303} y1={OY + 63} x2={OX + 303} y2={OY + 113} />
          <path d={`M ${OX + 303} ${OY + 63} A 50 50 0 0 0 ${OX + 253} ${OY + 113}`} />
        </g>

        {/* Door 3: Living → Bed2 (bottom wall) — hinge right, swings into bed2 */}
        <g stroke="#1a1a1a" strokeWidth="1.2" fill="none">
          <line x1={OX + 58} y1={OY + 271} x2={OX + 113} y2={OY + 271} />
          <path d={`M ${OX + 113} ${OY + 271} A 55 55 0 0 1 ${OX + 58} ${OY + 326}`} />
        </g>

        {/* Door 4: Bed2 → Bathroom (vert wall) — hinge top, swings into bath */}
        <g stroke="#1a1a1a" strokeWidth="1.2" fill="none">
          <line x1={OX + 167} y1={OY + 325} x2={OX + 167} y2={OY + 375} />
          <path d={`M ${OX + 167} ${OY + 375} A 50 50 0 0 1 ${OX + 217} ${OY + 325}`} />
        </g>

        {/* Door 5: Kitchen → Bed1 (horiz wall) — hinge right, swings up into kitchen */}
        <g stroke="#1a1a1a" strokeWidth="1.2" fill="none">
          <line x1={OX + 378} y1={OY + 141} x2={OX + 433} y2={OY + 141} />
          <path d={`M ${OX + 378} ${OY + 141} A 55 55 0 0 0 ${OX + 433} ${OY + 86}`} />
        </g>

        {/* ── 5. Furniture ── */}
        {/* LIVING ROOM */}
        <g stroke="#555" strokeWidth="1.3" fill="white">
          {/* Sofa body */}
          <rect x={OX + 60} y={OY + 120} width={175} height={58} rx="4" />
          {/* Sofa back */}
          <rect x={OX + 60} y={OY + 120} width={175} height={16} rx="3" fill="#D8D8D8" stroke="#555" strokeWidth="1.3" />
          {/* Left armrest */}
          <rect x={OX + 54} y={OY + 124} width={10} height={50} rx="3" />
          {/* Right armrest */}
          <rect x={OX + 231} y={OY + 124} width={10} height={50} rx="3" />
          {/* Cushion lines */}
          <line x1={OX + 118} y1={OY + 136} x2={OX + 118} y2={OY + 178} stroke="#999" strokeWidth="0.8" />
          <line x1={OX + 177} y1={OY + 136} x2={OX + 177} y2={OY + 178} stroke="#999" strokeWidth="0.8" />
        </g>
        {/* Coffee table */}
        <rect x={OX + 95} y={OY + 185} width={110} height={48} rx="3" fill="white" stroke="#777" strokeWidth="1" />

        {/* KITCHEN */}
        {/* Counter along top wall */}
        <rect x={OX + 318} y={OY + EW} width={253} height={32} fill="white" stroke="#555" strokeWidth="1.3" />
        {/* Sink */}
        <rect x={OX + 330} y={OY + 13} width={28} height={26} rx="2" fill="#D5D5D5" stroke="#555" strokeWidth="1" />
        <circle cx={OX + 344} cy={OY + 26} r="5" fill="none" stroke="#888" strokeWidth="1" />
        {/* Stovetop */}
        <rect x={OX + 375} y={OY + 13} width={40} height={26} rx="1" fill="#E0E0E0" stroke="#555" strokeWidth="1" />
        <circle cx={OX + 387} cy={OY + 20} r="4" fill="none" stroke="#888" strokeWidth="0.8" />
        <circle cx={OX + 403} cy={OY + 20} r="4" fill="none" stroke="#888" strokeWidth="0.8" />
        <circle cx={OX + 387} cy={OY + 31} r="4" fill="none" stroke="#888" strokeWidth="0.8" />
        <circle cx={OX + 403} cy={OY + 31} r="4" fill="none" stroke="#888" strokeWidth="0.8" />
        {/* Fridge (right side) */}
        <rect x={OX + 559} y={OY + EW} width={12} height={100} fill="white" stroke="#555" strokeWidth="1.3" />
        <line x1={OX + 559} y1={OY + 60} x2={OX + 571} y2={OY + 60} stroke="#999" strokeWidth="0.8" />
        {/* Right side counter */}
        <rect x={OX + 559} y={OY + 110} width={12} height={30} fill="white" stroke="#555" strokeWidth="1.3" />
        {/* Dining table */}
        <ellipse cx={OX + 447} cy={OY + 103} rx={42} ry={28} fill="white" stroke="#555" strokeWidth="1.3" />
        {/* Chairs */}
        <g fill="white" stroke="#777" strokeWidth="1">
          <rect x={OX + 405} y={OY + 88} width={20} height={14} rx="3" />
          <rect x={OX + 474} y={OY + 88} width={20} height={14} rx="3" />
          <rect x={OX + 424} y={OY + 114} width={14} height={18} rx="3" />
          <rect x={OX + 461} y={OY + 114} width={14} height={18} rx="3" />
        </g>

        {/* BEDROOM 1 */}
        {/* Bed frame */}
        <rect x={OX + 340} y={OY + 255} width={185} height={130} rx="4" fill="white" stroke="#555" strokeWidth="1.3" />
        {/* Headboard */}
        <rect x={OX + 340} y={OY + 255} width={185} height={22} rx="3" fill="#D8D8D8" stroke="#555" strokeWidth="1.3" />
        {/* Pillow left */}
        <rect x={OX + 355} y={OY + 282} width={68} height={38} rx="5" fill="#F2F2F2" stroke="#999" strokeWidth="1" />
        {/* Pillow right */}
        <rect x={OX + 437} y={OY + 282} width={68} height={38} rx="5" fill="#F2F2F2" stroke="#999" strokeWidth="1" />
        {/* Wardrobe along bottom */}
        <rect x={OX + 323} y={OY + 400} width={215} height={20} fill="white" stroke="#555" strokeWidth="1.3" />
        <line x1={OX + 430} y1={OY + 400} x2={OX + 430} y2={OY + 408} stroke="#888" strokeWidth="0.8" />
        {/* Handle dots */}
        <circle cx={OX + 415} cy={OY + 410} r="2" fill="#888" />
        <circle cx={OX + 445} cy={OY + 410} r="2" fill="#888" />

        {/* BEDROOM 2 */}
        {/* Single bed */}
        <rect x={OX + 18} y={OY + 293} width={85} height={105} rx="4" fill="white" stroke="#555" strokeWidth="1.3" />
        {/* Headboard */}
        <rect x={OX + 18} y={OY + 293} width={85} height={18} rx="3" fill="#D8D8D8" stroke="#555" strokeWidth="1.3" />
        {/* Pillow */}
        <rect x={OX + 28} y={OY + 316} width={65} height={28} rx="4" fill="#F2F2F2" stroke="#999" strokeWidth="1" />
        {/* Wardrobe */}
        <rect x={OX + 113} y={OY + 293} width={25} height={105} fill="white" stroke="#555" strokeWidth="1.3" />
        <line x1={OX + 113} y1={OY + 345} x2={OX + 138} y2={OY + 345} stroke="#888" strokeWidth="0.8" />

        {/* BATHROOM */}
        {/* Shower stall (top area) */}
        <rect x={OX + 172} y={OY + 276} width={55} height={55} fill="#E8E8E8" stroke="#555" strokeWidth="1.3" />
        {/* Shower head */}
        <circle cx={OX + 199} cy={OY + 300} r="8" fill="none" stroke="#888" strokeWidth="1" />
        <circle cx={OX + 199} cy={OY + 300} r="3" fill="#D0D0D0" stroke="#888" strokeWidth="0.8" />
        {/* Shower door arc */}
        <path d={`M ${OX + 227} ${OY + 276} A 28 28 0 0 0 ${OX + 227} ${OY + 331}`} fill="none" stroke="#888" strokeWidth="1" strokeDasharray="3,2" />

        {/* Toilet */}
        <rect x={OX + 172} y={OY + 353} width={32} height={50} rx="4" fill="white" stroke="#555" strokeWidth="1.3" />
        <ellipse cx={OX + 188} cy={OY + 374} rx="10" ry="12" fill="#E8E8E8" stroke="#777" strokeWidth="1" />
        <rect x={OX + 172} y={OY + 353} width={32} height={14} rx="3" fill="white" stroke="#555" strokeWidth="1.3" />

        {/* Sink */}
        <rect x={OX + 225} y={OY + 356} width={34} height={28} rx="3" fill="white" stroke="#555" strokeWidth="1.3" />
        <circle cx={OX + 242} cy={OY + 365} r="4" fill="none" stroke="#888" strokeWidth="0.8" />
        {/* Sink pipe */}
        <line x1={OX + 242} y1={OY + 384} x2={OX + 242} y2={OY + 393} stroke="#888" strokeWidth="1" />

        {/* ── 6. Drywall indicators ── */}
        {floorPlan.drywallPoints.map((pt, i) => (
          <g key={i}>
            {highlightDrywall && (
              <rect
                x={OX + pt.x - 4}
                y={OY}
                width={8}
                height={AH}
                fill="#F5A623"
                fillOpacity="0.18"
                pointerEvents="none"
              />
            )}
            <circle
              cx={OX + pt.x}
              cy={OY + pt.y}
              r={6.5}
              fill="#F5A623"
              stroke="white"
              strokeWidth="2.5"
              className="drywall-dot cursor-pointer"
              onMouseEnter={() => setDrywallTip(true)}
              onMouseLeave={() => setDrywallTip(false)}
            />
          </g>
        ))}

        {/* ── 7. Room labels ── */}
        {/* סלון */}
        <g fontFamily="Inter, sans-serif" pointerEvents="none">
          <text x={OX + 154} y={OY + 60} textAnchor="middle" fontSize="11" fontWeight="600" fill="#1a1a1a">סלון</text>
          <text x={OX + 154} y={OY + 75} textAnchor="middle" fontSize="9" fill="#555">32 מ״ר (5.64 × 4.73)</text>
        </g>
        {/* מטבח */}
        <g fontFamily="Inter, sans-serif" pointerEvents="none">
          <text x={OX + 447} y={OY + 53} textAnchor="middle" fontSize="10.5" fontWeight="600" fill="#1a1a1a">מטבח</text>
          <text x={OX + 447} y={OY + 66} textAnchor="middle" fontSize="9" fill="#555">15 מ״ר (4.91 × 2.64)</text>
        </g>
        {/* חדר שינה 1 */}
        <g fontFamily="Inter, sans-serif" pointerEvents="none">
          <text x={OX + 447} y={OY + 223} textAnchor="middle" fontSize="10.5" fontWeight="600" fill="#1a1a1a">חדר שינה 1</text>
          <text x={OX + 447} y={OY + 236} textAnchor="middle" fontSize="9" fill="#555">18 מ״ר (4.91 × 5.00)</text>
        </g>
        {/* חדר שינה 2 */}
        <g fontFamily="Inter, sans-serif" pointerEvents="none">
          <text x={OX + 88} y={OY + 282} textAnchor="middle" fontSize="9.5" fontWeight="600" fill="#1a1a1a">חדר שינה 2</text>
          <text x={OX + 88} y={OY + 294} textAnchor="middle" fontSize="8.5" fill="#555">12 מ״ר</text>
          <text x={OX + 88} y={OY + 305} textAnchor="middle" fontSize="8" fill="#777">(3.00 × 2.91)</text>
        </g>
        {/* חדר רחצה */}
        <g fontFamily="Inter, sans-serif" pointerEvents="none">
          <text x={OX + 234} y={OY + 282} textAnchor="middle" fontSize="9" fontWeight="600" fill="#1a1a1a">חדר רחצה</text>
          <text x={OX + 234} y={OY + 293} textAnchor="middle" fontSize="8" fill="#555">10 מ״ר</text>
          <text x={OX + 234} y={OY + 304} textAnchor="middle" fontSize="7.5" fill="#777">(2.64 × 2.91)</text>
        </g>

        {/* ── 8. Dimension lines ── */}
        {/* Top: left column width */}
        <Dim x1={OX} y1={OY - 28} x2={OX + 308} y2={OY - 28} label="5.64" />
        {/* Top: right column width */}
        <Dim x1={OX + 318} y1={OY - 28} x2={OX + AW} y2={OY - 28} label="4.91" />
        {/* Top tick connector lines */}
        <line x1={OX} y1={OY} x2={OX} y2={OY - 34} stroke="#AAA" strokeWidth="0.6" strokeDasharray="3,3" />
        <line x1={OX + 308} y1={OY} x2={OX + 308} y2={OY - 34} stroke="#AAA" strokeWidth="0.6" strokeDasharray="3,3" />
        <line x1={OX + 318} y1={OY} x2={OX + 318} y2={OY - 34} stroke="#AAA" strokeWidth="0.6" strokeDasharray="3,3" />
        <line x1={OX + AW} y1={OY} x2={OX + AW} y2={OY - 34} stroke="#AAA" strokeWidth="0.6" strokeDasharray="3,3" />

        {/* Left: top section height */}
        <Dim x1={OX - 38} y1={OY} x2={OX - 38} y2={OY + 260} label="4.73" rotate />
        {/* Left: bottom section height */}
        <Dim x1={OX - 38} y1={OY + 271} x2={OX - 38} y2={OY + AH} label="2.91" rotate />
        {/* Left tick connector lines */}
        <line x1={OX} y1={OY} x2={OX - 44} y2={OY} stroke="#AAA" strokeWidth="0.6" strokeDasharray="3,3" />
        <line x1={OX} y1={OY + 260} x2={OX - 44} y2={OY + 260} stroke="#AAA" strokeWidth="0.6" strokeDasharray="3,3" />
        <line x1={OX} y1={OY + 271} x2={OX - 44} y2={OY + 271} stroke="#AAA" strokeWidth="0.6" strokeDasharray="3,3" />
        <line x1={OX} y1={OY + AH} x2={OX - 44} y2={OY + AH} stroke="#AAA" strokeWidth="0.6" strokeDasharray="3,3" />

        {/* Right: kitchen height */}
        <Dim x1={OX + AW + 30} y1={OY} x2={OX + AW + 30} y2={OY + 141} label="2.64" rotate />
        {/* Right: bed1 height */}
        <Dim x1={OX + AW + 30} y1={OY + 153} x2={OX + AW + 30} y2={OY + AH} label="5.00" rotate />
        <line x1={OX + AW} y1={OY} x2={OX + AW + 36} y2={OY} stroke="#AAA" strokeWidth="0.6" strokeDasharray="3,3" />
        <line x1={OX + AW} y1={OY + 141} x2={OX + AW + 36} y2={OY + 141} stroke="#AAA" strokeWidth="0.6" strokeDasharray="3,3" />
        <line x1={OX + AW} y1={OY + 153} x2={OX + AW + 36} y2={OY + 153} stroke="#AAA" strokeWidth="0.6" strokeDasharray="3,3" />
        <line x1={OX + AW} y1={OY + AH} x2={OX + AW + 36} y2={OY + AH} stroke="#AAA" strokeWidth="0.6" strokeDasharray="3,3" />

        {/* Bottom: bed2 width */}
        <Dim x1={OX} y1={OY + AH + 34} x2={OX + 157} y2={OY + AH + 34} label="3.00" />
        {/* Bottom: bathroom width */}
        <Dim x1={OX + 167} y1={OY + AH + 34} x2={OX + 308} y2={OY + AH + 34} label="2.64" />
        <line x1={OX} y1={OY + AH} x2={OX} y2={OY + AH + 40} stroke="#AAA" strokeWidth="0.6" strokeDasharray="3,3" />
        <line x1={OX + 157} y1={OY + AH} x2={OX + 157} y2={OY + AH + 40} stroke="#AAA" strokeWidth="0.6" strokeDasharray="3,3" />
        <line x1={OX + 167} y1={OY + AH} x2={OX + 167} y2={OY + AH + 40} stroke="#AAA" strokeWidth="0.6" strokeDasharray="3,3" />
        <line x1={OX + 308} y1={OY + AH} x2={OX + 308} y2={OY + AH + 40} stroke="#AAA" strokeWidth="0.6" strokeDasharray="3,3" />

        {/* ── Compass rose ── */}
        <g transform={`translate(${OX + AW - 28}, ${OY + 25})`}>
          <circle cx="0" cy="0" r="16" fill="white" stroke="#CCCCCC" strokeWidth="1" />
          <polygon points="0,-13 -4,-2 4,-2" fill="#F5A623" />
          <polygon points="0,13 -4,2 4,2" fill="#D0D0D0" />
          <text x="0" y="-5" textAnchor="middle" fontSize="8" fontWeight="700" fill="#1a1a1a" fontFamily="Inter, sans-serif">N</text>
        </g>

        {/* ── Scale bar ── */}
        <g transform={`translate(${OX + 20}, ${OY + AH + 46})`}>
          <rect x="0" y="0" width="55" height="5" fill="#1a1a1a" />
          <rect x="55" y="0" width="55" height="5" fill="white" stroke="#1a1a1a" strokeWidth="0.8" />
          <text x="0" y="14" fontSize="7.5" fill="#666" fontFamily="Inter, sans-serif">0</text>
          <text x="50" y="14" fontSize="7.5" fill="#666" fontFamily="Inter, sans-serif">1m</text>
          <text x="103" y="14" fontSize="7.5" fill="#666" fontFamily="Inter, sans-serif">2m</text>
        </g>
      </svg>

      {/* Drywall tooltip */}
      {drywallTip && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-navy text-white text-xs px-3 py-1.5 rounded-full shadow-lg pointer-events-none fade-in whitespace-nowrap">
          ✦ Removable Drywall — Kitchen / Living room wall
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-5 px-4 py-3 border-t border-gray-100 flex-wrap" dir="rtl">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-amber border-2 border-white shadow-sm" />
          <span className="text-xs text-gray-500">קיר גבס נשלף</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-2 bg-[#1a1a1a] rounded-sm" />
          <span className="text-xs text-gray-500">קיר נושא עומסים</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg width="14" height="12" viewBox="0 0 14 12"><path d="M 0 12 A 12 12 0 0 1 12 0" stroke="#555" strokeWidth="1.5" fill="none"/></svg>
          <span className="text-xs text-gray-500">כיוון פתיחת דלת</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-[#D8D8D8] border border-[#555]" />
          <span className="text-xs text-gray-500">ריהוט</span>
        </div>
      </div>
    </div>
  );
}
