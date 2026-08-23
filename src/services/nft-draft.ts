import { createHash } from "node:crypto";
import { loadPosts } from "./memory.js";

const randomThemes = [
  "Base creator signal map with bright cobalt nodes",
  "Zora asset launch cockpit with proof cards",
  "onchain creator economy constellation",
  "transaction firewall shield over a digital mint grid",
  "premium brief archive rendered as luminous data tablets",
  "consumer discovery feed for creator assets",
];

export function createNftDraft(input: { prompt?: string; random?: boolean; seed?: string } = {}) {
  const latest = loadPosts()[0] ?? { date: new Date(0).toISOString(), title: "Zora Genesis: Base Creator Signal", hashtags: ["#Base", "#Zora", "#CreatorAssets"] };
  const seed = input.seed?.trim() || `${latest.title}:${input.prompt ?? ""}:${input.random ? Date.now() : "latest"}`;
  const hash = createHash("sha256").update(seed).digest("hex");
  const randomTheme = randomThemes[parseInt(hash.slice(0, 2), 16) % randomThemes.length];
  const customPrompt = input.prompt?.trim();
  const theme = customPrompt || (input.random ? randomTheme : "abstract on-chain signal map, layered creator nodes, deep blue space, luminous cobalt geometry");
  const accent = `#${hash.slice(0, 6)}`;
  const accentTwo = `#${hash.slice(6, 12)}`;
  const xml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const shorten = (value: string, max = 42) => value.length <= max ? value : `${value.slice(0, max - 1).trim()}…`;
  const headline = customPrompt ? shorten(customPrompt, 58) : shorten(latest.title, 58);
  const orbit = 120 + (parseInt(hash.slice(12, 14), 16) % 170);
  const inner = 72 + (parseInt(hash.slice(14, 16), 16) % 98);
  const pathOffset = parseInt(hash.slice(16, 18), 16) % 120;
  const imagePrompt = [
    "Create one original square NFT artwork for Zora Genesis.",
    `Article title: ${latest.title}`,
    `User direction: ${theme}`,
    `Themes: ${latest.hashtags.join(", ")}`,
    "Visual direction: abstract on-chain signal map, layered creator nodes, luminous geometry, editorial composition.",
    "No brand logos, price claims, copied characters or watermark.",
  ].join("\n");
  const nodes = [[190,680],[360,620],[512,720],[650,600],[860,690]].map(([x,y], index) => `<circle cx="${x + (index % 2 ? pathOffset / 4 : -pathOffset / 5)}" cy="${y - (index % 2 ? pathOffset / 6 : -pathOffset / 7)}" r="${11 + index}"/>`).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024" role="img" aria-label="${xml(headline)}"><defs><radialGradient id="g"><stop stop-color="${accent}"/><stop offset=".48" stop-color="${accentTwo}"/><stop offset="1" stop-color="#071124"/></radialGradient><filter id="glow"><feGaussianBlur stdDeviation="10" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><rect width="1024" height="1024" fill="url(#g)"/><g opacity=".28" stroke="#8fb7ff" stroke-width="2">${Array.from({ length: 9 }, (_, index) => `<circle cx="512" cy="430" r="${90 + index * 34}" fill="none"/>`).join("")}</g><circle cx="512" cy="430" r="${orbit}" fill="none" stroke="#fff" stroke-width="3" opacity=".55"/><circle cx="512" cy="430" r="${inner}" fill="#0052ff" opacity=".42" filter="url(#glow)"/><path d="M190 680 C${330 + pathOffset} ${510 - pathOffset} ${430 - pathOffset} ${810 - pathOffset} 560 640 S${790 - pathOffset} 520 860 690" fill="none" stroke="#fff" stroke-width="8" opacity=".9"/><g fill="#fff">${nodes}</g><text x="72" y="90" fill="#fff" font-family="system-ui,sans-serif" font-size="26" font-weight="700" letter-spacing="4">ZORA GENESIS · NFT DRAFT</text><text x="72" y="835" fill="#fff" font-family="system-ui,sans-serif" font-size="34" font-weight="700">${xml(shorten(theme, 52))}</text><text x="72" y="890" fill="#fff" font-family="system-ui,sans-serif" font-size="46" font-weight="850">${xml(shorten(headline))}</text><text x="72" y="945" fill="#c9d8ff" font-family="system-ui,sans-serif" font-size="25">${xml(latest.hashtags.join("  "))}</text></svg>`;
  const image = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
  const description = customPrompt
    ? `A custom Zora Genesis NFT draft from the prompt “${customPrompt}”, grounded in the article “${latest.title}”.`
    : `A single Zora Genesis NFT draft derived from the article “${latest.title}”.`;
  const metadata = { name: `Zora Genesis — ${headline}`, description, image, attributes: [{ trait_type: "Network", value: "Base" }, { trait_type: "Collection", value: "Zora Genesis Articles" }, { trait_type: "Source date", value: latest.date }, { trait_type: "Generation mode", value: customPrompt ? "Custom prompt" : input.random ? "Random concept" : "Latest article" }, { trait_type: "Mint status", value: "Not minted" }] };
  return { name: metadata.name, description, sourceArticle: latest, generationMode: customPrompt ? "custom-prompt" : input.random ? "random-concept" : "latest-article", seed: hash.slice(0, 12), imagePrompt, image: { mimeType: "image/svg+xml" as const, svg, dataUri: image }, metadata, tokenUri: `data:application/json;base64,${Buffer.from(JSON.stringify(metadata)).toString("base64")}`, status: "draft-not-minted" as const };
}
