import { useEffect, useState, type ComponentType, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  Bell,
  QrCode,
  ScanLine,
  IndianRupee,
  Activity,
  Star,
  ExternalLink,
  Receipt,
  Ban,
  CheckCircle2,
  Trash2,
  Crown,
  Copy,
  Check,
  AlertTriangle,
  Loader2,
  Globe,
  Users,
  Minus,
  Plus,
} from 'lucide-react';
import {
  useGetUserQuery,
  useUpdateUserStatusMutation,
  useUpdateUserPlanMutation,
  useUpdateUserSeatsMutation,
  useDeleteUserMutation,
  type AdminUser,
  type AgencyClientItem,
  type TeamInviteItem,
  type TeamMember,
  type TeamOf,
  type UserTransaction,
} from '../store/api/adminUsersApi';
import type { PlanName } from '../store/api/adminDashboardApi';
import CountUp from '../components/dashboard/CountUp';
import TrendChart from '../components/dashboard/TrendChart';
import { UserAvatar, PlanBadge, StatusBadge } from '../components/users/UserBits';
import { daysUntil, formatDate, formatMoney, formatNumber, timeAgo } from '../lib/format';
import Pagination from '../components/common/Pagination';
import { useClientPagination } from '../hooks/useListControls';

const SCAN_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api\/?$/, '');
const EMPTY: never[] = [];

const TX_STATUS_STYLES: Record<UserTransaction['status'], string> = {
  completed: 'bg-emerald-50 text-emerald-700',
  pending: 'bg-amber-50 text-amber-700',
  failed: 'bg-red-50 text-red-600',
  refunded: 'bg-gray-100 text-gray-600',
};

type Notice = { type: 'success' | 'error'; text: string } | null;

function errorMessage(err: unknown, fallback: string): string {
  const data = (err as { data?: { message?: string } })?.data;
  return data?.message || fallback;
}

function addPeriod(base: Date, months: number): string {
  const d = new Date(base);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

// ─── Building blocks ────────────────────────────────────────────────────────

const Card = ({
  title,
  icon: Icon,
  action,
  children,
  className = '',
  delay = 0,
}: {
  title?: string;
  icon?: ComponentType<{ className?: string }>;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  delay?: number;
}) => (
  <section
    className={`rounded-2xl border border-[#E3EEE7] bg-white p-6 shadow-sm animate-fade-up ${className}`}
    style={{ animationDelay: `${delay}ms` }}
  >
    {title && (
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-semibold text-gray-800">
          {Icon && <Icon className="h-4 w-4 text-[#1A6B45]" />}
          {title}
        </h2>
        {action}
      </div>
    )}
    {children}
  </section>
);

const InfoRow = ({ icon: Icon, label, children }: { icon: ComponentType<{ className?: string }>; label: string; children: ReactNode }) => (
  <div className="flex items-start gap-3 py-2.5">
    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F4F7F4]">
      <Icon className="h-4 w-4 text-[#1A6B45]" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">{label}</p>
      <div className="truncate text-sm font-medium text-gray-800">{children}</div>
    </div>
  </div>
);

const StatTile = ({
  label,
  value,
  format,
  icon: Icon,
  accent,
  hint,
  delay,
}: {
  label: string;
  value: number;
  format?: (n: number) => string;
  icon: ComponentType<{ className?: string }>;
  accent: string;
  hint?: string;
  delay: number;
}) => (
  <div
    className="group rounded-2xl border border-[#E3EEE7] bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-900/5 animate-fade-up"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div
      className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
      style={{ backgroundColor: accent }}
    >
      <Icon className="h-4 w-4 text-white" />
    </div>
    <p className="text-xl font-bold text-gray-900 tabular-nums">
      <CountUp value={value} format={format} />
    </p>
    <p className="text-xs font-medium text-gray-500">{label}</p>
    {hint && <p className="mt-1 text-[11px] text-gray-400">{hint}</p>}
  </div>
);

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="ml-1.5 inline-flex rounded p-0.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#1A6B45]"
      title="Copy"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
};

