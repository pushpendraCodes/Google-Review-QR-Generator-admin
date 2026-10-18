import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  QrCode,
  ScanLine,
  Star,
  EyeOff,
  Activity,
  Smartphone,
  MapPin,
  X,
  ChevronRight,
} from 'lucide-react';
import { useGetQRStatsQuery, useListQRCodesQuery, type QRSort, type QRStatusFilter, type AdminQRCode } from '../store/api/adminQRCodesApi';
import type { PlanName } from '../store/api/adminDashboardApi';
import Pagination from '../components/common/Pagination';
import TrendChart from '../components/dashboard/TrendChart';
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
} from '../components/ui';
import { UserAvatar, PlanBadge } from '../components/users/UserBits';
import { DeviceBreakdown, QRStatusBadge, QRThumb } from '../components/qr/QRBits';
import { useDebounced, usePageForFilters } from '../hooks/useListControls';
import { formatDate, formatNumber, timeAgo } from '../lib/format';

const qrState = (q: Pick<AdminQRCode, 'status' | 'isActive'>): QRStatusFilter =>
  q.status === 'archived' ? 'archived' : q.isActive === false ? 'paused' : 'live';

const QRCodesPage = () => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState<QRStatusFilter | ''>('');
  const [plan, setPlan] = useState<PlanName | ''>('');
  const [sort, setSort] = useState<QRSort>('newest');
  const [limit, setLimit] = useState(10);

  const search = useDebounced(searchInput.trim());
  const [page, setPage] = usePageForFilters(JSON.stringify([search, status, plan, sort, limit]));

  const { data: stats } = useGetQRStatsQuery();
  const { data, isLoading, isFetching, error, refetch } = useListQRCodesQuery({ search, status, plan, sort, page, limit });

  const qrCodes = data?.qrCodes ?? [];
  const pagination = data?.pagination ?? { total: 0, totalPages: 0 };
  const hasFilters = !!(search || status || plan);

  return (
    <div className="min-h-screen flex-1 bg-[#F4F7F4]">
      <PageHeader
        title="QR codes"
        subtitle={
          stats
            ? `${formatNumber(stats.total)} codes · ${formatNumber(stats.totalScans)} scans all time`
            : 'Performance and scan data across the platform'
        }
      />

      <div className="space-y-5 px-6 py-6 sm:px-8">
        {/* KPIs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {!stats ? (
            Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-[124px] rounded-2xl" />)
          ) : (
            <>
              <StatCard
                label="Total QR codes"
                value={stats.total}
                icon={QrCode}
                accent="#1A6B45"
                delay={0}
                sub={
                  <div className="flex gap-3 text-[11px] text-gray-500">
                    <span><span className="font-semibold text-emerald-700">{stats.active}</span> live</span>
                    <span><span className="font-semibold text-amber-600">{stats.paused}</span> paused</span>
                    <span><span className="font-semibold text-gray-600">{stats.archived}</span> archived</span>
                  </div>
                }
              />
              <StatCard
                label="Scans this month"
                value={stats.scansThisMonth}
                icon={ScanLine}
                accent="#10B981"
                delay={60}
                sub={<GrowthPill growth={stats.scansGrowth} fallback={`${stats.avgScans} avg per QR`} />}
              />
              <StatCard
                label="Avg Google rating"
                value={stats.avgRating}
                format={(n) => (n ? n.toFixed(1) : '—')}
                icon={Star}
                accent="#D97706"
                delay={120}
                sub={<span className="text-[11px] text-gray-400">{formatNumber(stats.totalReviews)} reviews tracked</span>}
              />
              <StatCard
                label="Never scanned"
                value={stats.neverScanned}
                icon={EyeOff}
                accent="#DC2626"
                delay={180}
                sub={
                  <span className="text-[11px] text-gray-400">
                    {stats.total ? Math.round((stats.neverScanned / stats.total) * 100) : 0}% of all codes — possible onboarding gap
                  </span>
                }
              />
            </>
          )}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <Card title="Scans across the platform" icon={Activity} className="xl:col-span-2" delay={220} action={<span className="text-xs text-gray-400">Last 30 days</span>}>
            {stats ? <TrendChart data={stats.scanSeries} color="#10B981" label="Scans" height={240} /> : <div className="skeleton h-60 rounded-xl" />}
          </Card>
          <Card title="Who's scanning" icon={Smartphone} delay={280} action={<span className="text-xs text-gray-400">30 days</span>}>
            {stats ? (
              <div className="space-y-6">
                <DeviceBreakdown devices={stats.devices} />
                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    <MapPin className="h-3.5 w-3.5" /> Top cities
                  </p>
                  {stats.topCities.length === 0 ? (
                    <p className="text-sm text-gray-400">No location data yet</p>
                  ) : (
                    <ul className="space-y-1.5">
                      {stats.topCities.map((c) => (
                        <li key={`${c.city}-${c.country}`} className="flex items-center justify-between rounded-lg px-2 py-1 text-sm transition-colors hover:bg-[#F7FAF8]">
                          <span className="truncate text-gray-700">
                            {c.city}
                            {c.country && <span className="text-gray-400">, {c.country}</span>}
                          </span>
                          <span className="font-semibold text-gray-900 tabular-nums">{formatNumber(c.count)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ) : (
              <div className="skeleton h-60 rounded-xl" />
            )}
          </Card>
        </div>

        {/* Table */}
        <Card
          flush
          title="All QR codes"
          icon={QrCode}
          delay={340}
          action={<SearchInput value={searchInput} onChange={setSearchInput} placeholder="Business, address, code, owner email…" className="w-full sm:w-80" />}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EEF3EF] px-5 py-3">
            <FilterChips<QRStatusFilter | ''>
              value={status}
              onChange={setStatus}
              options={[
                { value: '', label: 'All', count: stats?.total },
                { value: 'live', label: 'Live', count: stats?.active },
                { value: 'paused', label: 'Paused', count: stats?.paused },
                { value: 'archived', label: 'Archived', count: stats?.archived },
              ]}
            />
            <div className="flex flex-wrap items-center gap-2">
              <Select<PlanName | ''>
                value={plan}
                onChange={setPlan}
                options={[
                  { value: '', label: 'Any owner plan' },
                  { value: 'free', label: 'Free' },
                  { value: 'starter', label: 'Starter' },
                  { value: 'pro', label: 'Pro' },
                  { value: 'agency', label: 'Agency' },
                ]}
              />
              <Select<QRSort>
                value={sort}
                onChange={setSort}
                options={[
                  { value: 'newest', label: 'Newest first' },
                  { value: 'oldest', label: 'Oldest first' },
                  { value: 'scans', label: 'Most scans' },
                  { value: 'rating', label: 'Highest rating' },
                  { value: 'reviews', label: 'Most reviews' },
                ]}
              />
              {hasFilters && (
                <button
                  onClick={() => {
                    setSearchInput('');
                    setStatus('');
                    setPlan('');
                  }}
                  className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                >
                  <X className="h-3 w-3" /> Clear
                </button>
              )}
            </div>
          </div>

          <FetchBar active={isFetching && !isLoading} />

          {isLoading ? (
            <TableSkeleton />
          ) : error ? (
            <ErrorState text="Couldn't load QR codes" onRetry={refetch} />
          ) : qrCodes.length === 0 ? (
            <EmptyState icon={QrCode} title="No QR codes found" hint={hasFilters ? 'Try a different search or filter.' : 'QR codes will appear once users create them.'} />
          ) : (
            <div className={`overflow-x-auto transition-opacity duration-200 ${isFetching ? 'opacity-60' : ''}`}>
              <table className="w-full min-w-[980px] text-left">
                <thead>
                  <tr className="bg-[#F7FAF8] text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    <th className="px-5 py-3">QR code</th>
                    <th className="px-5 py-3">Owner</th>
                    <th className="px-5 py-3 text-right">Scans</th>
                    <th className="px-5 py-3">Google</th>
                    <th className="px-5 py-3">Last scan</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Created</th>
                    <th className="w-8 px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF3EF]">
                  {qrCodes.map((q, i) => (
                    <tr
                      key={q._id}
                      onClick={() => navigate(`/qr-codes/${q._id}`)}
                      className="group cursor-pointer transition-colors duration-150 hover:bg-[#F7FAF8] animate-fade-up"
                      style={{ animationDelay: `${i * 25}ms` }}
                    >
                      <td className="max-w-[300px] px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <QRThumb name={q.businessName} logoUrl={q.qrConfig?.logoUrl} />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-gray-900">{q.businessName}</p>
                            <p className="truncate text-xs text-gray-400">{q.placeAddress || q.label || '—'}</p>
                            <span className="mt-0.5 inline-block rounded bg-[#E8F5EE] px-1.5 py-px font-mono text-[10px] font-semibold text-[#1A6B45]">
                              {q.shortCode}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        {q.owner ? (
                          <div className="flex items-center gap-2.5">
                            <UserAvatar name={q.owner.name || q.owner.email || '?'} picture={q.owner.picture} size={30} />
                            <div className="min-w-0">
                              <p className="max-w-[180px] truncate text-xs font-medium text-gray-700">{q.owner.email}</p>
                              {q.owner.plan && <PlanBadge plan={q.owner.plan} />}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Deleted user</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <p className="text-sm font-bold text-gray-900 tabular-nums">{formatNumber(q.scanCount)}</p>
                        <p className={`text-[11px] ${q.scans7d > 0 ? 'font-medium text-emerald-600' : 'text-gray-400'}`}>
                          {q.scans7d > 0 ? `+${q.scans7d} this week` : 'none this week'}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        {q.placeRating ? (
                          <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-800">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            {q.placeRating}
                            <span className="text-xs font-normal text-gray-400">({formatNumber(q.totalReviews || 0)})</span>
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">No rating</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-500">{q.lastScanAt ? timeAgo(q.lastScanAt) : 'Never'}</td>
                      <td className="px-5 py-3.5">
                        <QRStatusBadge state={qrState(q)} />
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-500">{formatDate(q.createdAt)}</td>
                      <td className="px-5 py-3.5">
                        <ChevronRight className="h-4 w-4 text-gray-300 transition-all group-hover:translate-x-0.5 group-hover:text-[#1A6B45]" />
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

export default QRCodesPage;
