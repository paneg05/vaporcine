import pino from "pino";
import { promisify } from "util";
import { pipeline } from "stream";
const logger = pino({
  prettyPrint: {
    ignore: "pid,hostname",
  },
});
const pipelineAsync = promisify(pipeline);

export { logger, pipelineAsync, promisify };
