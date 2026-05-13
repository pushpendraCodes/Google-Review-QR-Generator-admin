import { User, Shield, Bell, Globe, Database, Save, ChevronRight } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'General',       icon: User,     active: true },
  { label: 'Security',      icon: Shield              },
  { label: 'Notifications', icon: Bell                },
  { label: 'Localization',  icon: Globe               },
  { label: 'Database',      icon: Database            },
];

const SettingsPage = () => {
  return (
    <div className="flex-1 min-h-screen" style={{ backgroundColor: '#F4F7F4' }}>
      {/* Header */}
      <div
        className="sticky top-0 z-30 backdrop-blur-xl border-b flex items-center justify-between px-6 sm:px-8 pt-5 pb-4"
        style={{ backgroundColor: 'rgba(255,255,255,0.85)', borderColor: '#D1E7DA' }}
      >
        <div>
          <h1 className="text-[22px] font-semibold text-gray-800">Admin Settings</h1>
          <p className="text-gray-400 text-sm mt-0.5">Configure your admin account and global system preferences</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ backgroundColor: '#2ECC71' }} />
          </button>
        </div>
      </div>

      <div className="px-6 sm:px-8 py-6">
        <div className="max-w-4xl grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Settings nav — dark green like website sidebar */}
          <div
            className="rounded-xl p-3 flex flex-col gap-0.5 h-fit"
            style={{ backgroundColor: '#1A3A2E' }}
          >
            {NAV_ITEMS.map((item) => (
              <button
                key={item.label}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-left transition-colors"
                style={{
                  backgroundColor: item.active ? 'rgba(46,204,113,0.20)' : 'transparent',
                  color: item.active ? '#ffffff' : '#A8C9B8',
                  fontWeight: item.active ? 500 : 400,
                }}
                onMouseEnter={(e) => {
                  if (!item.active) {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.color = '#ffffff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!item.active) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#A8C9B8';
                  }
                }}
              >
                <div className="flex items-center gap-2.5">
                  <item.icon
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: item.active ? '#2ECC71' : '#6BAA8A' }}
                  />
                  {item.label}
                </div>
                {item.active && <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#2ECC71' }} />}
              </button>
            ))}
          </div>

          {/* Content area */}
          <div className="lg:col-span-2 space-y-5">

            {/* Profile card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              {/* Avatar */}
              <div
                className="flex items-center gap-4 p-4 rounded-xl mb-6"
                style={{ backgroundColor: '#E8F5EE', border: '1px solid #B6E2CB' }}
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
                  style={{ backgroundColor: '#1A6B45' }}
                >
                  SA
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Super Admin</p>
                  <p className="text-sm text-gray-400 mt-0.5">admin@reviewqr.com</p>
                  <span
                    className="inline-block mt-1.5 text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: '#D1FAE5', color: '#1A6B45' }}
                  >
                    Full Access Plan
                  </span>
                </div>
              </div>

              <h2 className="text-gray-700 font-semibold text-sm mb-4">General Preferences</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Admin Display Name', type: 'text',  value: 'Super Admin'        },
                  { label: 'Email Address',       type: 'email', value: 'admin@reviewqr.com', readonly: true },
                ].map((field) => (
                  <div key={field.label}>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">{field.label}</label>
                    <input
                      type={field.type}
                      defaultValue={field.value}
                      readOnly={!!field.readonly}
                      className={`w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm transition-colors ${field.readonly ? 'bg-gray-50 cursor-not-allowed text-gray-400' : 'bg-white'}`}
                      style={{ outlineColor: '#1A6B45' }}
                    />
                  </div>
                ))}
              </div>

              {/* Maintenance toggle */}
              <div
                className="flex items-center justify-between p-3 rounded-lg mt-4 border"
                style={{ backgroundColor: '#F4F7F4', borderColor: '#D1E7DA' }}
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">Maintenance Mode</p>
                  <p className="text-xs text-gray-400 mt-0.5">Put the platform into maintenance mode for all users</p>
                </div>
                {/* Toggle — matches website's checkbox toggle */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div
                    className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                    style={{ backgroundColor: '#D1E7DA' }}
                  />
                </label>
              </div>

              <div className="flex justify-end mt-6 gap-3">
                <button className="px-5 py-2 text-sm font-medium text-gray-400 hover:text-gray-700 transition-colors">
                  Cancel
                </button>
                <button
                  className="flex items-center gap-2 px-5 py-2 rounded-lg text-white text-sm font-medium transition-colors shadow-sm"
                  style={{ backgroundColor: '#1A6B45' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#165a3a')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1A6B45')}
                >
                  <Save className="w-4 h-4" />
                  Save changes
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div
              className="rounded-xl p-6 border"
              style={{ backgroundColor: '#FEF2F2', borderColor: '#FECACA' }}
            >
              <h2 className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-2">
                Danger Zone
              </h2>
              <p className="text-xs text-red-500 mb-5">
                Be careful! These actions are permanent and cannot be undone.
              </p>
              <button className="px-5 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-all shadow-sm">
                Clear Platform Cache
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
