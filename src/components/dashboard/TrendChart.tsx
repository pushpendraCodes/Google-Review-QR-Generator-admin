import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { shortDate } from '../../lib/format';

export interface TrendPoint {
  date: string;
  value: number;
}

interface TrendChartProps {
  data: TrendPoint[];
  color: string;
  height?: number;
  formatValue?: (n: number) => string;
  label: string;
}

const PAD = { top: 16, right: 12, bottom: 28, left: 44 };

/** Catmull-Rom → cubic Bézier for a smooth line that still passes through every point. */
function smoothPath(points: [number, number][]): string {
  if (points.length < 2) return '';
  let d = `M${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;
  }
  return d;
}

function niceMax(value: number): number {
  if (value <= 4) return 4;
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const normalized = value / magnitude;
  const nice = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return nice * magnitude;
}

const TrendChart = ({ data, color, height = 260, formatValue = (n) => n.toLocaleString('en-IN'), label }: TrendChartProps) => {
  const gradientId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { points, line, area, max, ticks } = useMemo(() => {
    const innerW = Math.max(width - PAD.left - PAD.right, 1);
    const innerH = height - PAD.top - PAD.bottom;
    const maxValue = niceMax(Math.max(...data.map((d) => d.value), 0));
    const step = data.length > 1 ? innerW / (data.length - 1) : 0;
    const pts = data.map(
      (d, i) => [PAD.left + i * step, PAD.top + innerH - (d.value / maxValue) * innerH] as [number, number],
    );
    const linePath = smoothPath(pts);
    const baseline = PAD.top + innerH;
    const areaPath = pts.length
      ? `${linePath} L${pts[pts.length - 1][0]},${baseline} L${pts[0][0]},${baseline} Z`
      : '';
    const tickValues = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
      value: maxValue * t,
      y: PAD.top + innerH - t * innerH,
    }));
    return { points: pts, line: linePath, area: areaPath, max: maxValue, ticks: tickValues };
  }, [data, width, height]);

  const handleMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!points.length) return;
    const x = e.clientX - e.currentTarget.getBoundingClientRect().left;
    let nearest = 0;
    for (let i = 1; i < points.length; i++) {
      if (Math.abs(points[i][0] - x) < Math.abs(points[nearest][0] - x)) nearest = i;
    }
    setHover(nearest);
  };

  const labelEvery = Math.max(1, Math.ceil(data.length / 7));
  const hovered = hover !== null ? { point: points[hover], datum: data[hover] } : null;
  const isEmpty = max <= 4 && data.every((d) => d.value === 0);

  return (
    <div ref={containerRef} className="relative w-full" style={{ height }}>
      {width > 0 && (
        <svg
          width={width}
          height={height}
          onMouseMove={handleMove}
          onMouseLeave={() => setHover(null)}
          className="block cursor-crosshair select-none"
          role="img"
          aria-label={`${label} trend chart`}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.28} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>

          {ticks.map((t) => (
            <g key={t.value}>
              <line x1={PAD.left} x2={width - PAD.right} y1={t.y} y2={t.y} stroke="#EEF3EF" strokeDasharray="3 4" />
              <text x={PAD.left - 8} y={t.y + 4} textAnchor="end" className="fill-gray-400 text-[10px]">
                {formatValue(t.value)}
              </text>
            </g>
          ))}

          {data.map((d, i) =>
            i % labelEvery === 0 || i === data.length - 1 ? (
              <text
                key={d.date}
                x={points[i]?.[0]}
                y={height - 8}
                textAnchor="middle"
                className="fill-gray-400 text-[10px]"
              >
                {shortDate(d.date)}
              </text>
            ) : null,
          )}

          <path key={`area-${label}`} d={area} fill={`url(#${gradientId})`} className="animate-fade-up" />
          <path
            key={`line-${label}`}
            d={line}
            fill="none"
            stroke={color}
            strokeWidth={2.5}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            className="animate-draw"
            style={{ ['--path-length' as string]: 1 }}
          />

          {hovered && (
            <g className="pointer-events-none">
              <line
                x1={hovered.point[0]}
                x2={hovered.point[0]}
                y1={PAD.top}
                y2={height - PAD.bottom}
                stroke={color}
                strokeOpacity={0.35}
                strokeDasharray="4 4"
              />
              <circle cx={hovered.point[0]} cy={hovered.point[1]} r={9} fill={color} fillOpacity={0.15} />
              <circle cx={hovered.point[0]} cy={hovered.point[1]} r={4.5} fill="#fff" stroke={color} strokeWidth={2.5} />
            </g>
          )}
        </svg>
      )}

      {isEmpty && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-sm text-gray-400 bg-white/80 px-3 py-1 rounded-full">No {label.toLowerCase()} in this period yet</p>
        </div>
      )}

      {hovered && (
        <div
          className="absolute pointer-events-none -translate-x-1/2 -translate-y-full rounded-xl bg-[#1A3A2E] px-3 py-2 shadow-xl transition-[left,top] duration-150 ease-out"
          style={{ left: hovered.point[0], top: hovered.point[1] - 14 }}
        >
          <p className="text-[10px] font-medium uppercase tracking-wider text-[#6BAA8A] whitespace-nowrap">
            {shortDate(hovered.datum.date)}
          </p>
          <p className="text-sm font-bold text-white whitespace-nowrap">
            {formatValue(hovered.datum.value)} <span className="font-normal text-[#A8C9B8]">{label.toLowerCase()}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default TrendChart;