const ConfirmDialog = ({
  title,
  body,
  confirmLabel,
  danger,
  loading,
  onConfirm,
  onCancel,
}: {
  title: string;
  body: ReactNode;
  confirmLabel: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-fade-up" onClick={onCancel}>
    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
      <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-full ${danger ? 'bg-red-50' : 'bg-amber-50'}`}>
        <AlertTriangle className={`h-5 w-5 ${danger ? 'text-red-500' : 'text-amber-600'}`} />
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <div className="mt-1.5 text-sm text-gray-500">{body}</div>
      <div className="mt-6 flex justify-end gap-2">
        <button onClick={onCancel} className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100">
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all active:scale-95 disabled:opacity-60 ${
            danger ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'
          }`}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

// ─── Plan manager ───────────────────────────────────────────────────────────

const PlanCard = ({ user, onNotice }: { user: AdminUser; onNotice: (n: Notice) => void }) => {
  const [editing, setEditing] = useState(false);
  const [plan, setPlan] = useState<PlanName>(user.plan);
  const [expiry, setExpiry] = useState('');
  const [updatePlan, { isLoading }] = useUpdateUserPlanMutation();

  const startEditing = () => {
    setPlan(user.plan);
    setExpiry(user.planExpiresAt ? user.planExpiresAt.slice(0, 10) : addPeriod(new Date(), 1));
    setEditing(true);
  };

  const days = user.planExpiresAt ? daysUntil(user.planExpiresAt) : null;
  const isPaid = user.plan !== 'free';
  const extendBase = user.planExpiresAt && days !== null && days > 0 ? new Date(user.planExpiresAt) : new Date();

  const save = async () => {
    try {
      await updatePlan({
        id: user._id,
        plan,
        planExpiresAt: plan === 'free' ? null : new Date(`${expiry}T23:59:59`).toISOString(),
      }).unwrap();
      onNotice({ type: 'success', text: `Plan updated to ${plan}` });
      setEditing(false);
    } catch (err) {
      onNotice({ type: 'error', text: errorMessage(err, 'Failed to update plan') });
    }
  };

  return (
    <Card
      title="Subscription"
      icon={Crown}
      delay={120}
      action={
        !editing && (
          <button onClick={startEditing} className="text-xs font-semibold text-[#1A6B45] transition-colors hover:text-[#2ECC71]">
            Change plan
          </button>
        )
      }
    >
      {!editing ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <PlanBadge plan={user.plan} />
            {isPaid && (
              <span className={`text-xs font-semibold ${user.planActive ? 'text-emerald-600' : 'text-red-500'}`}>
                {user.planActive ? 'Active' : 'Expired'}
              </span>
            )}
          </div>
          {isPaid ? (
            user.planExpiresAt ? (
              <div>
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="text-gray-500">Expires {formatDate(user.planExpiresAt)}</span>
                  <span className="font-semibold text-gray-700">{days !== null && days > 0 ? `${days}d left` : 'Expired'}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[#EEF3EF]">
                  <div
                    className={`h-full rounded-full transition-[width] duration-1000 ease-out ${
                      days !== null && days <= 7 ? 'bg-amber-500' : 'bg-linear-to-r from-[#2ECC71] to-[#1A6B45]'
                    }`}
                    style={{ width: `${Math.max(0, Math.min(100, ((days ?? 0) / 30) * 100))}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                No expiry date set. This plan never expires. Use "Change plan" to set one.
              </div>
            )
          ) : (
            <p className="text-sm text-gray-500">On the free plan. Scans go straight to Google Reviews.</p>
          )}
        </div>
      ) : (
        <div className="space-y-4 animate-fade-up">
          <div className="grid grid-cols-4 gap-1.5">
            {(['free', 'starter', 'pro', 'agency'] as PlanName[]).map((p) => (
              <button
                key={p}
                onClick={() => setPlan(p)}
                className={`rounded-lg py-2 text-xs font-semibold capitalize transition-all duration-200 ${
                  plan === p ? 'bg-[#1A3A2E] text-white shadow-sm' : 'bg-[#F4F7F4] text-gray-600 hover:bg-[#E8F5EE]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {plan !== 'free' && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">Expires on</label>
              <input
                type="date"
                value={expiry}
                min={addPeriod(new Date(), 0)}
                onChange={(e) => setExpiry(e.target.value)}
                className="w-full rounded-xl border border-[#D1E7DA] px-3 py-2 text-sm outline-none transition-all focus:border-[#1A6B45] focus:ring-4 focus:ring-[#1A6B45]/10"
              />
              <div className="mt-2 flex gap-1.5">
                {[
                  { label: '+1 month', months: 1 },
                  { label: '+3 months', months: 3 },
                  { label: '+1 year', months: 12 },
                ].map((q) => (
                  <button
                    key={q.label}
                    onClick={() => setExpiry(addPeriod(extendBase, q.months))}
                    className="rounded-md bg-[#F4F7F4] px-2 py-1 text-[11px] font-medium text-gray-600 transition-colors hover:bg-[#E8F5EE] hover:text-[#1A6B45]"
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button onClick={() => setEditing(false)} className="rounded-xl px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100">
              Cancel
            </button>
            <button
              onClick={save}
              disabled={isLoading || (plan !== 'free' && !expiry)}
              className="flex items-center gap-1.5 rounded-xl bg-[#1A6B45] px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-[#15573A] active:scale-95 disabled:opacity-60"
            >
              {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Save plan
            </button>
          </div>
        </div>
      )}
    </Card>
  );
};

// ─── Agency team seats ──────────────────────────────────────────────────────

const SeatsCard = ({ user, onNotice }: { user: AdminUser; onNotice: (n: Notice) => void }) => {
  const extra = user.extraSeats ?? 0;
  const maxExtra = user.maxExtraSeats ?? 7;
  const included = (user.seatLimit ?? 3) - extra;
  const [value, setValue] = useState(extra);
  const [updateSeats, { isLoading }] = useUpdateUserSeatsMutation();

  const save = async () => {
    try {
      await updateSeats({ id: user._id, extraSeats: value }).unwrap();
      onNotice({ type: 'success', text: `Extra seats set to ${value}` });
    } catch (err) {
      onNotice({ type: 'error', text: errorMessage(err, 'Failed to update seats') });
    }
  };

  return (
    <Card title="Team seats" icon={Users} delay={160}>
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { label: 'Members', value: user.teamMembers ?? 0 },
            { label: 'Seat limit', value: included + extra },
            { label: 'Extra seats', value: extra },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-[#F4F7F4] py-2.5">
              <p className="text-lg font-bold tabular-nums text-gray-900">{s.value}</p>
              <p className="text-[11px] font-medium text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-500">
            Extra seats (0–{maxExtra}) · {included} included with Agency
          </label>
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-xl border border-[#D1E7DA]">
              <button
                onClick={() => setValue((v) => Math.max(0, v - 1))}
                disabled={value <= 0}
                className="px-3 py-2 text-gray-600 transition-colors hover:text-[#1A6B45] disabled:opacity-40"
                aria-label="Fewer seats"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-8 text-center text-sm font-semibold tabular-nums">{value}</span>
              <button
                onClick={() => setValue((v) => Math.min(maxExtra, v + 1))}
                disabled={value >= maxExtra}
                className="px-3 py-2 text-gray-600 transition-colors hover:text-[#1A6B45] disabled:opacity-40"
                aria-label="More seats"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <button
              onClick={save}
              disabled={isLoading || value === extra}
              className="ml-auto flex items-center gap-1.5 rounded-xl bg-[#1A6B45] px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-[#15573A] active:scale-95 disabled:opacity-60"
            >
              {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Save seats
            </button>
          </div>
          <p className="mt-2 text-[11px] text-gray-400">
            Free of charge when set here. Seats you set are billed on the customer&apos;s next Agency renewal.
          </p>
        </div>
      </div>
    </Card>
  );
};

// ─── Agency team & clients ──────────────────────────────────────────────────

/** Agency client billing amounts are whole currency units (not paise). */
function formatClientAmount(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount || 0);
  } catch {
    return `${currency} ${amount || 0}`;
  }
}

const Pill = ({ className, children }: { className: string; children: ReactNode }) => (
  <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ${className}`}>{children}</span>
);

const TeamOfCard = ({ teamOf }: { teamOf: TeamOf }) => (
  <Card title="Team member of" icon={Users} delay={100}>
    <Link
      to={`/users/${teamOf.owner._id}`}
      className="flex items-center gap-3 rounded-xl border border-[#E3EEE7] p-3 transition-colors hover:border-[#1A6B45]/30 hover:bg-[#F7FAF8]"
    >
      <UserAvatar name={teamOf.owner.name} picture={teamOf.owner.picture} size={36} />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 truncate text-sm font-semibold text-gray-900">
          {teamOf.owner.businessName || teamOf.owner.name}
          <PlanBadge plan={teamOf.owner.plan} />
        </p>
        <p className="truncate text-xs text-gray-400">{teamOf.owner.email}</p>
      </div>
    </Link>
    <div className="mt-3 grid grid-cols-3 gap-2 text-center">
      {[
        { label: 'QRs created', value: teamOf.qrCount },
        { label: 'Clients added', value: teamOf.clientCount },
        { label: 'Joined', value: teamOf.joinedAt ? formatDate(teamOf.joinedAt) : '—' },
      ].map((s) => (
        <div key={s.label} className="rounded-xl bg-[#F4F7F4] py-2.5">
          <p className="text-sm font-bold tabular-nums text-gray-900">{s.value}</p>
          <p className="text-[11px] font-medium text-gray-500">{s.label}</p>
        </div>
      ))}
    </div>
    {!teamOf.owner.planActive && (
      <p className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        The agency&apos;s plan isn&apos;t active, so this team member can&apos;t use Agency features right now.
      </p>
    )}
  </Card>
);

const TeamCard = ({ members, invites }: { members: TeamMember[]; invites: TeamInviteItem[] }) => (
  <Card
    title={`Team members (${members.length})`}
    icon={Users}
    delay={280}
    action={invites.length > 0 && <span className="text-xs text-gray-400">{invites.length} pending invite{invites.length === 1 ? '' : 's'}</span>}
  >
    {members.length === 0 && invites.length === 0 ? (
      <p className="py-6 text-center text-sm text-gray-400">No team members yet</p>
    ) : (
      <div className="-mx-6 -mb-6 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left">
          <thead>
            <tr className="bg-[#F7FAF8] text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              <th className="px-6 py-2.5">Member</th>
              <th className="px-6 py-2.5 text-right">QRs</th>
              <th className="px-6 py-2.5 text-right">Clients</th>
              <th className="px-6 py-2.5">Joined</th>
              <th className="px-6 py-2.5">Last login</th>
              <th className="px-6 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEF3EF]">
            {members.map((m) => (
              <tr key={m._id} className="transition-colors hover:bg-[#F7FAF8]">
                <td className="max-w-[260px] px-6 py-3">
                  <Link to={`/users/${m._id}`} className="flex items-center gap-2.5">
                    <UserAvatar name={m.name} picture={m.picture} size={28} />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-gray-900 hover:text-[#1A6B45]">{m.name}</span>
                      <span className="block truncate text-xs text-gray-400">{m.email}</span>
                    </span>
                  </Link>
                </td>
                <td className="px-6 py-3 text-right text-sm font-semibold tabular-nums text-gray-900">{m.qrCount}</td>
                <td className="px-6 py-3 text-right text-sm font-semibold tabular-nums text-gray-900">{m.clientCount}</td>
                <td className="px-6 py-3 text-sm text-gray-600">{formatDate(m.teamJoinedAt || m.createdAt)}</td>
                <td className="px-6 py-3 text-sm text-gray-600">{m.lastLoginAt ? timeAgo(m.lastLoginAt) : <span className="text-gray-400">Never</span>}</td>
                <td className="px-6 py-3">
                  <StatusBadge status={m.status} />
                </td>
              </tr>
            ))}
            {invites.map((inv) => {
              const { expired } = inv;
              return (
                <tr key={inv._id} className="bg-[#FCFDFC]">
                  <td className="max-w-[260px] px-6 py-3">
                    <span className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100">
                        <Mail className="h-3.5 w-3.5 text-gray-400" />
                      </span>
                      <span className="truncate text-sm text-gray-600">{inv.email}</span>
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right text-sm text-gray-300">—</td>
                  <td className="px-6 py-3 text-right text-sm text-gray-300">—</td>
                  <td className="px-6 py-3 text-xs text-gray-400">Invited {timeAgo(inv.lastSentAt || inv.createdAt)}</td>
                  <td className="px-6 py-3 text-xs text-gray-400">{expired ? 'Expired' : `Expires ${formatDate(inv.expiresAt)}`}</td>
                  <td className="px-6 py-3">
                    <Pill className={expired ? 'bg-gray-100 text-gray-500' : 'bg-amber-50 text-amber-700'}>{expired ? 'Invite expired' : 'Invite pending'}</Pill>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    )}
  </Card>
);

const ClientsCard = ({ clients }: { clients: AgencyClientItem[] }) => {
  const pager = useClientPagination(clients, 5);
  const blocked = clients.filter((c) => c.billing.blocked).length;
  const pendingClaims = clients.reduce((s, c) => s + c.pendingClaims, 0);

  return (
    <Card
      title={`Clients (${clients.length})`}
      icon={Building2}
      delay={300}
      action={
        <div className="flex gap-1.5">
          {blocked > 0 && <Pill className="bg-red-50 text-red-600">{blocked} blocked</Pill>}
          {pendingClaims > 0 && <Pill className="bg-amber-50 text-amber-700">{pendingClaims} payment{pendingClaims === 1 ? '' : 's'} to confirm</Pill>}
        </div>
      }
    >
      <div className="-mx-6 -mb-6 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left">
          <thead>
            <tr className="bg-[#F7FAF8] text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              <th className="px-6 py-2.5">Client</th>
              <th className="px-6 py-2.5">QR codes</th>
              <th className="px-6 py-2.5">Billing</th>
              <th className="px-6 py-2.5">Added by</th>
              <th className="px-6 py-2.5">Last login</th>
              <th className="px-6 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEF3EF]">
            {pager.pageItems.map((c) => (
              <tr key={c._id} className="transition-colors hover:bg-[#F7FAF8]">
                <td className="max-w-[220px] px-6 py-3">
                  <p className="truncate text-sm font-semibold text-gray-900">{c.name}</p>
                  <p className="truncate text-xs text-gray-400">{c.email}</p>
                </td>
                <td className="max-w-[200px] px-6 py-3">
                  <p className="text-sm font-semibold tabular-nums text-gray-900">{c.qrCount}</p>
                  {c.qrNames.length > 0 && (
                    <p className="truncate text-xs text-gray-400" title={c.qrNames.join(', ')}>
                      {c.qrNames.join(', ')}
                    </p>
                  )}
                </td>
                <td className="px-6 py-3">
                  {c.billing.blocked ? (
                    <Pill className="bg-red-50 text-red-600">Blocked · {formatClientAmount(c.billing.overdueAmount, c.billingCurrency)} due</Pill>
                  ) : c.billing.overdueAmount > 0 ? (
                    <Pill className="bg-amber-50 text-amber-700">
                      Overdue {formatClientAmount(c.billing.overdueAmount, c.billingCurrency)}
                      {c.billing.blocksOn && ` · blocks ${formatDate(c.billing.blocksOn)}`}
                    </Pill>
                  ) : (
                    <span className="text-xs text-gray-500">Up to date · {c.billingCurrency}</span>
                  )}
                  {c.pendingClaims > 0 && (
                    <p className="mt-1 text-[11px] font-medium text-amber-700">
                      {c.pendingClaims} payment{c.pendingClaims === 1 ? '' : 's'} awaiting confirmation
                    </p>
                  )}
                </td>
                <td className="max-w-[160px] px-6 py-3 text-sm text-gray-600">
                  {c.createdBy ? (
                    <Link to={`/users/${c.createdBy._id}`} className="block truncate hover:text-[#1A6B45]" title={c.createdBy.email}>
                      {c.createdBy.name}
                    </Link>
                  ) : (
                    <span className="text-gray-400">Owner</span>
                  )}
                </td>
                <td className="px-6 py-3 text-sm text-gray-600">{c.lastLoginAt ? timeAgo(c.lastLoginAt) : <span className="text-gray-400">Never</span>}</td>
                <td className="px-6 py-3">
                  <Pill className={c.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}>
                    {c.status === 'active' ? 'Active' : 'Disabled'}
                  </Pill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination {...pager.paginationProps} />
      </div>
    </Card>
  );
};

// ─── Page ───────────────────────────────────────────────────────────────────

const UserDetailsPage = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useGetUserQuery(id, { skip: !id });
  const [updateStatus, { isLoading: isStatusLoading }] = useUpdateUserStatusMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [confirm, setConfirm] = useState<'block' | 'delete' | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const qrPager = useClientPagination(data?.qrCodes ?? EMPTY, 5);
  const txPager = useClientPagination(data?.transactions ?? EMPTY, 5);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 3500);
    return () => clearTimeout(t);
  }, [notice]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex-1 bg-[#F4F7F4] px-6 py-6 sm:px-8">
        <div className="skeleton mb-6 h-24 rounded-2xl" />
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <div className="space-y-5">
            <div className="skeleton h-96 rounded-2xl" />
            <div className="skeleton h-48 rounded-2xl" />
          </div>
          <div className="space-y-5 xl:col-span-2">
            <div className="skeleton h-32 rounded-2xl" />
            <div className="skeleton h-80 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    const notFound = (error as { status?: number })?.status === 404;
    return (
      <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-3 bg-[#F4F7F4]">
        <AlertTriangle className="h-8 w-8 text-red-400" />
        <p className="font-medium text-gray-700">{notFound ? 'User not found' : "Couldn't load this user"}</p>
        <div className="flex gap-2">
          <Link to="/users" className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-white">
            Back to users
          </Link>
          {!notFound && (
            <button onClick={() => refetch()} className="rounded-xl bg-[#1A6B45] px-4 py-2 text-sm font-semibold text-white hover:bg-[#15573A]">
              Try again
            </button>
          )}
        </div>
      </div>
    );
  }

  const { user, qrCodes, transactions, scanSeries, topLocations, stats } = data;
  const team = data.team ?? { members: EMPTY, invites: EMPTY };
  const clients = data.clients ?? EMPTY;
  const showTeam = team.members.length > 0 || team.invites.length > 0 || user.plan === 'agency';
  const isBlocked = user.status === 'block';

  const toggleBlock = async () => {
    try {
      await updateStatus({ id: user._id, status: isBlocked ? 'active' : 'block' }).unwrap();
      setNotice({ type: 'success', text: isBlocked ? 'User unblocked' : 'User blocked' });
    } catch (err) {
      setNotice({ type: 'error', text: errorMessage(err, 'Failed to update status') });
    } finally {
      setConfirm(null);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUser(user._id).unwrap();
      navigate('/users', { replace: true });
    } catch (err) {
      setNotice({ type: 'error', text: errorMessage(err, 'Failed to delete user') });
      setConfirm(null);
    }
  };

  return (
    <div className="min-h-screen flex-1 bg-[#F4F7F4]">
      {/* Header */}
      <header className="sticky top-14 lg:top-0 z-20 border-b border-[#D1E7DA] bg-white/80 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 sm:px-8">
          <div className="flex min-w-0 items-center gap-3 animate-fade-up">
            <Link
              to="/users"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#D1E7DA] bg-white text-gray-500 transition-all hover:-translate-x-0.5 hover:text-[#1A6B45]"
              aria-label="Back to users"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <UserAvatar name={user.name} picture={user.picture} size={40} />
            <div className="min-w-0">
              <h1 className="flex items-center gap-2 truncate text-lg font-semibold text-gray-900">
                {user.name}
                <PlanBadge plan={user.plan} />
              </h1>
              <p className="truncate text-xs text-gray-400">
                {user.email} · Joined {timeAgo(user.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 animate-fade-up" style={{ animationDelay: '60ms' }}>
            <StatusBadge status={user.status} />
            <button
              onClick={() => (isBlocked ? toggleBlock() : setConfirm('block'))}
              disabled={isStatusLoading}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all active:scale-95 disabled:opacity-60 ${
                isBlocked
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  : 'border-amber-200 bg-white text-amber-700 hover:bg-amber-50'
              }`}
            >
              {isStatusLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : isBlocked ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
              {isBlocked ? 'Unblock' : 'Block'}
            </button>
            <button
              onClick={() => setConfirm('delete')}
              className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition-all hover:bg-red-50 active:scale-95"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        </div>
      </header>

      {notice && (
        <div
          className={`fixed right-6 top-20 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-xl animate-scale-in ${
            notice.type === 'success' ? 'bg-[#1A3A2E] text-white' : 'bg-red-600 text-white'
          }`}
        >
          {notice.type === 'success' ? <CheckCircle2 className="h-4 w-4 text-[#2ECC71]" /> : <AlertTriangle className="h-4 w-4" />}
          {notice.text}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 px-6 py-6 sm:px-8 xl:grid-cols-3">
        {/* Left column */}
        <div className="space-y-5">
          <Card title="Profile" icon={ShieldCheck} delay={0}>
            <div className="divide-y divide-[#F1F5F2]">
              <InfoRow icon={Mail} label="Email">
                <span className="inline-flex items-center">
                  {user.email}
                  <CopyButton text={user.email} />
                </span>
                <p className={`text-[11px] font-medium ${user.isEmailVerified ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {user.isEmailVerified ? 'Verified' : 'Not verified'} · {user.authProvider === 'google' ? 'Google sign-in' : 'Email & password'}
                </p>
              </InfoRow>
              <InfoRow icon={Phone} label="Mobile">
                {user.mobile || <span className="text-gray-400">Not provided</span>}
              </InfoRow>
              <InfoRow icon={Building2} label="Business">
                {user.businessName || <span className="text-gray-400">Not set</span>}
                {user.businessType && <p className="text-[11px] capitalize text-gray-400">{user.businessType}</p>}
              </InfoRow>
              <InfoRow icon={MapPin} label="City">
                {user.businessCity || <span className="text-gray-400">Not set</span>}
              </InfoRow>
              <InfoRow icon={Calendar} label="Joined">
                {formatDate(user.createdAt, true)}
              </InfoRow>
              <InfoRow icon={Clock} label="Last login">
                {user.lastLoginAt ? (
                  <>
                    {timeAgo(user.lastLoginAt)}
                    <p className="text-[11px] text-gray-400">{formatDate(user.lastLoginAt, true)}</p>
                  </>
                ) : (
                  <span className="text-gray-400">Never</span>
                )}
              </InfoRow>
              <InfoRow icon={Bell} label="Notifications">
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  <span className={`rounded-md px-1.5 py-0.5 text-[11px] ${user.emailNotifications !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    Emails {user.emailNotifications !== false ? 'on' : 'off'}
                  </span>
                  <span className={`rounded-md px-1.5 py-0.5 text-[11px] ${user.weeklyReportEnabled !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    Weekly report {user.weeklyReportEnabled !== false ? 'on' : 'off'}
                  </span>
                </div>
              </InfoRow>
            </div>
          </Card>

          {data.teamOf && <TeamOfCard teamOf={data.teamOf} />}
          <PlanCard user={user} onNotice={setNotice} />
          {user.plan === 'agency' && <SeatsCard key={user.extraSeats} user={user} onNotice={setNotice} />}
        </div>

        {/* Right column */}
        <div className="space-y-5 xl:col-span-2">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatTile label="QR codes" value={stats.qrCount} icon={QrCode} accent="#1A6B45" hint={`${stats.activeQrCount} active`} delay={60} />
            <StatTile
              label="Total scans"
              value={stats.totalScans}
              icon={ScanLine}
              accent="#10B981"
              hint={stats.lastScanAt ? `Last ${timeAgo(stats.lastScanAt)}` : 'No scans yet'}
              delay={100}
            />
            <StatTile label="Scans (30 days)" value={stats.scansLast30} icon={Activity} accent="#0D9488" delay={140} />
            <StatTile
              label="Lifetime spend"
              value={stats.lifetimeSpendInr}
              format={(n) => formatMoney(n, 'INR', true)}
              icon={IndianRupee}
              accent="#D97706"
              hint={`${stats.paymentsCount} payment${stats.paymentsCount === 1 ? '' : 's'}`}
              delay={180}
            />
          </div>

          <Card title="Scan activity" icon={Activity} delay={220} action={<span className="text-xs text-gray-400">Last 30 days</span>}>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
              <div className="lg:col-span-3">
                <TrendChart data={scanSeries} color="#10B981" label="Scans" height={220} />
              </div>
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  <Globe className="h-3.5 w-3.5" /> Top locations
                </p>
                {topLocations.length === 0 ? (
                  <p className="text-sm text-gray-400">No location data yet</p>
                ) : (
                  <ul className="space-y-2">
                    {topLocations.map((l) => (
                      <li key={`${l.city}-${l.country}`} className="flex items-center justify-between gap-2 text-sm">
                        <span className="truncate text-gray-700">
                          {l.city}
                          {l.country && <span className="text-gray-400">, {l.country}</span>}
                        </span>
                        <span className="font-semibold text-gray-900 tabular-nums">{l.count}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </Card>

          <Card title={`QR codes (${qrCodes.length})`} icon={QrCode} delay={260}>
            {qrCodes.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">This user hasn't created a QR code yet</p>
            ) : (
              <div className="-mx-6 -mb-6 overflow-x-auto">
                <table className="w-full min-w-[640px] text-left">
                  <thead>
                    <tr className="bg-[#F7FAF8] text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                      <th className="px-6 py-2.5">Business</th>
                      <th className="px-6 py-2.5">Google</th>
                      <th className="px-6 py-2.5 text-right">Scans</th>
                      <th className="px-6 py-2.5">Status</th>
                      <th className="px-6 py-2.5">Links</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEF3EF]">
                    {qrPager.pageItems.map((q) => {
                      const live = q.status === 'active' && q.isActive !== false;
                      return (
                        <tr key={q._id} className="transition-colors hover:bg-[#F7FAF8]">
                          <td className="max-w-[260px] px-6 py-3">
                            <Link to={`/qr-codes/${q._id}`} className="block truncate text-sm font-semibold text-gray-900 hover:text-[#1A6B45]">
                              {q.businessName}
                            </Link>
                            <p className="truncate text-xs text-gray-400">{q.placeAddress || q.label || '—'}</p>
                          </td>
                          <td className="px-6 py-3">
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
                          <td className="px-6 py-3 text-right text-sm font-semibold text-gray-900 tabular-nums">{formatNumber(q.scanCount)}</td>
                          <td className="px-6 py-3">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                                live ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                              }`}
                            >
                              {q.status === 'archived' ? 'Archived' : live ? 'Live' : 'Paused'}
                            </span>
                          </td>
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-3 text-xs font-medium">
                              {SCAN_BASE_URL && (
                                <a
                                  href={`${SCAN_BASE_URL}/r/${q.shortCode}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-[#1A6B45] hover:text-[#2ECC71]"
                                  title="Open scan link (counts as a scan)"
                                >
                                  /r/{q.shortCode}
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                              <a
                                href={q.reviewUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-800"
                              >
                                Google <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <Pagination {...qrPager.paginationProps} />
              </div>
            )}
          </Card>

          {showTeam && <TeamCard members={team.members} invites={team.invites} />}
          {clients.length > 0 && <ClientsCard clients={clients} />}

          <Card title={`Payments (${transactions.length})`} icon={Receipt} delay={300}>
            {transactions.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">No payments from this user</p>
            ) : (
              <div className="-mx-6 -mb-6 overflow-x-auto">
                <table className="w-full min-w-[640px] text-left">
                  <thead>
                    <tr className="bg-[#F7FAF8] text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                      <th className="px-6 py-2.5">Date</th>
                      <th className="px-6 py-2.5">Plan</th>
                      <th className="px-6 py-2.5">Provider</th>
                      <th className="px-6 py-2.5 text-right">Amount</th>
                      <th className="px-6 py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEF3EF]">
                    {txPager.pageItems.map((t) => (
                      <tr key={t._id} className="transition-colors hover:bg-[#F7FAF8]">
                        <td className="px-6 py-3 text-sm text-gray-600">{formatDate(t.createdAt, true)}</td>
                        <td className="px-6 py-3">
                          <PlanBadge plan={t.plan} />
                          <p className="mt-1 text-[11px] capitalize text-gray-400">
                            {t.kind === 'seats'
                              ? `+${t.seats ?? 0} extra seat${t.seats === 1 ? '' : 's'}`
                              : `${t.billingCycle}${t.seats ? ` · ${t.seats} extra seat${t.seats === 1 ? '' : 's'}` : ''}`}
                          </p>
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-600">{t.paymentProvider === 'lemon_squeezy' ? 'Lemon Squeezy' : 'Razorpay'}</td>
                        <td className="px-6 py-3 text-right">
                          <p className="text-sm font-semibold text-gray-900 tabular-nums">{formatMoney(t.amountInr, 'INR')}</p>
                          <p className="text-[11px] text-gray-400">
                            {t.currency === 'USD' && `${formatMoney(t.amount, 'USD')} `}
                            {t.couponApplied && `· ${t.couponApplied}`}
                          </p>
                        </td>
                        <td className="px-6 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${TX_STATUS_STYLES[t.status]}`}>{t.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Pagination {...txPager.paginationProps} />
              </div>
            )}
          </Card>
        </div>
      </div>

      {confirm === 'block' && (
        <ConfirmDialog
          title={`Block ${user.name}?`}
          body="They won't be able to sign in or use the dashboard until unblocked. Their QR codes keep working."
          confirmLabel="Block user"
          loading={isStatusLoading}
          onConfirm={toggleBlock}
          onCancel={() => setConfirm(null)}
        />
      )}
      {confirm === 'delete' && (
        <ConfirmDialog
          danger
          title={`Delete ${user.name}?`}
          body={
            <>
              This permanently deletes the account and <strong>{stats.qrCount} QR code{stats.qrCount === 1 ? '' : 's'}</strong>. Printed QRs will stop
              working. This can't be undone.
            </>
          }
          confirmLabel="Delete forever"
          loading={isDeleting}
          onConfirm={handleDelete}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
};

export default UserDetailsPage;
