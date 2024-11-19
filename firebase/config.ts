import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCGm32G1k7YqVIJUR9Xt2wK4De5Rw8mMGY",
  authDomain: "talon-59a0c.firebaseapp.com",
  projectId: "talon-59a0c",
  storageBucket: "talon-59a0c.appspot.com",
  messagingSenderId: "864424270707",
  appId: "1:864424270707:web:dc6fe9642b3ecb04d0c306",
  measurementId: "G-417W6PRD43",
};

const app = initializeApp(firebaseConfig);
let firebase_app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, firebase_app };
