
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";
import {
  MessageCircle,
  Send,
  Package,
  ArrowLeft,
  LoaderCircle,
} from "lucide-react";

import { auth, db } from "../firebase";

export default function Messages() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  // Identify the currently signed-in student.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  // Load only conversations involving the current student.
  useEffect(() => {
    if (!user) {
      setConversations([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const conversationsQuery = query(
      collection(db, "conversations"),
      where("participants", "array-contains", user.uid)
    );

    const unsubscribe = onSnapshot(
      conversationsQuery,
      (snapshot) => {
        const data = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        data.sort((a, b) => {
          const timeA = a.updatedAt?.toMillis?.() || 0;
          const timeB = b.updatedAt?.toMillis?.() || 0;
          return timeB - timeA;
        });

        setConversations(data);
        setLoading(false);
        setError("");
      },
      (err) => {
        console.error("Conversation error:", err);
        setError("Unable to load conversations.");
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  // Select the first conversation if none is selected.
  useEffect(() => {
    if (!conversations.length) {
      setSelectedId(null);
      return;
    }

    const selectedExists = conversations.some(
      (conversation) => conversation.id === selectedId
    );

    if (!selectedExists) {
      setSelectedId(conversations[0].id);
    }
  }, [conversations, selectedId]);

  const selectedConversation = conversations.find(
    (conversation) => conversation.id === selectedId
  );

  const otherStudent = selectedConversation
    ? selectedConversation.buyerId === user?.uid
      ? selectedConversation.sellerName || "Seller"
      : selectedConversation.buyerName || "Buyer"
    : "";

  // Listen for new messages in the selected conversation.
  useEffect(() => {
    if (!user || !selectedId || !selectedConversation) {
      setMessages([]);
      return;
    }

    setMessages([]);

    const messagesQuery = query(
      collection(db, "conversations", selectedId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        setMessages(
          snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data(),
          }))
        );
      },
      (err) => {
        console.error("Message error:", err);
        setError("Unable to load messages.");
      }
    );

    return unsubscribe;
  }, [user, selectedId, selectedConversation]);

  async function handleSend(event) {
    event.preventDefault();

    const text = messageText.trim();

    if (!text || !user || !selectedConversation || sending) {
      return;
    }

    if (text.length > 4000) {
      setError("Messages cannot exceed 4000 characters.");
      return;
    }

    setSending(true);
    setError("");

    try {
      // Firestore Security Rules must verify that the sender
      // is a participant in this conversation.
      await addDoc(
        collection(
          db,
          "conversations",
          selectedConversation.id,
          "messages"
        ),
        {
          senderId: user.uid,
          text,
          createdAt: serverTimestamp(),
        }
      );

      await updateDoc(
        doc(db, "conversations", selectedConversation.id),
        {
          lastMessage: text,
          updatedAt: serverTimestamp(),
        }
      );

      setMessageText("");
    } catch (err) {
      console.error("Send message error:", err);
      setError("Message could not be sent. Please try again.");
    } finally {
      setSending(false);
    }
  }

  function formatTime(timestamp) {
    if (!timestamp?.toDate) return "";

    return timestamp.toDate().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoaderCircle className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
        <MessageCircle className="mx-auto text-blue-600" size={36} />
        <h1 className="mt-4 text-xl font-semibold">Messages</h1>
        <p className="mt-2 text-sm text-slate-500">
          Sign in to view your private conversations.
        </p>
        <Link
          to="/login"
          className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-white"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-blue-600">Campus Marketplace</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">
          Messages
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Chat privately with students about their resources.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <div className="grid min-h-[540px] overflow-hidden rounded-xl border border-slate-200 bg-white md:grid-cols-[280px_minmax(0,1fr)]">
        {/* Conversation list */}
        <aside
          className={`border-r border-slate-200 ${
            selectedId ? "hidden md:block" : "block"
          }`}
        >
          <div className="border-b border-slate-200 p-4">
            <h2 className="font-semibold text-slate-900">
              Your conversations
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Only your conversations appear here.
            </p>
          </div>

          {loading ? (
            <div className="p-6 text-center text-sm text-slate-500">
              Loading conversations...
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-5 text-center">
              <MessageCircle
                size={30}
                className="mx-auto text-slate-300"
              />
              <p className="mt-3 text-sm font-medium text-slate-700">
                No conversations yet
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Purchase a resource to start chatting with its seller.
              </p>
              <Link
                to="/browse"
                className="mt-4 inline-block text-sm font-medium text-blue-600"
              >
                Browse resources
              </Link>
            </div>
          ) : (
            <div className="max-h-[540px] overflow-y-auto">
              {conversations.map((conversation) => {
                const name =
                  conversation.buyerId === user.uid
                    ? conversation.sellerName || "Seller"
                    : conversation.buyerName || "Buyer";

                return (
                  <button
                    key={conversation.id}
                    onClick={() => {
                      setSelectedId(conversation.id);
                      setError("");
                    }}
                    className={`w-full border-b border-slate-100 p-4 text-left hover:bg-slate-50 ${
                      selectedId === conversation.id
                        ? "bg-blue-50"
                        : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                        {name.charAt(0).toUpperCase()}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {name}
                        </p>
                        <p className="mt-1 truncate text-xs text-slate-500">
                          {conversation.resourceTitle || "Resource"}
                        </p>
                        <p className="mt-1 truncate text-xs text-slate-400">
                          {conversation.lastMessage || "Start a conversation"}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        {/* Selected conversation */}
        <section
          className={`min-w-0 flex-col ${
            selectedId ? "flex" : "hidden md:flex"
          }`}
        >
          {selectedConversation ? (
            <>
              <header className="flex items-center gap-3 border-b border-slate-200 p-4">
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="text-slate-500 md:hidden"
                  aria-label="Back to conversations"
                >
                  <ArrowLeft size={20} />
                </button>

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                  {otherStudent.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-semibold text-slate-900">
                    {otherStudent}
                  </h2>
                  <p className="truncate text-xs text-slate-500">
                    {selectedConversation.resourceTitle || "Resource"}
                  </p>
                </div>

                <Package size={20} className="text-slate-400" />
              </header>

              <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-600">
                  <span className="font-medium">About:</span>{" "}
                  {selectedConversation.resourceTitle || "Resource"}
                </p>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto p-4">
                {messages.length === 0 ? (
                  <div className="flex h-full min-h-48 flex-col items-center justify-center text-center">
                    <MessageCircle
                      size={32}
                      className="text-slate-300"
                    />
                    <p className="mt-3 text-sm font-medium text-slate-700">
                      Start the conversation
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Ask about availability, condition or pickup.
                    </p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isMine = message.senderId === user.uid;

                    return (
                      <div
                        key={message.id}
                        className={`flex ${
                          isMine ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                            isMine
                              ? "rounded-br-sm bg-blue-600 text-white"
                              : "rounded-bl-sm bg-slate-100 text-slate-900"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words text-sm">
                            {message.text}
                          </p>
                          <p
                            className={`mt-1 text-right text-[10px] ${
                              isMine
                                ? "text-blue-100"
                                : "text-slate-400"
                            }`}
                          >
                            {formatTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <form
                onSubmit={handleSend}
                className="flex items-end gap-2 border-t border-slate-200 p-3"
              >
                <textarea
                  value={messageText}
                  onChange={(event) => setMessageText(event.target.value)}
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" &&
                      !event.shiftKey &&
                      !event.nativeEvent.isComposing
                    ) {
                      event.preventDefault();
                      event.currentTarget.form?.requestSubmit();
                    }
                  }}
                  maxLength={4000}
                  rows={1}
                  placeholder="Write a message..."
                  aria-label="Write a message"
                  className="max-h-32 min-h-11 flex-1 resize-y rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500"
                />

                <button
                  type="submit"
                  disabled={!messageText.trim() || sending}
                  aria-label="Send message"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sending ? (
                    <LoaderCircle size={18} className="animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
              <MessageCircle size={44} className="text-slate-300" />
              <h2 className="mt-4 font-semibold text-slate-900">
                Your messages
              </h2>
              <p className="mt-2 max-w-sm text-sm text-slate-500">
                Select a conversation or browse resources to contact a seller.
              </p>
              <Link
                to="/browse"
                className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Browse Resources
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
