"use client";

interface PricePoint {
  date: string;
  price: number;
}

export default function PriceChart({ data }: { data: PricePoint[] }) {
  const min = Math.min(...data.map((d) => d.price)) * 0.97;
  const max = Math.max(...data.map((d) => d.price)) * 1.02;
  const range = max - min;

  const W = 500;
  const H = 120;
  const PAD = { top: 10, right: 20, bottom: 30, left: 60 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const points = data.map((d, i) => ({
    x: PAD.left + (i / (data.length - 1)) * chartW,
    y: PAD.top + chartH - ((d.price - min) / range) * chartH,
    price: d.price,
    date: d.date,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaD = `${pathD} L ${points[points.length - 1].x} ${H - PAD.bottom} L ${points[0].x} ${H - PAD.bottom} Z`;

  const formatPrice = (p: number) => `₪${(p / 1000000).toFixed(1)}M`;

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {/* Y axis labels */}
        {[0, 0.5, 1].map((t) => {
          const price = min + t * range;
          const y = PAD.top + chartH - t * chartH;
          return (
            <g key={t}>
              <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4,4" />
              <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize="9" fill="#9CA3AF" fontFamily="Inter, sans-serif">
                {formatPrice(price)}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={areaD} fill="#F5A623" fillOpacity="0.08" />

        {/* Line */}
        <path d={pathD} fill="none" stroke="#F5A623" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {/* Points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill="#F5A623" stroke="white" strokeWidth="1.5" />
            {/* Date label for first and last */}
            {(i === 0 || i === points.length - 1) && (
              <text
                x={p.x}
                y={H - PAD.bottom + 14}
                textAnchor={i === 0 ? "start" : "end"}
                fontSize="9"
                fill="#9CA3AF"
                fontFamily="Inter, sans-serif"
              >
                {p.date}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}
