import { useEffect, useMemo, useState, type ComponentType, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  IndianRupee,
  QrCode,
  Crown,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Star,
  MessageSquare,
  Activity,
  Receipt,
  ScanLine,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { useGetStatsQuery, type DashboardStats, type PlanName } from '../store/api/adminDashboardApi';
import CountUp from '../components/dashboard/CountUp';
import Sparkline from '../components/dashboard/Sparkline';
import TrendChart from '../components/dashboard/TrendChart';
import PlanDonut from '../components/dashboard/PlanDonut';
import { formatMoney, formatNumber, timeAgo } from '../lib/format';

const RANGES = [7, 30, 90] as const;
type Range = (typeof RANGES)[number];

type Metric = 'scans' | 'signups' | 'revenue';

const METRICS: { key: Metric; label: string; color: string }[] = [
  { key: 'scans', label: 'Scans', color: '#10B981' },
  { key: 'signups', label: 'Signups', color: '#1A6B45' },
  { key: 'revenue', label: 'Revenue', color: '#0D9488' },
];

const PLAN_COLORS: Record<PlanName, string> = {
  free: '#CFE3D7',
  starter: '#6EE7B7',
  pro: '#2ECC71',
  agency: '#1A6B45',
};

const PLAN_BADGE: Record<PlanName, string> = {
  free: 'bg-gray-100 text-gray-600',
  starter: 'bg-emerald-50 text-emerald-700',
  pro: 'bg-green-100 text-green-800',
  agency: 'bg-[#1A3A2E] text-[#2ECC71]',
};

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

// ─── Small building blocks ──────────────────────────────────────────────────

const GrowthPill = ({ growth, fallback }: { growth: string | null | undefined; fallback: string }) => {
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
      {Math.abs(value)}%
      <span className="font-normal opacity-70 ml-0.5">vs last month</span>
    </span>
  );
};

interface KpiCardProps {
  label: string;
  value: number;
  format?: (n: number) => string;
  sub?: ReactNode;
  icon: ComponentType<{ className?: string }>;
  accent: string;
  spark: number[];
  delay: number;
}

const KpiCard = ({ label, value, format, sub, icon: Icon, accent, spark, delay }: KpiCardProps) => (
  <div
    className="group relative overflow-hidden rounded-2xl border border-[#E3EEE7] bg-white p-5 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-900/5 animate-fade-up"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div
      className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-[0.08] transition-transform duration-500 group-hover:scale-125"
      style={{ backgroundColor: accent }}
    />
    <div className="relative flex items-start justify-between">
      <div
        className="flex h-10 w-10 items-center justify-center rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
        style={{ backgroundColor: accent }}
      >
        <Icon className="h-5 w-5 text-white" />
      </div>
      <Sparkline data={spark} color={accent} />
    </div>
    <p className="relative mt-4 text-[26px] font-bold leading-none text-gray-900 tabular-nums">
      <CountUp value={value} format={format} />
    </p>
    <p className="relative mt-1.5 text-xs font-medium text-gray-500">{label}</p>
    <div className="relative mt-3 min-h-5">{sub}</div>
  </div>
);

const Card = ({
  title,
  icon: Icon,
  action,
  children,
  className = '',
  delay = 0,
}: {
  title: string;
  icon?: ComponentType<{ className?: string }>;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  delay?: number;
}) => (
  <section
    className={`rounded-2xl border border-[#E3EEE7] bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-lg hover:shadow-emerald-900/5 animate-fade-up ${className}`}
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="mb-5 flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 font-semibold text-gray-800">
        {Icon && <Icon className="h-4 w-4 text-[#1A6B45]" />}
        {title}
      </h2>
      {action}
    </div>
    {children}
  </section>
);

const ViewAll = ({ to }: { to: string }) => (
  <Link
    to={to}
    className="group inline-flex items-center gap-0.5 text-xs font-medium text-[#1A6B45] transition-colors hover:text-[#2ECC71]"
  >
    View all
    <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
  </Link>
);

const Avatar = ({ name, picture }: { name: string; picture?: string }) =>
  picture ? (
    <img src={picture} alt="" referrerPolicy="no-referrer" className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-white" />
  ) : (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#1A6B45] to-[#2ECC71] text-sm font-semibold text-white ring-2 ring-white">
      {(name || '?').charAt(0).toUpperCase()}
    </div>
  );

const EmptyRow = ({ text }: { text: string }) => <p className="py-8 text-center text-sm text-gray-400">{text}</p>;

