import { config } from "../config.js";
import { CREDIT_COSTS, listUsers } from "./auth.js";

const RUNWAY_API_URL = "https://api.dev.runwayml.com/v1";
const RUNWAY_API_VERSION = "2024-11-06";
const RUNWAY_CREDIT_USD = 0.01;
const GEN4_TURBO_CREDITS_PER_SECOND = 5;

export type AdminSystemStatus = {
  generatedAt: string;
  users: {
    count: number;
    creditsOutstanding: number;
    creditsSpent: number;
  };
  runway: {
    configured: boolean;
    ok: boolean;
    creditBalance: number | null;
    usdEstimate: number | null;
    estimatedFiveSecondVideos: number | null;
    estimatedTenSecondVideos: number | null;
    tierName: string;
    error: string | null;
  };
  providers: {
    openai: boolean;
    openrouter: boolean;
    supabase: boolean;
    billingWallet: boolean;
  };
  costs: typeof CREDIT_COSTS & {
    runwayFiveSecondVideo: number;
    runwayTenSecondVideo: number;
  };
};

function shortError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.slice(0, 220);
}

async function fetchRunwayOrganization() {
  if (!config.runwayApiSecret) {
    return {
      configured: false,
      ok: false,
      creditBalance: null,
      usdEstimate: null,
      estimatedFiveSecondVideos: null,
      estimatedTenSecondVideos: null,
      tierName: "Ni nastavljen",
      error: "RUNWAYML_API_SECRET ni nastavljen.",
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const response = await fetch(`${RUNWAY_API_URL}/organization`, {
      method: "GET",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${config.runwayApiSecret}`,
        "X-Runway-Version": RUNWAY_API_VERSION,
      },
    });
    clearTimeout(timeout);

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
      const detail = typeof data?.error === "string" ? data.error : `Runway HTTP ${response.status}`;
      throw new Error(detail);
    }

    const creditBalance = Number(data?.creditBalance ?? NaN);
    const tierName = String(data?.tier?.name ?? data?.tier?.id ?? "Aktiven");
    if (!Number.isFinite(creditBalance)) {
      throw new Error("Runway ni vrnil številčnega stanja kreditov.");
    }

    const fiveSecondCost = GEN4_TURBO_CREDITS_PER_SECOND * 5;
    const tenSecondCost = GEN4_TURBO_CREDITS_PER_SECOND * 10;

    return {
      configured: true,
      ok: true,
      creditBalance,
      usdEstimate: creditBalance * RUNWAY_CREDIT_USD,
      estimatedFiveSecondVideos: Math.floor(creditBalance / fiveSecondCost),
      estimatedTenSecondVideos: Math.floor(creditBalance / tenSecondCost),
      tierName,
      error: null,
    };
  } catch (error) {
    return {
      configured: true,
      ok: false,
      creditBalance: null,
      usdEstimate: null,
      estimatedFiveSecondVideos: null,
      estimatedTenSecondVideos: null,
      tierName: "Ni mogoče prebrati",
      error: shortError(error),
    };
  }
}

export async function getAdminSystemStatus(): Promise<AdminSystemStatus> {
  const [users, runway] = await Promise.all([
    listUsers(),
    fetchRunwayOrganization(),
  ]);

  const creditsOutstanding = users
    .filter((user) => user.role !== "owner")
    .reduce((sum, user) => sum + Math.max(0, Number(user.credits ?? 0)), 0);
  const creditsSpent = users.reduce((sum, user) => sum + Math.max(0, Number(user.totalSpent ?? 0)), 0);

  return {
    generatedAt: new Date().toISOString(),
    users: {
      count: users.length,
      creditsOutstanding,
      creditsSpent,
    },
    runway,
    providers: {
      openai: Boolean(config.openAiApiKey),
      openrouter: Boolean(config.openRouterApiKey),
      supabase: Boolean(config.supabaseUrl && config.supabaseServiceRoleKey),
      billingWallet: /^0x[a-fA-F0-9]{40}$/.test(config.billingWalletAddress),
    },
    costs: {
      ...CREDIT_COSTS,
      runwayFiveSecondVideo: GEN4_TURBO_CREDITS_PER_SECOND * 5,
      runwayTenSecondVideo: GEN4_TURBO_CREDITS_PER_SECOND * 10,
    },
  };
}
