import type { PlanName } from '../../store/api/adminDashboardApi';
import type { UserStatus } from '../../store/api/adminUsersApi';
import { daysUntil } from '../../lib/format';

const PLAN_STYLES: Record<PlanName, string> = {
  free: 'bg-gray-100 text-gray-600 ring-gray-200',
  starter: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  pro: 'bg-green-100 text-green-800 ring-green-300',
  agency: 'bg-[#1A3A2E] text-[#2ECC71] ring-[#1A3A2E]',
};

export const UserAvatar = ({ name, picture, size = 36 }: { name: string; picture?: string; size?: number }) => {
  const initials = (name || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('');

  return picture ? (
    <img
      src={picture}
      alt=""
      referrerPolicy="no-referrer"
      className="shrink-0 rounded-full object-cover ring-2 ring-white shadow-sm"
      style={{ width: size, height: size }}
    />
  ) : (
    <div
      className="flex shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#1A6B45] to-[#2ECC71] font-semibold text-white ring-2 ring-white shadow-sm"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials}
    </div>
  );
};

export const PlanBadge = ({ plan }: { plan: PlanName }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ring-inset ${
      PLAN_STYLES[plan] ?? PLAN_STYLES.free
    }`}
  >
    {plan}
  </span>
);

/** Small line under the plan badge: "23 days left", "Expired", "No expiry set". */
export const PlanExpiryNote = ({ plan, planExpiresAt }: { plan: PlanName; planExpiresAt: string | null }) => {
  if (plan === 'free') return null;
  if (!planExpiresAt) return <p className="mt-1 text-[11px] font-medium text-amber-600">No expiry set</p>;
  const days = daysUntil(planExpiresAt);
  if (days <= 0) return <p className="mt-1 text-[11px] font-medium text-red-500">Expired</p>;
  return (
    <p className={`mt-1 text-[11px] font-medium ${days <= 7 ? 'text-amber-600' : 'text-gray-400'}`}>
      {days} day{days === 1 ? '' : 's'} left
    </p>
  );
};

export const StatusBadge = ({ status }: { status: UserStatus }) =>
  status === 'block' ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">
      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
      Blocked
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      Active
    </span>
  );
