import { useState } from 'react';

export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

interface PlanDonutProps {
  slices: DonutSlice[];
  size?: number;
  thickness?: number;
}

const PlanDonut = ({ slices, size = 168, thickness = 22 }: PlanDonutProps) => {
  const [active, setActive] = useState<number | null>(null);
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  const fractions = slices.map((s) => (total > 0 ? s.value / total : 0));
  const arcs = slices.map((s, i) => ({
    ...s,
    fraction: fractions[i],
    dash: fractions[i] * circumference,
    offset: fractions.slice(0, i).reduce((sum, f) => sum + f, 0) * circumference,
  }));

  const focused = active !== null ? arcs[active] : null;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#EEF3EF" strokeWidth={thickness} />
          {arcs.map((a, i) =>
            a.value > 0 ? (
              <circle
                key={a.label}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={a.color}
                strokeWidth={active === i ? thickness + 6 : thickness}
                strokeDasharray={`${Math.max(a.dash - 2, 0)} ${circumference}`}
                strokeDashoffset={-a.offset}
                className="cursor-pointer transition-all duration-300 ease-out"
                style={{ opacity: active === null || active === i ? 1 : 0.35 }}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
              />
            ) : null,
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <p className="text-2xl font-bold text-gray-900 transition-all">
            {focused ? focused.value.toLocaleString('en-IN') : total.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
            {focused ? `${focused.label} · ${(focused.fraction * 100).toFixed(0)}%` : 'Total users'}
          </p>
        </div>
      </div>

      <ul className="w-full space-y-2">
        {arcs.map((a, i) => (
          <li
            key={a.label}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            className={`flex items-center justify-between rounded-lg px-3 py-2 cursor-default transition-colors duration-200 ${
              active === i ? 'bg-[#F0F7F2]' : 'hover:bg-[#F7FAF8]'
            }`}
          >
            <span className="flex items-center gap-2.5 text-sm text-gray-600">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: a.color }} />
              {a.label}
            </span>
            <span className="text-sm font-semibold text-gray-900 tabular-nums">
              {a.value.toLocaleString('en-IN')}
              <span className="ml-1.5 text-xs font-normal text-gray-400">{(a.fraction * 100).toFixed(0)}%</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlanDonut;
