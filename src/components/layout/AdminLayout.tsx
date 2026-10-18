import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

const STORAGE_KEY = 'admin_sidebar_collapsed';

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(STORAGE_KEY) === '1');
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      localStorage.setItem(STORAGE_KEY, prev ? '0' : '1');
      return !prev;
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleCollapsed();
      } else if (e.key === 'Escape') {
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleCollapsed]);

  return (
    <div className="flex min-h-screen font-sans antialiased" style={{ backgroundColor: '#F4F7F4' }}>
      <Sidebar
        collapsed={collapsed}
        onToggleCollapsed={toggleCollapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-gray-200 bg-white/90 px-4 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-gray-700 hover:bg-gray-100"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <img src="/favicon.svg" alt="" className="h-7 w-7 rounded-lg" />
          <span className="text-sm font-semibold text-gray-900">ReviewQR Admin</span>
        </header>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
