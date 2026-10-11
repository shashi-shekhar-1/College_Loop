
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useListings } from "../context/ListingContext";

const initialForm = {
  title: "",
  description: "",
  price: "",
  category: "Books",
  condition: "Good",
  transactionType: "Sell",
  sellerName: "",
  image: "",
};

export default function EditResource() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    listings,
    updateListing,
    currentUser,
    listingsLoading,
  } = useListings();

  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const listing = listings.find((item) => item.id === id);

  useEffect(() => {
    if (listing) {
      setForm({
        title: listing.title || listing.name || "",
        description: listing.description || "",
        price: listing.price ?? "",
        category: listing.category || "Books",
        condition: listing.condition || "Good",
        transactionType: listing.transactionType || "Sell",
        sellerName: listing.sellerName || "",
        image: listing.image || listing.imageUrl || "",
      });
    }
  }, [listing]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!listing || listing.ownerId !== currentUser?.uid) {
      setError("You cannot edit this listing.");
      return;
    }

    if (!form.title.trim() || !form.description.trim()) {
      setError("Please enter a title and description.");
      return;
    }

    if (form.price === "" || Number(form.price) < 0) {
      setError("Please enter a valid price.");
      return;
    }

    setSaving(true);

    try {
      await updateListing(id, {
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        image: form.image.trim(),
      });

      navigate("/my-listings", {
        replace: true,
        state: { message: "Listing updated successfully." },
      });
    } catch (err) {
      console.error("Error updating listing:", err);
      setError(err.message || "Could not update the listing.");
    } finally {
      setSaving(false);
    }
  }

  if (listingsLoading) {
    return (
      <div className="p-8 text-center text-slate-600">
        Loading listing...
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="mx-auto max-w-xl p-8 text-center">
        <h1 className="text-2xl font-bold">Listing not found</h1>
        <p className="mt-2 text-slate-500">
          This resource may have been deleted.
        </p>
        <Link
          to="/my-listings"
          className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-3 text-white"
        >
          Back to My Listings
        </Link>
      </div>
    );
  }

  if (listing.ownerId !== currentUser?.uid) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold">Access denied</h1>
        <p className="mt-2 text-slate-500">
          You can only edit your own listings.
        </p>
        <Link
          to="/my-listings"
          className="mt-5 inline-block text-blue-600 underline"
        >
          Back to My Listings
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/my-listings"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to My Listings
        </Link>

        <h1 className="mt-4 text-3xl font-bold text-slate-900">
          Edit Resource
        </h1>

        <p className="mt-2 text-slate-500">
          Update your resource details below.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div>
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Resource Title *
            </label>
            <input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              placeholder="e.g. Engineering Mathematics Book"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              placeholder="Describe your resource..."
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="price"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Price (₹) *
              </label>
              <input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-slate-500">
                Enter 0 if the resource is free.
              </p>
            </div>

            <div>
              <label
                htmlFor="category"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Category
              </label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              >
                {[
                  "Books",
                  "Electronics",
                  "Notes",
                  "Stationery",
                  "Hostel Essentials",
                  "Other",
                ].map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="condition"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Condition
              </label>
              <select
                id="condition"
                name="condition"
                value={form.condition}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              >
                {["New", "Like New", "Good", "Fair"].map((condition) => (
                  <option key={condition} value={condition}>
                    {condition}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="transactionType"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Transaction Type
              </label>
              <select
                id="transactionType"
                name="transactionType"
                value={form.transactionType}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              >
                {["Sell", "Rent", "Free"].map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="sellerName"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Seller Name
            </label>
            <input
              id="sellerName"
              name="sellerName"
              value={form.sellerName}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              placeholder="Your name"
            />
          </div>

          <div>
            <label
              htmlFor="image"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Image URL
            </label>
            <input
              id="image"
              name="image"
              type="url"
              value={form.image}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>

            <Link
              to="/my-listings"
              className="rounded-lg border border-slate-300 px-6 py-3 text-center font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
