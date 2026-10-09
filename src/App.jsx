import { Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/Mainlayout'
import Home from './pages/Home'
import BrowseResource from './pages/BrowseResouce'
import AddResource from './pages/AddResource.jsx'

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
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<BrowseResource />} />
        <Route path="/add-resource" element={<AddResource />} />
        <Route
          path="/my-listings"
          element={<Placeholder title="My Listings" />}
        />
        <Route
          path="/my-requests"
          element={<Placeholder title="My Requests" />}
        />
        <Route
          path="/messages"
          element={<Placeholder title="Message" />}
        />
        <Route
          path="/wishlist"
          element={<Placeholder title="Wishlist" />}
        />
        <Route
          path="/profile"
          element={<Placeholder title="Profile" />}
        />
        <Route
          path="/settings"
          element={<Placeholder title="Setting" />}
        />
        <Route
          path="*"
          element={<Placeholder title="Page Not Found" />}
        />
      </Route>
    </Routes>
  )
}