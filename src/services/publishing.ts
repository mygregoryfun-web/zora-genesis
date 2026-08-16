import type { PublishResult } from "../types.js";

export type SettledChannelResult = {
  name: string;
  result: PromiseSettledResult<PublishResult>;
};

export function publishedChannels(results: SettledChannelResult[]) {
  return results.filter(
    ({ result }) => result.status === "fulfilled" && result.value.status === "published",
  );
}

export function describeChannelResult({ name, result }: SettledChannelResult) {
  if (result.status === "rejected") {
    const reason = result.reason instanceof Error ? result.reason.message : String(result.reason);
    return { name, status: "failed" as const, reason };
  }

  return {
    name,
    status: result.value.status,
    reason: result.value.reason,
  };
}
