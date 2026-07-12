import { config } from "../src/config.js";

export default function handler(_req: any, res: any) {
  res.status(200).json({
    ok: true,
    service: "zora-genesis",
    dryRun: config.dryRun,
  });
}
