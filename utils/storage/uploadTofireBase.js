import { bucket } from "../firebaseAdmin.js";
import mime from "mime-types";
import fs from "fs";

export async function uploadFile(
  localPath,
  destinationPath,
  { makePublic = false, retries = 3 } = {}
) {
  const contentType = mime.lookup(localPath) || "application/octet-stream";

  function sleep(ms) {
    return new Promise((res) => setTimeout(res, ms));
  }

  let attempt = 0;
  while (true) {
    try {
      await bucket.upload(localPath, {
        destination: destinationPath,
        metadata: {
          contentType,
        },
        resumable: true,
        validation: false,
      });

      const file = bucket.file(destinationPath);
      if (makePublic) {
        await file.makePublic();
        return `https://storage.googleapis.com/${bucket.name}/${encodeURI(
          destinationPath
        )}`;
      } else {
        const [url] = await file.getSignedUrl({
          action: "read",
          expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
        });
        return url;
      }
    } catch (err) {
      attempt += 1;
      if (attempt > retries) throw err;
      const delay =
        Math.min(1000 * 2 ** attempt, 30000) + Math.floor(Math.random() * 1000);
      await sleep(delay);
    }
  }
}

function listFilesRecursively(localDir, remotePrefix) {
  const files = [];
  const entries = fs.readdirSync(localDir, { withFileTypes: true });
  for (const entry of entries) {
    const localPath = pathJoin(localDir, entry.name);
    const destPath = `${remotePrefix}/${entry.name}`;
    if (entry.isDirectory()) {
      files.push(...listFilesRecursively(localPath, destPath));
    } else if (entry.isFile()) {
      files.push({ localPath, destPath });
    }
  }
  return files;
}

export async function uploadFolder(localDir, remotePrefix, opts = {}) {
  const concurrency =
    typeof opts.concurrency === "number" ? opts.concurrency : 6;
  const retries = typeof opts.retries === "number" ? opts.retries : 3;
  const makePublic = !!opts.makePublic;

  const files = listFilesRecursively(localDir, remotePrefix);
  const results = [];

  let idx = 0;

  async function worker() {
    while (true) {
      const i = idx;
      idx += 1;
      if (i >= files.length) return;
      const f = files[i];
      try {
        const url = await uploadFile(f.localPath, f.destPath, {
          makePublic,
          retries,
        });
        results.push({ file: f.destPath, url });
      } catch (err) {
        results.push({ file: f.destPath, error: err.message || String(err) });
      }
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, files.length) },
    () => worker()
  );
  await Promise.all(workers);
  return results;
}

function pathJoin(a, b) {
  return `${a.replace(/\\\\/g, "/").replace(/\/$/, "")}/${b}`;
}
