import { useEffect, useEffectEvent, type ComponentType, type ReactNode } from 'react';
import { AlertTriangle, ArrowDownRight, ArrowUpRight, CheckCircle2, Search, X } from 'lucide-react';
import CountUp from '../dashboard/CountUp';

type IconType = ComponentType<{ className?: string }>;

export const PageHeader = ({ title, subtitle, actions }: { title: ReactNode; subtitle?: ReactNode; actions?: ReactNode }) => (
  <header className="sticky top-14 lg:top-0 z-20 border-b border-[#D1E7DA] bg-white/80 backdrop-blur-xl">
    <div className="flex flex-wrap items-center justify-between gap-4 px-6 pb-5 pt-6 sm:px-8">
      <div className="min-w-0 animate-fade-up">
        <h1 className="text-[22px] font-semibold text-gray-800">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-gray-400">{subtitle}</p>}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2 animate-fade-up" style={{ animationDelay: '60ms' }}>
          {actions}
        </div>
      )}
    </div>
  </header>
);

export const Card = ({
  title,
  icon: Icon,
  action,
  children,
  className = '',
  delay = 0,
  flush = false,
}: {
  title?: ReactNode;
  icon?: IconType;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  delay?: number;
  /** No body padding — for tables that run edge to edge. */
  flush?: boolean;
}) => (
  <section
    className={`overflow-hidden rounded-2xl border border-[#E3EEE7] bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg hover:shadow-emerald-900/5 animate-fade-up ${className}`}
    style={{ animationDelay: `${delay}ms` }}
  >
    {title && (
      <div className={`flex flex-wrap items-center justify-between gap-3 ${flush ? 'border-b border-[#EEF3EF] px-5 py-4' : 'px-6 pt-6'}`}>
        <h2 className="flex items-center gap-2 font-semibold text-gray-800">
          {Icon && <Icon className="h-4 w-4 text-[#1A6B45]" />}
          {title}
        </h2>
        {action}
      </div>
    )}
    <div className={flush ? '' : title ? 'px-6 pb-6 pt-4' : 'p-6'}>{children}</div>
  </section>
);

export const GrowthPill = ({ growth, fallback }: { growth: string | null | undefined; fallback: string }) => {
  if (growth === null || growth === undefined) {
    return <span className="text-[11px] font-medium text-gray-400">{fallback}</span>;
  }
  const value = parseFloat(growth);
  const up = value >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
        up ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
      }`}
    >
      <Icon className="h-3 w-3" />
      {Math.abs(value)}%<span className="ml-0.5 font-normal opacity-70">vs last month</span>
    </span>
  );
};

export const StatCard = ({
  label,
  value,
  format,
  icon: Icon,
  accent,
  sub,
  delay = 0,
}: {
  label: string;
  value: number;
  format?: (n: number) => string;
  icon: IconType;
  accent: string;
  sub?: ReactNode;
  delay?: number;
}) => (
  <div
    className="group relative overflow-hidden rounded-2xl border border-[#E3EEE7] bg-white p-5 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-900/5 animate-fade-up"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div
      className="absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-[0.08] transition-transform duration-500 group-hover:scale-125"
      style={{ backgroundColor: accent }}
    />
    <div className="relative flex items-center gap-4">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm transition-transform duration-300 group-hover:rotate-3 group-hover:scale-110"
        style={{ backgroundColor: accent }}
      >
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-2xl font-bold leading-none text-gray-900 tabular-nums">
          <CountUp value={value} format={format} />
        </p>
        <p className="mt-1 text-xs font-medium text-gray-500">{label}</p>
      </div>
    </div>
    {sub && <div className="relative mt-3 min-h-5">{sub}</div>}
  </div>
);

export function FilterChips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; count?: number }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.label}
            onClick={() => onChange(o.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
              active ? 'bg-[#1A3A2E] text-white shadow-sm' : 'bg-[#F4F7F4] text-gray-600 hover:bg-[#E8F5EE] hover:text-[#1A6B45]'
            }`}
          >
            {o.label}
            {o.count !== undefined && (
              <span className={`ml-1.5 tabular-nums ${active ? 'text-[#2ECC71]' : 'text-gray-400'}`}>{o.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function Select<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="cursor-pointer rounded-lg border border-[#D1E7DA] bg-white px-3 py-1.5 text-xs font-medium text-gray-600 outline-none transition-colors hover:border-[#1A6B45] focus:border-[#1A6B45]"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export const SearchInput = ({
  value,
  onChange,
  placeholder,
  className = 'w-full sm:w-72',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  className?: string;
}) => (
  <div className={`relative ${className}`}>
    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-[#D1E7DA] bg-white py-2.5 pl-9 pr-9 text-sm shadow-sm outline-none transition-all placeholder:text-gray-400 focus:border-[#1A6B45] focus:ring-4 focus:ring-[#1A6B45]/10"
    />
    {value && (
      <button
        onClick={() => onChange('')}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        aria-label="Clear search"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    )}
  </div>
);

export const FetchBar = ({ active }: { active: boolean }) => (
  <div className="relative h-0.5 overflow-hidden">{active && <div className="absolute inset-y-0 w-1/3 bg-[#2ECC71] animate-progress" />}</div>
);

export const TableSkeleton = ({ rows = 6 }: { rows?: number }) => (
  <div className="space-y-2 p-5">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="skeleton h-14 rounded-xl" />
    ))}
  </div>
);

export const EmptyState = ({ icon: Icon = Search, title, hint }: { icon?: IconType; title: string; hint?: string }) => (
  <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E8F5EE]">
      <Icon className="h-5 w-5 text-[#1A6B45]" />
    </div>
    <p className="font-medium text-gray-700">{title}</p>
    {hint && <p className="text-sm text-gray-400">{hint}</p>}
  </div>
);

export const ErrorState = ({ text, onRetry }: { text: string; onRetry?: () => void }) => (
  <div className="flex flex-col items-center gap-3 py-16">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
      <AlertTriangle className="h-5 w-5 text-red-500" />
    </div>
    <p className="text-sm font-medium text-gray-700">{text}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="rounded-xl bg-[#1A6B45] px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-[#15573A] active:scale-95"
      >
        Try again
      </button>
    )}
  </div>
);

export type Notice = { type: 'success' | 'error'; text: string } | null;

export const Toast = ({ notice, onClose }: { notice: Notice; onClose: () => void }) => {
  const close = useEffectEvent(onClose);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => close(), 3500);
    return () => clearTimeout(t);
  }, [notice]);

  if (!notice) return null;
  return (
    <div
      className={`fixed right-6 top-20 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-xl animate-scale-in ${
        notice.type === 'success' ? 'bg-[#1A3A2E]' : 'bg-red-600'
      }`}
    >
      {notice.type === 'success' ? <CheckCircle2 className="h-4 w-4 text-[#2ECC71]" /> : <AlertTriangle className="h-4 w-4" />}
      {notice.text}
    </div>
  );
};