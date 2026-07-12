import axios from "axios";
import { config } from "../config.js";

export async function fetchMarketData() {
  if (config.dryRun) {
    return {
      ethPrice: 1800,
      ethChange24h: 1.5
    };
  }

  const res = await axios.get(
    "https://api.coingecko.com/api/v3/simple/price",
    {
      params: {
        ids: "ethereum",
        vs_currencies: "usd",
        include_24hr_change: "true"
      }
    }
  );

  return {
    ethPrice: res.data.ethereum.usd,
    ethChange24h: res.data.ethereum.usd_24h_change
  };
}
