import { useState, type ComponentType, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ScanLine,
  Activity,
  Star,
  MessageSquare,
  ExternalLink,
  Copy,
  Check,
  Pause,
  Play,
  Loader2,
  MapPin,
  Hash,
  Link2,
  Calendar,
  RefreshCw,
  Smartphone,
  History,
  User,
  ChevronRight,
  Globe,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import {
  useGetQRCodeQuery,
  useListQRScansQuery,
  useSetQRActiveMutation,
  type QRDetails,
  type QRReviewProfile,
} from '../store/api/adminQRCodesApi';
import Pagination from '../components/common/Pagination';
import TrendChart from '../components/dashboard/TrendChart';
import CountUp from '../components/dashboard/CountUp';
import { Card, ErrorState, EmptyState, FetchBar, TableSkeleton, Toast, type Notice } from '../components/ui';
import { UserAvatar, PlanBadge, PlanExpiryNote } from '../components/users/UserBits';
import { DeviceBreakdown, QRStatusBadge, QRThumb } from '../components/qr/QRBits';
import { useClientPagination } from '../hooks/useListControls';
import { apiErrorMessage, formatDate, formatNumber, timeAgo } from '../lib/format';

const SCAN_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api\/?$/, '');

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
    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110" style={{ backgroundColor: accent }}>
      <Icon className="h-4 w-4 text-white" />
    </div>
    <p className="text-xl font-bold text-gray-900 tabular-nums">
      <CountUp value={value} format={format} />
    </p>
    <p className="text-xs font-medium text-gray-500">{label}</p>
    {hint && <p className="mt-1 text-[11px] text-gray-400">{hint}</p>}
  </div>
);

const InfoRow = ({ icon: Icon, label, children }: { icon: ComponentType<{ className?: string }>; label: string; children: ReactNode }) => (
  <div className="flex items-start gap-3 py-2.5">
    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F4F7F4]">
      <Icon className="h-4 w-4 text-[#1A6B45]" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">{label}</p>
      <div className="break-words text-sm font-medium text-gray-800">{children}</div>
    </div>
  </div>
);

