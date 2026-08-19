import fs from "node:fs";
import path from "node:path";
import { config } from "../config.js";

const X_TOKEN_URL = "https://api.x.com/2/oauth2/token";
const X_FALLBACK_TOKEN_URL = "https://api.twitter.com/2/oauth2/token";

type XTokenResponse = {
  token_type?: string;
  expires_in?: number;
  access_token?: string;
  refresh_token?: string;
  scope?: string;
};

const REQUIRED_POST_SCOPE = "tweet.write";
const REQUIRED_MEDIA_SCOPE = "media.write";

function hasRefreshCredentials() {
  return Boolean(config.xClientId && config.xClientSecret && config.xRefreshToken);
}

function updateEnvLine(content: string, key: string, value: string) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const line = `${key}=${value}`;

  if (new RegExp(`^${escaped}=`, "m").test(content)) {
    return content.replace(new RegExp(`^${escaped}=.*$`, "m"), line);
  }

  return `${content.replace(/\s*$/, "")}\n${line}\n`;
}

function persistTokens(tokens: { accessToken: string; refreshToken?: string }) {
  const envPath = path.resolve(process.cwd(), ".env");

  if (!fs.existsSync(envPath)) {
    return;
  }

  let content = fs.readFileSync(envPath, "utf8");
  content = updateEnvLine(content, "X_BEARER_TOKEN", tokens.accessToken);

  if (tokens.refreshToken) {
    content = updateEnvLine(content, "X_REFRESH_TOKEN", tokens.refreshToken);
  }

  fs.writeFileSync(envPath, content);
}

async function requestRefreshToken(body: URLSearchParams) {
  const basicRaw = Buffer.from(`${config.xClientId}:${config.xClientSecret}`).toString("base64");
  const basicEncoded = Buffer.from(`${encodeURIComponent(config.xClientId)}:${encodeURIComponent(config.xClientSecret)}`).toString("base64");
  const attempts: {
    name: string;
    url: string;
    headers: Record<string, string>;
    body: URLSearchParams;
  }[] = [];

  for (const tokenUrl of [X_TOKEN_URL, X_FALLBACK_TOKEN_URL]) {
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
    publicBody.set("client_id", config.xClientId);
    attempts.push({
      name: `public PKCE via ${new URL(tokenUrl).host}`,
      url: tokenUrl,
      body: publicBody,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
  }

  let lastFailure: XTokenResponse & { error?: string; error_description?: string } = {};
  for (const attempt of attempts) {
    const response = await fetch(attempt.url, {
      method: "POST",
      headers: attempt.headers,
      body: attempt.body,
      signal: AbortSignal.timeout(config.requestTimeoutMs),
    });
    const data = (await response.json().catch(() => ({}))) as XTokenResponse & { error?: string; error_description?: string };

    if (response.ok && data.access_token) {
      console.log(`X token refresh succeeded: ${attempt.name}`);
      return data;
    }

    lastFailure = data;
    const reason = data.error_description ?? data.error ?? response.statusText;
    console.log(`X token refresh failed: ${attempt.name}: ${response.status} ${reason}`);
  }

  return lastFailure;
}

export async function refreshXAccessToken() {
  if (!hasRefreshCredentials()) {
    return config.xBearerToken;
  }

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: config.xRefreshToken,
  });

  const data = await requestRefreshToken(body);

  if (!data.access_token) {
    const reason = data.error_description ?? data.error ?? "Token refresh failed";
    if (config.xBearerToken) {
      console.log(`X token refresh failed; using existing access token: ${reason}`);
      return config.xBearerToken;
    }

    throw new Error(`X token refresh failed: ${reason}`);
  }

  const scopes = new Set((data.scope ?? "").split(/\s+/).filter(Boolean));
  if (data.scope && !scopes.has(REQUIRED_POST_SCOPE)) {
    throw new Error(`X token refresh succeeded, but returned token is missing ${REQUIRED_POST_SCOPE}. Re-authorize X OAuth.`);
  }

  process.env.X_BEARER_TOKEN = data.access_token;
  config.xBearerToken = data.access_token;

  if (data.refresh_token) {
    process.env.X_REFRESH_TOKEN = data.refresh_token;
    config.xRefreshToken = data.refresh_token;
  }

  persistTokens({
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
  });

  if (data.scope && !scopes.has(REQUIRED_MEDIA_SCOPE)) {
    console.log(`X access token refreshed, but ${REQUIRED_MEDIA_SCOPE} is missing; image upload will be skipped.`);
  } else {
    console.log("X access token refreshed.");
  }

  return data.access_token;
}

export async function getXAccessToken() {
  if (hasRefreshCredentials()) {
    return refreshXAccessToken();
  }

  return config.xBearerToken;
}
