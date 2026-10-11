const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { FieldValue, getFirestore } = require("firebase-admin/firestore");
const { HttpsError, onCall } = require("firebase-functions/v2/https");

initializeApp();

const db = getFirestore();

exports.suspendReportedUser = onCall(async (request) => {
  if (!request.auth || request.auth.token.admin !== true) {
    throw new HttpsError(
      "permission-denied",
      "Administrator access is required."
    );
  }

  const reportId = request.data?.reportId;
  if (typeof reportId !== "string" || !reportId) {
    throw new HttpsError("invalid-argument", "A report ID is required.");
  }

  const reportRef = db.collection("reports").doc(reportId);
  const reportSnapshot = await reportRef.get();

  if (!reportSnapshot.exists) {
    throw new HttpsError("not-found", "The report could not be found.");
  }

  const report = reportSnapshot.data();
  if (!["open", "reviewed"].includes(report.status) || !report.reportedUserId) {
    throw new HttpsError(
      "failed-precondition",
      "Only open reports can be actioned."
    );
  }

  if (report.reportedUserId === request.auth.uid) {
    throw new HttpsError(
      "failed-precondition",
      "An administrator cannot suspend their own account through a report."
    );
  }

  await getAuth().updateUser(report.reportedUserId, { disabled: true });
  await getAuth().revokeRefreshTokens(report.reportedUserId);

  await db.runTransaction(async (transaction) => {
    const latestReport = await transaction.get(reportRef);
    if (
      !latestReport.exists ||
      !["open", "reviewed"].includes(latestReport.data().status)
    ) {
      throw new HttpsError(
        "failed-precondition",
        "This report has already been reviewed."
      );
    }

    transaction.set(
      db.collection("users").doc(report.reportedUserId),
      { moderationStatus: "suspended" },
      { merge: true }
    );

    transaction.update(reportRef, {
      status: "actioned",
      action: "account-suspended",
      reviewedBy: request.auth.uid,
      reviewedAt: FieldValue.serverTimestamp(),
      actionAt: FieldValue.serverTimestamp(),
    });
  });

  return { success: true };
});
