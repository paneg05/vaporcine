import getAccessTokenController from "../controllers/getAccessTokenController.js";

function accessTokenRout(fastify, opts, done) {
  fastify.get("/get-access-token/:movieId", getAccessTokenController);
  done();
}

export default accessTokenRout;
