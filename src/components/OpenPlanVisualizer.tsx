"use client";
import { useState } from "react";
import { Zap, ArrowLeftRight, TrendingUp, Clock, Wrench } from "lucide-react";

// ─── Architectural open-plan simulator ───────────────────────────────────────
// Shows before ↔ after when the drywall between kitchen and living is removed.
// Focused on the kitchen + living room area only.

const S = 0.85; // scale factor
const LW = Math.round(310 * S); // living room width
const LH = Math.round(260 * S); // living room height
const KW = Math.round(270 * S); // kitchen width
const KH = Math.round(145 * S); // kitchen height
const EW = 9;   // exterior wall thickness
const IW = 8;   // interior wall thickness

// SVG viewbox dimensions
const VW = LW + KW + 80; // total width with padding
const VH = LH + 80;      // total height with padding
const PL = 40; const PT = 40;

export default function OpenPlanVisualizer() {
  const [isOpen, setIsOpen] = useState(false);
  const [animating, setAnimating] = useState(false);

  const toggle = () => {
    setAnimating(true);
    setTimeout(() => {
      setIsOpen((v) => !v);
      setAnimating(false);
    }, 150);
  };

  // Merged area of kitchen + living when wall removed
  const mergedSqm = 47;
  const livingColor = isOpen ? "#FDE9B5" : "#EDEDED";
  const kitchenColor = isOpen ? "#FDE9B5" : "#F2F0EB";
  const mergedLabel = isOpen ? `סלון+מטבח פתוח — ${mergedSqm} מ״ר` : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-navy flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber" />
              סימולטור פוטנציאל שיפוץ
            </h3>
            <p className="text-gray-400 text-sm mt-0.5">
              מה יקרה אם נסיר את קיר הגבס בין הסלון למטבח?
            </p>
          </div>
          {/* Toggle button */}
          <button
            onClick={toggle}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm ${
              isOpen
                ? "bg-amber text-white hover:bg-amber/90"
                : "bg-navy text-white hover:bg-navy/90"
            }`}
          >
            <ArrowLeftRight className="w-4 h-4" />
            {isOpen ? "מצב נוכחי" : "הצג פתוח"}
          </button>
        </div>

        {/* State label */}
        <div className={`mt-3 inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
          isOpen ? "bg-amber text-white" : "bg-gray-100 text-navy/60"
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${isOpen ? "bg-white" : "bg-gray-400"}`} />
          {isOpen ? "מרחב פתוח — לאחר הריסת הקיר" : "מצב נוכחי — לפני שיפוץ"}
        </div>
      </div>

      {/* SVG floor plan visualization */}
      <div className={`px-6 py-5 transition-opacity duration-150 ${animating ? "opacity-0" : "opacity-100"}`}>
        <svg
          viewBox={`0 0 ${VW} ${VH}`}
          className="w-full h-auto"
          style={{ maxHeight: "300px" }}
        >
          {/* White background */}
          <rect width={VW} height={VH} fill="white" />

          {/* Outer walls (black silhouette) */}
          <rect x={PL} y={PT} width={LW + KW} height={LH} fill="#1a1a1a" />
          {/* Kitchen is only partial height on the right */}
          <rect x={PL + LW} y={PT + KH} width={KW} height={LH - KH} fill="white" />
          {/* Re-draw that partial area as apartment bg */}
          <rect x={PL + LW + EW} y={PT + KH + IW} width={KW - EW - IW} height={LH - KH - EW - IW} fill="#F8F8F8" />

          {/* Room fills */}
          {/* Living room */}
          <rect
            x={PL + EW} y={PT + EW}
            width={LW - EW - (isOpen ? 0 : IW)}
            height={LH - EW - EW}
            fill={livingColor}
            style={{ transition: "fill 0.4s ease, width 0.4s ease" }}
          />
          {/* Kitchen room */}
          <rect
            x={PL + LW + (isOpen ? 0 : IW)} y={PT + EW}
            width={KW - (isOpen ? 0 : IW) - EW}
            height={KH - EW - (isOpen ? 0 : IW)}
            fill={kitchenColor}
            style={{ transition: "fill 0.4s ease, x 0.4s ease, width 0.4s ease" }}
          />

          {/* Interior wall (fades out in open state) */}
          {!isOpen && (
            <rect
              x={PL + LW - IW / 2} y={PT}
              width={IW} height={LH}
              fill="#1a1a1a"
            />
          )}

          {/* When open: dashed outline where the wall WAS */}
          {isOpen && (
            <line
              x1={PL + LW} y1={PT + EW}
              x2={PL + LW} y2={PT + KH}
              stroke="#F5A623"
              strokeWidth="2"
              strokeDasharray="6,4"
            />
          )}

          {/* Horizontal wall between kitchen and area below (always shown) */}
          <line
            x1={PL + LW} y1={PT + KH}
            x2={PL + LW + KW} y2={PT + KH}
            stroke="#1a1a1a" strokeWidth={IW}
          />

          {/* ── Furniture ── */}
          {/* Sofa in living */}
          <g stroke="#666" strokeWidth="1.2" fill="white">
            <rect x={PL + 45} y={PT + 95} width={130} height={48} rx="4" />
            <rect x={PL + 45} y={PT + 95} width={130} height={14} rx="3" fill="#D8D8D8" />
            <rect x={PL + 40} y={PT + 99} width={9} height={40} rx="3" />
            <rect x={PL + 171} y={PT + 99} width={9} height={40} rx="3" />
            <line x1={PL + 95} y1={PT + 109} x2={PL + 95} y2={PT + 143} stroke="#AAA" strokeWidth="0.8" />
            <line x1={PL + 130} y1={PT + 109} x2={PL + 130} y2={PT + 143} stroke="#AAA" strokeWidth="0.8" />
          </g>
          {/* Coffee table */}
          <rect x={PL + 65} y={PT + 150} width={90} height={38} rx="3" fill="white" stroke="#888" strokeWidth="1" />

          {/* Kitchen counter */}
          <rect x={PL + LW + (isOpen ? 2 : IW + 2)} y={PT + EW + 1} width={KW - EW - (isOpen ? 4 : IW + 4)} height={26} fill="white" stroke="#666" strokeWidth="1.2" />
          {/* Dining table */}
          <ellipse cx={PL + LW + KW / 2 - 5} cy={PT + 95} rx={38} ry={25} fill="white" stroke="#666" strokeWidth="1.2" />
          <g fill="white" stroke="#888" strokeWidth="0.9">
            <rect x={PL + LW + KW / 2 - 43} y={PT + 82} width={16} height={12} rx="2" />
            <rect x={PL + LW + KW / 2 + 27} y={PT + 82} width={16} height={12} rx="2" />
            <rect x={PL + LW + KW / 2 - 12} y={PT + 105} width={12} height={15} rx="2" />
            <rect x={PL + LW + KW / 2 + 2} y={PT + 105} width={12} height={15} rx="2" />
          </g>

          {/* ── Labels ── */}
          {!isOpen ? (
            <>
              <text x={PL + LW / 2} y={PT + 55} textAnchor="middle" fontSize="12" fontWeight="600" fill="#1a1a1a" fontFamily="Inter, sans-serif">סלון</text>
              <text x={PL + LW / 2} y={PT + 70} textAnchor="middle" fontSize="10" fill="#666" fontFamily="Inter, sans-serif">32 מ״ר</text>
              <text x={PL + LW + KW / 2} y={PT + 58} textAnchor="middle" fontSize="11" fontWeight="600" fill="#1a1a1a" fontFamily="Inter, sans-serif">מטבח</text>
              <text x={PL + LW + KW / 2} y={PT + 72} textAnchor="middle" fontSize="9.5" fill="#666" fontFamily="Inter, sans-serif">15 מ״ר</text>
            </>
          ) : (
            <g>
              <text x={PL + (LW + KW) / 2} y={PT + 50} textAnchor="middle" fontSize="13" fontWeight="700" fill="#1a1a1a" fontFamily="Inter, sans-serif">סלון + מטבח פתוח</text>
              <text x={PL + (LW + KW) / 2} y={PT + 67} textAnchor="middle" fontSize="11" fill="#F5A623" fontWeight="600" fontFamily="Inter, sans-serif">{mergedSqm} מ״ר — שטח מוגדל</text>
              {/* "Was here" arrow indicator */}
              <text x={PL + LW} y={PT - 8} textAnchor="middle" fontSize="8" fill="#F5A623" fontFamily="Inter, sans-serif">← קיר לשעבר</text>
            </g>
          )}

          {/* Dimension lines */}
          <line x1={PL} y1={PT + LH + 18} x2={PL + LW} y2={PT + LH + 18} stroke="#AAA" strokeWidth="0.8" />
          <text x={PL + LW / 2} y={PT + LH + 30} textAnchor="middle" fontSize="8.5" fill="#888" fontFamily="Inter, sans-serif">5.64 מ׳</text>
          <line x1={PL + LW} y1={PT + LH + 18} x2={PL + LW + KW} y2={PT + LH + 18} stroke="#AAA" strokeWidth="0.8" />
          <text x={PL + LW + KW / 2} y={PT + LH + 30} textAnchor="middle" fontSize="8.5" fill="#888" fontFamily="Inter, sans-serif">4.91 מ׳</text>
        </svg>
      </div>

      {/* Info cards — only show renovation info */}
      <div className={`px-6 pb-5 transition-all duration-300 ${isOpen ? "opacity-100" : "opacity-0 h-0 pb-0 overflow-hidden"}`}>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-amber-light rounded-xl p-3 text-center">
            <Wrench className="w-4 h-4 text-amber mx-auto mb-1" />
            <div className="text-sm font-bold text-navy">₪15K–25K</div>
            <div className="text-xs text-gray-500">עלות הריסה משוערת</div>
          </div>
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <TrendingUp className="w-4 h-4 text-green-600 mx-auto mb-1" />
            <div className="text-sm font-bold text-navy">+₪150K</div>
            <div className="text-xs text-gray-500">תוספת שווי משוערת</div>
          </div>
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <Clock className="w-4 h-4 text-blue-500 mx-auto mb-1" />
            <div className="text-sm font-bold text-navy">~3 ימים</div>
            <div className="text-xs text-gray-500">זמן עבודה</div>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3 text-center">
          * הערכה בלבד. מומלץ לקבל חוות דעת קבלן לפני ביצוע
        </p>
      </div>
    </div>
  );
}
