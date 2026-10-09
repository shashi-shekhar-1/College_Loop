import { NavLink } from 'react-router-dom'
import {
  Home,
  Search,
  PlusSquare,
  Package,
  ClipboardList,
  MessageCircle,
  UserRound,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  GraduationCap,
  X,
  Heart,
} from 'lucide-react'

const menuItems = [
  { label: 'Home', path: '/', icon: Home },
  { label: 'Browse Resource', path: '/browse', icon: Search },
  { label: 'Add Resource', path: '/add-resource', icon: PlusSquare },
  { label: 'My Listings', path: '/my-listings', icon: Package },
  { label: 'My Requests', path: '/my-requests', icon: ClipboardList },
  { label: 'Message', path: '/messages', icon: MessageCircle },
  {label:'Whishlist', path:'/wishlist', icon: Heart}, // I want this also
  { label: 'Profile', path: '/profile', icon: UserRound },
  { label: 'Setting', path: '/settings', icon: Settings },
]

export default function Sidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) {
  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <button
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation backdrop"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col
          bg-slate-900 text-slate-200
          transition-[width,transform] duration-300
          ${collapsed ? 'w-[72px]' : 'w-[250px]'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        {/* Brand and controls */}
        <div className="flex h-20 shrink-0 items-center gap-3 border-b border-slate-700 px-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600">
            <GraduationCap size={24} />
          </div>

          {!collapsed && (
            <span className="min-w-0 flex-1 font-bold text-white">
              Campus Loop
            </span>
          )}

          {/* Collapse button: desktop */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden rounded-lg p-2 hover:bg-slate-800 md:block"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed
              ? <PanelLeftOpen size={20} />
              : <PanelLeftClose size={20} />}
          </button>

          {/* Close button: mobile */}
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto rounded-lg p-2 hover:bg-slate-800 md:hidden"
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 overflow-y-auto p-3">
          {menuItems.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? label : undefined}
              className={({ isActive }) => `
                flex min-h-11 items-center gap-3 rounded-lg px-3 py-3
                transition-colors
                ${collapsed ? 'justify-center' : ''}
                ${isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
              `}
            >
              <Icon size={20} className="shrink-0" />

              {!collapsed && (
                <span className="truncate text-sm font-medium">
                  {label}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {!collapsed && (
          <div className="border-t border-slate-700 p-4 text-xs text-slate-400">
            BIT Sindri Student Marketplace
          </div>
        )}
      </aside>
    </>
  )
}