export function shouldPost(signals: any[], memory: any[]) {
  const topScore = signals[0]?.score ?? 0;

  if (topScore < 8) {
    return {
      post: false,
      mode: "skip",
      reason: "Signal score too low"
    };
  }

  const lastPost = memory[0];

  if (
    lastPost &&
    lastPost.title &&
    signals[0]?.signal &&
    lastPost.title.toLowerCase().includes(
      signals[0].signal.split(" ")[0].toLowerCase()
    )
  ) {
    return {
      post: true,
      mode: "fresh_angle",
      reason: "Topic recently posted"
    };
  }

  return {
    post: true,
    mode: "normal",
    reason: "Strong signal"
  };
}
