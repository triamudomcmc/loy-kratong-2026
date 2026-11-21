import "server-only";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function getApp() {
  const existing = getApps()[0];
  if (existing) return existing;

  return initializeApp({
    credential: cert({
      projectId: process.env.FCERT_PROJECT_ID,
      privateKey: process.env.FCERT_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      clientEmail: process.env.FCERT_CLIENT_EMAIL,
    }),
  });
}

/** Lazily initialised Firestore instance (safe to call many times). */
export function getDb() {
  return getFirestore(getApp());
}
