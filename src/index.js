import http from "http";
import { Server } from "socket.io";
import Routes from "./routs.js";
import { logger } from "./util.js";
import uploadRoute from "./Routs/uploadRout/uploadRout.js";
import fastify from "fastify";
import { setupSockets } from "./sockets.js";
import multipart from "@fastify/multipart";

const port = 8080;

const app = fastify({
  logger: true,
  ignoreTrailingSlash: true,
});
app.register(multipart);
app.register(uploadRoute, { prefix: "/api" });

const socket = setupSockets(app.server);
app.decorate("io", socket);
app.ready((err) => {
  if (err) {
    app.log.error(err);
    console.log(app.printRoutes());
    process.exit(1);
  }

  /*const interval = setInterval(() => {
  io.emit(`file-uploaded`, 5e6);
}, 250);
*/

  const startServer = () => {
    console.log(`Server is running on port ${port}`);
  };

  app.listen({ port, host: "0.0.0.0" }, (err) => {
    if (err) {
      app.log.error(err);
      process.exit(1);
    }
    console.log(`🚀 Servidor rodando em http://localhost:${port}`);
  });
});

const handler = function (request, response) {
  const defaultRoute = async (request, response) => response.end("hello!");

  const routes = new Routes(io);
  const chosen = routes[request.method.toLowerCase()] || defaultRoute;

  return chosen.apply(routes, [request, response]);
};
