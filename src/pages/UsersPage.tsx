import { useState } from 'react';
import { Search, Filter, MoreHorizontal, UserCheck, UserPlus, UserX, Loader2 } from 'lucide-react';
import { useListUsersQuery } from '../store/api/adminUsersApi';
import Pagination from '../components/common/Pagination';

const statColors = {
  total:   { cardBg: '#E8F5EE', border: '#B6E2CB', iconBg: '#1A6B45' },
  active:  { cardBg: '#D1FAE5', border: '#6EE7B7', iconBg: '#059669' },
  churn:   { cardBg: '#FEF2F2', border: '#FECACA', iconBg: '#DC2626' },
};

const UsersPage = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, error } = useListUsersQuery({ search, page, limit });

  const users = data?.users || [];
  const stats = data?.stats || { total: 0, active: 0, churnRate: '0%' };
  const pagination = data?.pagination || { total: 0, totalPages: 0 };

  return (
    <div className="flex-1 min-h-screen" style={{ backgroundColor: '#F4F7F4' }}>
      {/* Header */}
      <div
        className="sticky top-0 z-30 backdrop-blur-xl border-b flex items-center justify-between px-6 sm:px-8 pt-5 pb-4"
        style={{ backgroundColor: 'rgba(255,255,255,0.85)', borderColor: '#D1E7DA' }}
      >
        <div>
          <h1 className="text-[22px] font-semibold text-gray-800">Users Management</h1>
          <p className="text-gray-400 text-sm mt-0.5">Manage and track all business accounts</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1); // Reset to page 1 on search
              }}
              className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none transition-all w-56"
              style={{ outlineColor: '#1A6B45' }}
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      <div className="px-6 sm:px-8 py-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Total Users', value: stats.total?.toLocaleString(), icon: UserPlus,  key: 'total'  },
            { label: 'Active Now',  value: stats.active?.toLocaleString(),   icon: UserCheck, key: 'active' },
            { label: 'Churn Rate',  value: stats.churnRate,  icon: UserX,     key: 'churn'  },
          ].map((stat) => {
            const c = statColors[stat.key as keyof typeof statColors];
            return (
              <div
                key={stat.label}
                className="border rounded-xl p-5 flex items-center gap-4"
                style={{ backgroundColor: c.cardBg, borderColor: c.border }}
              >
                <div className="p-3 rounded-xl shadow-sm" style={{ backgroundColor: c.iconBg }}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px] flex flex-col">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center text-red-500">
              Failed to load users
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100" style={{ backgroundColor: '#F4F7F4' }}>
                      <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">User / Business</th>
                      <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Plan</th>
                      <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((user: any) => (
                      <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                              style={{ backgroundColor: '#E8F5EE', color: '#1A6B45' }}
                            >
                              {user.name?.split(' ').map((n: string) => n[0]).join('')}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                              <p className="text-xs text-gray-400">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase"
                            style={{ backgroundColor: '#FEE2D5', color: '#C2410C' }}
                          >
                            {user.plan}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                            <span className="text-sm text-gray-600 font-medium">{user.isActive ? 'Active' : 'Inactive'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700 transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-10 text-center text-gray-400 text-sm">
                          No users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination
                currentPage={page}
                totalPages={pagination.totalPages}
                onPageChange={setPage}
                totalItems={pagination.total}
                itemsPerPage={limit}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};


export default UsersPage;
