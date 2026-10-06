import axios from "axios";
import { buildSocialPrompt } from "./facebook-ai.js";
import { config } from "../config.js";
import { normalizeGeneratedPost } from "./ai.js";
import type { GeneratedPost } from "../types.js";

const actionPrompts: Record<string, string> = {
  "my-style": "Rewrite it closer to Fun Gregory's voice: direct, morally sharp, rhythmic, grounded, not polished. If the text is plastic, replace it completely.",
  sharper: "Make it sharper and more provocative, but not insulting.",
  emotional: "Make it more emotional and human, with more inner conflict.",
  "less-ai": "Remove generic AI phrasing, cliches, decorative metaphors, and polished marketing tone.",
  deeper: "Make it deeper and more reflective, with clearer explanations and concrete consequences; do not invent motives.",
  shorter: "Make it shorter while keeping the strongest idea.",
  longer: "Make it longer with useful details and concrete examples; preserve the original format.",
  question: "Keep the post mostly intact but improve the final question so it invites comments.",
  "auto-fix":
    "Fix the post automatically. If it sounds like generic AI, rewrite it from scratch. Make it follow the user's request more tightly, remove generic AI phrasing, make it useful and concrete, keep Slovenian diacritics, and preserve the intended channel.",
};

function languageName(language: string) {
  if (language === "eng") return "English";
  if (language === "esp") return "Spanish";
  return "Slovenian";
}

export async function rewriteSocialPost(input: {
  title?: string;
  post: string;
  hashtags?: string[];
  action?: string;
  language?: string;
}): Promise<GeneratedPost> {
  const action = actionPrompts[input.action ?? "my-style"] ?? actionPrompts["my-style"];
  const language = languageName((input.language ?? "si").toLowerCase());

  const prompt = buildSocialPrompt({
    memory: [],
    language: input.language,
    topic: "Rewrite the supplied artifact in " + language + ". Preserve its subject, language, structure, facts and intended platform unless the action explicitly changes them. ACTION: " + action,
  }, { title: input.title ?? "", post: input.post, hashtags: input.hashtags ?? [] });

  const res = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: config.socialModel,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.55,
    },
    {
      timeout: config.requestTimeoutMs,
      headers: {
        Authorization: `Bearer ${config.openRouterApiKey}`,
        "Content-Type": "application/json",
      },
    }
  );

  return normalizeGeneratedPost(JSON.parse(res.data.choices[0].message.content));
}
