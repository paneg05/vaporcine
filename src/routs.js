import url from "url";
import UploadHandler from "./uploadHandler.js";
import { logger, pipelineAsync } from "./util.js";
class Routes {
  #io;
  constructor(io) {
    this.#io = io;
  }

  async options(req, res) {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS, POST",
    });
    res.end();
  }

  async post(req, res) {
    console.log("post request received");
    const { headers } = req;
    const {
      query: { socketId },
    } = url.parse(req.url, true);
    const redirectTo = headers.origin;
    console.log("redirectTo", redirectTo);
    const uploadHandler = new UploadHandler(this.#io, socketId);

    const onFinish = (res, redirectTo) => () => {
      res.writeHead(303, {
        Connection: "close",
        Location: `${redirectTo}?msg=Files uploaded with success!`,
      });
      res.end();
    };
    const busBoyInstance = uploadHandler.registerEvents(
      headers,
      onFinish(res, redirectTo)
    );
    await pipelineAsync(req, busBoyInstance);
    logger.info("request finished with success");
  }
}

export default Routes;
