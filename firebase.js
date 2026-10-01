import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const privateKey = process.env.FIREBASE_PRIVATE_KEY
  ?.trim()
  .replace(/^['"]|['"]$/g, "")
  .replace(/\\+r\\+n/g, "\n")
  .replace(/\\+n/g, "\n")
  .replace(/\r\n/g, "\n");

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey,
};

// Evita inicializar varias veces
if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();

export default db;
