import fs from "node:fs";

const envPath = new URL("../.env", import.meta.url);
const sessionPath = new URL("../x-oauth-session.json", import.meta.url);

function updateEnv(name, value) {
  const envText = fs.readFileSync(envPath, "utf8");
  const escaped = value.replace(/\r?\n/g, "");
  const pattern = new RegExp(`^${name}=.*$`, "m");
  const next = pattern.test(envText)
    ? envText.replace(pattern, `${name}=${escaped}`)
    : `${envText.trimEnd()}\n${name}=${escaped}\n`;
  fs.writeFileSync(envPath, next);
}

async function tryExchange(attempt) {
  const response = await fetch(attempt.url, {
    method: "POST",
    headers: attempt.headers,
    body: attempt.body,
  });
  const data = await response.json().catch(() => ({}));
  return { response, data };
}

async function exchangeCodeForToken(session, code) {
  const tokenUrls = [
    "https://api.x.com/2/oauth2/token",
    "https://api.twitter.com/2/oauth2/token",
  ];
  const baseBody = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: session.redirectUri,
    code_verifier: session.verifier,
  });
  const basicRaw = Buffer.from(`${session.clientId}:${session.clientSecret}`).toString("base64");
  const basicEncoded = Buffer.from(`${encodeURIComponent(session.clientId)}:${encodeURIComponent(session.clientSecret)}`).toString("base64");
  const attempts = [];

  for (const tokenUrl of tokenUrls) {
    attempts.push({
      name: `confidential raw Basic via ${new URL(tokenUrl).host}`,
      url: tokenUrl,
      body: new URLSearchParams(baseBody),
      headers: {
        Authorization: `Basic ${basicRaw}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    attempts.push({
      name: `confidential encoded Basic via ${new URL(tokenUrl).host}`,
      url: tokenUrl,
      body: new URLSearchParams(baseBody),
      headers: {
        Authorization: `Basic ${basicEncoded}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const publicBody = new URLSearchParams(baseBody);
    publicBody.set("client_id", session.clientId);
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
    const { response, data } = await tryExchange(attempt);
    if (response.ok && data.access_token) {
      console.log(`X token exchange succeeded: ${attempt.name}`);
      return data;
    }

    const reason = data.error_description || data.error || response.statusText;
    failures.push(`${attempt.name}: ${response.status} ${reason}`);
    console.warn(`X token exchange failed: ${attempt.name}: ${response.status} ${reason}`);
  }

  throw new Error(`Token exchange failed after ${attempts.length} attempts.\n${failures.join("\n")}`);
}

const callbackUrl = process.argv[2];
if (!callbackUrl) {
  throw new Error("Usage: node scripts/x-oauth-complete.mjs \"http://localhost:8080/callback?state=...&code=...\"");
}

const session = JSON.parse(fs.readFileSync(sessionPath, "utf8"));
const url = new URL(callbackUrl);

const error = url.searchParams.get("error");
if (error) {
  throw new Error(`X authorization failed: ${error}`);
}

if (url.searchParams.get("state") !== session.state) {
  throw new Error("OAuth state mismatch. Generate a fresh URL with scripts/x-oauth-token.mjs and use that callback URL.");
}

const code = url.searchParams.get("code");
if (!code) {
  throw new Error("Missing authorization code in callback URL.");
}

const tokenData = await exchangeCodeForToken(session, code);

updateEnv("X_BEARER_TOKEN", tokenData.access_token);
if (tokenData.refresh_token) updateEnv("X_REFRESH_TOKEN", tokenData.refresh_token);

const returnedScopes = String(tokenData.scope ?? "").split(/\s+/).filter(Boolean);
const missingScopes = String(session.scope ?? "").split(/\s+/).filter((item) => item && !returnedScopes.includes(item));
if (missingScopes.length > 0) {
  console.warn(`X token saved, but returned token is missing scopes: ${missingScopes.join(", ")}`);
} else {
  console.log(`X token saved with scopes: ${returnedScopes.join(", ")}`);
}
