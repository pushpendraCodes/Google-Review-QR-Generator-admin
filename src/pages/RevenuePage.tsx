import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IndianRupee,
  TrendingUp,
  CreditCard,
  Users,
  Download,
  Loader2,
  BarChart3,
  PieChart,
  Receipt,
  RotateCcw,
  ShieldCheck,
  X,
  Copy,
  Check,
  ChevronRight,
} from 'lucide-react';
import {
  useGetRevenueStatsQuery,
  useListTransactionsQuery,
  useExportTransactionsMutation,
  type TxStatus,
  type TxProvider,
  type TxSort,
  type AdminTransaction,
} from '../store/api/adminRevenueApi';
import type { PlanName } from '../store/api/adminDashboardApi';
import Pagination from '../components/common/Pagination';
import BarChart from '../components/dashboard/BarChart';
import {
  PageHeader,
  Card,
  StatCard,
  GrowthPill,
  FilterChips,
  Select,
  SearchInput,
  FetchBar,
  TableSkeleton,
  EmptyState,
  ErrorState,
  Toast,
  type Notice,
} from '../components/ui';
import { UserAvatar, PlanBadge } from '../components/users/UserBits';
import { useDebounced, usePageForFilters } from '../hooks/useListControls';
import { formatDate, formatMoney, formatNumber } from '../lib/format';

type PaidPlan = Exclude<PlanName, 'free'>;

const STATUS_STYLES: Record<TxStatus, string> = {
  completed: 'bg-emerald-50 text-emerald-700',
  pending: 'bg-amber-50 text-amber-700',
  failed: 'bg-red-50 text-red-600',
  refunded: 'bg-gray-100 text-gray-600',
};

const PLAN_COLORS: Record<PaidPlan, string> = { starter: '#6EE7B7', pro: '#2ECC71', agency: '#1A6B45' };
const PROVIDER_LABEL: Record<TxProvider, string> = { razorpay: 'Razorpay', lemon_squeezy: 'Lemon Squeezy' };

const monthLabel = (ym: string) =>
  new Date(`${ym}-01T00:00:00Z`).toLocaleDateString('en-IN', { month: 'short', timeZone: 'UTC' });

