import axios from "axios";
import { config } from "../config.js";
import { GeneratedPostSchema, type GeneratedPost } from "../types.js";

type GenerateFacebookPostInput = {
  memory: unknown[];
};

function topicBrief(topic: string) {
  if (topic === "relationships") {
    return [
      "Theme: relationships, emotional maturity, being heard, tenderness after conflict, sincere apologies, boundaries without cruelty.",
      "Audience: adults who like honest, relatable Slovenian Facebook posts about life and relationships.",
      "Tone: warm, direct, slightly spicy, human, not preachy, not therapy jargon.",
    ].join("\n");
  }

  return [
    `Theme: ${topic}.`,
    "Audience: adults who like honest, relatable Slovenian Facebook posts.",
    "Tone: warm, direct, slightly spicy, human, not preachy.",
  ].join("\n");
}

export async function generateFacebookPost(data: GenerateFacebookPostInput): Promise<GeneratedPost> {
  if (config.skipAI) {
    return {
      title: "[Dry-run] Odnosi",
      post: [
        "Najbolj boli, ko govoriš iz srca, druga stran pa sliši samo napad.",
        "",
        "Včasih odnos ne potrebuje velike obljube. Potrebuje samo trenutek, ko nekdo odloži svoj ponos in reče: povej mi še enkrat, zdaj te poslušam.",
      ].join("\n"),
      hashtags: ["#Odnosi", "#Zivljenje", "#Iskreno"],
    };
  }

  const prompt = `
You are writing for Fun Gregory's Facebook page in Slovenian.

${topicBrief(config.facebookTopic)}

RECENT FACEBOOK MEMORY
${JSON.stringify(data.memory.slice(0, 12), null, 2)}

TASK
Write ONE original Facebook post.

RULES
- Write in Slovenian.
- Make it feel authored by a real person, not AI.
- Start with a strong first line that stops scrolling.
- Use short paragraphs.
- Do not mention AI, crypto, Zora, Base, or automation.
- Do not claim personal events happened unless written generally.
- No cliches like "cas zaceli vse rane" or "vse se zgodi z razlogom".
- Avoid repeating previous openings, titles, or angles from memory.
- The post should be emotional but grounded, with a little edge.
- 80 to 180 words.
- Maximum 3 hashtags.

OUTPUT
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
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      },
      {
        timeout: config.requestTimeoutMs,
        headers: {
          Authorization: `Bearer ${config.openRouterApiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const content = res.data.choices[0].message.content;
    return GeneratedPostSchema.parse(JSON.parse(content));
  } catch (error: any) {
    console.error("Facebook post generation failed:");
    console.error(error.response?.data || error.message);
    throw error;
  }
}
