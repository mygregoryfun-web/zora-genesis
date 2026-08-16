import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { config } from "../config.js";
import { GeneratedPostSchema } from "../types.js";

const FacebookMemoryEntrySchema = GeneratedPostSchema.pick({ title: true, hashtags: true }).extend({
  date: z.string().datetime(),
  opening: z.string().trim().optional(),
});

export function loadFacebookPosts() {
  if (!fs.existsSync(config.facebookMemoryFile)) {
    return [];
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(config.facebookMemoryFile, "utf8"));
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry) => FacebookMemoryEntrySchema.safeParse(entry).success);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.error(`Could not read Facebook memory file; starting with empty memory: ${reason}`);
    return [];
  }
}

export function saveFacebookPost(post: unknown) {
  const validPost = GeneratedPostSchema.parse(post);
  const history = loadFacebookPosts();

  history.unshift({
    date: new Date().toISOString(),
    title: validPost.title,
    opening: validPost.post.split(/\r?\n/).find((line) => line.trim())?.trim(),
    hashtags: validPost.hashtags,
  });

  const directory = path.dirname(config.facebookMemoryFile);
  fs.mkdirSync(directory, { recursive: true });
  const temporaryFile = `${config.facebookMemoryFile}.${process.pid}.tmp`;
  fs.writeFileSync(temporaryFile, JSON.stringify(history.slice(0, 50), null, 2));
  fs.renameSync(temporaryFile, config.facebookMemoryFile);
}
