
import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
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
  LogOut,
  ShieldAlert,
} from 'lucide-react'
import { onIdTokenChanged, signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { db } from '../firebase'

const menuItems = [
  { label: 'Home', path: '/', icon: Home },
  { label: 'Browse Resource', path: '/browse', icon: Search },
  { label: 'Add Resource', path: '/add-resource', icon: PlusSquare },
  { label: 'My Listings', path: '/my-listings', icon: Package },
  { label: 'My Requests', path: '/my-requests', icon: ClipboardList },
  { label: 'Message', path: '/messages', icon: MessageCircle },
  { label: 'Wishlist', path: '/wishlist', icon: Heart },
  { label: 'Profile', path: '/profile', icon: UserRound },
  { label: 'Setting', path: '/settings', icon: Settings },
]

export default function Sidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) {
  const navigate = useNavigate()
  const [isAdmin, setIsAdmin] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    return onIdTokenChanged(auth, async (user) => {
      if (!user) {
        setIsAdmin(false)
        return
      }

      try {
        const token = await user.getIdTokenResult()
        setIsAdmin(token.claims.admin === true)
      } catch (error) {
        console.error('Could not verify administrator navigation:', error)
        setIsAdmin(false)
      }
    })
  }, [])

  useEffect(() => {
  let unsubscribeConversations = () => {}

  const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
    unsubscribeConversations()
    setUnreadCount(0)

    if (!user) return

    const conversationsQuery = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.uid)
    )

    unsubscribeConversations = onSnapshot(
      conversationsQuery,
      (snapshot) => {
        const count = snapshot.docs.filter((item) => {
          const conversation = item.data()
          return (conversation.unreadFor || []).includes(user.uid)
        }).length

        setUnreadCount(count)
      },
      (error) => {
        console.error('Could not load unread messages:', error)
      }
    )
  })

  return () => {
    unsubscribeAuth()
    unsubscribeConversations()
  }
}, [])

  async function handleLogout() {
    try {
      await signOut(auth)
      setMobileOpen(false)
      navigate('/auth', { replace: true })
    } catch (error) {
      console.error('Logout failed:', error)
      alert('Unable to log out. Please try again.')
    }
  }

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
          {[...menuItems, ...(isAdmin
            ? [{ label: 'Reports', path: '/admin/reports', icon: ShieldAlert }]
            : [])].map(({ label, path, icon: Icon }) => (
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
  <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
    <span className="truncate text-sm font-medium">
      {label}
    </span>

    {label === 'Message' && unreadCount > 0 && (
      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
        {unreadCount > 99 ? '99+' : unreadCount}
      </span>
    )}
  </span>
)}
            </NavLink>
          ))}
        </nav>

        {/* Logout button */}
        <div className="shrink-0 border-t border-slate-700 p-3">
          <button
            type="button"
            onClick={handleLogout}
            title={collapsed ? 'Logout' : undefined}
            className={`
              flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-3
              text-slate-300 transition-colors
              hover:bg-red-600 hover:text-white
              ${collapsed ? 'justify-center' : ''}
            `}
          >
            <LogOut size={20} className="shrink-0" />

            {!collapsed && (
              <span className="text-sm font-medium">
                Logout
              </span>
            )}
          </button>

          {!collapsed && (
            <p className="mt-3 px-1 text-xs text-slate-400">
              BIT Sindri Student Marketplace
            </p>
          )}
        </div>
      </aside>
    </>
  )
}
