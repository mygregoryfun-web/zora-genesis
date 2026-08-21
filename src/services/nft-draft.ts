import { createHash } from "node:crypto";
import { loadPosts } from "./memory.js";

export function createNftDraft() {
  const latest = loadPosts()[0] ?? { date: new Date(0).toISOString(), title: "Zora Genesis: Base Creator Signal", hashtags: ["#Base", "#Zora", "#CreatorAssets"] };
  const accent = `#${createHash("sha256").update(latest.title).digest("hex").slice(0, 6)}`;
  const xml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const shorten = (value: string, max = 42) => value.length <= max ? value : `${value.slice(0, max - 1).trim()}…`;
  const imagePrompt = [
    "Create one original square NFT artwork from an existing Zora Genesis article.",
    `Article title: ${latest.title}`,
    `Themes: ${latest.hashtags.join(", ")}`,
    "Visual direction: abstract on-chain signal map, layered creator nodes, deep blue space, luminous cobalt geometry, editorial composition.",
    "No brand logos, price claims, copied characters or watermark.",
  ].join("\n");
  const nodes = [[190,680],[360,620],[512,720],[650,600],[860,690]].map(([x,y]) => `<circle cx="${x}" cy="${y}" r="13"/>`).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024" role="img" aria-label="${xml(latest.title)}"><defs><radialGradient id="g"><stop stop-color="${accent}"/><stop offset="1" stop-color="#071124"/></radialGradient><filter id="glow"><feGaussianBlur stdDeviation="10" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><rect width="1024" height="1024" fill="url(#g)"/><circle cx="512" cy="430" r="250" fill="none" stroke="#8fb7ff" stroke-width="3" opacity=".55"/><circle cx="512" cy="430" r="150" fill="#0052ff" opacity=".38" filter="url(#glow)"/><path d="M190 680 C350 510 430 810 560 640 S790 520 860 690" fill="none" stroke="#fff" stroke-width="8" opacity=".9"/><g fill="#fff">${nodes}</g><text x="72" y="90" fill="#fff" font-family="system-ui,sans-serif" font-size="26" font-weight="700" letter-spacing="4">ZORA GENESIS · ARTICLE 001</text><text x="72" y="870" fill="#fff" font-family="system-ui,sans-serif" font-size="48" font-weight="800">${xml(shorten(latest.title))}</text><text x="72" y="925" fill="#c9d8ff" font-family="system-ui,sans-serif" font-size="25">${xml(latest.hashtags.join("  "))}</text></svg>`;
  const image = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
  const description = `A single Zora Genesis NFT draft derived from the article “${latest.title}”.`;
  const metadata = { name: `Zora Genesis — ${shorten(latest.title, 58)}`, description, image, attributes: [{ trait_type: "Network", value: "Base" }, { trait_type: "Collection", value: "Zora Genesis Articles" }, { trait_type: "Source date", value: latest.date }, { trait_type: "Mint status", value: "Not minted" }] };
  return { name: metadata.name, description, sourceArticle: latest, imagePrompt, image: { mimeType: "image/svg+xml" as const, svg, dataUri: image }, metadata, tokenUri: `data:application/json;base64,${Buffer.from(JSON.stringify(metadata)).toString("base64")}`, status: "draft-not-minted" as const };
}
