
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useListings } from "../context/ListingContext";

export default function MyListings() {
  const {
    listings = [],
    deleteListing,
    currentUser,
    listingsLoading,
    listingsError,
  } = useListings();

  const navigate = useNavigate();
const location = useLocation();

  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [editMessage, setEditMessage] = useState(
  location.state?.message || ""
);

  const myListings = currentUser
    ? listings.filter((item) => item.ownerId === currentUser.uid)
    : [];

  async function handleDelete() {
    if (deleteId === null || deleting) return;

    setDeleting(true);
    setMessage("");

    try {
      await deleteListing(deleteId);
      setMessage("Listing deleted successfully.");
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting listing:", error);
      setMessage(error.message || "Unable to delete listing. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold text-slate-900">
          My Listings
        </h1>

        {editMessage && (
  <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
    {editMessage}
    <button
      type="button"
      onClick={() => {
        setEditMessage("");
        navigate(location.pathname, { replace: true, state: {} });
      }}
      className="ml-3 underline"
    >
      Dismiss
    </button>
  </div>
)}

        <p className="mt-2 text-slate-500">
          Manage the resources you have added to Campus Loop.
        </p>

        {message && (
          <p className="mt-4 text-sm text-slate-700" role="status">
            {message}
          </p>
        )}

        {listingsError && (
          <p className="mt-4 text-sm text-red-600" role="alert">
            {listingsError}
          </p>
        )}

        <div className="mb-5 mt-8 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your Resources</h2>
          <span className="text-sm text-slate-500">
            {listingsLoading ? "Loading..." : `${myListings.length} listings`}
          </span>
        </div>

        {listingsLoading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">
            Loading your listings...
          </div>
        ) : myListings.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
            <h3 className="text-xl font-semibold">No listings yet</h3>
            <p className="mt-2 text-slate-500">
              Add a resource and it will appear here.
            </p>
            <Link
              to="/add-resource"
              className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
            >
              + Add Resource
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {myListings.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white"
              >
                {item.imageUrl || item.image ? (
                  <img
                    src={item.imageUrl || item.image}
                    alt={item.title || item.name || "Resource"}
                    className="h-48 w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center bg-slate-100 text-5xl">
                    📚
                  </div>
                )}

                <div className="p-5">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {item.title || item.name || "Untitled resource"}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {item.category || "Other"}
                  </p>

                  <p className="mt-3 text-sm text-slate-600">
                    {item.description || "No description available."}
                  </p>

                  <p className="mt-4 text-xl font-bold">
                    {item.price == null
                      ? "Price not set"
                      : Number(item.price) === 0
                        ? "Free"
                        : `₹${item.price}`}
                  </p>

                  <div className="mt-5 flex gap-3">
                    <button
  type="button"
  onClick={() => navigate(`/edit-resource/${item.id}`)}
  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
>
  Edit
</button>

                    <button
                      type="button"
                      onClick={() => setDeleteId(item.id)}
                      className="flex-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
          >
            <h2
              id="delete-title"
              className="text-xl font-bold text-slate-900"
            >
              Delete listing?
            </h2>

            <p className="mt-3 text-sm text-slate-600">
              Are you sure you want to delete this resource?
              This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteId(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete listing"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
