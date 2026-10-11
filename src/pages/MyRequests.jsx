
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ClipboardList,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  Search,
  MessageCircle,
} from "lucide-react";

import { useListings } from "../context/ListingContext";

const filters = ["All", "Pending", "Accepted", "Rejected"];

function formatDate(date) {
  if (!date) return "Date unavailable";

  const parsedDate = date?.toDate
    ? date.toDate()
    : new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const statusStyle = {
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Accepted: "bg-green-50 text-green-700 border-green-200",
  Rejected: "bg-red-50 text-red-700 border-red-200",
};

const statusIcon = {
  Pending: Clock,
  Accepted: CheckCircle,
  Rejected: XCircle,
};

function getStatus(request) {
  return (
    ["Pending", "Accepted", "Rejected"].find(
      (value) =>
        value.toLowerCase() ===
        (request.status || "Pending").toLowerCase()
    ) || "Pending"
  );
}

export default function MyRequests() {
  const {
    requests = [],
    currentUser,
    requestsLoading,
    requestsError,
    updateRequestStatus,
  } = useListings();

  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState("");

  const userId = currentUser?.uid;

  const filterRequests = (items) =>
    items.filter((request) => {
      const status = getStatus(request);
      const title = (
        request.resourceTitle || "Untitled Resource"
      ).toLowerCase();

      const matchesFilter =
        activeFilter === "All" || status === activeFilter;

      const matchesSearch = title.includes(
        search.trim().toLowerCase()
      );

      return matchesFilter && matchesSearch;
    });

  const myRequests = useMemo(() => {
    if (!userId) return [];

    return filterRequests(
      requests.filter((request) => request.requesterId === userId)
    );
  }, [requests, userId, activeFilter, search]);

  const incomingRequests = useMemo(() => {
    if (!userId) return [];

    return filterRequests(
      requests.filter((request) => request.ownerId === userId)
    );
  }, [requests, userId, activeFilter, search]);

  const allMadeCount = requests.filter(
    (request) => request.requesterId === userId
  ).length;

  const pendingIncomingCount = requests.filter(
    (request) =>
      request.ownerId === userId &&
      getStatus(request) === "Pending"
  ).length;

  async function handleResponse(requestId, status) {
    if (updatingId) return;

    setUpdatingId(requestId);
    setMessage("");
    setActionError("");

    try {
      await updateRequestStatus(requestId, status);
      setMessage(`Request ${status.toLowerCase()} successfully.`);
    } catch (error) {
      console.error("Could not update request:", error);
      setActionError(
        error.message || "Could not update the request."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  function renderRequestCard(request, incoming) {
    const status = getStatus(request);
    const StatusIcon = statusIcon[status];

    return (
      <article
        key={request.id}
        className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
            {request.imageUrl ? (
              <img
                src={request.imageUrl}
                alt={request.resourceTitle || "Resource"}
                className="h-full w-full object-cover"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <Package size={30} className="text-slate-400" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-slate-900">
                {request.resourceTitle || "Untitled Resource"}
              </h3>

              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyle[status]}`}
              >
                <StatusIcon size={13} />
                {status}
              </span>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              {request.resourceCategory || "Other"}
            </p>

            {request.price != null && (
              <p className="mt-2 font-semibold text-slate-900">
                {Number(request.price) === 0
                  ? "Free"
                  : `₹${request.price}`}
              </p>
            )}

            <p className="mt-2 text-xs text-slate-500">
              {incoming ? "Received" : "Requested"} on{" "}
              {formatDate(request.createdAt)}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {incoming
                ? "Buyer ID"
                : "Seller ID"}
              :{" "}
              {incoming
                ? request.requesterId
                : request.ownerId}
            </p>
          </div>
        </div>

        {incoming && status === "Pending" && (
          <div className="mt-4 flex flex-wrap gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              disabled={updatingId !== null}
              onClick={() => handleResponse(request.id, "Accepted")}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
            >
              {updatingId === request.id
                ? "Updating..."
                : "Accept Request"}
            </button>

            <button
              type="button"
              disabled={updatingId !== null}
              onClick={() => handleResponse(request.id, "Rejected")}
              className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
            >
              Reject
            </button>
          </div>
        )}

        {!incoming && status === "Pending" && (
          <p className="mt-4 border-t border-slate-100 pt-3 text-sm text-amber-700">
            <Clock size={15} className="mr-1 inline" />
            Waiting for the resource owner's response.
          </p>
        )}

        {!incoming && status === "Accepted" && (
          <div className="mt-4 border-t border-slate-100 pt-3">
            <p className="text-sm text-green-700">
              Your request was accepted.
            </p>
            <Link
              to="/messages"
              className="mt-3 inline-flex items-center gap-2 rounded-lg border border-blue-200 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
            >
              <MessageCircle size={16} />
              Messages
            </Link>
          </div>
        )}
      </article>
    );
  }

  function renderSection(title, items, incoming) {
    return (
      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-semibold text-slate-900">
            {title}
          </h2>
          <span className="text-sm text-slate-500">
            {items.length} found
          </span>
        </div>

        {items.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white px-5 py-10 text-center">
            <Package
              size={30}
              className="mx-auto text-slate-400"
            />
            <h3 className="mt-3 font-semibold text-slate-900">
              {search || activeFilter !== "All"
                ? "No matching requests"
                : incoming
                  ? "No incoming requests yet"
                  : "You haven't requested any resources"}
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              {incoming
                ? "New requests from students will appear here."
                : "Browse the marketplace to request a resource."}
            </p>

            {!incoming && (
              <Link
                to="/browse"
                className="mt-4 inline-flex rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Browse Resources
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((request) =>
              renderRequestCard(request, incoming)
            )}
          </div>
        )}
      </section>
    );
  }

  return (
    <div className="min-h-screen space-y-6">
      <div>
        <p className="text-sm text-blue-600">
          Campus Marketplace
        </p>

        <h1 className="mt-1 text-2xl font-bold text-slate-900">
          My Requests
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Track requests you've made and manage requests received
          for your resources.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            label: "Requests Made",
            value: allMadeCount,
            icon: ClipboardList,
            color: "bg-blue-50 text-blue-600",
          },
          {
            label: "Incoming Pending",
            value: pendingIncomingCount,
            icon: Clock,
            color: "bg-amber-50 text-amber-600",
          },
          {
            label: "All Requests",
            value: requests.length,
            icon: Package,
            color: "bg-green-50 text-green-600",
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  {item.label}
                </span>
                <span className={`rounded-lg p-2 ${item.color}`}>
                  <Icon size={19} />
                </span>
              </div>
              <p className="mt-3 text-2xl font-semibold text-slate-900">
                {item.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="relative">
          <Search
            size={19}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search requests by resource name..."
            className="w-full rounded-lg border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`rounded-lg border px-4 py-2 text-sm transition ${
                activeFilter === filter
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {message && (
        <p
          role="status"
          className="rounded-lg bg-green-50 p-3 text-sm text-green-700"
        >
          {message}
        </p>
      )}

      {actionError && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          {actionError}
        </p>
      )}

      {requestsError && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          {requestsError}
        </p>
      )}

      {requestsLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">
          Loading requests...
        </div>
      ) : (
        <>
          {renderSection(
            "Requests I've Made",
            myRequests,
            false
          )}

          {renderSection(
            "Requests Received",
            incomingRequests,
            true
          )}
        </>
      )}
    </div>
  );
}
