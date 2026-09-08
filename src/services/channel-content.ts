import type { GeneratedPost, PublishChannel } from "../types.js";
import { config } from "../config.js";

const CHANNEL_HASHTAGS: Record<PublishChannel, string[]> = {
  x: ["#Base", "#Zora"],
  farcaster: ["#Base", "#Zora", "#Onchain"],
  zora: ["#Base", "#Zora", "#CreatorAssets"],
};

function trimAtBoundary(text: string, maxLength: number) {
  if (text.length <= maxLength) {
    return text;
  }

  const candidate = text.slice(0, maxLength).trimEnd();
  const sentenceBoundary = Math.max(
    candidate.lastIndexOf(". "),
    candidate.lastIndexOf("! "),
    candidate.lastIndexOf("? "),
  );

  if (sentenceBoundary >= 90) {
    return candidate.slice(0, sentenceBoundary + 1).trimEnd();
  }

  const wordBoundary = candidate.lastIndexOf(" ");
  return wordBoundary >= 40 ? candidate.slice(0, wordBoundary).trimEnd() : candidate;
}

function uniqueHashtags(primary: string[], fallback: string[]) {
  const tags = [...primary, ...fallback]
    .map((tag) => tag.trim())
    .filter((tag) => /^#[\p{L}\p{N}_]+$/u.test(tag));

  return Array.from(new Set(tags)).slice(0, 3);
}

function ensureProductAngle(text: string) {
  const hasAngle = /asset pulse|launchpad-lite|discovery feed|agent-assisted publishing|creator asset brief|distribution loop/i.test(text);
  if (hasAngle) {
    return text;
  }

  return `${text} A practical product angle is a creator asset pulse that turns signals into draft launches.`;
}

function ensureLeadProductAngle(text: string) {
  const hasAngle = /asset pulse|launchpad-lite|discovery feed|agent-assisted publishing|creator asset brief|distribution loop/i.test(text);
  if (hasAngle) {
    return text;
  }

  return `Creator asset pulse: ${text}`;
}

function appendSignature(text: string, maxLength: number) {
  const signature = config.publishSignature.trim();
  if (!signature) {
    return trimAtBoundary(text, maxLength);
  }

  const signed = `${text}\n\n- ${signature}`;
  if (signed.length <= maxLength) {
    return signed;
  }

  const suffix = `\n\n- ${signature}`;
  const body = trimAtBoundary(text, Math.max(40, maxLength - suffix.length));
  return `${body}${suffix}`;
}

export function preparePostForChannel(post: GeneratedPost, channel: PublishChannel): GeneratedPost {
  const hashtags = uniqueHashtags(post.hashtags, CHANNEL_HASHTAGS[channel]);

  if (channel === "x") {
    return {
      title: trimAtBoundary(post.title, 72),
      post: appendSignature(ensureLeadProductAngle(post.post), 190),
      hashtags: hashtags.slice(0, 2),
    };
  }

  if (channel === "farcaster") {
    return {
      title: trimAtBoundary(post.title, 96),
      post: appendSignature(ensureProductAngle(post.post), 620),
      hashtags,
    };
  }

  return {
    title: trimAtBoundary(post.title, 96),
    post: trimAtBoundary(
      appendSignature(
        `${ensureProductAngle(post.post)} This can become a Zora-ready creator asset brief with a cover image, distribution note, and onchain proof.`,
        900,
      ),
      900,
    ),
    hashtags,
  };
}
