import axios from "axios";
import { config } from "../config.js";
import { GeneratedPostSchema, type GeneratedPost } from "../types.js";

type GeneratePostInput = {
  trends: any;
  market: any;
  focus: any[];
  memory: any[];
};

export function normalizeGeneratedPost(raw: unknown): GeneratedPost {
  if (!raw || typeof raw !== "object") {
    return GeneratedPostSchema.parse(raw);
  }

  const candidate = raw as {
    title?: unknown;
    post?: unknown;
    hashtags?: unknown;
  };

  if (typeof candidate.post === "string") {
    const foundTags = candidate.post.match(/#[\p{L}\p{N}_]+/gu) ?? [];
    candidate.post = candidate.post
      .replace(/(?:\s*#[\p{L}\p{N}_]+){1,}$/gu, "")
      .replace(/\s{2,}/g, " ")
      .trim();

    if (!Array.isArray(candidate.hashtags) || candidate.hashtags.length === 0) {
      candidate.hashtags = Array.from(new Set(foundTags)).slice(0, 3);
    }
  }

  const parsed = GeneratedPostSchema.parse(candidate);

  const normalized = {
    ...parsed,
    title: polishGeneratedText(parsed.title),
    post: polishGeneratedText(parsed.post),
  };

  assertReadableGeneratedPost(normalized);

  return normalized;
}

function polishGeneratedText(text: string) {
  const replacements: Array<[RegExp, string]> = [
    [/\bactivityseeing\b/giu, "activity seeing"],
    [/\btransactioncosts\b/giu, "transaction costs"],
    [/\bforbuilders\b/giu, "for builders"],
    [/\bbuildersfocused\b/giu, "builders focused"],
    [/\bappstailored\b/giu, "apps tailored"],
    [/\bconsumerapps\b/giu, "consumer apps"],
    [/\btailoredto\b/giu, "tailored to"],
    [/\baroundthe\b/giu, "around the"],
    [/\bseebullish\b/giu, "see bullish"],
    [/\bisthe\b/giu, "is the"],
    [/\bnowis\b/giu, "now is"],
    [/\btodive\b/giu, "to dive"],
    [/\btimeto\b/giu, "time to"],
    [/\bvolumeindicates\b/giu, "volume indicates"],
    [/\bmarketneeds\b/giu, "market needs"],
    [/\bsolutionsthat\b/giu, "solutions that"],
    [/\banddistribute\b/giu, "and distribute"],
    [/\bopportunityfor\b/giu, "opportunity for"],
    [/\boffersa\b/giu, "offers a"],
    [/\bandaccessibility\b/giu, "and accessibility"],
    [/\baspike\b/giu, "a spike"],
    [/\bZora’srising\b/gu, "Zora’s rising"],
    [/\bZora'srising\b/gu, "Zora's rising"],
    [/\bBuildingthe\b/gu, "Building the"],
    [/\blaunchpad-liteflow\b/giu, "launchpad-lite flow"],
    [/\bsynergy between\b/giu, "connection between"],
    [/\bsynergy\b/giu, "overlap"],
    [/\bstreamlined mechanisms\b/giu, "simple launch flows"],
    [/\bperfectly aligns\b/giu, "fits"],
    [/\bhealthy engagement\b/giu, "active use"],
    [/\bthese capabilities\b/giu, "these tools"],
    [/\bopen doors for\b/giu, "make it cheaper for"],
    [/\bfertile ground for\b/giu, "useful setup for"],
    [/\bvibrant environment\b/giu, "active market"],
    [/\bincreasingly vibrant environment\b/giu, "active market"],
    [/\bstrong market demand\b/giu, "clear builder interest"],
    [/\binnovative projects\b/giu, "specific products"],
  ];

  return replacements.reduce(
    (text, [pattern, replacement]) => text.replace(pattern, replacement),
    text,
  )
    .replace(/\s+([,.!?;:])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function assertReadableGeneratedPost(post: GeneratedPost) {
  const suspiciousJoinedWords = [
    "activityseeing",
    "transactioncosts",
    "nowis",
    "todive",
    "volumeindicates",
    "consumerapps",
    "anddistribute",
    "opportunityfor",
    "offersa",
    "andaccessibility",
    "aspike",
    "launchpad-liteflow",
    "Buildingthe",
  ];

  const combined = `${post.title} ${post.post}`;
  const remaining = suspiciousJoinedWords.filter((word) =>
    new RegExp(`\\b${word}\\b`, "iu").test(combined),
  );

  if (remaining.length > 0) {
    throw new Error(`Generated post still has joined words: ${remaining.join(", ")}`);
  }
}

export async function generatePost(data: GeneratePostInput): Promise<GeneratedPost> {
  if (config.skipAI) {
    return {
      title: "[Dry-run] Zora Genesis update",
      post: "This is a dry-run AI-generated post that summarizes the current Base, Zora, and market signals without calling the external AI service.",
      hashtags: ["#Base", "#Zora", "#Crypto"],
    };
  }

  const prompt = `
You are Zora Genesis AI.

You are an elite crypto analyst and autonomous AI creator focused on:

- Base ecosystem
- Zora
- Ethereum
- Creator Economy
- NFTs
- On-chain culture
- Base infrastructure, including Beryl and the B20 native token standard
- Base builder opportunity areas: prediction markets, token launchpads, new asset creation, consumer apps, commerce agents, x402 implementations, autonomous trading agents, DeFi vaults and tokenized equities

Your audience:
- Base builders
- Zora creators
- NFT collectors
- Crypto traders
- consumer crypto app builders

━━━━━━━━━━━━━━━━━━━━━━
MARKET DATA
━━━━━━━━━━━━━━━━━━━━━━

${JSON.stringify(data.market, null, 2)}

━━━━━━━━━━━━━━━━━━━━━━
FOCUS SIGNALS
━━━━━━━━━━━━━━━━━━━━━━

${JSON.stringify(data.focus, null, 2)}

━━━━━━━━━━━━━━━━━━━━━━
TREND DATA
━━━━━━━━━━━━━━━━━━━━━━

${JSON.stringify(data.trends, null, 2)}

━━━━━━━━━━━━━━━━━━━━━━
BASE BUILDER OPPORTUNITY CONTEXT
━━━━━━━━━━━━━━━━━━━━━━

Base developers are looking at prediction markets, token launchpads, new asset
creation, consumer apps, agents for commerce and x402, autonomous trading, and
DeFi primitives such as lending, looping, yield, vaults, and tokenized equities.

For Zora Genesis, the strongest overlap is:
- new asset creation
- token launchpads
- consumer apps for creators and collectors
- prediction-market narrative radar as a signal layer
- agent-assisted discovery and publishing

Treat autonomous trading and DeFi execution as observation topics only. Do not
recommend trades, leverage, looping, or specific financial actions.

Prediction-market rails and perps-like UX should be framed as market-attention
signals for builders. Use them to explain what Base users are paying attention
to, then connect that attention to creator assets, discovery feeds, or publishing
briefs. Do not present them as trading products for Zora Genesis.

━━━━━━━━━━━━━━━━━━━━━━
BASE INFRASTRUCTURE CONTEXT
━━━━━━━━━━━━━━━━━━━━━━

Beryl is a Base network upgrade. B20 is its native, ERC-20-compatible token
standard implemented in Base node software; B20 is a standard, not a standalone
Base token.

━━━━━━━━━━━━━━━━━━━━━━
RECENT MEMORY
━━━━━━━━━━━━━━━━━━━━━━

${JSON.stringify(data.memory.slice(0, 10), null, 2)}

━━━━━━━━━━━━━━━━━━━━━━
TASK
━━━━━━━━━━━━━━━━━━━━━━

Write ONE original Farcaster post.

━━━━━━━━━━━━━━━━━━━━━━
MEMORY RULES
━━━━━━━━━━━━━━━━━━━━━━

- Never repeat previous titles.
- Never repeat the same opening sentence.
- Avoid repeating hashtags from memory.
- If a topic was recently discussed, use a different angle.
- Write something fresh and useful.

━━━━━━━━━━━━━━━━━━━━━━
CONTENT RULES
━━━━━━━━━━━━━━━━━━━━━━

- Use ONLY the supplied information.
- Focus only on the strongest signals.
- Never invent facts.
- Never sound like marketing.
- Never use phrases like:
  - "The future is here"
  - "Don't miss out"
  - "Huge opportunity"
  - "Game changer"
- Explain WHY the signals matter.
- Combine Base, Zora and market sentiment into one coherent observation.
- When relevant, connect Zora to new asset creation, token launchpads, consumer apps, or agent-assisted commerce.
- Keep DeFi/autonomous trading commentary high-level and non-advisory.
- Mention B20 only if it directly improves the post. Most posts should not mention B20.
- Do not imply that B20 itself is a token or that it replaces Zora content coins.
- If Base gas is low, describe it as "low transaction costs" or "cheap execution"; never call gas "bearish".
- Do not say infrastructure "continues to evolve" unless the supplied data explicitly says so.
- Avoid vague hype words like "promising landscape", "robust community engagement", or "capitalize on".
- Avoid generic filler phrases like "synergy", "streamlined mechanisms", "perfectly aligns", "healthy engagement", or "these capabilities".
- Avoid soft marketing phrases like "open doors", "fertile ground", "vibrant environment", "increasingly vibrant", "strong market demand", or "innovative projects".
- Do not use "financing" unless the supplied data explicitly discusses financing.
- Prefer concrete builder language: "launch flow", "creator asset", "discovery feed", "low-cost minting", "distribution loop".
- Make the post sound like a builder/operator note, not a press release.
- Include one concrete product angle, such as an asset pulse, launchpad-lite flow, or consumer discovery feed.
- End with a specific observation, not a broad conclusion.
- Sound like an experienced crypto trader sharing insight.
- Keep the post concise.
- Maximum 130 words.
- Maximum 3 hashtags.
- Use emojis only when they improve readability.

━━━━━━━━━━━━━━━━━━━━━━
STYLE
━━━━━━━━━━━━━━━━━━━━━━

Randomly choose ONE style:

- Market Analysis
- Alpha Insight
- Builder Perspective
- Creator Economy Update
- Hot Take
- Ecosystem Observation

━━━━━━━━━━━━━━━━━━━━━━
OUTPUT
━━━━━━━━━━━━━━━━━━━━━━

Return ONLY valid JSON.
The "post" field must not contain hashtags.
All hashtags must be in the "hashtags" array.

{
  "title": "",
  "post": "",
  "hashtags": []
}
`;

  try {
    const res = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: config.model,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: {
          type: "json_object"
        }
      },
      {
        timeout: config.requestTimeoutMs,
        headers: {
          Authorization: `Bearer ${config.openRouterApiKey}`,
          "Content-Type": "application/json"
        }
      }
    );

    const content = res.data.choices[0].message.content;

    try {
      return normalizeGeneratedPost(JSON.parse(content));
    } catch (err) {
      console.error("❌ Invalid JSON returned by AI:");
      console.log(content);
      throw err;
    }
  } catch (err: any) {
    console.error("❌ OpenRouter Error:");
    console.error(err.response?.data || err.message);
    throw err;
  }
}
