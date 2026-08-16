import { fetchMarketData } from "../../src/services/market.js";
import { generateOpportunities } from "../../src/services/opportunities.js";
import { fetchTrends } from "../../src/services/trends.js";

export const config = {
  maxDuration: 30,
};

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.status(405).json({
      ok: false,
      error: "Method not allowed",
    });
    return;
  }

  const trends = fetchTrends();
  const market = await fetchMarketData();
  const opportunities = generateOpportunities({ trends, market });

  res.status(200).json({
    ok: true,
    service: "zora-genesis",
    dryRun: true,
    opportunities,
  });
}
