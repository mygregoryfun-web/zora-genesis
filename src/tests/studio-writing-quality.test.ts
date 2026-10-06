import assert from "node:assert/strict";
import test from "node:test";
import axios from "axios";
import { config } from "../config.js";
import { normalizeGeneratedPost } from "../services/ai.js";
import { artifactKind, generateFacebookPost, buildSocialPrompt } from "../services/facebook-ai.js";
import { createSocialDraft } from "../services/social-draft.js";

const topic = "NAŠTEJ IN OPIŠI KORAKE, KI SO POTREBNI DA LAHKO ODPUSTIM KADAR NE MOREM ALI NE ŽELIM";
const post = { title: "Ko še ne moreš odpustiti", post: "Ni ti treba hiteti.\n\n1. Poimenuj bolečino.\nZapiši, kaj te boli.\n\n2. Postavi mejo.\nPogovor lahko prekineš.", hashtags: ["#Odpuščanje"] };

test("recognizes the actual Slovenian steps request and keeps X ad constraints", () => {
  assert.equal(artifactKind(topic), "steps");
  const prompt = buildSocialPrompt({ memory: [], topic: "Napiši oglas za studio za twiter s hashtagi" });
  assert.match(prompt, /ARTIFACT: AD/);
  assert.match(prompt, /PLATFORM: X\/Twitter/);
  assert.match(prompt, /280 characters/);
});

test("normalization preserves paragraphs and numbered step explanations", () => {
  const normalized = normalizeGeneratedPost({ ...post, post: post.post + "\n\n#Odpuščanje" });
  assert.equal(normalized.post, post.post);
  assert.deepEqual(normalized.hashtags, post.hashtags);
});

test("both generation passes honor steps and channel output preserves structure", async (t) => {
  const previous = config.skipAI;
  config.skipAI = false;
  t.after(() => { config.skipAI = previous; });
  const prompts: string[] = [];
  t.mock.method(axios, "post", async (_url: string, body: any) => {
    prompts.push(body.messages.find((message: any) => message.role === "user").content);
    return { data: { choices: [{ message: { content: JSON.stringify(post) } }] } };
  });
  const draft = await createSocialDraft({ topic, includeImage: false });
  assert.equal(prompts.length, 2);
  for (const prompt of prompts) {
    assert.match(prompt, /NUMBERED PRACTICAL STEPS/);
    assert.match(prompt, /not being ready or willing to forgive/);
    assert.doesNotMatch(prompt, /End with one uncomfortable question/);
  }
  assert.equal(draft.source.post, post.post);
  assert.match(draft.channels.facebook.text, /\n\n1\. Poimenuj/);
  assert.match(draft.channels.instagram.text, /\n\n2\. Postavi/);
});

test("provider failure cannot become a canned successful Studio draft", async (t) => {
  const previous = config.skipAI;
  config.skipAI = false;
  t.after(() => { config.skipAI = previous; });
  t.mock.method(axios, "post", async () => { throw new Error("Provider unavailable"); });
  await assert.rejects(createSocialDraft({ topic, includeImage: false }), /Provider unavailable/);
});

test("disabled AI cannot return unrelated relationship copy", async (t) => {
  const previous = config.skipAI;
  config.skipAI = true;
  t.after(() => { config.skipAI = previous; });
  await assert.rejects(generateFacebookPost({ memory: [], topic }), /AI ustvarjanje je izklopljeno/);
});
