import { useState, type ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Users,
  Crown,
  UserPlus,
  Activity,
  Ban,
  X,
  ChevronRight,
  QrCode,
  ScanLine,
  AlertTriangle,
  Mail,
} from 'lucide-react';
import { useListUsersQuery, type UserSort, type UserStatus } from '../store/api/adminUsersApi';
import type { PlanName } from '../store/api/adminDashboardApi';
import Pagination from '../components/common/Pagination';
import CountUp from '../components/dashboard/CountUp';
import { UserAvatar, PlanBadge, PlanExpiryNote, StatusBadge } from '../components/users/UserBits';
import { formatDate, formatNumber, timeAgo } from '../lib/format';
import { useDebounced, usePageForFilters } from '../hooks/useListControls';

const PLAN_FILTERS: { value: PlanName | ''; label: string }[] = [
  { value: '', label: 'All plans' },
  { value: 'free', label: 'Free' },
  { value: 'starter', label: 'Starter' },
  { value: 'pro', label: 'Pro' },
  { value: 'agency', label: 'Agency' },
];

const SORT_OPTIONS: { value: UserSort; label: string }[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'lastLogin', label: 'Recently active' },
  { value: 'name', label: 'Name A–Z' },
];

const StatCard = ({
  label,
  value,
  hint,
  icon: Icon,
  accent,
  delay,
}: {
  label: string;
  value: number;
  hint: string;
  icon: ComponentType<{ className?: string }>;
  accent: string;
  delay: number;
}) => (
  <div
    className="group relative overflow-hidden rounded-2xl border border-[#E3EEE7] bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-900/5 animate-fade-up"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div
      className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-[0.08] transition-transform duration-500 group-hover:scale-125"
      style={{ backgroundColor: accent }}
    />
    <div className="relative flex items-center gap-4">
      <div
        className="flex h-11 w-11 items-center justify-center rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-110"
        style={{ backgroundColor: accent }}
      >
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold leading-none text-gray-900 tabular-nums">
          <CountUp value={value} />
        </p>
        <p className="mt-1 text-xs font-medium text-gray-500">{label}</p>
      </div>
    </div>
    <p className="relative mt-3 text-[11px] text-gray-400">{hint}</p>
  </div>
);