// ─── Loading skeleton ───────────────────────────────────────────────────────

const DashboardSkeleton = () => (
  <div className="space-y-5 px-6 py-6 sm:px-8">
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="skeleton h-[168px] rounded-2xl" />
      ))}
    </div>
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
      <div className="skeleton h-[380px] rounded-2xl xl:col-span-2" />
      <div className="skeleton h-[380px] rounded-2xl" />
    </div>
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="skeleton h-[320px] rounded-2xl" />
      ))}
    </div>
  </div>
);

// ─── Page ───────────────────────────────────────────────────────────────────

const Dashboard = () => {
  const [range, setRange] = useState<Range>(30);
  const [metric, setMetric] = useState<Metric>('scans');
  const { data: stats, isLoading, isFetching, error, refetch, fulfilledTimeStamp } = useGetStatsQuery(range, {
    pollingInterval: 60_000,
    refetchOnFocus: true,
  });

  const [, forceTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => forceTick((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const activeMetric = METRICS.find((m) => m.key === metric) ?? METRICS[0];

  const chartData = useMemo(
    () => (stats?.series ?? []).map((d) => ({ date: d.date, value: d[activeMetric.key] })),
    [stats, activeMetric.key],
  );
  const periodTotal = chartData.reduce((sum, d) => sum + d.value, 0);
  const formatChartValue = (n: number) =>
    activeMetric.key === 'revenue' ? formatMoney(n, 'INR', true) : formatNumber(Math.round(n));

  return (
    <div className="min-h-screen flex-1 bg-[#F4F7F4]">
      <header className="sticky top-14 lg:top-0 z-20 border-b border-[#D1E7DA] bg-white/80 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 pb-5 pt-6 sm:px-8">
          <div className="animate-fade-up">
            <h1 className="text-[22px] font-semibold text-gray-800">{greeting()}, Admin</h1>
            <p className="mt-0.5 text-sm text-gray-400">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
              {fulfilledTimeStamp ? ` · Updated ${timeAgo(new Date(fulfilledTimeStamp))}` : ''}
            </p>
          </div>

          <div className="flex items-center gap-2 animate-fade-up" style={{ animationDelay: '80ms' }}>
            <div className="relative flex rounded-xl border border-[#D1E7DA] bg-[#F4F7F4] p-1">
              <span
                className="absolute inset-y-1 rounded-lg bg-white shadow-sm transition-all duration-300 ease-out"
                style={{
                  width: `calc((100% - 8px) / ${RANGES.length})`,
                  left: `calc(4px + (100% - 8px) / ${RANGES.length} * ${RANGES.indexOf(range)})`,
                }}
              />
              {RANGES.map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`relative z-10 w-14 rounded-lg py-1.5 text-xs font-semibold transition-colors duration-200 ${
                    range === r ? 'text-[#1A6B45]' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {r}d
                </button>
              ))}
            </div>
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              title="Refresh"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#D1E7DA] bg-white text-[#1A6B45] transition-all duration-200 hover:bg-[#E8F5EE] active:scale-95 disabled:opacity-70"
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {isLoading ? (
        <DashboardSkeleton />
      ) : error || !stats ? (
        <div className="flex flex-col items-center justify-center gap-3 py-32 animate-fade-up">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
          <p className="font-medium text-gray-700">Couldn't load dashboard stats</p>
          <button
            onClick={() => refetch()}
            className="rounded-xl bg-[#1A6B45] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[#15573A] active:scale-95"
          >
            Try again
          </button>
        </div>
      ) : (
        <DashboardBody
          stats={stats}
          isFetching={isFetching}
          activeMetric={activeMetric}
          onMetricChange={setMetric}
          chartData={chartData}
          periodTotal={periodTotal}
          formatChartValue={formatChartValue}
        />
      )}
    </div>
  );
};

interface BodyProps {
  stats: DashboardStats;
  isFetching: boolean;
  activeMetric: (typeof METRICS)[number];
  onMetricChange: (m: Metric) => void;
  chartData: { date: string; value: number }[];
  periodTotal: number;
  formatChartValue: (n: number) => string;
}

const DashboardBody = ({
  stats,
  isFetching,
  activeMetric,
  onMetricChange,
  chartData,
  periodTotal,
  formatChartValue,
}: BodyProps) => {
  const { users, revenue, qrCodes, ratings, plans, series } = stats;
  const conversion = users.total > 0 ? (users.activeSubscribers / users.total) * 100 : 0;
  const lastDays = series.slice(-14);

  return (
    <div className={`space-y-5 px-6 py-6 transition-opacity duration-300 sm:px-8 ${isFetching ? 'opacity-80' : ''}`}>
      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total users"
          value={users.total}
          icon={Users}
          accent="#1A6B45"
          spark={lastDays.map((d) => d.signups)}
          delay={0}
          sub={<GrowthPill growth={users.growth} fallback={`+${users.newThisMonth} this month`} />}
        />
        <KpiCard
          label="Revenue this month"
          value={revenue.mrr}
          format={(n) => formatMoney(n, 'INR', true)}
          icon={IndianRupee}
          accent="#0D9488"
          spark={lastDays.map((d) => d.revenue)}
          delay={60}
          sub={
            <div className="flex flex-wrap items-center gap-2">
              <GrowthPill growth={revenue.mrrGrowth} fallback={`${revenue.newSubsThisMonth} new subs`} />
              {revenue.mrrUsdOriginal > 0 && (
                <span className="text-[11px] font-medium text-gray-400" title={`$1 = ₹${stats.usdToInr}`}>
                  incl. {formatMoney(revenue.mrrUsdOriginal, 'USD')}
                </span>
              )}
            </div>
          }
        />
        <KpiCard
          label="Scans this month"
          value={qrCodes.scansThisMonth}
          icon={ScanLine}
          accent="#10B981"
          spark={lastDays.map((d) => d.scans)}
          delay={120}
          sub={<GrowthPill growth={qrCodes.scansGrowth} fallback={`${formatNumber(qrCodes.totalScans)} all time`} />}
        />
        <KpiCard
          label="Active subscribers"
          value={users.activeSubscribers}
          icon={Crown}
          accent="#D97706"
          spark={[]}
          delay={180}
          sub={
            <div className="w-full">
              <div className="mb-1 flex justify-between text-[11px] font-medium text-gray-400">
                <span>Paid conversion</span>
                <span className="text-gray-700">{conversion.toFixed(1)}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-amber-50">
                <div
                  className="h-full rounded-full bg-linear-to-r from-amber-400 to-amber-600 transition-[width] duration-1000 ease-out"
                  style={{ width: `${Math.min(conversion, 100)}%` }}
                />
              </div>
            </div>
          }
        />
      </div>

      {/* Trend chart + plan donut */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card
          title="Growth trend"
          icon={Activity}
          className="xl:col-span-2"
          delay={240}
          action={
            <div className="flex flex-wrap gap-1 rounded-xl bg-[#F4F7F4] p-1">
              {METRICS.map((m) => (
                <button
                  key={m.key}
                  onClick={() => onMetricChange(m.key)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                    activeMetric.key === m.key ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                  style={activeMetric.key === m.key ? { color: m.color } : undefined}
                >
                  {m.label}
                </button>
              ))}
            </div>
          }
        >
          <div className="mb-3 flex items-baseline gap-2">
            <p className="text-2xl font-bold text-gray-900 tabular-nums">
              <CountUp key={activeMetric.key} value={periodTotal} format={formatChartValue} />
            </p>
            <p className="text-xs font-medium text-gray-400">in the last {stats.range} days</p>
          </div>
          <TrendChart
            key={`${activeMetric.key}-${stats.range}`}
            data={chartData}
            color={activeMetric.color}
            label={activeMetric.label}
            formatValue={formatChartValue}
          />
        </Card>

        <Card title="Users by plan" icon={Users} delay={300} action={<ViewAll to="/users" />}>
          <PlanDonut
            slices={(['free', 'starter', 'pro', 'agency'] as PlanName[]).map((p) => ({
              label: p.charAt(0).toUpperCase() + p.slice(1),
              value: plans[p] || 0,
              color: PLAN_COLORS[p],
            }))}
          />
        </Card>
      </div>

      {/* Activity lists */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card title="Recent signups" icon={Users} delay={360} action={<ViewAll to="/users" />}>
          {stats.recentUsers.length === 0 ? (
            <EmptyRow text="No users yet" />
          ) : (
            <ul className="-mx-2 space-y-0.5">
              {stats.recentUsers.map((u) => (
                <li
                  key={u._id}
                  className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors duration-200 hover:bg-[#F7FAF8]"
                >
                  <Avatar name={u.name || u.email} picture={u.picture} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-800">{u.name || u.email.split('@')[0]}</p>
                    <p className="truncate text-xs text-gray-400">{u.email}</p>
                  </div>
                  <div className="text-right">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${PLAN_BADGE[u.plan] ?? PLAN_BADGE.free}`}>
                      {u.plan}
                    </span>
                    <p className="mt-1 text-[10px] text-gray-400">{timeAgo(u.createdAt)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Recent payments" icon={Receipt} delay={420} action={<ViewAll to="/revenue" />}>
          {stats.recentTransactions.length === 0 ? (
            <EmptyRow text="No payments yet" />
          ) : (
            <ul className="-mx-2 space-y-0.5">
              {stats.recentTransactions.map((t) => (
                <li
                  key={t._id}
                  className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors duration-200 hover:bg-[#F7FAF8]"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E8F5EE]">
                    <IndianRupee className="h-4 w-4 text-[#1A6B45]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-800">
                      {t.user?.name || t.user?.email || 'Deleted user'}
                    </p>
                    <p className="truncate text-xs capitalize text-gray-400">
                      {t.plan} · {t.billingCycle}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-emerald-700 tabular-nums">
                      +{formatMoney(t.amountInr, 'INR')}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {t.currency === 'USD' ? `${formatMoney(t.amount, 'USD')} · ` : ''}
                      {timeAgo(t.createdAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Top QR codes" icon={QrCode} delay={480} action={<ViewAll to="/qr-codes" />}>
          {stats.topQRs.length === 0 ? (
            <EmptyRow text="No scans recorded yet" />
          ) : (
            <ul className="space-y-3.5">
              {stats.topQRs.map((q, i) => {
                const share = stats.topQRs[0].scanCount > 0 ? (q.scanCount / stats.topQRs[0].scanCount) * 100 : 0;
                return (
                  <li key={q._id} className="group">
                    <div className="mb-1.5 flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#E8F5EE] text-[10px] font-bold text-[#1A6B45]">
                          {i + 1}
                        </span>
                        <p className="truncate text-sm font-medium text-gray-800">{q.businessName}</p>
                        {q.placeRating ? (
                          <span className="flex shrink-0 items-center gap-0.5 text-[11px] text-amber-600">
                            <Star className="h-3 w-3 fill-current" />
                            {q.placeRating}
                          </span>
                        ) : null}
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-gray-900 tabular-nums">
                        {formatNumber(q.scanCount)}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-[#EEF3EF]">
                      <div
                        className="h-full rounded-full bg-linear-to-r from-[#2ECC71] to-[#1A6B45] transition-[width] duration-1000 ease-out group-hover:brightness-110"
                        style={{ width: `${share}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      {/* Platform health */}
      <section
        className="relative overflow-hidden rounded-2xl bg-[#1A3A2E] p-6 shadow-lg animate-fade-up"
        style={{ animationDelay: '540ms' }}
      >
        <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-[#2ECC71] opacity-15 blur-2xl" />
        <div className="absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-teal-400 opacity-10 blur-2xl" />
        <h2 className="relative z-10 mb-5 flex items-center gap-2 font-semibold text-white">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2ECC71] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#2ECC71]" />
          </span>
          Platform health
        </h2>
        <div className="relative z-10 grid grid-cols-2 gap-6 sm:grid-cols-3 xl:grid-cols-6">
          {[
            { label: 'Total revenue', value: formatMoney(revenue.total, 'INR', true), icon: IndianRupee },
            { label: 'Total QR codes', value: formatNumber(qrCodes.total), icon: QrCode },
            { label: 'Active QR codes', value: formatNumber(qrCodes.active), icon: Activity },
            { label: 'Avg Google rating', value: ratings.average ? `${ratings.average} / 5` : '—', icon: Star },
            { label: 'Reviews tracked', value: formatNumber(ratings.totalReviews), icon: MessageSquare },
            {
              label: 'Avg order value',
              value: revenue.avgOrderValue ? formatMoney(revenue.avgOrderValue, 'INR') : '—',
              icon: Receipt,
            },
          ].map((s) => (
            <div key={s.label} className="rounded-xl p-2 -m-2 transition-colors duration-200 hover:bg-white/5">
              <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-[#6BAA8A]">
                <s.icon className="h-3.5 w-3.5" />
                {s.label}
              </p>
              <p className="text-2xl font-bold text-[#2ECC71] tabular-nums">{s.value}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
