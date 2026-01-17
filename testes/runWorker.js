import dotenv from "dotenv";
import connectDB from "../utils/db/dbConnector.js";
import videoProcessor from "../workers/videoProcessorWorker.js";

dotenv.config();

// Skip heavy transcode and packaging when running this test.
process.env.SKIP_TRANSCODE = process.env.SKIP_TRANSCODE || "true";

const run = async () => {
  try {
    console.log("Starting manual worker run");
    if (!process.env.DB_URL) {
      console.error(
        "DB_URL is not set. Set it in .env or pass it in the environment."
      );
      process.exit(1);
    }

    await connectDB();
    await videoProcessor();
    console.log("Worker finished");
    process.exit(0);
  } catch (err) {
    console.error("Error running worker:", err);
    process.exit(1);
  }
};

run();
