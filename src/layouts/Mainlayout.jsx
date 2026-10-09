import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main content */}
      <div
        className={`min-h-screen min-w-0 transition-[margin] duration-300
          ${collapsed ? 'md:ml-[72px]' : 'md:ml-[250px]'}`}
      >
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-white px-4 md:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 hover:bg-slate-100"
            aria-label="Open navigation"
          >
            ☰
          </button>

          <span className="font-bold text-blue-700">
            Campus Loop
          </span>
        </header>

        {/* Current route appears here */}
        <main className="min-w-0 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}