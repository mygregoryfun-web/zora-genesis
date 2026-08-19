import type { GrowthPlan } from "../types.js";

export function generateGrowthPlan(): GrowthPlan {
  return {
    positioning: "Public build-in-progress for an AI creator-assets agent on Base and Zora.",
    primaryCta: "Request a premium Base/Zora creator brief",
    primaryCtaUrl: "https://x.com/mygregoryfun",
    weeklyLoop: [
      "Publish one build log with the newest agent improvement.",
      "Share one proof link: dashboard, metrics, Zora asset, X post, or Builder Code.",
      "Turn the best agent output into one short X/Farcaster post and one longer Facebook post.",
      "Invite builders to request a free sample creator brief before offering the paid version.",
    ],
    channels: [
      {
        id: "base-builders",
        name: "Base builder ecosystem",
        audience: "Base developers, grant reviewers, and app discovery users",
        freeTactic: "Post weekly build updates with the dashboard, Builder Code, and proof contract links.",
        proofToShare: "Base App profile, Builder Code bc_lk15eqwc, public metrics endpoint",
        cadence: "1-2 concise updates per week",
      },
      {
        id: "farcaster",
        name: "Farcaster",
        audience: "Onchain creators and Base-native builders",
        freeTactic: "Share one useful Base/Zora opportunity each day and ask for creator brief requests.",
        proofToShare: "Latest cast, Opportunity Radar, Zora-ready brief examples",
        cadence: "Daily short cast",
      },
      {
        id: "x",
        name: "X",
        audience: "Crypto builders, Zora creators, and grant watchers",
        freeTactic: "Use short build-in-public posts, reply to relevant Base/Zora threads, and pin the dashboard.",
        proofToShare: "Latest X post, public dashboard, Zora asset contract",
        cadence: "3-5 replies plus 1 original post per week",
      },
      {
        id: "facebook",
        name: "Facebook communities",
        audience: "Creators and non-technical people who need help turning ideas into posts or assets",
        freeTactic: "Share plain-language examples of how the agent turns an idea into a post, image prompt, and checklist.",
        proofToShare: "Dashboard and one friendly example brief, not technical JSON",
        cadence: "1 practical post per week",
      },
      {
        id: "github",
        name: "GitHub README and issues",
        audience: "Developers who inspect proof before trusting the app",
        freeTactic: "Keep README proof links current and open small public issues for roadmap items.",
        proofToShare: "CI status, public endpoints, deployment URL",
        cadence: "Update after every meaningful feature",
      },
      {
        id: "talent",
        name: "Talent / builder profile",
        audience: "Verified builders and grant scouts",
        freeTactic: "Use the app dashboard and screenshots as a live portfolio item.",
        proofToShare: "Base App screenshots, dashboard, metrics",
        cadence: "Refresh after milestones",
      },
    ],
    samplePosts: {
      x: "Building Zora Genesis: an AI agent that tracks Base/Zora signals, scores creator asset opportunities, and drafts channel-ready posts with proof links. Live dashboard: https://zora-genesis-t1j9.vercel.app/",
      farcaster: "Zora Genesis is now live as a Base/Zora creator-assets agent. It turns ecosystem signals into opportunity scores, post drafts, and Zora-ready briefs. Next: premium brief requests and approval-first publishing.",
      facebook: "I am building Zora Genesis, an AI assistant that helps creators turn ideas and market signals into clearer posts, image directions, and launch checklists. The goal is simple: less confusion, more useful creative output.",
    },
    safetyBoundary: "Free promotion should show working product proof and useful examples, not make investment promises, yield claims, or automated trading claims.",
  };
}