const CopyText = ({ text, display }: { text: string; display?: ReactNode }) => {
  const [copied, setCopied] = useState(false);
  return (
    <span className="inline-flex max-w-full items-center gap-1">
      <span className="truncate">{display ?? text}</span>
      <button
        onClick={() => {
          navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="shrink-0 rounded p-0.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#1A6B45]"
        title="Copy"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </span>
  );
};

const RecentScans = ({ id }: { id: string }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data, isLoading, isFetching, error, refetch } = useListQRScansQuery({ id, page, limit });

  return (
    <Card flush title="Scan log" icon={History} delay={340} action={data && <span className="text-xs text-gray-400">{formatNumber(data.pagination.total)} logged</span>}>
      <FetchBar active={isFetching && !isLoading} />
      {isLoading ? (
        <TableSkeleton rows={4} />
      ) : error ? (
        <ErrorState text="Couldn't load scans" onRetry={refetch} />
      ) : !data || data.scans.length === 0 ? (
        <EmptyState icon={ScanLine} title="No scans logged yet" />
      ) : (
        <div className={`overflow-x-auto transition-opacity ${isFetching ? 'opacity-60' : ''}`}>
          <table className="w-full min-w-[480px] text-left">
            <thead>
              <tr className="bg-[#F7FAF8] text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                <th className="px-5 py-2.5">When</th>
                <th className="px-5 py-2.5">Device</th>
                <th className="px-5 py-2.5">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF3EF]">
              {data.scans.map((s) => (
                <tr key={s._id} className="transition-colors hover:bg-[#F7FAF8]">
                  <td className="px-5 py-2.5">
                    <p className="text-sm text-gray-800">{timeAgo(s.scannedAt)}</p>
                    <p className="text-[11px] text-gray-400">{formatDate(s.scannedAt, true)}</p>
                  </td>
                  <td className="px-5 py-2.5 text-sm text-gray-600">{s.device}</td>
                  <td className="px-5 py-2.5 text-sm text-gray-600">
                    {s.city ? (
                      <>
                        {s.city}
                        {s.country && <span className="text-gray-400">, {s.country}</span>}
                      </>
                    ) : (
                      <span className="text-gray-400">Unknown</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {data && (
        <Pagination
          currentPage={page}
          totalPages={data.pagination.totalPages}
          onPageChange={setPage}
          totalItems={data.pagination.total}
          itemsPerPage={limit}
          onItemsPerPageChange={(n) => {
            setLimit(n);
            setPage(1);
          }}
        />
      )}
    </Card>
  );
};

const TONE_LABELS: Record<NonNullable<QRReviewProfile['tone']>, string> = {
  friendly: 'Friendly',
  professional: 'Professional',
  enthusiastic: 'Enthusiastic',
};

const ProfileChips = ({ label, items }: { label: string; items: string[] }) => (
  <div>
    <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-gray-400">{label}</p>
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span key={item} className="rounded-full border border-[#E3EEE7] bg-[#F7FAF8] px-2.5 py-1 text-xs text-gray-700">
          {item}
        </span>
      ))}
    </div>
  </div>
);

/** Personalised AI review setup (services/highlights/staff); questions only show to customers on an active Pro/Agency plan. */
const AIReviewProfileCard = ({ profile, owner }: { profile?: QRReviewProfile; owner?: QRDetails['qr']['owner'] }) => {
  const services = profile?.services ?? [];
  const highlights = profile?.highlights ?? [];
  const staff = profile?.staff ?? [];
  const configured = services.length > 0 || highlights.length > 0;
  const planAllows =
    (owner?.plan === 'pro' || owner?.plan === 'agency') &&
    (!owner?.planExpiresAt || new Date(owner.planExpiresAt) > new Date());

  const status = !configured
    ? null
    : planAllows
      ? { text: 'Live on review page', cls: 'bg-emerald-50 text-emerald-700' }
      : { text: 'Saved · plan inactive', cls: 'bg-amber-50 text-amber-700' };

  return (
    <Card
      title="AI review profile"
      icon={Sparkles}
      delay={200}
      action={status && <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${status.cls}`}>{status.text}</span>}
    >
      {!configured ? (
        <p className="text-sm text-gray-400">Not set up. Customers get generic AI review suggestions.</p>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">Category</p>
              <p className="text-sm font-medium text-gray-800">{profile?.category || <span className="text-gray-400">Not set</span>}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">Tone</p>
              <p className="text-sm font-medium text-gray-800">{TONE_LABELS[profile?.tone ?? 'friendly']}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">Last updated</p>
              <p className="text-sm font-medium text-gray-800">
                {profile?.updatedAt ? timeAgo(profile.updatedAt) : <span className="text-gray-400">Unknown</span>}
              </p>
            </div>
          </div>

          {profile?.description && (
            <div>
              <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-gray-400">Description</p>
              <p className="text-sm leading-relaxed text-gray-700">{profile.description}</p>
            </div>
          )}

          {services.length > 0 && (
            <div>
              <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-gray-400">Services ({services.length})</p>
              <ul className="divide-y divide-[#F1F5F2] rounded-xl border border-[#E3EEE7]">
                {services.map((s) => (
                  <li key={s.name} className="flex flex-wrap items-baseline gap-x-2 px-3 py-2">
                    <span className="text-sm font-medium text-gray-800">{s.name}</span>
                    {s.detail && <span className="text-xs text-gray-500">{s.detail}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {highlights.length > 0 && <ProfileChips label={`Highlights (${highlights.length})`} items={highlights} />}
          {staff.length > 0 && <ProfileChips label={`Staff (${staff.length})`} items={staff} />}
        </div>
      )}
    </Card>
  );
};

const QRDetailsPage = () => {
  const { id = '' } = useParams<{ id: string }>();
  const { data, isLoading, error, refetch } = useGetQRCodeQuery(id, { skip: !id });
  const [setActive, { isLoading: isToggling }] = useSetQRActiveMutation();
  const [confirmPause, setConfirmPause] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const reviews = useClientPagination(data?.qr.latestReviews ?? [], 3);

  if (isLoading) {
    return (
      <div className="min-h-screen flex-1 bg-[#F4F7F4] px-6 py-6 sm:px-8">
        <div className="skeleton mb-6 h-20 rounded-2xl" />
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <div className="skeleton h-[480px] rounded-2xl" />
          <div className="space-y-5 xl:col-span-2">
            <div className="skeleton h-28 rounded-2xl" />
            <div className="skeleton h-80 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    const notFound = (error as { status?: number })?.status === 404;
    return (
      <div className="flex min-h-screen flex-1 flex-col items-center justify-center bg-[#F4F7F4]">
        <ErrorState text={notFound ? 'QR code not found' : "Couldn't load this QR code"} onRetry={notFound ? undefined : refetch} />
        <Link to="/qr-codes" className="text-sm font-medium text-[#1A6B45] hover:underline">
          Back to QR codes
        </Link>
      </div>
    );
  }

  const { qr, scanSeries, devices, topCities, stats } = data;
  const state = qr.status === 'archived' ? 'archived' : qr.isActive === false ? 'paused' : 'live';
  const scanUrl = SCAN_BASE_URL ? `${SCAN_BASE_URL}/r/${qr.shortCode}` : '';

  const toggle = async (isActive: boolean) => {
    try {
      const res = await setActive({ id: qr._id, isActive }).unwrap();
      setNotice({ type: 'success', text: res.message });
    } catch (err) {
      setNotice({ type: 'error', text: apiErrorMessage(err, 'Failed to update QR code') });
    } finally {
      setConfirmPause(false);
    }
  };

  return (
    <div className="min-h-screen flex-1 bg-[#F4F7F4]">
      <header className="sticky top-14 lg:top-0 z-20 border-b border-[#D1E7DA] bg-white/80 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 sm:px-8">
          <div className="flex min-w-0 items-center gap-3 animate-fade-up">
            <Link
              to="/qr-codes"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#D1E7DA] bg-white text-gray-500 transition-all hover:-translate-x-0.5 hover:text-[#1A6B45]"
              aria-label="Back to QR codes"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <QRThumb name={qr.businessName} logoUrl={qr.qrConfig?.logoUrl} />
            <div className="min-w-0">
              <h1 className="flex items-center gap-2 truncate text-lg font-semibold text-gray-900">
                {qr.businessName}
                <QRStatusBadge state={state} />
              </h1>
              <p className="truncate text-xs text-gray-400">
                <span className="font-mono">{qr.shortCode}</span> · Created {timeAgo(qr.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 animate-fade-up" style={{ animationDelay: '60ms' }}>
            {scanUrl && (
              <a
                href={scanUrl}
                target="_blank"
                rel="noreferrer"
                title="Opening this counts as a scan"
                className="flex items-center gap-1.5 rounded-xl border border-[#D1E7DA] bg-white px-3 py-2 text-xs font-semibold text-[#1A6B45] transition-all hover:bg-[#E8F5EE]"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Scan link
              </a>
            )}
            <a
              href={qr.reviewUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-xl border border-[#D1E7DA] bg-white px-3 py-2 text-xs font-semibold text-gray-600 transition-all hover:bg-gray-50"
            >
              <Star className="h-3.5 w-3.5" /> Google review page
            </a>
            {qr.status !== 'archived' && (
              <button
                onClick={() => (state === 'paused' ? toggle(true) : setConfirmPause(true))}
                disabled={isToggling}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all active:scale-95 disabled:opacity-60 ${
                  state === 'paused'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    : 'border-amber-200 bg-white text-amber-700 hover:bg-amber-50'
                }`}
              >
                {isToggling ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : state === 'paused' ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
                {state === 'paused' ? 'Resume' : 'Pause'}
              </button>
            )}
          </div>
        </div>
      </header>
      <Toast notice={notice} onClose={() => setNotice(null)} />

      <div className="grid grid-cols-1 gap-5 px-6 py-6 sm:px-8 xl:grid-cols-3">
        {/* Left */}
        <div className="space-y-5">
          <Card title="Details" icon={Hash} delay={0}>
            <div className="divide-y divide-[#F1F5F2]">
              <InfoRow icon={Hash} label="Short code">
                <CopyText text={qr.shortCode} display={<span className="font-mono">{qr.shortCode}</span>} />
              </InfoRow>
              {scanUrl && (
                <InfoRow icon={Link2} label="Scan link">
                  <CopyText text={scanUrl} />
                </InfoRow>
              )}
              <InfoRow icon={MapPin} label="Address">
                {qr.placeAddress || <span className="text-gray-400">Not set</span>}
              </InfoRow>
              <InfoRow icon={Globe} label="Google Place ID">
                <CopyText text={qr.placeId} display={<span className="font-mono text-xs">{qr.placeId}</span>} />
              </InfoRow>
              <InfoRow icon={Calendar} label="Created">
                {formatDate(qr.createdAt, true)}
              </InfoRow>
              <InfoRow icon={RefreshCw} label="Google data synced">
                {qr.googleSyncedAt ? timeAgo(qr.googleSyncedAt) : <span className="text-gray-400">Never</span>}
              </InfoRow>
            </div>
          </Card>

          <Card title="Owner" icon={User} delay={60}>
            {qr.owner ? (
              <Link
                to={`/users/${qr.owner._id}`}
                className="group -m-2 flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-[#F7FAF8]"
              >
                <UserAvatar name={qr.owner.name || qr.owner.email || '?'} picture={qr.owner.picture} size={44} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900">{qr.owner.name}</p>
                  <p className="truncate text-xs text-gray-400">{qr.owner.email}</p>
                  <div className="mt-1 flex items-center gap-2">
                    {qr.owner.plan && <PlanBadge plan={qr.owner.plan} />}
                    {qr.owner.status === 'block' && <span className="text-[11px] font-medium text-red-500">Blocked</span>}
                  </div>
                  {qr.owner.plan && <PlanExpiryNote plan={qr.owner.plan} planExpiresAt={qr.owner.planExpiresAt ?? null} />}
                </div>
                <ChevronRight className="h-4 w-4 text-gray-300 transition-all group-hover:translate-x-0.5 group-hover:text-[#1A6B45]" />
              </Link>
            ) : (
              <p className="text-sm text-gray-400">Owner account was deleted</p>
            )}
          </Card>

          <Card title="Latest Google reviews" icon={MessageSquare} delay={120}>
            {reviews.paginationProps.totalItems === 0 ? (
              <p className="text-sm text-gray-400">No reviews synced from Google yet</p>
            ) : (
              <>
                <ul className="space-y-3">
                  {reviews.pageItems.map((r, i) => (
                    <li key={`${r.authorName}-${r.time}-${i}`} className="rounded-xl bg-[#F7FAF8] p-3 animate-fade-up">
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-gray-800">{r.authorName || 'Google user'}</p>
                        <span className="flex shrink-0 items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, s) => (
                            <Star key={s} className={`h-3 w-3 ${s < (r.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                          ))}
                        </span>
                      </div>
                      {r.text && <p className="line-clamp-3 text-xs leading-relaxed text-gray-600">{r.text}</p>}
                      {r.time && <p className="mt-1 text-[10px] text-gray-400">{timeAgo(new Date(r.time * 1000))}</p>}
                    </li>
                  ))}
                </ul>
                <div className="-mx-6 -mb-6 mt-4">
                  <Pagination {...reviews.paginationProps} onItemsPerPageChange={undefined} />
                </div>
              </>
            )}
          </Card>
        </div>

        {/* Right */}
        <div className="space-y-5 xl:col-span-2">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatTile
              label="Total scans"
              value={qr.scanCount}
              icon={ScanLine}
              accent="#1A6B45"
              hint={stats.lastScanAt ? `Last ${timeAgo(stats.lastScanAt)}` : 'Never scanned'}
              delay={60}
            />
            <StatTile label="Scans (30 days)" value={stats.scansLast30} icon={Activity} accent="#10B981" delay={100} />
            <StatTile
              label="Google rating"
              value={qr.placeRating || 0}
              format={(n) => (n ? n.toFixed(1) : '—')}
              icon={Star}
              accent="#D97706"
              delay={140}
            />
            <StatTile label="Google reviews" value={qr.totalReviews || 0} icon={MessageSquare} accent="#0D9488" delay={180} />
          </div>

          {state === 'paused' && (
            <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 animate-fade-up">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              This QR code is paused. Anyone scanning it sees a "disabled" page instead of the review page.
            </div>
          )}

          <AIReviewProfileCard profile={qr.reviewProfile} owner={qr.owner} />

          <Card title="Scan activity" icon={Activity} delay={220} action={<span className="text-xs text-gray-400">Last 30 days</span>}>
            <TrendChart data={scanSeries} color="#10B981" label="Scans" height={220} />
          </Card>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Card title="Devices" icon={Smartphone} delay={280} action={<span className="text-xs text-gray-400">All time</span>}>
              <DeviceBreakdown devices={devices} />
            </Card>
            <Card title="Top locations" icon={MapPin} delay={300} action={<span className="text-xs text-gray-400">All time</span>}>
              {topCities.length === 0 ? (
                <p className="text-sm text-gray-400">No location data yet</p>
              ) : (
                <ul className="space-y-1.5">
                  {topCities.map((c) => (
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
            </Card>
          </div>

          <RecentScans id={qr._id} />
        </div>
      </div>

      {confirmPause && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-fade-up" onClick={() => setConfirmPause(false)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-amber-50">
              <Pause className="h-5 w-5 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Pause this QR code?</h3>
            <p className="mt-1.5 text-sm text-gray-500">
              Customers scanning <strong>{qr.businessName}</strong>'s printed QR will see a "disabled" page until you resume it.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setConfirmPause(false)} className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">
                Cancel
              </button>
              <button
                onClick={() => toggle(false)}
                disabled={isToggling}
                className="flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-amber-700 active:scale-95 disabled:opacity-60"
              >
                {isToggling && <Loader2 className="h-4 w-4 animate-spin" />}
                Pause QR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRDetailsPage;
