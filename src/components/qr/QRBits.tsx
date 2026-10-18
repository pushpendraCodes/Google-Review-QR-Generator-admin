import { Apple, Monitor, Smartphone, HelpCircle } from 'lucide-react';
import type { QRStatusFilter, QRStats } from '../../store/api/adminQRCodesApi';
import { formatNumber } from '../../lib/format';

const STATE_STYLES: Record<QRStatusFilter, { label: string; cls: string; dot: string }> = {
  live: { label: 'Live', cls: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  paused: { label: 'Paused', cls: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  archived: { label: 'Archived', cls: 'bg-gray-100 text-gray-500', dot: 'bg-gray-400' },
};

export const QRStatusBadge = ({ state }: { state: QRStatusFilter }) => {
  const s = STATE_STYLES[state];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${s.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};

/** Customer logos are uploaded to Cloudinary; anything else is customer-controlled and not loaded. */
const isTrustedLogoUrl = (value?: string) => {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'res.cloudinary.com';
  } catch {
    return false;
  }
};

export const QRThumb = ({ name, logoUrl, size = 40 }: { name: string; logoUrl?: string; size?: number }) =>
  isTrustedLogoUrl(logoUrl) ? (
    <img src={logoUrl} alt="" loading="lazy" referrerPolicy="no-referrer" className="shrink-0 rounded-xl border border-[#E3EEE7] bg-white object-contain p-1" style={{ width: size, height: size }} />
  ) : (
    <div
      className="flex shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-[#E8F5EE] to-[#CFE3D7] font-bold text-[#1A6B45]"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {(name || '?').charAt(0).toUpperCase()}
    </div>
  );

const DEVICE_META = {
  iOS: { icon: Apple, color: '#1A3A2E' },
  Android: { icon: Smartphone, color: '#2ECC71' },
  Desktop: { icon: Monitor, color: '#0D9488' },
  Other: { icon: HelpCircle, color: '#CFE3D7' },
} as const;

export const DeviceBreakdown = ({ devices }: { devices: QRStats['devices'] }) => {
  const total = devices.reduce((s, d) => s + d.count, 0);
  if (total === 0) return <p className="text-sm text-gray-400">No scans yet</p>;

  return (
    <div>
      <div className="mb-3 flex h-2.5 overflow-hidden rounded-full bg-[#EEF3EF]">
        {devices.map((d) => (
          <div
            key={d.device}
            className="h-full transition-[width] duration-1000 ease-out"
            style={{ width: `${(d.count / total) * 100}%`, backgroundColor: DEVICE_META[d.device].color }}
            title={`${d.device}: ${d.count}`}
          />
        ))}
      </div>
      <ul className="grid grid-cols-2 gap-2">
        {devices.map((d) => {
          const Icon = DEVICE_META[d.device].icon;
          return (
            <li key={d.device} className="flex items-center gap-2 rounded-lg bg-[#F7FAF8] px-2.5 py-2">
              <Icon className="h-4 w-4" style={{ color: DEVICE_META[d.device].color === '#CFE3D7' ? '#9CA3AF' : DEVICE_META[d.device].color }} />
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-700">{d.device}</p>
                <p className="text-[11px] text-gray-400 tabular-nums">
                  {formatNumber(d.count)} · {Math.round((d.count / total) * 100)}%
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
