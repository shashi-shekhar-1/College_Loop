import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyADk2x2zSzefarAwgxt5-o9DNDJT2HxfDY",
  authDomain: "college-loop-38f0e.firebaseapp.com",
  projectId: "college-loop-38f0e",
  storageBucket: "college-loop-38f0e.firebasestorage.app",
  messagingSenderId: "405433947205",
  appId: "1:405433947205:web:bd9a592b9cdc48044f7f2c",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;