import { Bell, ShieldAlert, Zap, Info, MoreVertical, Check } from 'lucide-react';

const ALERTS = [
  { id: 1, title: 'MongoDB Connection Failed', desc: 'Cluster "one9cluster" is unreachable from production IP.', date: '2 mins ago',  icon: ShieldAlert, cardBg: '#FEF2F2', border: '#FECACA', iconBg: '#FEE2E2', iconColor: '#DC2626' },
  { id: 2, title: 'High Latency Detected',     desc: 'API response time increased by 40% in Reva region.',        date: '45 mins ago', icon: Zap,         cardBg: '#FFFBEB', border: '#FDE68A', iconBg: '#FEF3C7', iconColor: '#D97706' },
  { id: 3, title: 'New Pro Subscription',       desc: 'User "Sharma & Co." upgraded to Pro plan.',                  date: '1 hour ago',  icon: Info,        cardBg: '#E8F5EE', border: '#B6E2CB', iconBg: '#D1FAE5', iconColor: '#1A6B45' },
  { id: 4, title: 'Daily Backup Completed',     desc: 'All database records successfully backed up to S3.',          date: '4 hours ago', icon: Check,       cardBg: '#ECFDF5', border: '#A7F3D0', iconBg: '#D1FAE5', iconColor: '#059669' },
];

const AlertsPage = () => {
  return (
    <div className="flex-1 min-h-screen" style={{ backgroundColor: '#F4F7F4' }}>
      {/* Header */}
      <div
        className="sticky top-14 lg:top-0 z-20 backdrop-blur-xl border-b flex items-center justify-between px-6 sm:px-8 pt-5 pb-4"
        style={{ backgroundColor: 'rgba(255,255,255,0.85)', borderColor: '#D1E7DA' }}
      >
        <div>
          <h1 className="text-[22px] font-semibold text-gray-800">System Alerts</h1>
          <p className="text-gray-400 text-sm mt-0.5">Real-time notifications and system health alerts</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ backgroundColor: '#2ECC71' }} />
          </button>
          <button
            className="text-xs font-medium border bg-white px-3 py-2 rounded-lg transition-colors text-gray-500 hover:text-gray-800 border-gray-200"
          >
            Mark all as read
          </button>
        </div>
      </div>

      <div className="px-6 sm:px-8 py-6">
        <div className="max-w-4xl space-y-3">
          {ALERTS.map((alert) => (
            <div
              key={alert.id}
              className="border rounded-xl p-5 flex items-start gap-4 hover:shadow-md transition-all cursor-pointer shadow-sm group"
              style={{ backgroundColor: alert.cardBg, borderColor: alert.border }}
            >
              <div className="p-2.5 rounded-xl flex-shrink-0" style={{ backgroundColor: alert.iconBg }}>
                <alert.icon className="w-5 h-5" style={{ color: alert.iconColor }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-1">
                  <h3 className="text-sm font-semibold text-gray-900">{alert.title}</h3>
                  <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide flex-shrink-0">{alert.date}</span>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{alert.desc}</p>
              </div>
              <button className="p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/60 rounded-lg">
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          ))}
        </div>

        {/* Webhook banner — dark green like website sidebar */}
        <div
          className="max-w-4xl mt-8 rounded-xl p-8 shadow-lg relative overflow-hidden"
          style={{ backgroundColor: '#1A3A2E' }}
        >
          <div
            className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-20 -translate-y-1/2 translate-x-1/2"
            style={{ backgroundColor: '#2ECC71' }}
          />
          <div className="relative z-10">
            <h2 className="text-white font-semibold text-lg mb-2">Configure Webhooks</h2>
            <p className="text-sm mb-6 max-w-md" style={{ color: '#A8C9B8' }}>
              Send system alerts directly to your Slack or Discord channel for faster response times.
            </p>
            <button
              className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg"
              style={{ backgroundColor: '#2ECC71', color: '#1A3A2E' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#27ae60')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#2ECC71')}
            >
              Setup Webhook
            </button>
          </div>
          <Bell className="absolute -right-8 -bottom-8 w-40 h-40 opacity-10 rotate-12" style={{ color: '#2ECC71' }} />
        </div>
      </div>
    </div>
  );
};

export default AlertsPage;
