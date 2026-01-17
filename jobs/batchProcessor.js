import cron from "node-cron";
import videoProcessor from "../workers/videoProcessorWorker.js";
const videoprocessorScheduler = () => {
  cron.schedule("27 00 * * * ", async () => {
    console.log("Executando tarefa agendada às 08:01");
    videoProcessor();
  });
};

export default videoprocessorScheduler;
