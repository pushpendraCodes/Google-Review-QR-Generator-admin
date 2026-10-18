import {
  LayoutDashboard,
  Users,
  IndianRupee,
  QrCode,
  MessageSquareHeart,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  type LucideIcon,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logoutUser } from '../../store/slices/authSlice';
import { useLogoutMutation } from '../../store/api/adminAuthApi';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface NavItem {
  name: string;
  icon: LucideIcon;
  path: string;
}

const MENU_ITEMS: { group: string; items: NavItem[] }[] = [
  {
    group: 'Overview',
    items: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
      { name: 'Revenue', icon: IndianRupee, path: '/revenue' },
    ],
  },
  {
    group: 'Manage',
    items: [
      { name: 'Users', icon: Users, path: '/users' },
      { name: 'QR codes', icon: QrCode, path: '/qr-codes' },
      { name: 'Platform reviews', icon: MessageSquareHeart, path: '/reviews' },
    ],
  },
  {
    group: 'System',
    items: [{ name: 'Settings', icon: Settings, path: '/settings' }],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const initials = (name?: string) =>
  (name || 'Admin')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

const Sidebar = ({ collapsed, onToggleCollapsed, mobileOpen, onCloseMobile }: SidebarProps) => {
  const { pathname } = useLocation();
  const dispatch = useAppDispatch();
  const admin = useAppSelector((s) => s.auth.admin);
  const [logout, { isLoading: loggingOut }] = useLogoutMutation();

  // The mobile drawer is always shown expanded.
  const compact = collapsed && !mobileOpen;

  const handleSignOut = async () => {
    try {
      await logout().unwrap();
    } catch {
      // Session is cleared locally regardless of the server response.
    }
    dispatch(logoutUser());
  };

  return (
    <>
      <div
        onClick={onCloseMobile}
        className={cn(
          'fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        aria-hidden
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex h-screen flex-col overflow-hidden',
          'bg-gradient-to-b from-[#1F4535] via-[#1A3A2E] to-[#132B22] text-[#A8C9B8]',
          'shadow-2xl shadow-black/20 transition-[width,transform] duration-300 ease-out',
          'lg:sticky lg:top-0 lg:z-30 lg:translate-x-0 lg:shadow-none',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          compact ? 'w-[76px]' : 'w-[248px]',
        )}
        aria-label="Admin navigation"
      >
        <div
          className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-[#2ECC71]/10 blur-3xl"
          aria-hidden
        />

        <div className={cn('relative flex h-16 shrink-0 items-center gap-3 px-4', compact && 'justify-center px-0')}>
          <div className="relative shrink-0">
            <img src="/favicon.svg" alt="ReviewQR" className="h-9 w-9 rounded-xl bg-white p-0.5 shadow-md shadow-black/20" />
            <span className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#1F4535] bg-[#2ECC71]" />
          </div>
          {!compact && (
            <div className="min-w-0 flex-1 animate-fade-up">
              <p className="truncate text-[15px] leading-none font-semibold text-white">ReviewQR</p>
              <p className="mt-1 text-[11px] leading-none text-[#6BAA8A]">Admin console</p>
            </div>
          )}
          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-lg p-1.5 text-[#A8C9B8] hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav
          className={cn(
            'relative flex-1 px-3 pt-2 pb-4',
            compact ? 'overflow-visible' : 'overflow-y-auto overscroll-contain',
          )}
        >
          {MENU_ITEMS.map((group) => (
            <div key={group.group} className="mb-5">
              {compact ? (
                <div className="mx-auto mb-2 h-px w-8 bg-white/10" />
              ) : (
                <p className="mb-2 px-3 text-[10px] font-semibold tracking-[0.14em] text-[#6BAA8A] uppercase">
                  {group.group}
                </p>
              )}
              <ul className="flex flex-col gap-1">
                {group.items.map((item) => {
                  const isActive = item.path === '/' ? pathname === '/' : pathname.startsWith(item.path);
                  return (
                    <li key={item.path} className="group/item relative">
                      <Link
                        to={item.path}
                        onClick={onCloseMobile}
                        aria-current={isActive ? 'page' : undefined}
                        aria-label={compact ? item.name : undefined}
                        className={cn(
                          'relative flex items-center gap-3 rounded-xl py-2.5 text-sm transition-all duration-200',
                          compact ? 'justify-center px-0' : 'px-3',
                          isActive
                            ? 'bg-gradient-to-r from-[#2ECC71]/25 to-[#2ECC71]/5 font-medium text-white shadow-inner shadow-[#2ECC71]/10'
                            : 'hover:bg-white/[0.06] hover:text-white',
                        )}
                      >
                        {isActive && (
                          <span className="absolute top-1/2 left-0 h-6 w-1 -translate-y-1/2 rounded-r-full bg-[#2ECC71] shadow-[0_0_12px_#2ECC71]" />
                        )}
                        <item.icon
                          className={cn(
                            'h-[18px] w-[18px] shrink-0 transition-transform duration-200 group-hover/item:scale-110',
                            isActive && 'text-[#2ECC71]',
                          )}
                        />
                        {!compact && <span className="flex-1 truncate">{item.name}</span>}
                      </Link>
                      {compact && (
                        <span className="pointer-events-none absolute top-1/2 left-full z-50 ml-3 -translate-y-1/2 translate-x-1 rounded-lg bg-gray-900 px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-white opacity-0 shadow-lg transition-all duration-150 group-hover/item:translate-x-0 group-hover/item:opacity-100">
                          {item.name}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="relative shrink-0 border-t border-white/10 p-3">
          <div
            className={cn(
              'mb-2 flex items-center gap-3 rounded-xl bg-white/[0.04] p-2.5',
              compact && 'justify-center bg-transparent p-0 py-1',
            )}
            title={compact ? `${admin?.name ?? 'Admin'} · ${admin?.email ?? ''}` : undefined}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2ECC71] to-[#1E8E50] text-xs font-semibold text-white ring-2 ring-white/10">
              {initials(admin?.name)}
            </div>
            {!compact && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm leading-tight font-semibold text-white">{admin?.name || 'Admin'}</p>
                <p className="truncate text-[11px] text-[#6BAA8A]">{admin?.email || admin?.role || 'All access'}</p>
              </div>
            )}
          </div>

          <div className={cn('flex gap-1', compact && 'flex-col')}>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={loggingOut}
              className={cn(
                'flex flex-1 items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors hover:bg-red-500/15 hover:text-red-200 disabled:opacity-60',
                compact && 'justify-center px-0',
              )}
              title="Sign out"
            >
              <LogOut className="h-[18px] w-[18px] shrink-0" />
              {!compact && <span>{loggingOut ? 'Signing out…' : 'Sign out'}</span>}
            </button>
            <button
              type="button"
              onClick={onToggleCollapsed}
              className={cn(
                'hidden items-center justify-center rounded-xl p-2 transition-colors hover:bg-white/10 hover:text-white lg:flex',
              )}
              title={collapsed ? 'Expand sidebar (Ctrl+B)' : 'Collapse sidebar (Ctrl+B)'}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <PanelLeftOpen className="h-[18px] w-[18px]" /> : <PanelLeftClose className="h-[18px] w-[18px]" />}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
