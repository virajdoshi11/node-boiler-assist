import admin from 'firebase-admin';
import serviceAccount from "./path/to/serviceAccountKey.json";

const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export async function closeFirebaseConnection() {
  try {
      // Delete the Firebase app instance
      await app.delete();
      console.log('Firebase app deleted.');
  } catch (error) {
      console.error('Error cleaning up Firebase:', error);
      throw error;
  }
}

export const fbAdmin = app;
export const db = admin.firestore();
export const auth = admin.auth();