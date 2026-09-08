import axios from "axios";
import { config } from "../config.js";
import type { GeneratedPost } from "../types.js";
import { normalizeGeneratedPost } from "./ai.js";

type GenerateFacebookPostInput = {
  memory: unknown[];
  topic?: string;
  language?: string;
  tone?: string;
  length?: string;
};

function languageName(language: string) {
  if (language === "eng") return "English";
  if (language === "esp") return "Spanish";
  return "Slovenian";
}

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

function toneName(tone: string) {
  if (tone === "deep") return "deep, reflective, emotionally precise";
  if (tone === "sharp") return "direct, provocative, but not insulting";
  if (tone === "soft") return "warm, gentle, and reconciliatory";
  if (tone === "story") return "story-like, intimate, and vivid";
  return "warm, direct, slightly spicy, human, not preachy";
}

function lengthRule(length: string) {
  if (length === "short") return "50 to 90 words.";
  if (length === "long") return "180 to 300 words.";
  return "100 to 170 words.";
}

export async function generateFacebookPost(data: GenerateFacebookPostInput): Promise<GeneratedPost> {
  const topic = data.topic?.trim() || config.facebookTopic;
  const language = languageName((data.language ?? "si").toLowerCase());
  const tone = toneName((data.tone ?? "balanced").toLowerCase());
  const length = lengthRule((data.length ?? "medium").toLowerCase());

  if (config.skipAI) {
    return {
      title: `[Dry-run] ${topic}`,
      post: [
        `Tema: ${topic}`,
        "",
        "Najbolj boli, ko govoriš iz srca, druga stran pa sliši samo napad.",
        "",
        "Vcasih odnos ne potrebuje velike obljube. Potrebuje samo trenutek, ko nekdo odlozi svoj ponos in rece: povej mi se enkrat, zdaj te poslusam.",
      ].join("\n"),
      hashtags: ["#Odnosi", "#Zivljenje", "#Iskreno"],
    };
  }

  const prompt = `
You are writing for Fun Gregory's Facebook page in ${language}.

${topicBrief(topic)}

Requested tone: ${tone}.
Requested length: ${length}

RECENT FACEBOOK MEMORY
${JSON.stringify(data.memory.slice(0, 12), null, 2)}

TASK
Write ONE original Facebook post.

RULES
- Write in ${language}.
- Make it feel authored by a real person, not AI.
- Start with a strong first line that stops scrolling.
- Use short paragraphs.
- Do not mention AI, crypto, Zora, Base, or automation.
- Do not claim personal events happened unless written generally.
- No cliches like "cas zaceli vse rane" or "vse se zgodi z razlogom".
- Avoid repeating previous openings, titles, or angles from memory.
- The post should be emotional but grounded, with a little edge.
- Follow the requested length.
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
    return normalizeGeneratedPost(JSON.parse(content));
  } catch (error: any) {
    console.error("Facebook post generation failed:");
    console.error(error.response?.data || error.message);
    throw error;
  }
}
