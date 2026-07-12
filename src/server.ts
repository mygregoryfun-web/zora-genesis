import "dotenv/config";

import http from "node:http";
import { config } from "./config.js";
import { runAgent } from "./index.js";
import { getAgentProfile } from "./profile.js";

function sendJson(res: http.ServerResponse, statusCode: number, data: unknown) {
  res.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
  });
  res.end(JSON.stringify(data, null, 2));
}

function isAuthorized(req: http.IncomingMessage) {
  if (!config.agentRunToken) {
    return false;
  }

  return req.headers.authorization === `Bearer ${config.agentRunToken}`;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);

  if (req.method === "GET" && url.pathname === "/health") {
    sendJson(res, 200, {
      ok: true,
      service: "zora-genesis",
      dryRun: config.dryRun,
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/agent/profile") {
    sendJson(res, 200, {
      profile: getAgentProfile(),
      endpoint: config.agentEndpoint,
      publicUrl: config.agentPublicUrl,
      communicationProtocol: "hcs-10",
    });
    return;
  }

  if (req.method === "POST" && url.pathname === "/agent/run") {
    if (!isAuthorized(req)) {
      sendJson(res, 403, {
        ok: false,
        error: "AGENT_RUN_TOKEN is required to trigger the agent over HTTP.",
      });
      return;
    }

    try {
      await runAgent();
      sendJson(res, 200, { ok: true });
    } catch (error) {
      sendJson(res, 500, {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    return;
  }

  sendJson(res, 404, {
    ok: false,
    error: "Not found",
  });
});

server.listen(config.port, () => {
  console.log(`Zora Genesis endpoint listening on port ${config.port}`);
});
