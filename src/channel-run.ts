import "dotenv/config";

const validChannels = new Set(["x", "farcaster", "zora"]);

const channel = process.argv[2]?.toLowerCase();
const live = process.argv.includes("--live");

if (!channel || !validChannels.has(channel)) {
  throw new Error("Usage: node dist/channel-run.js <x|farcaster|zora> [--live]");
}

process.env.PUBLISH_CHANNELS = channel;

if (!live) {
  process.env.SKIP_POST = "true";
}

const { runAgent } = await import("./agent.js");

console.log(live
  ? `Live ${channel} publishing enabled.`
  : `Safe ${channel} check enabled; SKIP_POST=true.`);

await runAgent();
