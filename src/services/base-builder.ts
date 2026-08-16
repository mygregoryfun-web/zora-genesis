import { config } from "../config.js";
import type { BaseBuilderCodeAttribution } from "../types.js";

export const BASE_BUILDER_CODE_PATTERN = /^bc_[a-z0-9]+$/i;

export function isValidBaseBuilderCode(code: string) {
  return BASE_BUILDER_CODE_PATTERN.test(code.trim());
}

export function buildBuilderCodeAttribution(builderCode: string): BaseBuilderCodeAttribution {
  const normalized = builderCode.trim();

  return {
    builderCode: normalized,
    valid: isValidBaseBuilderCode(normalized),
    app: "Zora Genesis",
    attribution: "Base Builder Code attribution for app, wallet, and agent activity.",
    usage: [
      "attribute future Base transactions initiated by approved creator workflows",
      "connect Zora asset creation flows back to the Zora Genesis app",
      "track x402-style paid brief experiments when payments are added",
    ],
    integrationTargets: [
      "Base app analytics",
      "Zora-ready asset creation",
      "premium creator briefs",
      "agent-assisted publishing",
    ],
    safetyBoundary: "Attribution only; this code does not custody funds, sign transactions, or change transaction economics.",
  };
}

export function getBuilderCodeAttribution() {
  return buildBuilderCodeAttribution(config.baseBuilderCode);
}
