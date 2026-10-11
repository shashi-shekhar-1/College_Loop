import { useEffect, useState } from "react";
import { collection, doc, getDocs, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore";
import { AlertTriangle, LoaderCircle, ShieldCheck } from "lucide-react";
import { auth, db } from "../firebase";

export default function AdminReports() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [reports, setReports] = useState([]);
  const [selectedReportId, setSelectedReportId] = useState("");
  const [messages, setMessages] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [actionError, setActionError] = useState("");
  const [working, setWorking] = useState(false);

  useEffect(() => {
    let active = true;

    async function checkAdmin() {
      try {
        const token = await auth.currentUser?.getIdTokenResult();
        if (active) setIsAdmin(token?.claims.admin === true);
      } catch (error) {
        console.error("Could not verify admin access:", error);
        if (active) setActionError("Could not verify administrator access.");
      } finally {
        if (active) setCheckingAdmin(false);
      }
    }

    checkAdmin();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isAdmin) return undefined;

    const reportsQuery = query(
      collection(db, "reports"),
      orderBy("createdAt", "desc")
    );

    return onSnapshot(
      reportsQuery,
      (snapshot) => {
        const nextReports = snapshot.docs.map((item) => ({
          ...item.data(),
          id: item.id,
        }));
        setReports(nextReports);
        setLoadingReports(false);
        setActionError("");
      },
      (error) => {
        console.error("Could not load reports:", error);
        setActionError("Could not load reports. Check the admin Firestore rules.");
        setLoadingReports(false);
      }
    );
  }, [isAdmin]);

  const selectedReport = reports.find(
    (report) => report.id === selectedReportId
  );

  useEffect(() => {
    let active = true;

    async function loadMessages() {
      if (!isAdmin || !selectedReport?.conversationId) {
        setMessages([]);
        return;
      }

      setLoadingMessages(true);

      try {
        const messagesQuery = query(
          collection(
            db,
            "conversations",
            selectedReport.conversationId,
            "messages"
          ),
          orderBy("createdAt", "asc")
        );
        const snapshot = await getDocs(messagesQuery);
        if (active) {
          setMessages(
            snapshot.docs.map((item) => ({
              ...item.data(),
              id: item.id,
            }))
          );
        }
      } catch (error) {
        console.error("Could not load reported chat:", error);
        if (active) {
          setActionError("Could not load the reported conversation.");
          setMessages([]);
        }
      } finally {
        if (active) setLoadingMessages(false);
      }
    }

    loadMessages();
    return () => {
      active = false;
    };
  }, [isAdmin, selectedReport?.conversationId]);

  async function handleSuspend() {
    if (!selectedReport || working) return;

    const confirmed = window.confirm(
      `Suspend ${selectedReport.reportedUserName || "this user"}? They will no longer be able to sign in.`
    );
    if (!confirmed) return;

    setWorking(true);
    setActionError("");

    try {
      const { getFunctions, httpsCallable } = await import("firebase/functions");
      const suspendReportedUser = httpsCallable(
        getFunctions(),
        "suspendReportedUser"
      );
      await suspendReportedUser({ reportId: selectedReport.id });
    } catch (error) {
      console.error("Could not suspend reported user:", error);
      setActionError(
        error.message || "Could not suspend the reported account."
      );
    } finally {
      setWorking(false);
    }
  }

  async function handleMarkReviewed() {
    if (!selectedReport || working) return;

    setWorking(true);
    setActionError("");

    try {
      await updateDoc(doc(db, "reports", selectedReport.id), {
        status: "reviewed",
        reviewedBy: auth.currentUser.uid,
        reviewedAt: new Date(),
      });
    } catch (error) {
      console.error("Could not update report status:", error);
      setActionError("Could not mark this report as reviewed.");
    } finally {
      setWorking(false);
    }
  }

  if (checkingAdmin) {
    return (
      <div className="flex min-h-48 items-center justify-center text-slate-500">
        <LoaderCircle className="mr-2 animate-spin" size={18} />
        Checking administrator access...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
        Administrator access is required to view reports.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm text-blue-600">Campus Loop moderation</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">
          Conversation reports
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Review the reported chat before taking action on an account.
        </p>
      </header>

      {actionError && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {actionError}
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(260px,0.8fr)_minmax(0,1.2fr)]">
        <section className="space-y-3">
          <h2 className="font-semibold text-slate-900">Reports</h2>
          {loadingReports ? (
            <p className="rounded-xl border bg-white p-5 text-sm text-slate-500">
              Loading reports...
            </p>
          ) : reports.length === 0 ? (
            <p className="rounded-xl border bg-white p-5 text-sm text-slate-500">
              There are no conversation reports.
            </p>
          ) : (
            reports.map((report) => (
              <button
                key={report.id}
                type="button"
                onClick={() => {
                  setSelectedReportId(report.id);
                  setActionError("");
                }}
                className={`w-full rounded-xl border bg-white p-4 text-left ${
                  report.id === selectedReportId
                    ? "border-blue-500 ring-1 ring-blue-500"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-slate-900">
                    {report.reportedUserName || "Reported student"}
                  </span>
                  <span className="text-xs text-slate-500">
                    {report.status || "open"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {report.reason}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Reported by {report.reporterName || "Student"}
                </p>
              </button>
            ))
          )}
        </section>

        <section className="min-h-80 rounded-xl border border-slate-200 bg-white">
          {!selectedReport ? (
            <div className="flex h-full min-h-80 flex-col items-center justify-center p-6 text-center text-slate-500">
              <AlertTriangle size={28} />
              <p className="mt-3">Select a report to review its conversation.</p>
            </div>
          ) : (
            <>
              <div className="border-b border-slate-200 p-4">
                <h2 className="font-semibold text-slate-900">
                  {selectedReport.reporterName} reported{" "}
                  {selectedReport.reportedUserName}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Reason: {selectedReport.reason}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Conversation about {selectedReport.resourceTitle || "a resource"}
                </p>
              </div>

              <div className="max-h-[420px] space-y-3 overflow-y-auto p-4">
                {loadingMessages ? (
                  <p className="text-sm text-slate-500">Loading conversation...</p>
                ) : messages.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No messages were found for this conversation.
                  </p>
                ) : (
                  messages.map((message) => (
                    <article
                      key={message.id}
                      className="rounded-lg bg-slate-50 p-3"
                    >
                      <p className="text-xs font-medium text-slate-500">
                        {message.senderName ||
                          (message.senderId === selectedReport.reporterId
                            ? selectedReport.reporterName
                            : selectedReport.reportedUserName)}
                      </p>
                      <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-800">
                        {message.text}
                      </p>
                    </article>
                  ))
                )}
              </div>

              <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 p-4">
                {selectedReport.status !== "actioned" && (
                  <button
                    type="button"
                    disabled={working}
                    onClick={handleSuspend}
                    className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
                  >
                    <AlertTriangle size={16} />
                    {working ? "Working..." : "Suspend account"}
                  </button>
                )}
                {selectedReport.status === "open" && (
                  <button
                    type="button"
                    disabled={working}
                    onClick={handleMarkReviewed}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                  >
                    <ShieldCheck size={16} />
                    Mark reviewed
                  </button>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
