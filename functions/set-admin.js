const { applicationDefault, initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

initializeApp({
  credential: applicationDefault(),
  projectId: "college-loop-38f0e",
});

async function setAdmin(uid) {
  if (!uid) {
    throw new Error("Pass the Firebase Auth user UID as the first argument.");
  }

  const auth = getAuth();
  const user = await auth.getUser(uid);
  await auth.setCustomUserClaims(uid, {
    ...user.customClaims,
    admin: true,
  });

  console.log(`Admin access enabled for ${uid}. Sign out and back in to refresh claims.`);
}

setAdmin(process.argv[2]).catch((error) => {
  console.error("Could not grant admin access:", error);
  process.exitCode = 1;
});
