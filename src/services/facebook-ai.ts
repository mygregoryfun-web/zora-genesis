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
  const lowerTopic = topic.toLowerCase();

  if (topic.toLowerCase().includes("denar")) {
    return [
      `Theme: ${topic}.`,
      "Audience: adults who think about money, work, status, pressure, survival, and the hidden trap of believing money will solve the inside of a person.",
      "Core angle: money looks like freedom, but for many people it is also captivity because they trade time, health, peace, and relationships for it.",
      "Use concrete anchors: work, one third of the day, status, bills, fear, comparison, people doing bad things for money, money as paper/number/symbol.",
      "Important line of thought: TOREJ DENAR NI SVOBODA, TEMVEČ UJETOST.",
      "Do not conclude that freedom is in the heart. Stay sharper: ask what we have sacrificed for money and whether it became our master.",
      "Do not make it soft or motivational. Make it uncomfortable and grounded.",
    ].join("\n");
  }

  if (
    lowerTopic.includes("ljubezen") ||
    lowerTopic.includes("iskrenost") ||
    lowerTopic.includes("pogum")
  ) {
    return [
      `Theme: ${topic}.`,
      "Audience: adults in a Facebook group about relationships, emotional truth, silence, vulnerability, pride, and closeness.",
      "Core angle: love without honesty becomes performance; honesty without courage stays only an inner thought; courage is often the moment a person says what hurts before pride turns it into silence.",
      "Explore the conflict: a person wants to be loved, but hides what is most true; wants closeness, but chooses sarcasm, silence, withdrawal, or pride because vulnerability feels dangerous.",
      "Concrete scenes: a forgotten anniversary, a partner on the phone, a hurt that is disguised as coldness, a sentence swallowed, a look that says more than words, a quiet evening where nobody says what is really wrong.",
      "Do not turn love, honesty, and courage into hashtags or motivational virtues. Treat them as forces inside a real relationship.",
      "End with one direct question about what people protect more: love, pride, or the image of being strong.",
    ].join("\n");
  }

  if (
    lowerTopic.includes("varanje") ||
    lowerTopic.includes("prevara") ||
    lowerTopic.includes("izdaja") ||
    lowerTopic.includes("laganje")
  ) {
    return [
      `Theme: ${topic}.`,
      "Audience: adults in a Facebook group about relationships, trust, betrayal, cheating, lying, pride, shame, and emotional truth.",
      "Core angle: do not reduce the topic to blame. Expose the inner mechanism: desire for validation, hidden emptiness, fear, ego, attention, revenge, silence, secrets, and the moment truth is replaced by self-justification.",
      "Write with tension: what people say publicly versus what they secretly want; what looks harmless versus what slowly opens doors; dignity versus temptation; truth versus image.",
      "Use concrete scenes: a message hidden, a look that lasts too long, dressing for attention, silence at home, deleted conversations, the body reacting before the mind admits the truth.",
      "Do not moralize from above. Ask uncomfortable questions and make the reader recognize themself.",
    ].join("\n");
  }

  if (
    lowerTopic.includes("oblač") ||
    lowerTopic.includes("obleč") ||
    lowerTopic.includes("sexy") ||
    lowerTopic.includes("zapeljiv") ||
    lowerTopic.includes("nogavic") ||
    lowerTopic.includes("pete")
  ) {
    return [
      `Theme: ${topic}.`,
      "Audience: adults in a Facebook discussion group about relationships, attraction, boundaries, attention, jealousy, dignity, and trust.",
      "Core angle: do not shame women and do not excuse everything as harmless self-expression. Hold the contradiction: a woman can want to feel feminine and seen, but the same behaviour can also become a door to outside attention if the relationship is hungry, cold, or full of silence.",
      "Explore the real question: is she dressing for herself, for her man, for other eyes, for lost confidence, for revenge, or because attention became a substitute for being loved at home?",
      "Concrete scenes: black stockings, high heels, a dress chosen twice, a husband who no longer notices, a phone photo before leaving, male looks in public, comments online, silence when she comes home.",
      "Tension: elegance versus temptation, femininity versus hunger for validation, freedom versus responsibility, attention versus trust.",
      "Do not write like a counselor. Write like a sharp discussion starter that people will comment on.",
    ].join("\n");
  }

  if (
    lowerTopic.includes("ponos") ||
    lowerTopic.includes("ego") ||
    lowerTopic.includes("samospo")
  ) {
    return [
      `Theme: ${topic}.`,
      "Audience: adults who have felt pride take over during conflict.",
      "Core angle: pride is not strength; it often disguises fear, shame, hurt, and the need to win. It closes the ears, narrows the eyes, heats the chest, and makes a person obey an inner ruler.",
      "Explore how pride works: it demands victory, invents excuses, rejects apology, turns truth into threat, and makes love look like weakness.",
      "Contrast pride with dignity: dignity can set a boundary; pride needs someone to lose.",
      "Do not write a motivational lesson. Write like someone exposing a hidden mechanism inside a person.",
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
    "Audience: adults who like honest, relatable Slovenian Facebook posts about relationships, human motives, desire, truth, pride, money, betrayal, and inner conflict.",
    "Core angle: find the hidden mechanism under the topic. Do not stay on the surface. Ask what fear, need, shame, hunger, pride, comparison, or self-deception is driving the behaviour.",
    "Use concrete examples instead of generic advice. Make the reader feel: this is uncomfortably true.",
    "Tone: direct, psychologically curious, morally sharp, human, not preachy.",
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
  if (length === "short") return "90 to 150 words.";
  if (length === "long") return "520 to 800 words.";
  return "280 to 480 words.";
}

function forbiddenSlop() {
  return [
    "LOW-QUALITY OUTPUT TO AVOID",
    "- Generic advice that could fit every relationship topic.",
    "- Safe school-essay structure: introduction, balanced middle, soft conclusion.",
    "- Empty phrases such as 'pomembno je, da se pogovorimo', 'vsak ima svojo pot', 'v današnjem svetu', 'komunikacija je ključ'.",
    "- Therapy-sounding paragraphs that diagnose everyone but expose nothing.",
    "- Motivational endings where everything becomes growth, healing, peace, or self-love.",
    "- Fake depth: many abstract nouns, no concrete scene.",
    "- Moralizing from above: 'ženske morajo', 'moški morajo', 'ljudje bi morali'.",
    "- Formal lecture language: 'razmišljaj', 'razmišljajte', 'predstavljaj si', 'vaša partnerica', 'pod površjem', 'globok strah', 'v današnji družbi'.",
    "- Directly addressing the reader as 'vi' or 'vaš'. Use general human scenes instead.",
    "- Therapy worksheet endings: 'kaj bi se zgodilo, če...', 'ta vprašanja niso enostavna', 'to nas oblikuje'.",
    "- Metaphorical cages, chains, prisons, walls as the main idea. If there is distance, show it in behaviour.",
    "- Generic virtue hashtags such as #ljubezen, #iskrenost, #pogum, #zivljenje, #odnosi when they do not add anything.",
    "- Clickbait without substance.",
    "- A text that is merely nice. Nice is not enough.",
  ].join("\n");
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
    "- Do not sound like a self-help worksheet.",
    "- Use correct Slovenian diacritics: š, č, ž. Never write 'cas', 'clovek', 'laz', 'bolecina', 'poslusam', or similar ASCII-only Slovenian.",
    "- Use simple hard words: strah, laž, resnica, sram, ponos, bolečina, mir, odnos, človek, ujetost.",
    "- The first line should be a question or a strong claim.",
    "- End with a question for reflection.",
    "- Do not sound like a therapist, influencer, sales page, sermon, or AI assistant.",
    "- Do not instruct the reader with 'razmišljaj', 'razmišljajte', 'predstavljaj si', 'poglejmo', 'pomembno je'.",
    "- Avoid direct coaching questions like 'kaj bi se zgodilo, če...' unless they are rewritten as one sharp final question.",
    "- Do not use formal second-person plural like 'vi', 'vaš', 'vaša partnerica'.",
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
    "2. Name the visible behaviour without pretending to be neutral.",
    "3. Go underneath it: what need, fear, hunger, shame, pride, or lie is moving the person?",
    "4. Show two or three concrete situations where this appears in real life.",
    "5. Expose the hidden lie or trap.",
    "6. Use a few contrast lines.",
    "7. End with one uncomfortable question.",
  ].join("\n");
}

