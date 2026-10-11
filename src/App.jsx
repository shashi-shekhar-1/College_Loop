import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/Mainlayout'
import Home from './pages/Home'
import BrowseResource from './pages/BrowseResouce'
import AddResource from './pages/AddResource.jsx'
import Wishlist from './pages/Whishlist.jsx'
import Profile from './pages/Profile.jsx'
import Settings from './pages/Settings.jsx'
import MyListings from './pages/MyListings.jsx'
import MyRequests from './pages/MyRequests.jsx'
import Messages from './pages/Messages.jsx'
import Auth from './pages/Auth.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import EditResource from './pages/EditResource.jsx'
const AdminReports = lazy(() => import('./pages/AdminReports.jsx'))


function Placeholder({ title }) {
  return (
    <div className="rounded-xl border bg-white p-6">
      <h1 className="text-2xl font-bold text-slate-900">
        {title}
      </h1>
      <p className="mt-2 text-slate-500">
        This page will be built next.
      </p>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Sign Up and Login: no sidebar */}
      <Route path="/auth" element={<Auth />} />

      {/* All marketplace pages require login */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<BrowseResource />} />
          <Route path="/add-resource" element={<AddResource />} />
          <Route path="/my-listings" element={<MyListings />} />
          <Route path="/my-requests" element={<MyRequests />} />
          <Route path="/messages" element={<Messages />} />
          <Route
            path="/admin/reports"
            element={
              <Suspense
                fallback={
                  <div className="p-8 text-center text-slate-500">
                    Loading moderation tools...
                  </div>
                }
              >
                <AdminReports />
              </Suspense>
            }
          />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route
  path="/edit-resource/:id"
  element={<EditResource />}
/>

          <Route
            path="*"
            element={<Placeholder title="Page Not Found" />}
          />
        </Route>
      </Route>
    </Routes>
  );
}
