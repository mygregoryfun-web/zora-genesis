import { generateMonetizationPlan } from "../../src/services/monetization.js";

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

  res.status(200).json({
    ok: true,
    service: "zora-genesis",
    generatedAt: new Date().toISOString(),
    plan: generateMonetizationPlan(),
  });
}
