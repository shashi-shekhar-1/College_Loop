
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  MapPin,
  Tag,
  ShoppingCart,
} from "lucide-react";

import { useListings } from "../context/ListingContext";

export default function ProductCard({
  listing,
  isWishlisted = false,
  onToggleWishlist,
}) {
  const {
    currentUser,
    createRequest,
  } = useListings();

  const navigate = useNavigate();

  const [requesting, setRequesting] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [requestError, setRequestError] = useState("");

  const title =
    listing.name || listing.title || "Untitled resource";

  const image =
    listing.imageUrl ||
    listing.image ||
    listing.photo ||
    listing.images?.[0];

  const price = listing.price;

  const isOwner =
    currentUser?.uid === listing.ownerId;

  async function handleRequest() {
    if (!currentUser) {
      navigate("/auth");
      return;
    }

    if (isOwner || requesting) return;

    setRequesting(true);
    setRequestMessage("");
    setRequestError("");

    try {
      await createRequest(listing.id);
      setRequestMessage("Request sent successfully!");
    } catch (error) {
      console.error("Error requesting resource:", error);
      setRequestError(
        error.message || "Could not send your request."
      );
    } finally {
      setRequesting(false);
    }
  }

  return (
    <article className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow hover:shadow-md">
      {/* Resource image */}
      <div className="relative h-48 bg-slate-100">
        {image ? (
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            No image available
          </div>
        )}

        {/* Wishlist button */}
        <button
          type="button"
          onClick={() => onToggleWishlist?.(listing.id)}
          aria-label={
            isWishlisted
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
          aria-pressed={isWishlisted}
          title={
            isWishlisted
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
          className={`absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full shadow-sm transition ${
            isWishlisted
              ? "bg-rose-50 text-rose-600"
              : "bg-white text-slate-600 hover:text-rose-600"
          }`}
        >
          <Heart
            size={20}
            fill={isWishlisted ? "currentColor" : "none"}
          />
        </button>

        {listing.condition && (
          <span className="absolute bottom-3 left-3 rounded-md bg-white px-2 py-1 text-xs font-medium text-slate-700 shadow-sm">
            {listing.condition}
          </span>
        )}
      </div>

      {/* Resource details */}
      <div className="p-4">
        <div className="mb-2 flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 font-semibold text-slate-900">
            {title}
          </h3>

          {price !== undefined &&
            price !== null &&
            price !== "" && (
              <span className="shrink-0 font-bold text-slate-900">
                {Number(price) === 0 ? "Free" : `₹${price}`}
              </span>
            )}
        </div>

        {listing.category && (
          <p className="mb-2 flex items-center gap-2 text-sm text-slate-500">
            <Tag size={15} />
            {listing.category}
          </p>
        )}

        {listing.location && (
          <p className="mb-3 flex items-center gap-2 text-sm text-slate-500">
            <MapPin size={15} />
            {listing.location}
          </p>
        )}

        {listing.description && (
          <p className="mb-3 line-clamp-2 text-sm text-slate-600">
            {listing.description}
          </p>
        )}

        {requestMessage && (
          <p className="mb-3 text-sm text-green-700" role="status">
            {requestMessage}
          </p>
        )}

        {requestError && (
          <p className="mb-3 text-sm text-red-600" role="alert">
            {requestError}
          </p>
        )}

        {isOwner ? (
          <p className="rounded-lg bg-slate-50 px-3 py-2 text-center text-sm text-slate-500">
            Your listing
          </p>
        ) : (
          <button
            type="button"
            onClick={handleRequest}
            disabled={requesting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ShoppingCart size={17} />
            {requesting ? "Sending Request..." : "Request Resource"}
          </button>
        )}

        <button
          type="button"
          onClick={() => onToggleWishlist?.(listing.id)}
          className={`mt-2 w-full rounded-lg border px-3 py-2 text-sm font-medium transition ${
            isWishlisted
              ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
              : "border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-700"
          }`}
        >
          {isWishlisted
            ? "Remove from Wishlist"
            : "Add to Wishlist"}
        </button>
      </div>
    </article>
  );
}
