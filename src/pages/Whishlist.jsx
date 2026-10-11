
import { Link } from "react-router-dom";
import { Heart, Search } from "lucide-react";
import ProductCard from "../components/ProductCard";
import { useListings } from "../context/ListingContext";

export default function Wishlist() {
  const {
    listings,
    wishlistIds,
    toggleWishlist,
  } = useListings();

  const savedResources = listings.filter((item) =>
    wishlistIds.includes(String(item.id))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Wishlist
        </h1>
        <p className="mt-2 text-slate-500">
          Resources you have saved for later.
        </p>
      </div>

      {savedResources.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {savedResources.map((item) => (
            <ProductCard
              key={item.id}
              listing={item}
              isWishlisted={true}
              onToggleWishlist={toggleWishlist}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <Heart
            size={38}
            className="mx-auto mb-3 text-slate-300"
          />

          <h2 className="font-semibold text-slate-900">
            Your wishlist is empty
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Save resources from Browse Resources to see them here.
          </p>

          <Link
            to="/browse"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-white hover:bg-blue-700"
          >
            <Search size={17} />
            Browse Resources
          </Link>
        </div>
      )}
    </div>
  );
}
