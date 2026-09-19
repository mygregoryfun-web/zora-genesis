import assert from "node:assert/strict";
import test from "node:test";
import { config } from "../config.js";
import { createSession } from "../services/auth.js";
import { generateStudioVideo, getStudioVideo, validateVideoInput } from "../services/studio-video.js";

const input = { promptText: "A gentle camera movement", promptImage: "data:image/png;base64,AAAA", duration: 5, ratio: "720:1280" };
test("validates video input before billing", () => {
  assert.equal(validateVideoInput(input).model, "gen4_turbo");
  for (const change of [{ duration: 20 }, { model: "gen4.5" }, { promptText: "" }, { promptImage: "file:///secret" }]) assert.throws(() => validateVideoInput({ ...input, ...change }));
});

test("video billing refunds provider rejection and checks ownership before provider lookup", async () => {
  const old = { url: config.supabaseUrl, key: config.supabaseServiceRoleKey, runway: config.runwayApiSecret, fetch: globalThis.fetch };
  config.supabaseUrl = "https://database.example"; config.supabaseServiceRoleKey = "test"; config.runwayApiSecret = "test";
  const actions: string[] = [];
  const session = createSession("member@example.com");
  try {
    globalThis.fetch = async (url, init) => {
      if (String(url).includes("studio_payments")) return new Response('[{"tx_hash":"confirmed-test"}]');
      if (String(url).includes("studio_video_transaction")) { actions.push(JSON.parse(String(init?.body)).p_action); return new Response("null"); }
      if (String(url).includes("runwayml.com")) return new Response('{"error":"Rejected"}', { status: 400 });
      assert.ok(String(url).includes("email=eq.member%40example.com"));
      return new Response("[]");
    };
    await assert.rejects(generateStudioVideo(session, input), /Rejected/);
    assert.deepEqual(actions, ["reserve", "refund"]);
    await assert.rejects(getStudioVideo(session, "someone-elses-task"), /not found/);
    actions.length = 0;
    await assert.rejects(generateStudioVideo(session, { ...input, duration: 30 }));
    assert.deepEqual(actions, []);
  } finally { config.supabaseUrl = old.url; config.supabaseServiceRoleKey = old.key; config.runwayApiSecret = old.runway; globalThis.fetch = old.fetch; }
});

test("free credits cannot call Runway or reserve credits; only a confirmed purchase unlocks video", async () => {
  const old = { url: config.supabaseUrl, key: config.supabaseServiceRoleKey, fetch: globalThis.fetch };
  config.supabaseUrl = "https://database.example"; config.supabaseServiceRoleKey = "test";
  const session = { ...createSession("trial@example.com"), credits: 5000 };
  const calls: string[] = [];
  try {
    globalThis.fetch = async (url) => {
      calls.push(String(url));
      assert.ok(String(url).includes("studio_payments"));
      assert.ok(String(url).includes("status=eq.confirmed"));
      assert.ok(String(url).includes("email=eq.trial%40example.com"));
      return new Response("[]");
    };
    await assert.rejects(generateStudioVideo(session, input), (error: any) => error.code === "VIDEO_PURCHASE_REQUIRED");
    assert.equal(calls.length, 1);
  } finally { config.supabaseUrl = old.url; config.supabaseServiceRoleKey = old.key; globalThis.fetch = old.fetch; }
});
