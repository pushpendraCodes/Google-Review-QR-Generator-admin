import { useState } from 'react';
import { QrCode, AlertTriangle, Eye, ArrowRight, Loader2 } from 'lucide-react';
import { useGetQRStatsQuery, useListQRCodesQuery } from '../store/api/adminQRCodesApi';
import Pagination from '../components/common/Pagination';

const QRCodesPage = () => {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: stats, isLoading: isStatsLoading } = useGetQRStatsQuery();
  const { data: qrData, isLoading: isListLoading } = useListQRCodesQuery({ page, limit });

  const qrCodes = qrData?.qrCodes || [];
  const pagination = qrData?.pagination || { total: 0, totalPages: 0 };

  return (
    <div className="flex-1 min-h-screen" style={{ backgroundColor: '#F4F7F4' }}>
      {/* Header */}
      <div
        className="sticky top-0 z-30 backdrop-blur-xl border-b flex items-center justify-between px-6 sm:px-8 pt-5 pb-4"
        style={{ backgroundColor: 'rgba(255,255,255,0.85)', borderColor: '#D1E7DA' }}
      >
        <div>
          <h1 className="text-[22px] font-semibold text-gray-800">QR Codes Tracking</h1>
          <p className="text-gray-400 text-sm mt-0.5">Monitor performance and scan data across the platform</p>
        </div>
      </div>

      <div className="px-6 sm:px-8 py-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {isStatsLoading ? (
            <div className="col-span-3 flex justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
          ) : (
            [
              { label: 'Total Scans', value: stats?.totalScans?.toLocaleString() || '0', icon: Eye, cardBg: '#E8F5EE', border: '#B6E2CB', iconBg: '#1A6B45' },
              { label: 'Active QRs', value: stats?.total?.toLocaleString() || '0', icon: QrCode, cardBg: '#D1FAE5', border: '#6EE7B7', iconBg: '#059669' },
              { label: 'Scan Failures', value: '0', icon: AlertTriangle, cardBg: '#FEF2F2', border: '#FECACA', iconBg: '#DC2626' },
            ].map((item) => (
              <div
                key={item.label}
                className="border rounded-xl p-6 flex items-center justify-between"
                style={{ backgroundColor: item.cardBg, borderColor: item.border }}
              >
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{item.label}</p>
                  <h3 className="text-3xl font-bold text-gray-900">{item.value}</h3>
                </div>
                <div className="p-3.5 rounded-xl shadow-sm" style={{ backgroundColor: item.iconBg }}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px] flex flex-col">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between" style={{ backgroundColor: '#F4F7F4' }}>
            <h2 className="text-gray-800 font-semibold">QR Performance</h2>
          </div>
          {isListLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">QR ID</th>
                      <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Business</th>
                      <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Scans</th>
                      <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Reviews</th>
                      <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {qrCodes.map((qr: any) => (
                      <tr key={qr._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <span
                            className="text-xs font-bold font-mono px-2 py-0.5 rounded-lg"
                            style={{ backgroundColor: '#E8F5EE', color: '#1A6B45' }}
                          >
                            {qr.shortCode || qr._id.substring(0, 8)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-gray-900">{qr.businessName || 'Unknown'}</p>
                          <p className="text-xs text-gray-400 mt-0.5">Created: {new Date(qr.createdAt).toLocaleDateString()}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm font-bold text-gray-900">{qr.scanCount?.toLocaleString() || 0}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm font-bold" style={{ color: '#1A6B45' }}>{qr.totalReviews?.toLocaleString() || 0}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 transition-colors">
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {qrCodes.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-10 text-center text-gray-400 text-sm">
                          No QR codes found
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


export default QRCodesPage;
