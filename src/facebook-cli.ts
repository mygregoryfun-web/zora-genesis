
import "dotenv/config";

import { config } from "./config.js";
import { generateFacebookPost } from "./services/facebook-ai.js";
import { loadFacebookPosts, saveFacebookPost } from "./services/facebook-memory.js";
import { postToFacebook } from "./services/facebook.js";

async function main() {
  if (!config.openRouterApiKey && !config.skipAI) {
    throw new Error("Missing OPENROUTER_API_KEY");
  }

  console.log("Facebook relationship post flow running...");
  if (config.dryRun) {
    console.log("Dry run enabled: AI generation and publishing may be skipped.");
  }

  const memory = loadFacebookPosts();
  console.log(`Loaded ${memory.length} previous Facebook posts.`);

  const post = await generateFacebookPost({ memory });
  console.log("Generated Facebook post:");
  console.log(JSON.stringify(post, null, 2));

  const result = await postToFacebook(post);

  if (result.status === "published") {
    saveFacebookPost(post);
    console.log("Facebook post saved to memory.");
    return;
  }

  console.log(`Facebook post not saved to memory because publishing was skipped: ${result.reason ?? "unknown reason"}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
