import fs from "fs";

const FILE = process.env.MEMORY_FILE ?? (process.env.VERCEL ? "/tmp/zora-genesis-posts.json" : "src/memory/posts.json");

export function loadPosts() {
  if (!fs.existsSync(FILE)) {
    return [];
  }

  return JSON.parse(fs.readFileSync(FILE, "utf8"));
}

export function savePost(post: any) {
  const history = loadPosts();

  history.unshift({
    date: new Date().toISOString(),
    title: post.title,
    hashtags: post.hashtags
  });

  fs.writeFileSync(
    FILE,
    JSON.stringify(history.slice(0, 50), null, 2)
  );
}