const BreakdownBars = ({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; total: number; count: number; color: string }[];
}) => {
  const grand = rows.reduce((s, r) => s + r.total, 0);
  return (
    <div>
      <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">{title}</p>
      <div className="space-y-3">
        {rows.map((r) => {
          const pct = grand > 0 ? (r.total / grand) * 100 : 0;
          return (
            <div key={r.label} className="group">
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-gray-600">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: r.color }} />
                  {r.label}
                  <span className="text-xs text-gray-400">· {r.count}</span>
                </span>
                <span className="font-semibold text-gray-900 tabular-nums">{formatMoney(r.total, 'INR', true)}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#EEF3EF]">
                <div
                  className="h-full rounded-full transition-[width] duration-1000 ease-out group-hover:brightness-110"
                  style={{ width: `${pct}%`, backgroundColor: r.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const CopyId = ({ id }: { id: string }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(id);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      title={id}
      className="group/id inline-flex max-w-[140px] items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-[11px] text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
    >
      <span className="truncate">{id}</span>
      {copied ? <Check className="h-3 w-3 shrink-0 text-emerald-600" /> : <Copy className="h-3 w-3 shrink-0 opacity-0 group-hover/id:opacity-100" />}
    </button>
  );
};

const txId = (t: AdminTransaction) => t.transactionId || t.razorpayOrderId || '';

const RevenuePage = () => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState<TxStatus | ''>('');
  const [plan, setPlan] = useState<PaidPlan | ''>('');
  const [provider, setProvider] = useState<TxProvider | ''>('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [sort, setSort] = useState<TxSort>('newest');
  const [limit, setLimit] = useState(10);
  const [notice, setNotice] = useState<Notice>(null);

  const search = useDebounced(searchInput.trim());
  const filters = { search, status, plan, provider, from, to, sort };
  const [page, setPage] = usePageForFilters(JSON.stringify([filters, limit]));

  const { data: stats, isLoading: statsLoading } = useGetRevenueStatsQuery();
  const { data, isLoading, isFetching, error, refetch } = useListTransactionsQuery({ ...filters, page, limit });
  const [exportCsv, { isLoading: isExporting }] = useExportTransactionsMutation();

  const transactions = data?.transactions ?? [];
  const pagination = data?.pagination ?? { total: 0, totalPages: 0 };
  const hasFilters = !!(search || status || plan || provider || from || to);

  const clearFilters = () => {
    setSearchInput('');
    setStatus('');
    setPlan('');
    setProvider('');
    setFrom('');
    setTo('');
  };

  const handleExport = async () => {
    try {
      const blob = await exportCsv(filters).unwrap();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setNotice({ type: 'success', text: 'CSV downloaded' });
    } catch {
      setNotice({ type: 'error', text: 'Export failed' });
    }
  };

  return (
    <div className="min-h-screen flex-1 bg-[#F4F7F4]">
      <PageHeader
        title="Revenue"
        subtitle={
          stats
            ? `${formatMoney(stats.totalRevenue, 'INR')} lifetime · ${formatNumber(stats.totalTransactions)} payments · $1 = ₹${stats.usdToInr}`
            : 'Earnings and subscriptions'
        }
        actions={
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 rounded-xl bg-[#1A6B45] px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-900/20 transition-all hover:bg-[#15573A] active:scale-95 disabled:opacity-70"
          >
            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Export CSV{hasFilters ? ' (filtered)' : ''}
          </button>
        }
      />
      <Toast notice={notice} onClose={() => setNotice(null)} />

      <div className="space-y-5 px-6 py-6 sm:px-8">
        {/* KPIs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statsLoading || !stats ? (
            Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-[124px] rounded-2xl" />)
          ) : (
            <>
              <StatCard
                label="Revenue this month"
                value={stats.mrr}
                format={(n) => formatMoney(n, 'INR', true)}
                icon={IndianRupee}
                accent="#1A6B45"
                delay={0}
                sub={<GrowthPill growth={stats.mrrGrowth} fallback={`${formatMoney(stats.prevMrr, 'INR', true)} last month`} />}
              />
              <StatCard
                label="New subscriptions (month)"
                value={stats.newSubsThisMonth}
                icon={TrendingUp}
                accent="#10B981"
                delay={60}
                sub={<GrowthPill growth={stats.newSubsGrowth} fallback="First month of sales" />}
              />
              <StatCard
                label="Avg order value"
                value={stats.avgOrderValue}
                format={(n) => formatMoney(n, 'INR')}
                icon={CreditCard}
                accent="#0D9488"
                delay={120}
                sub={<span className="text-[11px] text-gray-400">Across {formatNumber(stats.totalTransactions)} completed payments</span>}
              />
              <StatCard
                label="Paying customers"
                value={stats.payingCustomers}
                icon={Users}
                accent="#D97706"
                delay={180}
                sub={
                  <div className="flex flex-wrap items-center gap-3 text-[11px]">
                    <span className="inline-flex items-center gap-1 text-gray-500">
                      <ShieldCheck className="h-3 w-3 text-emerald-600" />
                      {stats.successRate !== null ? `${stats.successRate}% success` : 'No attempts yet'}
                    </span>
                    {stats.refundedAmount > 0 && (
                      <span className="inline-flex items-center gap-1 text-gray-500">
                        <RotateCcw className="h-3 w-3 text-red-500" />
                        {formatMoney(stats.refundedAmount, 'INR', true)} refunded
                      </span>
                    )}
                  </div>
                }
              />
            </>
          )}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <Card title="Monthly revenue" icon={BarChart3} className="xl:col-span-2" delay={220} action={<span className="text-xs text-gray-400">Last 12 months</span>}>
            {stats ? (
              <BarChart
                data={stats.monthly.map((m) => ({
                  label: monthLabel(m.month),
                  value: m.revenue,
                  sub: `${m.count} payment${m.count === 1 ? '' : 's'}`,
                }))}
                formatValue={(n) => formatMoney(n, 'INR')}
              />
            ) : (
              <div className="skeleton h-60 rounded-xl" />
            )}
          </Card>

          <Card title="Revenue breakdown" icon={PieChart} delay={280}>
            {stats ? (
              <div className="space-y-6">
                <BreakdownBars
                  title="By plan"
                  rows={(['starter', 'pro', 'agency'] as PaidPlan[]).map((p) => ({
                    label: p.charAt(0).toUpperCase() + p.slice(1),
                    total: stats.byPlan[p]?.total || 0,
                    count: stats.byPlan[p]?.count || 0,
                    color: PLAN_COLORS[p],
                  }))}
                />
                <BreakdownBars
                  title="By provider"
                  rows={(['razorpay', 'lemon_squeezy'] as TxProvider[]).map((p, i) => ({
                    label: PROVIDER_LABEL[p],
                    total: stats.byProvider[p]?.total || 0,
                    count: stats.byProvider[p]?.count || 0,
                    color: i === 0 ? '#0D9488' : '#D97706',
                  }))}
                />
                <BreakdownBars
                  title="By billing cycle"
                  rows={(['monthly', 'annual'] as const).map((c, i) => ({
                    label: c === 'monthly' ? 'Monthly' : 'Annual',
                    total: stats.byCycle[c]?.total || 0,
                    count: stats.byCycle[c]?.count || 0,
                    color: i === 0 ? '#10B981' : '#1A3A2E',
                  }))}
                />
              </div>
            ) : (
              <div className="skeleton h-60 rounded-xl" />
            )}
          </Card>
        </div>

        {/* Transactions */}
        <Card
          flush
          title="Transactions"
          icon={Receipt}
          delay={340}
          action={
            <SearchInput value={searchInput} onChange={setSearchInput} placeholder="Customer, email, transaction ID, coupon…" className="w-full sm:w-80" />
          }
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EEF3EF] px-5 py-3">
            <FilterChips<TxStatus | ''>
              value={status}
              onChange={setStatus}
              options={[
                { value: '', label: 'All' },
                { value: 'completed', label: 'Completed', count: stats?.byStatus.completed },
                { value: 'pending', label: 'Pending', count: stats?.byStatus.pending },
                { value: 'failed', label: 'Failed', count: stats?.byStatus.failed },
                { value: 'refunded', label: 'Refunded', count: stats?.byStatus.refunded },
              ]}
            />
            <div className="flex flex-wrap items-center gap-2">
              <Select<PaidPlan | ''>
                value={plan}
                onChange={setPlan}
                options={[
                  { value: '', label: 'All plans' },
                  { value: 'starter', label: 'Starter' },
                  { value: 'pro', label: 'Pro' },
                  { value: 'agency', label: 'Agency' },
                ]}
              />
              <Select<TxProvider | ''>
                value={provider}
                onChange={setProvider}
                options={[
                  { value: '', label: 'All providers' },
                  { value: 'razorpay', label: 'Razorpay' },
                  { value: 'lemon_squeezy', label: 'Lemon Squeezy' },
                ]}
              />
              <div className="flex items-center gap-1 rounded-lg border border-[#D1E7DA] bg-white px-2 py-0.5">
                <input
                  type="date"
                  value={from}
                  max={to || undefined}
                  onChange={(e) => setFrom(e.target.value)}
                  className="bg-transparent py-1 text-xs text-gray-600 outline-none"
                  aria-label="From date"
                />
                <span className="text-xs text-gray-300">→</span>
                <input
                  type="date"
                  value={to}
                  min={from || undefined}
                  onChange={(e) => setTo(e.target.value)}
                  className="bg-transparent py-1 text-xs text-gray-600 outline-none"
                  aria-label="To date"
                />
              </div>
              <Select<TxSort>
                value={sort}
                onChange={setSort}
                options={[
                  { value: 'newest', label: 'Newest first' },
                  { value: 'oldest', label: 'Oldest first' },
                  { value: 'amountDesc', label: 'Amount: high → low' },
                  { value: 'amountAsc', label: 'Amount: low → high' },
                ]}
              />
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                >
                  <X className="h-3 w-3" /> Clear
                </button>
              )}
            </div>
          </div>

          {hasFilters && data && (
            <div className="flex items-center justify-between bg-[#F7FAF8] px-5 py-2 text-xs text-gray-500 animate-fade-up">
              <span>
                {formatNumber(pagination.total)} matching transaction{pagination.total === 1 ? '' : 's'}
              </span>
              <span>
                Completed revenue in view: <span className="font-semibold text-[#1A6B45]">{formatMoney(data.filteredRevenue, 'INR')}</span>
              </span>
            </div>
          )}

          <FetchBar active={isFetching && !isLoading} />

          {isLoading ? (
            <TableSkeleton />
          ) : error ? (
            <ErrorState text="Couldn't load transactions" onRetry={refetch} />
          ) : transactions.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No transactions found"
              hint={hasFilters ? 'Try a different search or filter.' : 'Payments will show up here.'}
            />
          ) : (
            <div className={`overflow-x-auto transition-opacity duration-200 ${isFetching ? 'opacity-60' : ''}`}>
              <table className="w-full min-w-[960px] text-left">
                <thead>
                  <tr className="bg-[#F7FAF8] text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Plan</th>
                    <th className="px-5 py-3">Provider</th>
                    <th className="px-5 py-3 text-right">Amount</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Transaction ID</th>
                    <th className="w-8 px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF3EF]">
                  {transactions.map((t, i) => (
                    <tr
                      key={t._id}
                      onClick={() => t.user?._id && navigate(`/users/${t.user._id}`)}
                      className={`group transition-colors duration-150 hover:bg-[#F7FAF8] animate-fade-up ${t.user?._id ? 'cursor-pointer' : ''}`}
                      style={{ animationDelay: `${i * 25}ms` }}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <UserAvatar name={t.user?.name || t.user?.email || '?'} picture={t.user?.picture} />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-gray-900">{t.user?.name || 'Deleted user'}</p>
                            <p className="truncate text-xs text-gray-400">{t.user?.email || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <PlanBadge plan={t.plan} />
                        <p className="mt-1 text-[11px] capitalize text-gray-400">{t.billingCycle}</p>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-600">{PROVIDER_LABEL[t.paymentProvider]}</td>
                      <td className="px-5 py-3.5 text-right">
                        <p className="text-sm font-bold text-gray-900 tabular-nums">{formatMoney(t.amountInr, 'INR')}</p>
                        <p className="text-[11px] text-gray-400">
                          {t.currency === 'USD' && formatMoney(t.amount, 'USD')}
                          {t.discountAmount > 0 && ` · −${formatMoney(t.discountAmount, t.currency)}`}
                          {t.couponApplied && ` · ${t.couponApplied}`}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${STATUS_STYLES[t.status]}`}>{t.status}</span>
                        {t.status === 'failed' && t.failureReason && (
                          <p className="mt-1 max-w-[160px] truncate text-[11px] text-red-400" title={t.failureReason}>
                            {t.failureReason}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-500">{formatDate(t.createdAt, true)}</td>
                      <td className="px-5 py-3.5">{txId(t) ? <CopyId id={txId(t)} /> : <span className="text-xs text-gray-300">—</span>}</td>
                      <td className="px-5 py-3.5">
                        {t.user?._id && (
                          <ChevronRight className="h-4 w-4 text-gray-300 transition-all group-hover:translate-x-0.5 group-hover:text-[#1A6B45]" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <Pagination
            currentPage={page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
            totalItems={pagination.total}
            itemsPerPage={limit}
            onItemsPerPageChange={setLimit}
          />
        </Card>
      </div>
    </div>
  );
};

export default RevenuePage;
