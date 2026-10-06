import { config } from "../config.js";

const RUNWAY_API_URL = "https://api.dev.runwayml.com/v1";
const RUNWAY_API_VERSION = "2024-11-06";

export type RunwayVideoModel = "gen4_turbo" | "gen4.5";

export type RunwayVideoInput = {
  promptImage: string;
  promptText: string;
  ratio: "720:1280" | "1280:720" | "960:960";
  duration: 5 | 10;
  model?: RunwayVideoModel;
};

export type RunwayTask = {
  id: string;
  status?: string;
  output?: string[];
  error?: unknown;
};

function assertRunwayConfigured() {
  if (!config.runwayApiSecret) {
    throw new Error("Missing RUNWAYML_API_SECRET. Add a Runway Dev API secret before creating AI videos.");
  }
}

async function runwayFetch(path: string, init?: RequestInit) {
  assertRunwayConfigured();

  const response = await fetch(`${RUNWAY_API_URL}${path}`, {
    ...init,
    headers: {
      "Authorization": `Bearer ${config.runwayApiSecret}`,
      "Content-Type": "application/json",
      "X-Runway-Version": RUNWAY_API_VERSION,
      ...(init?.headers ?? {}),
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    const issues = Array.isArray(data?.issues)
      ? `: ${data.issues.map((issue: any) => `${(issue.path ?? []).join(".") || "body"} ${issue.message ?? issue.code ?? "is invalid"}`).join("; ")}`
      : "";
    const message = typeof data?.error === "string" ? `${data.error}${issues}` : `Runway request failed with HTTP ${response.status}${issues}`;
    throw new Error(message);
  }

  return data;
}

export async function createRunwayImageToVideoTask(input: RunwayVideoInput): Promise<RunwayTask> {
  const promptText = input.promptText.trim();
  if (!promptText) {
    throw new Error("Prompt text is required.");
  }
  if (!input.promptImage.startsWith("data:image/") && !/^https?:\/\//i.test(input.promptImage)) {
    throw new Error("Prompt image must be an image data URI or public image URL.");
  }

  const data = await runwayFetch("/image_to_video", {
    method: "POST",
    body: JSON.stringify({
      model: input.model ?? "gen4_turbo",
      promptImage: input.promptImage,
      promptText,
      ratio: input.ratio,
      duration: input.duration,
    }),
  });

  return data as RunwayTask;
}

export async function getRunwayTask(taskId: string): Promise<RunwayTask> {
  const id = taskId.trim();
  if (!id) {
    throw new Error("Task id is required.");
  }

  return (await runwayFetch(`/tasks/${encodeURIComponent(id)}`, {
    method: "GET",
  })) as RunwayTask;
}
