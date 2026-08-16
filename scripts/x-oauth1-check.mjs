import "dotenv/config";
import crypto from "node:crypto";

const enc = (value) =>
  encodeURIComponent(value).replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);

function createOAuth1Header(method, url) {
  const oauthParams = {
    oauth_consumer_key: process.env.X_API_KEY ?? "",
    oauth_nonce: crypto.randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: process.env.X_ACCESS_TOKEN ?? "",
    oauth_version: "1.0",
  };

  const parameterString = Object.entries(oauthParams)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${enc(key)}=${enc(value)}`)
    .join("&");
  const signatureBase = [method.toUpperCase(), enc(url), enc(parameterString)].join("&");
  const signingKey = `${enc(process.env.X_API_SECRET ?? "")}&${enc(process.env.X_ACCESS_TOKEN_SECRET ?? "")}`;

  oauthParams.oauth_signature = crypto.createHmac("sha1", signingKey).update(signatureBase).digest("base64");

  return `OAuth ${Object.entries(oauthParams)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${enc(key)}="${enc(value)}"`)
    .join(", ")}`;
}

const url = process.argv[2] ?? "https://api.x.com/2/users/me";
const response = await fetch(url, {
  headers: {
    Authorization: createOAuth1Header("GET", url),
  },
});
const body = await response.text();

console.log(JSON.stringify({ status: response.status, body: body.slice(0, 500) }, null, 2));

if (!response.ok) {
  process.exit(1);
}
