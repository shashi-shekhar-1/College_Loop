
import { Link } from "react-router-dom";
import { Search, Package } from "lucide-react";
import { useState } from "react";

import ProductCard from "../components/ProductCard";
import { useListings } from "../context/ListingContext";

export default function BrowseResource() {
  const {
    listings,
    wishlistIds,
    toggleWishlist,
  } = useListings();

  const [search, setSearch] = useState("");

  const filteredListings = listings.filter((listing) => {
    const query = search.toLowerCase();

    return [
      listing.name,
      listing.title,
      listing.category,
      listing.description,
      listing.location,
    ]
      .filter(Boolean)
      .some((value) =>
        String(value).toLowerCase().includes(query)
      );
  });

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div>
        <p className="text-sm text-blue-600">
          Campus Marketplace
        </p>

        <h1 className="mt-1 text-2xl font-bold text-slate-900">
          Browse Resources
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Find useful resources shared by students on campus.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-xl">
        <Search
          size={19}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search books, electronics, lab equipment..."
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 outline-none focus:border-blue-500"
        />
      </div>

      {/* Resource count */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-800">
          Available Resources
        </h2>

        <span className="text-sm text-slate-500">
          {filteredListings.length} resources
        </span>
      </div>

      {/* Cards */}
      {filteredListings.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredListings.map((listing) => (
            <ProductCard
              key={listing.id}
              listing={listing}
              isWishlisted={wishlistIds.includes(
                String(listing.id)
              )}
              onToggleWishlist={toggleWishlist}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <Package
            size={36}
            className="mx-auto mb-3 text-slate-400"
          />

          <h3 className="font-semibold text-slate-800">
            {search
              ? "No matching resources found"
              : "No resources listed yet"}
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            {search
              ? "Try another search term."
              : "Be the first to share a resource with your campus community."}
          </p>

          {!search && (
            <Link
              to="/add-resource"
              className="mt-5 inline-block rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Add a Resource
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
