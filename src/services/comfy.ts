import fs from "node:fs";
import { config } from "../config.js";
import type { GeneratedImage } from "./image.js";

const COMFY_BASE_URL = "https://cloud.comfy.org";

type Workflow = Record<string, {
  class_type?: string;
  inputs?: Record<string, unknown>;
}>;

type ComfyFile = {
  filename?: string;
  subfolder?: string;
  type?: string;
};

function headers(contentType = false): Record<string, string> {
  return {
    "X-API-Key": config.comfyApiKey,
    ...(contentType ? { "Content-Type": "application/json" } : {}),
  };
}

function cloneWorkflow(workflow: Workflow): Workflow {
  return JSON.parse(JSON.stringify(workflow)) as Workflow;
}

function findPromptNodeId(workflow: Workflow) {
  if (config.comfyPromptNodeId) {
    return config.comfyPromptNodeId;
  }

  const textNode = Object.entries(workflow).find(([, node]) =>
    typeof node.inputs?.[config.comfyPromptInput] === "string"
  );

  return textNode?.[0] ?? "";
}

export function applyComfyWorkflowInputs(workflow: Workflow, prompt: string, seed = Date.now()) {
  const next = cloneWorkflow(workflow);
  const promptNodeId = findPromptNodeId(next);

  if (!promptNodeId || !next[promptNodeId]?.inputs) {
    throw new Error("Comfy workflow prompt node not found. Set COMFY_PROMPT_NODE_ID and COMFY_PROMPT_INPUT.");
  }

  const promptNode = next[promptNodeId];
  if (!promptNode?.inputs) {
    throw new Error("Comfy workflow prompt node inputs missing.");
  }

  promptNode.inputs[config.comfyPromptInput] = prompt;

  const seedNode = config.comfySeedNodeId ? next[config.comfySeedNodeId] : undefined;
  if (seedNode?.inputs) {
    seedNode.inputs[config.comfySeedInput] = seed;
  }

  return next;
}

function loadWorkflow() {
  if (!fs.existsSync(config.comfyWorkflowFile)) {
    throw new Error(`Comfy workflow file not found: ${config.comfyWorkflowFile}`);
  }

  return JSON.parse(fs.readFileSync(config.comfyWorkflowFile, "utf8")) as Workflow;
}

async function readJson(response: Response) {
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    const detail = (data?.error ?? data?.message ?? text) || response.statusText;
    throw new Error(`Comfy API ${response.status}: ${detail}`);
  }

  return data;
}

async function submitWorkflow(workflow: Workflow) {
  const response = await fetch(`${COMFY_BASE_URL}/api/prompt`, {
    method: "POST",
    headers: headers(true),
    body: JSON.stringify({
      prompt: workflow,
      extra_data: {
        api_key_comfy_org: config.comfyApiKey,
      },
    }),
    signal: AbortSignal.timeout(config.requestTimeoutMs),
  });

  const data = await readJson(response);
  const promptId = data?.prompt_id;
  if (!promptId) {
    throw new Error("Comfy API did not return a prompt_id.");
  }

  return promptId as string;
}

async function waitForJob(promptId: string) {
  const started = Date.now();

  while (Date.now() - started < config.comfyTimeoutMs) {
    const response = await fetch(`${COMFY_BASE_URL}/api/job/${promptId}/status`, {
      headers: headers(),
      signal: AbortSignal.timeout(config.requestTimeoutMs),
    });
    const status = await readJson(response);
    const state = status?.status;

    if (state === "completed") {
      return;
    }

    if (["failed", "error", "cancelled"].includes(state)) {
      throw new Error(`Comfy job ${state}: ${status?.error_message ?? "unknown error"}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  throw new Error("Comfy job timed out.");
}

function firstOutputImage(outputs: Record<string, unknown>) {
  for (const output of Object.values(outputs)) {
    const images = (output as { images?: ComfyFile[] }).images ?? [];
    const image = images.find((item) => item.filename);
    if (image) {
      return image;
    }
  }

  return null;
}

async function downloadImage(file: ComfyFile) {
  const params = new URLSearchParams({
    filename: file.filename ?? "",
    subfolder: file.subfolder ?? "",
    type: file.type ?? "output",
  });
  const response = await fetch(`${COMFY_BASE_URL}/api/view?${params}`, {
    headers: headers(),
    signal: AbortSignal.timeout(config.requestTimeoutMs),
  });

  if (!response.ok) {
    throw new Error(`Comfy image download failed: HTTP ${response.status}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

export async function generateImageWithComfy(prompt: string): Promise<GeneratedImage> {
  if (!config.comfyApiKey) {
    throw new Error("COMFY_API_KEY not configured.");
  }

  const workflow = applyComfyWorkflowInputs(loadWorkflow(), prompt);
  const promptId = await submitWorkflow(workflow);
  await waitForJob(promptId);

  const jobResponse = await fetch(`${COMFY_BASE_URL}/api/jobs/${promptId}`, {
    headers: headers(),
    signal: AbortSignal.timeout(config.requestTimeoutMs),
  });
  const job = await readJson(jobResponse);
  const outputImage = firstOutputImage(job?.outputs ?? {});

  if (!outputImage) {
    throw new Error("Comfy job completed without image outputs.");
  }

  return {
    prompt,
    filename: outputImage.filename ?? `zora-genesis-comfy-${Date.now()}.png`,
    mimeType: "image/png",
    buffer: await downloadImage(outputImage),
  };
}
