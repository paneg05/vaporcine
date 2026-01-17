import app from "./config.js";
import connectDB from "./utils/db/dbConnector.js";
import videoprocessorScheduler from "./jobs/batchProcessor.js";

const start = async () => {
  try {
    videoprocessorScheduler();
    const port = process.env.PORT || 3000;
    await connectDB();
    await app.listen({ port });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};
start();
