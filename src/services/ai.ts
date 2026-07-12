import axios from "axios";
import { config } from "../config.js";

type GeneratePostInput = {
  trends: any;
  market: any;
  focus: any[];
  memory: any[];
};

export async function generatePost(data: GeneratePostInput) {
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

Your audience:
- Base builders
- Zora creators
- NFT collectors
- Crypto traders

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
- Sound like an experienced crypto trader sharing insight.
- Keep the post concise.
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
        headers: {
          Authorization: `Bearer ${config.openRouterApiKey}`,
          "Content-Type": "application/json"
        }
      }
    );

    const content = res.data.choices[0].message.content;

    try {
      return JSON.parse(content);
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
