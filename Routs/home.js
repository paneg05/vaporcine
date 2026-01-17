const Home = async (app) => {
  app.get("/api/v1", async (request, reply) => {
    reply.send({ hello: "world" });
  });
};

export default Home;
