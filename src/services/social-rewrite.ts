import axios from "axios";
import { config } from "../config.js";
import { normalizeGeneratedPost } from "./ai.js";
import type { GeneratedPost } from "../types.js";

const actionPrompts: Record<string, string> = {
  "my-style": "Rewrite it closer to Fun Gregory's voice: direct, morally sharp, rhythmic, grounded, not polished.",
  sharper: "Make it sharper and more provocative, but not insulting.",
  emotional: "Make it more emotional and human, with more inner conflict.",
  "less-ai": "Remove generic AI phrasing, cliches, decorative metaphors, and polished marketing tone.",
  deeper: "Make it deeper and more reflective, with stronger truth versus lie tension.",
  shorter: "Make it shorter while keeping the strongest idea.",
  longer: "Make it longer with more rhythm, contrast, and a stronger ending question.",
  question: "Keep the post mostly intact but improve the final question so it invites comments.",
  "auto-fix":
    "Fix the post automatically. Make it follow the user's request more tightly, remove generic AI phrasing, make it useful and concrete, keep Slovenian diacritics, and preserve the intended channel.",
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

  const prompt = `
You are rewriting a social post for Fun Gregory in ${language}.

ACTION
${action}

VOICE RULES
- Use ordinary language.
- Keep it human, direct, slightly raw, and not motivational.
- Avoid crypto/Web3/digital asset references.
- Avoid cliches and strange poetic phrases.
- Keep short paragraphs.
- End with a question when it fits.
- Maximum 3 hashtags.

CURRENT POST
Title: ${input.title ?? ""}
Post:
${input.post}
Hashtags: ${(input.hashtags ?? []).join(" ")}

Return ONLY valid JSON:
{
  "title": "",
  "post": "",
  "hashtags": []
}
`;

  const res = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: config.model,
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
