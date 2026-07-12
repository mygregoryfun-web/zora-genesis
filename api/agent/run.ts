import { config as appConfig } from "../../src/config.js";
import { runAgent } from "../../src/agent.js";

export const config = {
  maxDuration: 60,
};

function isAuthorized(req: any) {
  if (!appConfig.agentRunToken || !appConfig.agentAllowedUserId) {
    return false;
  }

  return (
    req.headers.authorization === `Bearer ${appConfig.agentRunToken}` &&
    req.headers["x-user-id"] === appConfig.agentAllowedUserId
  );
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({
      ok: false,
      error: "Method not allowed",
    });
    return;
  }

  if (!isAuthorized(req)) {
    res.status(403).json({
      ok: false,
      error: "Valid AGENT_RUN_TOKEN and x-user-id are required to trigger the agent over HTTP.",
    });
    return;
  }

  try {
    await runAgent();
    res.status(200).json({ ok: true });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
