import "dotenv/config";

import http from "node:http";
import { config } from "./config.js";
import { runAgent } from "./agent.js";
import { getAgentProfile } from "./profile.js";
import { fetchMarketData } from "./services/market.js";
import { generateOpportunities } from "./services/opportunities.js";
import { fetchTrends } from "./services/trends.js";
import { generateMonetizationPlan } from "./services/monetization.js";
import { getBuilderCodeAttribution } from "./services/base-builder.js";
import { generateMetrics } from "./services/metrics.js";

function sendJson(res: http.ServerResponse, statusCode: number, data: unknown) {
  res.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
  });
  res.end(JSON.stringify(data, null, 2));
}

function isAuthorized(req: http.IncomingMessage) {
  if (!config.agentRunToken || !config.agentAllowedUserId) {
    return false;
  }

  return (
    req.headers.authorization === `Bearer ${config.agentRunToken}` &&
    req.headers["x-user-id"] === config.agentAllowedUserId
  );
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

  if (req.method === "GET" && url.pathname === "/agent/opportunities") {
    try {
      const trends = fetchTrends();
      const market = await fetchMarketData();
      sendJson(res, 200, {
        generatedAt: new Date().toISOString(),
        positioning: "Base/Zora opportunity engine for new asset creation, token launchpads, consumer apps, and agent-assisted creator workflows.",
        disclaimer: "Opportunities are builder/product signals, not financial advice or trading instructions.",
        opportunities: generateOpportunities({ trends, market }),
      });
    } catch (error) {
      sendJson(res, 500, {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    return;
  }

  if (req.method === "GET" && url.pathname === "/agent/monetization") {
    sendJson(res, 200, {
      generatedAt: new Date().toISOString(),
      disclaimer: "Monetization ideas sell workflow and creator intelligence, not trading advice or autonomous execution.",
      plan: generateMonetizationPlan(),
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/agent/builder-code") {
    sendJson(res, 200, {
      ok: true,
      service: "zora-genesis",
      generatedAt: new Date().toISOString(),
      builderCode: getBuilderCodeAttribution(),
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/agent/metrics") {
    sendJson(res, 200, {
      ok: true,
      service: "zora-genesis",
      metrics: generateMetrics(),
    });
    return;
  }

  if (req.method === "POST" && url.pathname === "/agent/run") {
    if (!isAuthorized(req)) {
      sendJson(res, 403, {
        ok: false,
        error: "Valid AGENT_RUN_TOKEN and x-user-id are required to trigger the agent over HTTP.",
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
