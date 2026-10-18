import { useState } from 'react';

export interface BarDatum {
  label: string;
  value: number;
  sub?: string;
}

interface BarChartProps {
  data: BarDatum[];
  color?: string;
  height?: number;
  formatValue?: (n: number) => string;
}

const BarChart = ({ data, color = '#1A6B45', height = 240, formatValue = (n) => n.toLocaleString('en-IN') }: BarChartProps) => {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...data.map((d) => d.value), 1);
  const isEmpty = data.every((d) => d.value === 0);

  return (
    <div className="relative" style={{ height }}>
      <div className="absolute inset-x-0 bottom-6 top-0 flex items-end gap-1.5 sm:gap-2.5">
        {data.map((d, i) => {
          const pct = (d.value / max) * 100;
          const active = hover === i;
          return (
            <div
              key={d.label}
              className="group relative flex h-full flex-1 cursor-pointer flex-col justify-end"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              <div className="absolute inset-0 rounded-lg bg-[#F4F7F4] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
              <div
                className="relative w-full origin-bottom rounded-t-lg transition-all duration-700 ease-out animate-fade-up"
                style={{
                  height: `${Math.max(pct, d.value > 0 ? 3 : 0.8)}%`,
                  background: d.value > 0 ? `linear-gradient(to top, ${color}, ${color}B3)` : '#E3EEE7',
                  opacity: hover === null || active ? 1 : 0.45,
                  animationDelay: `${i * 35}ms`,
                }}
              />
              {active && (
                <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-xl bg-[#1A3A2E] px-3 py-2 text-center shadow-xl animate-scale-in">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-[#6BAA8A]">{d.label}</p>
                  <p className="text-sm font-bold text-white">{formatValue(d.value)}</p>
                  {d.sub && <p className="text-[11px] text-[#A8C9B8]">{d.sub}</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="absolute inset-x-0 bottom-0 flex gap-1.5 sm:gap-2.5">
        {data.map((d, i) => (
          <span
            key={d.label}
            className={`flex-1 truncate text-center text-[10px] transition-colors ${hover === i ? 'font-semibold text-gray-700' : 'text-gray-400'}`}
          >
            {d.label}
          </span>
        ))}
      </div>
      {isEmpty && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <p className="rounded-full bg-white/80 px-3 py-1 text-sm text-gray-400">No revenue yet</p>
        </div>
      )}
    </div>
  );
};

export default BarChart;
