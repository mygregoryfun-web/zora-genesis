import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { GeneratedPostSchema } from "../types.js";

const MemoryEntrySchema = GeneratedPostSchema.pick({ title: true, hashtags: true }).extend({
  date: z.string().datetime(),
});

const FILE = process.env.MEMORY_FILE ?? (process.env.VERCEL ? "/tmp/zora-genesis-posts.json" : "src/memory/posts.json");

export function loadPosts() {
  if (!fs.existsSync(FILE)) {
    return [];
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(FILE, "utf8"));
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry) => MemoryEntrySchema.safeParse(entry).success);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.error(`Could not read memory file; starting with empty memory: ${reason}`);
    return [];
  }
}

export function savePost(post: unknown) {
  const validPost = GeneratedPostSchema.parse(post);
  const history = loadPosts();

  history.unshift({
    date: new Date().toISOString(),
    title: validPost.title,
    hashtags: validPost.hashtags
  });

  const directory = path.dirname(FILE);
  fs.mkdirSync(directory, { recursive: true });
  const temporaryFile = `${FILE}.${process.pid}.tmp`;
  fs.writeFileSync(temporaryFile, JSON.stringify(history.slice(0, 50), null, 2));
  fs.renameSync(temporaryFile, FILE);
}
