import url from "url";
import UploadHandler from "../.././uploadHandler.js";
import { logger, pipelineAsync } from "../.././util.js";

async function uploadRoute(app, options) {
  app.options("/upload", options, async (request, reply) => {
    reply.header("Access-Control-Allow-Origin", "*");
    reply.header("Access-Control-Allow-Methods", "OPTIONS, POST");
    reply.send();
  });
  app.get("/upload", options, async (request, reply) => {
    reply.send("GET request to upload route!");
  });

  app.post("/upload", async (request, reply) => {
    const { headers } = request.raw;
    const {
      query: { socketId },
    } = url.parse(request.raw.url, true);
    const redirectTo = headers.origin;

    const uploadHandler = new UploadHandler(app.io, socketId);

    const onFinish = (reply, redirectTo) => () => {
      reply
        .code(303)
        .redirect(`${redirectTo}?msg=Files uploaded with success!`);
    };
    const busBoyInstance = uploadHandler.registerEvents(
      headers,
      onFinish(reply, redirectTo)
    );
    await pipelineAsync(request.raw, busBoyInstance);
    logger.info("request finished with success");
  });
}

export default uploadRoute;
