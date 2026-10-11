
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { onAuthStateChanged } from "firebase/auth";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import { auth, db } from "../firebase";

const ListingContext = createContext(null);

function readStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

export function ListingProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  // Listings
  const [listings, setListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [listingsError, setListingsError] = useState("");

  // Wishlist
  const [wishlistIds, setWishlistIds] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(true);
  const [wishlistError, setWishlistError] = useState("");

  // Purchase requests
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestsError, setRequestsError] = useState("");

  // Authentication and Firestore listeners
  useEffect(() => {
    let unsubscribeListings = () => {};
    let unsubscribeWishlist = () => {};
    let unsubscribeBuyerRequests = () => {};
    let unsubscribeSellerRequests = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      unsubscribeListings();
      unsubscribeWishlist();
      unsubscribeBuyerRequests();
      unsubscribeSellerRequests();

      setCurrentUser(user);
      setListings([]);
      setWishlistIds([]);
      setRequests([]);

      setListingsError("");
      setWishlistError("");
      setRequestsError("");

      if (!user) {
        setListingsLoading(false);
        setWishlistLoading(false);
        setRequestsLoading(false);
        return;
      }

      setListingsLoading(true);
      setWishlistLoading(true);
      setRequestsLoading(true);

      // Listen to all marketplace listings.
      const listingsQuery = query(
        collection(db, "listings"),
        orderBy("createdAt", "desc")
      );

      unsubscribeListings = onSnapshot(
        listingsQuery,
        (snapshot) => {
          setListings(
            snapshot.docs.map((item) => ({
              ...item.data(),
              id: item.id,
            }))
          );

          setListingsLoading(false);
        },
        (error) => {
          console.error("Error loading listings:", error);
          setListingsError(
            "Could not load resources. Please try again."
          );
          setListingsLoading(false);
        }
      );

      // Listen to the current user's wishlist.
      const wishlistRef = doc(db, "users", user.uid);

      unsubscribeWishlist = onSnapshot(
        wishlistRef,
        async (snapshot) => {
          const data = snapshot.exists()
            ? snapshot.data()
            : {};

          const savedIds = Array.isArray(data.wishlistIds)
            ? data.wishlistIds.map(String)
            : [];

          if (
            !snapshot.exists() ||
            !Array.isArray(data.wishlistIds)
          ) {
            const oldIds = readStorage(
              "campus-loop-wishlist",
              []
            )
              .filter(
                (id) =>
                  typeof id === "string" ||
                  typeof id === "number"
              )
              .map(String);

            try {
              await setDoc(
                wishlistRef,
                {
                  wishlistIds: [
                    ...new Set([...savedIds, ...oldIds]),
                  ],
                },
                { merge: true }
              );

              localStorage.removeItem(
                "campus-loop-wishlist"
              );
            } catch (error) {
              console.error(
                "Could not migrate wishlist:",
                error
              );

              setWishlistError(
                "Could not migrate your saved resources."
              );
            }
          } else {
            setWishlistIds(savedIds);

            localStorage.removeItem(
              "campus-loop-wishlist"
            );
          }

          setWishlistLoading(false);
        },
        (error) => {
          console.error("Error loading wishlist:", error);

          setWishlistError(
            "Could not load your wishlist. Check your Firestore rules."
          );

          setWishlistLoading(false);
        }
      );

      // Keep requests made by the current user.
      const buyerRequestsQuery = query(
        collection(db, "requests"),
        where("requesterId", "==", user.uid)
      );

      // Keep requests received by the current user as seller.
      const sellerRequestsQuery = query(
        collection(db, "requests"),
        where("ownerId", "==", user.uid)
      );

      let buyerRequests = [];
      let sellerRequests = [];
      let buyerReady = false;
      let sellerReady = false;

      function mergeRequests() {
        const uniqueRequests = new Map();

        [...buyerRequests, ...sellerRequests].forEach(
          (request) => {
            uniqueRequests.set(request.id, request);
          }
        );

        const combinedRequests = [
          ...uniqueRequests.values(),
        ].sort((a, b) => {
          const dateA = a.createdAt?.toMillis?.() || 0;
          const dateB = b.createdAt?.toMillis?.() || 0;

          return dateB - dateA;
        });

        setRequests(combinedRequests);

        if (buyerReady && sellerReady) {
          setRequestsLoading(false);
        }
      }

      unsubscribeBuyerRequests = onSnapshot(
        buyerRequestsQuery,
        (snapshot) => {
          buyerRequests = snapshot.docs.map((item) => ({
            ...item.data(),
            id: item.id,
          }));

          buyerReady = true;
          mergeRequests();
        },
        (error) => {
          console.error(
            "Error loading buyer requests:",
            error
          );

          setRequestsError(
            "Could not load requests you have made. Check your Firestore rules."
          );

          buyerReady = true;
          setRequestsLoading(false);
        }
      );

      unsubscribeSellerRequests = onSnapshot(
        sellerRequestsQuery,
        (snapshot) => {
          sellerRequests = snapshot.docs.map((item) => ({
            ...item.data(),
            id: item.id,
          }));

          sellerReady = true;
          mergeRequests();
        },
        (error) => {
          console.error(
            "Error loading seller requests:",
            error
          );

          setRequestsError(
            "Could not load incoming requests. Check your Firestore rules."
          );

          sellerReady = true;
          setRequestsLoading(false);
        }
      );
    });

    return () => {
      unsubscribeAuth();
      unsubscribeListings();
      unsubscribeWishlist();
      unsubscribeBuyerRequests();
      unsubscribeSellerRequests();
    };
  }, []);

  // Create a listing.
  async function addListing(resource) {
    const user = auth.currentUser;

    if (!user) {
      throw new Error(
        "Please log in before publishing a resource."
      );
    }

    const listingData = {
      ...resource,
      ownerId: user.uid,
      createdAt: serverTimestamp(),
    };

    const documentRef = await addDoc(
      collection(db, "listings"),
      listingData
    );

    return {
      ...resource,
      ownerId: user.uid,
      id: documentRef.id,
    };
  }

  // Edit a listing owned by the current user.
  async function updateListing(resourceId, updatedResource) {
    const user = auth.currentUser;

    if (!user) {
      throw new Error(
        "Please log in before editing a resource."
      );
    }

    const existingListing = listings.find(
      (item) => item.id === String(resourceId)
    );

    if (!existingListing) {
      throw new Error("Listing not found.");
    }

    if (existingListing.ownerId !== user.uid) {
      throw new Error(
        "You can only edit your own listings."
      );
    }

    const {
      ownerId,
      createdAt,
      id,
      ...safeResource
    } = updatedResource;

    await updateDoc(
      doc(db, "listings", String(resourceId)),
      safeResource
    );
  }

  // Delete a listing.
  async function deleteListing(resourceId) {
    const user = auth.currentUser;

    if (!user) {
      throw new Error("Please log in first.");
    }

    const id = String(resourceId);

    const existingListing = listings.find(
      (item) => item.id === id
    );

    if (!existingListing) {
      throw new Error("Listing not found.");
    }

    if (existingListing.ownerId !== user.uid) {
      throw new Error(
        "You can only delete your own listings."
      );
    }

    await deleteDoc(doc(db, "listings", id));

    const nextWishlistIds = wishlistIds.filter(
      (savedId) => savedId !== id
    );

    await setDoc(
      doc(db, "users", user.uid),
      { wishlistIds: nextWishlistIds },
      { merge: true }
    );
  }

  // Add or remove a resource from the wishlist.
  async function toggleWishlist(resourceId) {
    const user = auth.currentUser;

    if (!user) {
      throw new Error(
        "Please log in to manage your wishlist."
      );
    }

    const id = String(resourceId);

    const nextIds = wishlistIds.includes(id)
      ? wishlistIds.filter((savedId) => savedId !== id)
      : [...wishlistIds, id];

    await setDoc(
      doc(db, "users", user.uid),
      { wishlistIds: nextIds },
      { merge: true }
    );
  }

  function isWishlisted(resourceId) {
    return wishlistIds.includes(String(resourceId));
  }

  // Create a purchase/resource request.

  // Create a purchase/resource request.
 
  // Create a purchase/resource request.
  async function createRequest(resourceId) {
    const user = auth.currentUser;

    if (!user) {
      throw new Error("Please log in to request a resource.");
    }

    const listingRef = doc(db, "listings", String(resourceId));
    const requestRef = doc(collection(db, "requests"));

    await runTransaction(db, async (transaction) => {
      const listingSnapshot = await transaction.get(listingRef);

      if (!listingSnapshot.exists()) {
        throw new Error("This resource is no longer available.");
      }

      const listing = listingSnapshot.data();

      if (listing.ownerId === user.uid) {
        throw new Error("You cannot request your own resource.");
      }

      transaction.set(requestRef, {
        resourceId: String(resourceId),
        resourceTitle: listing.title || listing.name || "Untitled resource",
        resourceCategory: listing.category || "Other",
        price: listing.price ?? null,
        imageUrl: listing.imageUrl || listing.image || "",
        requesterId: user.uid,
        requesterName:
          user.displayName || user.email?.split("@")[0] || "Student",
        ownerId: listing.ownerId,
        ownerName: listing.sellerName || "Seller",
        status: "Pending",
        createdAt: serverTimestamp(),
      });
    });

    return requestRef.id;
  }



  // Seller accepts or rejects a pending request.
  
  // Seller accepts or rejects a request.
  // Accepting also creates a private conversation.
  async function updateRequestStatus(requestId, status) {
    const user = auth.currentUser;

    if (!user) {
      throw new Error("Please log in first.");
    }

    if (!["Accepted", "Rejected"].includes(status)) {
      throw new Error("Invalid request status.");
    }

    const requestRef = doc(db, "requests", String(requestId));
    const conversationRef = doc(
      db,
      "conversations",
      `request_${requestId}`
    );

    await runTransaction(db, async (transaction) => {
      const requestSnapshot = await transaction.get(requestRef);

      if (!requestSnapshot.exists()) {
        throw new Error("Request not found.");
      }

      const request = requestSnapshot.data();

      if (request.ownerId !== user.uid) {
        throw new Error("Only the resource owner can respond.");
      }

      if (request.status !== "Pending") {
        throw new Error("This request has already been handled.");
      }

      if (status === "Accepted") {
        const conversationSnapshot = await transaction.get(
          conversationRef
        );

        if (!conversationSnapshot.exists()) {
          transaction.set(conversationRef, {
            requestId: String(requestId),
            resourceId: request.resourceId,
            resourceTitle: request.resourceTitle || "Resource",

            buyerId: request.requesterId,
            sellerId: request.ownerId,

            buyerName: request.requesterName || "Buyer",
            sellerName:
              user.displayName ||
              user.email?.split("@")[0] ||
              request.ownerName ||
              "Seller",

            participants: [request.requesterId, request.ownerId],

            lastMessage: "",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      }

      transaction.update(requestRef, { status });
    });
  }


  return (
    <ListingContext.Provider
      value={{
        currentUser,

        // Listings
        listings,
        addListing,
        updateListing,
        deleteListing,
        listingsLoading,
        listingsError,

        // Wishlist
        wishlistIds,
        toggleWishlist,
        isWishlisted,
        wishlistLoading,
        wishlistError,

        // Purchase requests
        requests,
        requestsLoading,
        requestsError,
        createRequest,
        updateRequestStatus,
      }}
    >
      {children}
    </ListingContext.Provider>
  );
}

export function useListings() {
  const context = useContext(ListingContext);

  if (!context) {
    throw new Error(
      "useListings must be used inside ListingProvider"
    );
  }

  return context;
}
