import axios from "axios";
import { config } from "../config.js";

export async function fetchMarketData() {
  if (config.dryRun) {
    return fallbackMarketData("dry-run");
  }

  try {
    const res = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price",
      {
        timeout: config.requestTimeoutMs,
        params: {
          ids: "ethereum",
          vs_currencies: "usd",
          include_24hr_change: "true"
        }
      }
    );

    return {
      ethPrice: res.data.ethereum.usd,
      ethChange24h: res.data.ethereum.usd_24h_change,
      source: "coingecko",
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.error("Market data unavailable; using fallback:", reason);
    return fallbackMarketData("fallback");
  }
}

function fallbackMarketData(source: "dry-run" | "fallback") {
  return {
    ethPrice: 1800,
    ethChange24h: 0,
    source,
  };
}
