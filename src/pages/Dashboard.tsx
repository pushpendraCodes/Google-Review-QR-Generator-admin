import { Users, IndianRupee, QrCode, Star, ArrowUp, ArrowDown, Activity, ShieldAlert, Clock, Loader2 } from 'lucide-react';
import { useGetStatsQuery } from '../store/api/adminDashboardApi';

const colorMap: Record<string, { card: string; icon: string; text: string }> = {
  green: { card: 'border-[#B6E2CB]', icon: 'text-[#1A6B45]', text: 'text-[#1A6B45]' },
  teal: { card: 'border-teal-200', icon: 'text-teal-700', text: 'text-teal-700' },
  emerald: { card: 'border-emerald-200', icon: 'text-emerald-700', text: 'text-emerald-700' },
  amber: { card: 'border-amber-200', icon: 'text-amber-700', text: 'text-amber-700' },
};

const cardBg: Record<string, string> = {
  green: '#E8F5EE',
  teal: '#E6FAF6',
  emerald: '#D1FAE5',
  amber: '#FEF3C7',
};

const iconBg: Record<string, string> = {
  green: '#1A6B45',
  teal: '#0D9488',
  emerald: '#059669',
  amber: '#D97706',
};

const Dashboard = () => {
  const { data: stats, isLoading, error } = useGetStatsQuery();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-[#F4F7F4]">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-[#F4F7F4]">
        <p className="text-red-500 font-medium">Failed to load dashboard stats</p>
      </div>
    );
  }

  const STATS_DATA = [
    {
      label: 'Total users',
      value: stats?.users?.total?.toLocaleString() || '0',
      trend: stats?.users?.growth ? `${stats.users.growth}% this month` : 'New this month',
      trendType: parseFloat(stats?.users?.growth) >= 0 ? 'up' : 'down',
      icon: Users,
      color: 'green'
    },
    {
      label: 'MRR',
      value: `₹${(stats?.revenue?.mrr / 10000000).toFixed(2)}L`,
      trend: stats?.revenue?.mrrGrowth ? `${stats.revenue.mrrGrowth}% this month` : 'New this month',
      trendType: parseFloat(stats?.revenue?.mrrGrowth) >= 0 ? 'up' : 'down',
      icon: IndianRupee,
      color: 'teal'
    },
    {
      label: 'QR scans',
      value: stats?.qrCodes?.totalScans?.toLocaleString() || '0',
      trend: '+23% this month', // Mock trend for now
      trendType: 'up',
      icon: QrCode,
      color: 'emerald'
    },
    {
      label: 'Active QRs',
      value: stats?.qrCodes?.active?.toLocaleString() || '0',
      trend: 'Across all users',
      trendType: 'up',
      icon: Activity,
      color: 'amber'
    },
  ];

  return (
    <div className="flex-1 min-h-screen" style={{ backgroundColor: '#F4F7F4' }}>
      <div
        className="sticky top-0 z-30 backdrop-blur-xl border-b flex items-start justify-between px-6 sm:px-8 pt-7 pb-5"
        style={{ backgroundColor: 'rgba(255,255,255,0.85)', borderColor: '#D1E7DA' }}
      >
        <div>
          <h1 className="text-[22px] font-semibold text-gray-800">Dashboard Overview</h1>
          <p className="text-gray-400 text-sm mt-0.5">Here's how your platform is growing this month</p>
        </div>
      </div>

      <div className="px-6 sm:px-8 py-6 space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS_DATA.map((stat) => {
            const c = colorMap[stat.color];
            return (
              <div
                key={stat.label}
                className={`border rounded-xl p-5 space-y-3`}
                style={{ backgroundColor: cardBg[stat.color], borderColor: c.card.replace('border-', '') }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: iconBg[stat.color] }}
                >
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-gray-600 text-xs font-medium">{stat.label}</p>
                  <p className={`text-xs mt-1 font-medium flex items-center gap-1 ${c.text}`}>
                    {stat.trendType === 'up'
                      ? <ArrowUp className="w-3 h-3" />
                      : <ArrowDown className="w-3 h-3" />}
                    {stat.trend}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-gray-800 font-semibold">User Breakdown by Plan</h2>
              <button className="text-xs font-medium transition-colors" style={{ color: '#1A6B45' }}>View all →</button>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Free', value: stats?.plans?.free || 0, color: '#D1E7DA' },
                { label: 'Starter', value: stats?.plans?.starter || 0, color: '#D1E7DA' },
                { label: 'Pro', value: stats?.plans?.pro || 0, color: '#2ECC71' },
                { label: 'Agency', value: stats?.plans?.agency || 0, color: '#1A6B45' },
              ].map((plan) => {
                const percentage = stats?.users?.total > 0 ? (plan.value / stats.users.total) * 100 : 0;
                return (
                  <div key={plan.label}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm font-medium text-gray-600">{plan.label}</span>
                      <span className="text-sm font-bold text-gray-900">{plan.value} users</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#E8F5EE' }}>
                      <div className="h-full rounded-full" style={{ width: `${percentage}%`, backgroundColor: plan.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-gray-800 font-semibold">Platform Revenue</h2>
              <button className="text-xs font-medium transition-colors" style={{ color: '#1A6B45' }}>View all →</button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl p-4" style={{ backgroundColor: '#E8F5EE' }}>
                  <p className="text-xs font-medium text-gray-500 mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold" style={{ color: '#1A6B45' }}>₹{(stats?.revenue?.total / 10000000).toFixed(2)}L</p>
                </div>
                <div className="rounded-xl p-4" style={{ backgroundColor: '#E6FAF6' }}>
                  <p className="text-xs font-medium text-gray-500 mb-1">Avg Order Value</p>
                  <p className="text-2xl font-bold text-teal-700">₹{(stats?.revenue?.avgOrderValue / 100).toFixed(0)}</p>
                </div>
              </div>
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">New Subscriptions (Month)</p>
                  <p className="text-xl font-bold text-emerald-800">{stats?.revenue?.newSubsThisMonth}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="rounded-xl p-6 shadow-lg relative overflow-hidden"
          style={{ backgroundColor: '#1A3A2E' }}
        >
          <div
            className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-20 -translate-y-1/2 translate-x-1/2"
            style={{ backgroundColor: '#2ECC71' }}
          />
          <h2 className="text-white font-semibold mb-5 relative z-10">Platform Health</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {[
              { label: 'Avg scan rate', value: '47 sec', icon: Clock },
              { label: 'Avg rating', value: '4.3 / 5', icon: Star },
              { label: 'Total Scans', value: stats?.qrCodes?.totalScans?.toLocaleString(), icon: Activity },
              { label: 'System Status', value: 'Online', icon: ShieldAlert },
            ].map((stat) => (
              <div key={stat.label}>
                <p
                  className="text-xs font-medium mb-1 flex items-center gap-1.5"
                  style={{ color: '#6BAA8A' }}
                >
                  <stat.icon className="w-3.5 h-3.5" />
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-[#2ECC71]">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
