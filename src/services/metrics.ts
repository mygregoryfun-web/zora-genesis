import { loadPosts } from "./memory.js";

export type PublicProof = {
  label: string;
  value: string;
  url?: string;
};

export type AgentMetrics = {
  app: string;
  status: "live";
  generatedAt: string;
  publishedPostCount: number;
  activeChannels: string[];
  publicProofs: PublicProof[];
  latestPost?: {
    title: string;
    date: string;
    hashtags: string[];
  };
  nextMilestones: string[];
};

export function generateMetrics(): AgentMetrics {
  const posts = loadPosts();
  const latest = posts[0];

  return {
    app: "Zora Genesis",
    status: "live",
    generatedAt: new Date().toISOString(),
    publishedPostCount: posts.length,
    activeChannels: ["Zora", "Farcaster", "X"],
    publicProofs: [
      {
        label: "Base app",
        value: "zora-genesis-t1j9.vercel.app",
        url: "https://zora-genesis-t1j9.vercel.app/",
      },
      {
        label: "Base Builder Code",
        value: "bc_lk15eqwc",
        url: "https://docs.base.org/apps/builder-codes/builder-codes",
      },
      {
        label: "Base proof contract",
        value: "0xc74659ce159b88ef3aae55a61fc3906fe2b1de58",
        url: "https://basescan.org/address/0xc74659ce159b88ef3aae55a61fc3906fe2b1de58",
      },
      {
        label: "Latest Zora asset",
        value: "0x380518528ba2C7B80B61fAd1A03B52aA4006F892",
        url: "https://basescan.org/address/0x380518528ba2C7B80B61fAd1A03B52aA4006F892",
      },
      {
        label: "Latest Zora transaction",
        value: "0x2c45b55722868fe72b1dfc5c5f0338f37d3125665d7344abb9cc813fbd35d8c2",
        url: "https://basescan.org/tx/0x2c45b55722868fe72b1dfc5c5f0338f37d3125665d7344abb9cc813fbd35d8c2",
      },
      {
        label: "Latest X post",
        value: "2089550413590647294",
        url: "https://x.com/mygregoryfun/status/2089550413590647294",
      },
      {
        label: "Latest Farcaster cast",
        value: "0x517e667e1fdb60746418b21d2aa48dd5b5ede080",
      },
    ],
    latestPost: latest
      ? {
          title: latest.title,
          date: latest.date,
          hashtags: latest.hashtags,
        }
      : undefined,
    nextMilestones: [
      "Dashboard approval queue for publish-before-send control",
      "X media upload support once media.write is available",
      "Metrics tracking for engagement and conversion",
      "Premium Base/Zora creator brief experiment",
    ],
  };
}
