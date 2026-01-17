import { bucket } from "../utils/firebaseAdmin.js";

async function main() {
  const filePath = "processedFiles/abacate/master.m3u8";
  try {
    const file = bucket.file(filePath);
    const [exists] = await file.exists();
    if (!exists) {
      console.error("File does not exist in bucket:", filePath);
      process.exitCode = 2;
      return;
    }
    const [url] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    console.log(url);
  } catch (err) {
    console.error("Failed to generate signed URL:", err.message || err);
    process.exitCode = 1;
  }
}

main();
