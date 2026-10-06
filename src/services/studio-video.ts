import crypto from "node:crypto";
import { config } from "../config.js";
import { supabaseFetch, type StudioSession } from "./auth.js";
import { createRunwayImageToVideoTask, getRunwayTask, type RunwayVideoInput } from "./runway-video.js";

export class VideoPurchaseRequiredError extends Error {
  readonly code = "VIDEO_PURCHASE_REQUIRED";
  constructor() { super("AI video zahteva potrjen nakup kreditov. Začetnih 50 brezplačnih kreditov ne odklene AI videa."); }
}

export async function hasVideoAccess(session: StudioSession | null): Promise<boolean> {
  if (!session) return false;
  if (session.role === "owner") return true;
  if (!config.supabaseUrl || !config.supabaseServiceRoleKey) return false;
  const payments = await supabaseFetch("studio_payments", {}, `?email=eq.${encodeURIComponent(session.email)}&status=eq.confirmed&credits=gt.0&amount_usdc=gt.0&select=tx_hash&limit=1`);
  return Array.isArray(payments) && payments.length > 0;
}

export function validateVideoInput(input: any): RunwayVideoInput {
  if (!input || typeof input.promptText !== "string" || !input.promptText.trim() || input.promptText.length > 1000) throw new Error("Opis videa mora vsebovati od 1 do 1000 znakov.");
  if (typeof input.promptImage !== "string" || input.promptImage.length > 5_000_000 || !/^(data:image\/(png|jpeg|webp);base64,|https:\/\/)/i.test(input.promptImage)) throw new Error("Slika za video ni veljavna.");
  if (![5, 10].includes(input.duration) || !["720:1280", "1280:720", "960:960"].includes(input.ratio)) throw new Error("Trajanje ali format videa ni veljaven.");
  if (input.model && input.model !== "gen4_turbo") throw new Error("Ta video model ni podprt.");
  return { ...input, model: "gen4_turbo" };
}

async function ledger(session: StudioSession, action: string, id: string, cost = 0, taskId: string | null = null) {
  if (!config.supabaseUrl || !config.supabaseServiceRoleKey) throw new Error("Trajno obračunavanje videa zahteva Supabase in studio-video migracijo.");
  return supabaseFetch("rpc/studio_video_transaction", { method: "POST", body: JSON.stringify({ p_email: session.email, p_action: action, p_id: id, p_cost: cost, p_task_id: taskId, p_owner: session.role === "owner" }) });
}

export async function generateStudioVideo(session: StudioSession, body: unknown) {
  if (!await hasVideoAccess(session)) throw new VideoPurchaseRequiredError();
  const input = validateVideoInput(body);
  if (!config.runwayApiSecret) throw new Error("Runway ni nastavljen.");
  const id = crypto.randomUUID();
  const cost = input.duration === 10 ? 50 : 25;
  await ledger(session, "reserve", id, cost);
  let task;
  try { task = await createRunwayImageToVideoTask(input); }
  catch (error) { await ledger(session, "refund", id); throw error; }
  // Do not refund an accepted provider job if recording its ID fails: it may still succeed.
  await ledger(session, "bind", id, 0, task.id);
  return { ...task, billingId: id, estimatedCost: { credits: cost } };
}

export async function getStudioVideo(session: StudioSession, taskId: string) {
  if (!/^[a-zA-Z0-9_-]{1,100}$/.test(taskId)) throw new Error("ID video naloge ni veljaven.");
  const result = await supabaseFetch("studio_video_jobs", {}, `?task_id=eq.${encodeURIComponent(taskId)}&email=eq.${encodeURIComponent(session.email)}&select=id,status&limit=1`);
  const rows = Array.isArray(result) ? result as { id: string; status: string }[] : [];
  if (!rows?.[0]) throw new Error("Video naloga za ta račun ni bila najdena.");
  const task = await getRunwayTask(taskId);
  if (["FAILED", "CANCELED"].includes(task.status ?? "")) await ledger(session, "refund", rows[0].id);
  if (task.status === "SUCCEEDED") await ledger(session, "complete", rows[0].id);
  return task;
}