const UsersPage = () => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [plan, setPlan] = useState<PlanName | ''>('');
  const [status, setStatus] = useState<UserStatus | ''>('');
  const [sort, setSort] = useState<UserSort>('newest');
  const [limit, setLimit] = useState(10);

  const search = useDebounced(searchInput.trim());
  const [page, setPage] = usePageForFilters(JSON.stringify([search, plan, status, sort, limit]));

  const { data, isLoading, isFetching, error, refetch } = useListUsersQuery({ search, plan, status, sort, page, limit });

  const users = data?.users ?? [];
  const stats = data?.stats;
  const pagination = data?.pagination ?? { total: 0, totalPages: 0 };
  const hasFilters = !!(search || plan || status);

  const clearFilters = () => {
    setSearchInput('');
    setPlan('');
    setStatus('');
  };

  return (
    <div className="min-h-screen flex-1 bg-[#F4F7F4]">
      <header className="sticky top-14 lg:top-0 z-20 border-b border-[#D1E7DA] bg-white/80 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 pb-5 pt-6 sm:px-8">
          <div className="animate-fade-up">
            <h1 className="text-[22px] font-semibold text-gray-800">Users</h1>
            <p className="mt-0.5 text-sm text-gray-400">
              {stats ? `${formatNumber(stats.total)} accounts · ${formatNumber(stats.paidActive)} paying` : 'Manage all business accounts'}
            </p>
          </div>
          <div className="relative w-full sm:w-72 animate-fade-up" style={{ animationDelay: '60ms' }}>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search name, email, business, phone…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-xl border border-[#D1E7DA] bg-white py-2.5 pl-9 pr-9 text-sm shadow-sm outline-none transition-all placeholder:text-gray-400 focus:border-[#1A6B45] focus:ring-4 focus:ring-[#1A6B45]/10"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="space-y-5 px-6 py-6 sm:px-8">
        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {stats ? (
            <>
              <StatCard label="Total users" value={stats.total} hint={`${stats.byPlan.free} on free plan`} icon={Users} accent="#1A6B45" delay={0} />
              <StatCard
                label="Paying users"
                value={stats.paidActive}
                hint={`${stats.total ? ((stats.paidActive / stats.total) * 100).toFixed(1) : 0}% conversion`}
                icon={Crown}
                accent="#D97706"
                delay={50}
              />
              <StatCard label="New (30 days)" value={stats.newThisMonth} hint="Signed up in the last 30 days" icon={UserPlus} accent="#10B981" delay={100} />
              <StatCard label="Active (30 days)" value={stats.activeLast30} hint="Logged in in the last 30 days" icon={Activity} accent="#0D9488" delay={150} />
              <StatCard label="Blocked" value={stats.blocked} hint={`Churn rate ${stats.churnRate}`} icon={Ban} accent="#DC2626" delay={200} />
            </>
          ) : (
            Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-[118px] rounded-2xl" />)
          )}
        </div>

        {/* Table card */}
        <section className="overflow-hidden rounded-2xl border border-[#E3EEE7] bg-white shadow-sm animate-fade-up" style={{ animationDelay: '250ms' }}>
          {/* Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EEF3EF] px-5 py-4">
            <div className="flex flex-wrap items-center gap-1.5">
              {PLAN_FILTERS.map((f) => {
                const count = f.value && stats ? stats.byPlan[f.value] : stats?.total;
                const active = plan === f.value;
                return (
                  <button
                    key={f.label}
                    onClick={() => setPlan(f.value)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                      active
                        ? 'bg-[#1A3A2E] text-white shadow-sm'
                        : 'bg-[#F4F7F4] text-gray-600 hover:bg-[#E8F5EE] hover:text-[#1A6B45]'
                    }`}
                  >
                    {f.label}
                    {count !== undefined && (
                      <span className={`ml-1.5 tabular-nums ${active ? 'text-[#2ECC71]' : 'text-gray-400'}`}>{count}</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as UserStatus | '')}
                className="cursor-pointer rounded-lg border border-[#D1E7DA] bg-white px-3 py-1.5 text-xs font-medium text-gray-600 outline-none transition-colors hover:border-[#1A6B45] focus:border-[#1A6B45]"
              >
                <option value="">Any status</option>
                <option value="active">Active</option>
                <option value="block">Blocked</option>
              </select>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as UserSort)}
                className="cursor-pointer rounded-lg border border-[#D1E7DA] bg-white px-3 py-1.5 text-xs font-medium text-gray-600 outline-none transition-colors hover:border-[#1A6B45] focus:border-[#1A6B45]"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
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

          {/* Fetch progress bar */}
          <div className="relative h-0.5 overflow-hidden">
            {isFetching && !isLoading && <div className="absolute inset-y-0 w-1/3 bg-[#2ECC71] animate-progress" />}
          </div>

          {isLoading ? (
            <div className="space-y-2 p-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton h-14 rounded-xl" />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 py-20">
              <AlertTriangle className="h-8 w-8 text-red-400" />
              <p className="text-sm text-gray-600">Couldn't load users</p>
              <button onClick={() => refetch()} className="rounded-lg bg-[#1A6B45] px-4 py-2 text-xs font-semibold text-white hover:bg-[#15573A]">
                Try again
              </button>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-20 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E8F5EE]">
                <Search className="h-5 w-5 text-[#1A6B45]" />
              </div>
              <p className="font-medium text-gray-700">No users found</p>
              <p className="text-sm text-gray-400">{hasFilters ? 'Try a different search or filter.' : 'Users will appear here once they sign up.'}</p>
            </div>
          ) : (
            <div className={`overflow-x-auto transition-opacity duration-200 ${isFetching ? 'opacity-60' : ''}`}>
              <table className="w-full min-w-[900px] text-left">
                <thead>
                  <tr className="bg-[#F7FAF8] text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    <th className="px-5 py-3">User</th>
                    <th className="px-5 py-3">Plan</th>
                    <th className="px-5 py-3 text-right">QR codes</th>
                    <th className="px-5 py-3 text-right">Scans</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Last active</th>
                    <th className="px-5 py-3">Joined</th>
                    <th className="w-10 px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF3EF]">
                  {users.map((user, i) => (
                    <tr
                      key={user._id}
                      onClick={() => navigate(`/users/${user._id}`)}
                      className="group cursor-pointer transition-colors duration-150 hover:bg-[#F7FAF8] animate-fade-up"
                      style={{ animationDelay: `${i * 25}ms` }}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <UserAvatar name={user.name} picture={user.picture} />
                          <div className="min-w-0">
                            <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-gray-900">
                              {user.name}
                              {user.authProvider === 'google' ? (
                                <span className="rounded bg-blue-50 px-1 py-px text-[9px] font-bold text-blue-600">G</span>
                              ) : (
                                <Mail className="h-3 w-3 text-gray-400" />
                              )}
                            </p>
                            <p className="truncate text-xs text-gray-400">{user.email}</p>
                            {user.businessName && <p className="truncate text-[11px] text-[#1A6B45]">{user.businessName}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <PlanBadge plan={user.plan} />
                        <PlanExpiryNote plan={user.plan} planExpiresAt={user.planExpiresAt} />
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-700 tabular-nums">
                          <QrCode className="h-3.5 w-3.5 text-gray-300" />
                          {user.qrCount}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-700 tabular-nums">
                          <ScanLine className="h-3.5 w-3.5 text-gray-300" />
                          {formatNumber(user.totalScans)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={user.status} />
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-500">{user.lastLoginAt ? timeAgo(user.lastLoginAt) : 'Never'}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-500">{formatDate(user.createdAt)}</td>
                      <td className="px-5 py-3.5">
                        <ChevronRight className="h-4 w-4 text-gray-300 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-[#1A6B45]" />
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
        </section>
      </div>
    </div>
  );
};

export default UsersPage;
