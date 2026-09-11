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
  if (topic.toLowerCase().includes("denar")) {
    return [
      `Theme: ${topic}.`,
      "Audience: adults who think about money, work, status, pressure, survival, and the hidden trap of believing money will solve the inside of a person.",
      "Core angle: money looks like freedom, but for many people it is also captivity because they trade time, health, peace, and relationships for it.",
      "Use concrete anchors: work, one third of the day, status, bills, fear, comparison, people doing bad things for money, money as paper/number/symbol.",
      "Important line of thought: TOREJ DENAR NI SVOBODA, TEMVEC UJETOST.",
      "Do not conclude that freedom is in the heart. Stay sharper: ask what we have sacrificed for money and whether it became our master.",
      "Do not make it soft or motivational. Make it uncomfortable and grounded.",
    ].join("\n");
  }

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
  if (tone === "my-style") return "Fun Gregory voice: direct, morally sharp, reflective, rhythmic, emotionally honest";
  if (tone === "deep") return "deep, reflective, emotionally precise";
  if (tone === "sharp") return "direct, provocative, but not insulting";
  if (tone === "soft") return "warm, gentle, and reconciliatory";
  if (tone === "story") return "story-like, intimate, and vivid";
  return "warm, direct, slightly spicy, human, not preachy";
}

function lengthRule(length: string) {
  if (length === "short") return "50 to 90 words.";
  if (length === "long") return "320 to 520 words.";
  return "180 to 320 words.";
}

function voiceGuide(tone: string) {
  if (tone !== "my-style") {
    return [
      "VOICE",
      "- Human, grounded, not polished like marketing copy.",
      "- Avoid motivational cliches and therapy jargon.",
    ].join("\n");
  }

  return [
    "VOICE PROFILE: FUN GREGORY",
    "- Write like a person thinking out loud about hard truths, not like a brand or coach.",
    "- The style is direct, morally sharp, emotional, and reflective, but written in ordinary Slovenian.",
    "- Use short paragraphs and strong rhythm.",
    "- Use repetition when it creates pressure, e.g. 'Pride says...', 'Truth says...', 'Money can...', 'It comes as...'.",
    "- Build contrasts: truth vs lie, heart vs ego, dignity vs pride, freedom vs captivity, love vs control.",
    "- Let the text feel a little raw and imperfect. Do not over-polish it.",
    "- Do not use poetic fog. No soul compass, spectrum, energy, vibration, salto mortale, or similar strange phrasing.",
    "- Avoid soft filler such as 'praznina v srcu', 'notranja svoboda', 'ljubezen in mir' unless the topic is specifically love.",
    "- Do not sound spiritual, mystical, academic, corporate, or motivational.",
    "- Use simple hard words: strah, laz, resnica, sram, ponos, bolecina, mir, odnos, clovek, ujetost.",
    "- The first line should be a question or a strong claim.",
    "- End with a question for reflection.",
    "- Do not sound like a therapist, influencer, sales page, sermon, or AI assistant.",
    "- No neat motivational ending. Leave the reader thinking.",
    "",
    "STYLE EXAMPLES TO IMITATE WITHOUT COPYING:",
    "Kaj sploh je denar?",
    "Na papirju je sredstvo menjave, tvoj čas za številke na papirju. V resnici pa je pogosto veliko več: občutek varnosti, dokaz uspeha, simbol moči, svoboda izbire in včasih celo merilo lastne vrednosti.",
    "Večina nas mora delati, da zasluži, čeprav mnogokrat v službi komaj zdržimo. Pa se zavedaš, da je tretina dneva namenjena službi. TOREJ DENAR NI SVOBODA, TEMVEČ UJETOST.",
    "Največja prevara denarja pa je morda v tem, da nas prepriča, da bo zapolnil praznine, ki jih v resnici ne more.",
    "Lahko kupi udobje, ne pa notranjega miru. Lahko odpre vrata, ne pa iskrenih odnosov. Lahko prinese pozornost, ne pa prave ljubezni. Lahko da izbiro, ne pa nujno smisla.",
    "",
    "Ponos ne pride in reče: prišel sem, da ti uničim odnos.",
    "Pride kot občutek, da imamo prav.",
    "Pride kot notranji glas, ki pravi: ne popusti.",
    "Takrat se ušesa zaprejo. Vid se zoži. Srce otrdi.",
    "",
    "Samospoštovanje postavi mejo. Ponos zgradi zid.",
    "Samospoštovanje varuje srce. Ponos ga zapre.",
    "Samospoštovanje išče mir. Ponos išče zmago.",
    "",
    "PREFERRED STRUCTURE:",
    "1. Start with a direct question or claim.",
    "2. Explain the visible thing.",
    "3. Expose the hidden lie or trap.",
    "4. Use a few contrast lines.",
    "5. End with one uncomfortable question.",
  ].join("\n");
}

export async function generateFacebookPost(data: GenerateFacebookPostInput): Promise<GeneratedPost> {
  const topic = data.topic?.trim() || config.facebookTopic;
  const language = languageName((data.language ?? "si").toLowerCase());
  const toneKey = (data.tone ?? "my-style").toLowerCase();
  const tone = toneName(toneKey);
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

${voiceGuide(toneKey)}

RECENT FACEBOOK MEMORY
${JSON.stringify(data.memory.slice(0, 12), null, 2)}

TASK
Write ONE original Facebook post.

RULES
- Write in ${language}.
- Make it feel authored by a real person, not AI.
- Start with a strong first line that stops scrolling.
- Use short paragraphs.
- Prefer concrete inner conflict over abstract advice.
- Use ordinary Slovenian words. Avoid decorative metaphors.
- Do not mention AI, crypto, Zora, Base, or automation.
- Do not claim personal events happened unless written generally.
- No cliches like "cas zaceli vse rane", "vse se zgodi z razlogom", "postavi sebe na prvo mesto", or "zasluzis si boljse".
- Do not use strange poetic phrases like "kompas srca", "spekter senc", "salto mortale", "vibracija", "energija", "dusevna lahkotnost", "praznina v srcu", or "kletka zelje".
- Avoid repeating previous openings, titles, or angles from memory.
- The post should be emotional but grounded, with a little edge and a clear moral tension.
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
        temperature: toneKey === "my-style" ? 0.55 : 0.8,
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
