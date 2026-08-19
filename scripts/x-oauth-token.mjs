import crypto from "node:crypto";
import http from "node:http";
import fs from "node:fs";

const envPath = new URL("../.env", import.meta.url);

function readEnv(name) {
  const envText = fs.readFileSync(envPath, "utf8");
  const match = envText.match(new RegExp(`^${name}=(.*)$`, "m"));
  return match?.[1]?.trim() ?? "";
}

function updateEnv(name, value) {
  const envText = fs.readFileSync(envPath, "utf8");
  const escaped = value.replace(/\r?\n/g, "");
  const pattern = new RegExp(`^${name}=.*$`, "m");
  const next = pattern.test(envText)
    ? envText.replace(pattern, `${name}=${escaped}`)
    : `${envText.trimEnd()}\n${name}=${escaped}\n`;
  fs.writeFileSync(envPath, next);
}

function base64Url(buffer) {
  return buffer.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

const clientId = readEnv("X_CLIENT_ID");
const clientSecret = readEnv("X_CLIENT_SECRET");
const redirectUri = readEnv("X_REDIRECT_URI") || "http://localhost:8080/callback";

if (!clientId || !clientSecret) {
  throw new Error("Missing X_CLIENT_ID or X_CLIENT_SECRET in .env");
}

const verifier = base64Url(crypto.randomBytes(32));
const challenge = base64Url(crypto.createHash("sha256").update(verifier).digest());
const state = base64Url(crypto.randomBytes(16));
const scope = "tweet.read tweet.write users.read media.write offline.access";

const tokenUrls = [
  "https://api.x.com/2/oauth2/token",
  "https://api.twitter.com/2/oauth2/token",
];

const authUrl = new URL("https://x.com/i/oauth2/authorize");
authUrl.searchParams.set("response_type", "code");
authUrl.searchParams.set("client_id", clientId);
authUrl.searchParams.set("redirect_uri", redirectUri);
authUrl.searchParams.set("scope", scope);
authUrl.searchParams.set("state", state);
authUrl.searchParams.set("code_challenge", challenge);
authUrl.searchParams.set("code_challenge_method", "S256");

async function exchangeCodeForToken(body) {
  const attempts = [];
  const basicRaw = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const basicEncoded = Buffer.from(`${encodeURIComponent(clientId)}:${encodeURIComponent(clientSecret)}`).toString("base64");

  for (const tokenUrl of tokenUrls) {
    attempts.push({
      name: `confidential raw Basic via ${new URL(tokenUrl).host}`,
      url: tokenUrl,
      body: new URLSearchParams(body),
      headers: {
        Authorization: `Basic ${basicRaw}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    attempts.push({
      name: `confidential encoded Basic via ${new URL(tokenUrl).host}`,
      url: tokenUrl,
      body: new URLSearchParams(body),
      headers: {
        Authorization: `Basic ${basicEncoded}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const publicBody = new URLSearchParams(body);
    publicBody.set("client_id", clientId);
    attempts.push({
      name: `public PKCE via ${new URL(tokenUrl).host}`,
      url: tokenUrl,
      body: publicBody,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
  }

  const failures = [];
  for (const attempt of attempts) {
    const response = await fetch(attempt.url, {
      method: "POST",
      headers: attempt.headers,
      body: attempt.body,
    });
    const data = await response.json().catch(() => ({}));

    if (response.ok && data.access_token) {
      console.log(`X token exchange succeeded: ${attempt.name}`);
      return data;
    }

    const reason = data.error_description || data.error || response.statusText;
    failures.push(`${attempt.name}: ${response.status} ${reason}`);
    console.warn(`X token exchange failed: ${attempt.name}: ${response.status} ${reason}`);
  }

  throw new Error(`Token exchange failed after ${attempts.length} attempts. ${failures.join(" | ")}`);
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", redirectUri);
    if (url.pathname !== "/callback") {
      res.writeHead(404).end("Not found");
      return;
    }

    const error = url.searchParams.get("error");
    if (error) {
      throw new Error(`X authorization failed: ${error}`);
    }

    if (url.searchParams.get("state") !== state) {
      throw new Error("OAuth state mismatch.");
    }

    const code = url.searchParams.get("code");
    if (!code) {
      throw new Error("Missing authorization code.");
    }

    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      code_verifier: verifier,
    });

    const tokenData = await exchangeCodeForToken(body);

    updateEnv("X_BEARER_TOKEN", tokenData.access_token);
    if (tokenData.refresh_token) updateEnv("X_REFRESH_TOKEN", tokenData.refresh_token);

    const returnedScopes = String(tokenData.scope ?? "").split(/\s+/).filter(Boolean);
    const missingScopes = scope.split(/\s+/).filter((item) => !returnedScopes.includes(item));
    if (missingScopes.length > 0) {
      console.warn(`X token saved, but returned token is missing scopes: ${missingScopes.join(", ")}`);
    } else {
      console.log(`X token saved with scopes: ${returnedScopes.join(", ")}`);
    }

    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end("<h1>X authorization complete</h1><p>You can close this tab and return to Codex.</p>");
    console.log("X OAuth user token saved to .env.");
  } catch (error) {
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(error instanceof Error ? error.message : String(error));
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  } finally {
    server.close();
  }
});

server.listen(8080, () => {
  fs.writeFileSync(new URL("../x-oauth-url.txt", import.meta.url), authUrl.toString());
  fs.writeFileSync(new URL("../x-oauth-session.json", import.meta.url), JSON.stringify({
    clientId,
    clientSecret,
    redirectUri,
    verifier,
    state,
    scope,
  }, null, 2));
  console.log("Open the URL saved in x-oauth-url.txt");
  console.log(authUrl.toString());
});
