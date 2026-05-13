import { useState } from 'react';
import { TrendingUp, CreditCard, ArrowUpRight, DollarSign, Download, Loader2 } from 'lucide-react';
import { useGetRevenueStatsQuery, useListTransactionsQuery } from '../store/api/adminRevenueApi';
import Pagination from '../components/common/Pagination';

const RevenuePage = () => {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: stats, isLoading: isStatsLoading } = useGetRevenueStatsQuery();
  const { data: txData, isLoading: isTxLoading } = useListTransactionsQuery({ page, limit });

  const transactions = txData?.transactions || [];
  const pagination = txData?.pagination || { total: 0, totalPages: 0 };

  const STAT_CARDS = [
    { 
      label: 'Net Revenue', 
      value: `₹${((stats?.totalRevenue || 0) / 100).toLocaleString()}`, 
      trend: '+14.2%', // Mock trend
      icon: DollarSign, 
      cardBg: '#E8F5EE', 
      border: '#B6E2CB', 
      iconBg: '#1A6B45', 
      text: '#1A6B45' 
    },
    { 
      label: 'Avg Order Value', 
      value: `₹${((stats?.avgOrderValue || 0) / 100).toLocaleString()}`, 
      trend: '+2.1%', 
      icon: CreditCard, 
      cardBg: '#D1FAE5', 
      border: '#6EE7B7', 
      iconBg: '#059669', 
      text: '#065F46' 
    },
    { 
      label: 'New Subs (Month)', 
      value: stats?.newSubsThisMonth || 0, 
      trend: '+18.5%', 
      icon: TrendingUp, 
      cardBg: '#ECFDF5', 
      border: '#A7F3D0', 
      iconBg: '#10B981', 
      text: '#065F46' 
    },
    { 
      label: 'Current MRR', 
      value: `₹${((stats?.mrr || 0) / 100).toLocaleString()}`, 
      trend: '+6.4%', 
      icon: ArrowUpRight, 
      cardBg: '#FEF3C7', 
      border: '#FDE68A', 
      iconBg: '#D97706', 
      text: '#92400E' 
    },
  ];

  return (
    <div className="flex-1 min-h-screen" style={{ backgroundColor: '#F4F7F4' }}>
      {/* Header */}
      <div
        className="sticky top-0 z-30 backdrop-blur-xl border-b flex items-center justify-between px-6 sm:px-8 pt-5 pb-4"
        style={{ backgroundColor: 'rgba(255,255,255,0.85)', borderColor: '#D1E7DA' }}
      >
        <div>
          <h1 className="text-[22px] font-semibold text-gray-800">Revenue Analytics</h1>
          <p className="text-gray-400 text-sm mt-0.5">Detailed breakdown of earnings and subscriptions</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors shadow-sm"
            style={{ backgroundColor: '#1A6B45' }}
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="px-6 sm:px-8 py-6 space-y-5">
        {/* Financial overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {isStatsLoading ? (
            <div className="col-span-4 flex justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
          ) : (
            STAT_CARDS.map((stat) => (
              <div
                key={stat.label}
                className="border rounded-xl p-5 space-y-3"
                style={{ backgroundColor: stat.cardBg, borderColor: stat.border }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: stat.iconBg }}
                >
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-gray-600 text-xs font-medium">{stat.label}</p>
                  <p className="text-xs mt-1 font-medium" style={{ color: stat.text }}>
                    {stat.trend} vs last month
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Transactions */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm min-h-[400px] flex flex-col">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-gray-800 font-semibold">Recent Transactions</h2>
            <button className="text-xs font-medium transition-colors" style={{ color: '#1A6B45' }}>View all →</button>
          </div>
          <div className="divide-y divide-gray-100 flex-1">
            {isTxLoading ? (
              <div className="flex items-center justify-center h-full py-20">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              </div>
            ) : (
              transactions.map((tx: any) => {
                const statusColors: Record<string, { bg: string; text: string }> = {
                  completed: { bg: '#E8F5EE', text: '#1A6B45' },
                  pending:   { bg: '#FEF3C7', text: '#92400E' },
                  failed:    { bg: '#FEF2F2', text: '#DC2626' },
                };
                const s = statusColors[tx.status] || statusColors.pending;
                return (
                  <div key={tx._id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 rounded-xl" style={{ backgroundColor: s.bg }}>
                        <CreditCard className="w-4 h-4" style={{ color: s.text }} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{tx.user?.name || 'Unknown User'}</p>
                        <p className="text-xs text-gray-400 font-medium mt-0.5">{tx.orderId} · {new Date(tx.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <span
                        className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase"
                        style={{ backgroundColor: '#E8F5EE', color: '#1A6B45' }}
                      >
                        {tx.plan}
                      </span>
                      <div className="text-right min-w-[80px]">
                        <p className="text-sm font-bold text-gray-900">₹{tx.amount / 100}</p>
                        <p className="text-[10px] font-semibold mt-0.5 uppercase tracking-wider" style={{ color: s.text }}>{tx.status}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            {!isTxLoading && transactions.length === 0 && (
              <div className="py-20 text-center text-gray-400 text-sm">No transactions found</div>
            )}
          </div>
          <Pagination
            currentPage={page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
            totalItems={pagination.total}
            itemsPerPage={limit}
          />
        </div>
      </div>
    </div>
  );
};


export default RevenuePage;
