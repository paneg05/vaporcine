import { generateSignedCookies } from "../utils/generateSignedCookies.js";

/**
 * Rota para gerar cookies assinados para Cloud CDN
 * GET /get-access-token/:movieId
 * Query params: ?duration=3600 (opcional, segundos)
 */
async function getAccessTokenController(req, res) {
  // Ajuste para Fastify
  const movieId = req.params.movieId;
  const duration = parseInt(req.query.duration) || 7200; // padrão 2h
  const expiration = Math.floor(Date.now() / 1000) + duration;
  const urlPrefix = `http://34.8.161.128/processedFiles/${movieId}/`;
  const keyName = process.env.CDN_KEY_NAME || "minha-chave-cdn";
  const base64Key = process.env.CDN_BASE64_KEY || "SUA_CHAVE_BASE64";

  const cookies = generateSignedCookies(
    urlPrefix,
    keyName,
    base64Key,
    expiration
  );

  // Fastify: reply.setCookie
  Object.keys(cookies).forEach((name) => {
    res.setCookie(name, cookies[name], {
      // httpOnly removido para permitir envio pelo player
      secure: false, // true se HTTPS
      path: "/",
      domain: "34.8.161.128",
    });
  });

  res.send({ message: "Acesso autorizado" });
}

export default getAccessTokenController;