async function callOpenRouter(prompt: string, temperature: number) {
  const res = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: config.socialModel,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature,
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

async function editorialRewrite(input: {
  draft: GeneratedPost;
  topic: string;
  topicBrief: string;
  language: string;
  tone: string;
  length: string;
}) {
  const prompt = `
You are Fun Gregory's strict Slovenian editor.

The first draft below may be too generic. Your job is to make it actually usable for Facebook.

ORIGINAL THEME
${input.topicBrief}

REQUESTED LANGUAGE
${input.language}

REQUESTED TONE
${input.tone}

REQUESTED LENGTH
${input.length}

${forbiddenSlop()}

FIRST DRAFT
Title: ${input.draft.title}
Post:
${input.draft.post}
Hashtags: ${input.draft.hashtags.join(" ")}

REWRITE RULES
- If the draft is shallow, replace it completely.
- Keep only ideas that feel alive and true.
- Make the first line sharper and more specific.
- Add at least two concrete human moments: a sentence not answered, a phone turned down, silence at home, a look, a hidden desire, a pride reaction, a money pressure, a small lie, a body reaction.
- Name the hidden driver: fear, shame, hunger for attention, wounded pride, boredom, revenge, comparison, need to feel chosen, need to be seen, or fear of losing control.
- Add consequence: what this slowly does to trust, closeness, self-respect, or peace.
- Use ordinary Slovenian. No polished essay tone.
- Use correct Slovenian diacritics: š, č, ž. Never write ASCII-only Slovenian such as "cas", "clovek", "laz", "poslusam", "bolecina".
- No formal address. Do not use 'vi', 'vaš', 'vaša partnerica', 'razmišljaj', 'razmišljajte', or 'predstavljaj si'.
- Do not use generic depth phrases such as 'pod površjem', 'globok strah', 'kletka osamljenosti', or 'v današnji družbi'.
- Remove therapy-workbook endings such as 'kaj bi se zgodilo, če...', 'ta vprašanja niso enostavna', or 'to nas oblikuje'.
- Keep it tasteful, but do not remove tension.
- Do not use hashtags inside the post field.
- Hashtags are optional. It is better to return no hashtags than generic hashtags.
- Never use generic hashtags such as #ljubezen, #iskrenost, #pogum, #zivljenje, #odnosi unless the topic truly requires them.
- Maximum 2 hashtags.

QUALITY CHECK BEFORE YOU RETURN
The post must pass all five:
1. It has a clear opinion.
2. It contains concrete scenes, not just abstract advice.
3. It exposes a hidden motive or lie.
4. It does not sound like a generic AI post.
5. The ending question is uncomfortable enough to invite comments.

Return ONLY valid JSON:
{
  "title": "",
  "post": "",
  "hashtags": []
}
`;

  return callOpenRouter(prompt, 0.48);
}

export async function generateFacebookPost(data: GenerateFacebookPostInput): Promise<GeneratedPost> {
  const topic = data.topic?.trim() || config.facebookTopic;
  const language = languageName((data.language ?? "si").toLowerCase());
  const toneKey = (data.tone ?? "my-style").toLowerCase();
  const tone = toneName(toneKey);
  const length = lengthRule((data.length ?? "medium").toLowerCase());
  const brief = topicBrief(topic);

  if (config.skipAI) {
    return {
      title: `[Dry-run] ${topic}`,
      post: [
        `Tema: ${topic}`,
        "",
        "Najbolj boli, ko govoriš iz srca, druga stran pa sliši samo napad.",
        "",
        "Včasih odnos ne potrebuje velike obljube. Potrebuje samo trenutek, ko nekdo odloži svoj ponos in reče: povej mi še enkrat, zdaj te poslušam.",
      ].join("\n"),
      hashtags: [],
    };
  }

  const prompt = `
You are writing for Fun Gregory's Facebook page in ${language}.

${brief}

Requested tone: ${tone}.
Requested length: ${length}

${voiceGuide(toneKey)}

${forbiddenSlop()}

RECENT FACEBOOK MEMORY
${JSON.stringify(data.memory.slice(0, 12), null, 2)}

TASK
Write ONE original Facebook post.

EDITORIAL QUALITY BAR
- Do not write a safe summary of the topic. Take a clear angle.
- The post must answer: what is really happening under the surface?
- Include at least one concrete real-life scene or behaviour.
- Include cause and consequence: what drives it, and what it slowly creates.
- Use a few sharp contrast lines when useful.
- Make the reader feel that the text understands something real.
- If the topic is controversial, keep it tasteful and human, but do not remove the tension.
- Write as if the reader might disagree in the comments. Give them something specific to react to.
- Do not solve the topic too quickly. Let the contradiction stay alive.

RULES
- Write in ${language}.
- Make it feel authored by a real person, not AI.
- Start with a strong first line that stops scrolling.
- Use short paragraphs.
- Avoid empty lines that separate every sentence; group related thoughts.
- Prefer concrete inner conflict over abstract advice.
- Use ordinary Slovenian words. Avoid decorative metaphors.
- Use correct Slovenian diacritics: š, č, ž. Never write ASCII-only Slovenian such as "cas", "clovek", "laz", "poslusam", "bolecina".
- Do not use formal address or instructional openings such as "vi", "vaš", "vaša partnerica", "razmišljaj", "razmišljajte", "predstavljaj si", or "poglejmo".
- Do not mention AI, Web3 projects, digital assets, or automation.
- Do not claim personal events happened unless written generally.
- No cliches like "čas zaceli vse rane", "vse se zgodi z razlogom", "postavi sebe na prvo mesto", or "zaslužiš si boljše".
- Do not use strange poetic phrases like "kompas srca", "spekter senc", "salto mortale", "vibracija", "energija", "duševna lahkotnost", "praznina v srcu", "kletka želje", "kletka osamljenosti", or similar cage/prison metaphors.
- Avoid repeating previous openings, titles, or angles from memory.
- The post should be emotional but grounded, with a little edge and a clear moral tension.
- Follow the requested length.
- Hashtags are optional. Use no hashtags if only generic ones come to mind.
- Never use generic hashtags such as #ljubezen, #iskrenost, #pogum, #zivljenje, #odnosi.
- Maximum 2 hashtags.
- Never use generic filler like "v današnjem svetu", "pomembno je", "vsak ima svojo resnico", "na koncu dneva", "komunikacija je ključ", "kaj bi se zgodilo, če", "ta vprašanja niso enostavna", or "vse se začne pri sebi".
- Never use generic depth filler like "pod površjem se skriva", "globok strah", or "v današnji družbi".

OUTPUT
Return ONLY valid JSON.

{
  "title": "",
  "post": "",
  "hashtags": []
}
`;

  try {
    const draft = await callOpenRouter(prompt, toneKey === "my-style" ? 0.55 : 0.8);
    return await editorialRewrite({ draft, topic, topicBrief: brief, language, tone, length });
  } catch (error: any) {
    console.error("Facebook post generation failed:");
    console.error(error.response?.data || error.message);
    throw error;
  }
}
