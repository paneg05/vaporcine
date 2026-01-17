import crypto from "crypto";

/**
 * Gera cookies assinados para Google Cloud CDN
 * @param {string} urlPrefix - O prefixo autorizado (ex: https://cdn.seuapp.com/filmes/123/)
 * @param {string} keyName - Nome da chave criada no Cloud CDN
 * @param {string} base64Key - Valor da chave em Base64
 * @param {number} expirationTime - Unix timestamp (segundos)
 */
export function generateSignedCookies(
  urlPrefix,
  keyName,
  base64Key,
  expirationTime
) {
  const urlPrefixEncoded = Buffer.from(urlPrefix).toString("base64url");
  const inputToSign = `URLPrefix=${urlPrefixEncoded}:Expires=${expirationTime}:KeyName=${keyName}`;
  const key = Buffer.from(base64Key, "base64");
  const signature = crypto
    .createHmac("sha1", key)
    .update(inputToSign)
    .digest("base64url");
  return {
    "Cloud-CDN-Cookie-URLPrefix": urlPrefixEncoded,
    "Cloud-CDN-Cookie-Expires": expirationTime.toString(),
    "Cloud-CDN-Cookie-KeyName": keyName,
    "Cloud-CDN-Cookie-Signature": signature,
  };
}
