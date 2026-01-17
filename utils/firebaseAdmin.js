import admin from "firebase-admin";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccountPath = path.join(
  __dirname,
  "..",
  "vaporcine-a823d-firebase-adminsdk-fbsvc-804e1c2704.json"
);

let serviceAccount;
try {
  serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
} catch (err) {
  console.error("Failed to read service account JSON at", serviceAccountPath);
  throw err;
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket:
    process.env.FIREBASE_STORAGE_BUCKET ||
    "vaporcine-a823d.firebasestorage.app",
});

export const bucket = admin.storage().bucket();
export const auth = admin.auth();
export default admin;
