// src/firebase/config.js
// ─────────────────────────────────────────────────────────────
// Replace the placeholder values below with your own Firebase
// project credentials (Firebase Console → Project Settings → Your Apps).
// ─────────────────────────────────────────────────────────────

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Values come from .env file locally, or Vercel Environment Variables in production.
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const db   = getFirestore(app); // Firestore database
export const auth = getAuth(app);      // Firebase Auth (for anonymous sign-in)

export default app;
