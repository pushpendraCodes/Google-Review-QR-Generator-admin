import {
  LayoutDashboard,
  Users,
  IndianRupee,
  QrCode,

  Settings,
  LogOut,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

const MENU_ITEMS = [
  {
    group: 'MAIN', items: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
      { name: 'Users', icon: Users, path: '/users' },
      { name: 'Revenue', icon: IndianRupee, path: '/revenue' },
      { name: 'QR codes', icon: QrCode, path: '/qr-codes' },
      // { name: 'Reviews',   icon: Star,            path: '/reviews' },
    ]
  },
  {
    group: 'SYSTEM', items: [
      // { name: 'Alerts', icon: Bell, path: '/alerts' },
      { name: 'Settings', icon: Settings, path: '/settings' },
    ]
  },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    /* Exact same bg as website sidebar: #1A3A2E */
    <div
      className="w-[185px] min-w-[185px] min-h-screen flex flex-col justify-between py-5 px-3"
      style={{ backgroundColor: '#1A3A2E' }}
    >
      {/* Top section */}
      <div>
        {/* Logo */}
        <div className="flex items-center gap-2 px-2 mb-8">
          <img src="/favicon.svg" alt="ReviewQR" className="w-8 h-8 rounded-lg bg-white" />
          <div>
            <p className="text-white font-semibold text-sm leading-none">ReviewQR</p>
            <p className="text-[10px] leading-tight" style={{ color: '#6BAA8A' }}>Admin Panel</p>
          </div>
        </div>

        {/* Nav groups */}
        {MENU_ITEMS.map((group) => (
          <div key={group.group} className="mb-6">
            <p
              className="text-[10px] font-semibold uppercase tracking-widest px-2 mb-2"
              style={{ color: '#6BAA8A' }}
            >
              {group.group}
            </p>
            <nav className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm w-full text-left transition-colors",
                    )}
                    style={{
                      backgroundColor: isActive ? 'rgba(46,204,113,0.20)' : 'transparent',
                      color: isActive ? '#ffffff' : '#A8C9B8',
                      fontWeight: isActive ? 500 : 400,
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.05)';
                        (e.currentTarget as HTMLElement).style.color = '#ffffff';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                        (e.currentTarget as HTMLElement).style.color = '#A8C9B8';
                      }
                    }}
                  >
                    <span style={{ color: isActive ? '#2ECC71' : 'inherit' }}>
                      <item.icon className="w-[18px] h-[18px]" />
                    </span>
                    <span className="flex-1">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Bottom: sign out */}
      <div className="px-2">
        <div className="border-t pt-4" style={{ borderColor: '#2E5040' }}>
          <button
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm w-full text-left transition-colors"
            style={{ color: '#A8C9B8' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.05)';
              (e.currentTarget as HTMLElement).style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
              (e.currentTarget as HTMLElement).style.color = '#A8C9B8';
            }}
          >
            <LogOut className="w-[18px] h-[18px]" />
            <span>Sign out</span>
          </button>
          <div className="mt-3 px-3">
            <p className="text-white text-sm font-semibold leading-tight truncate">Super Admin</p>
            <div className="flex items-center gap-1 mt-1">
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: '#2ECC71' }} />
              <p className="text-[11px]" style={{ color: '#6BAA8A' }}>All access · System</p>
            </div>
            <div className="mt-2 h-1 rounded-full" style={{ backgroundColor: '#2E5040' }}>
              <div className="h-1 rounded-full w-full" style={{ backgroundColor: '#2ECC71' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
