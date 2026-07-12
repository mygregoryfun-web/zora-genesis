import { config } from "../../src/config.js";
import { getAgentProfile } from "../../src/profile.js";

export default function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.status(405).json({
      ok: false,
      error: "Method not allowed",
    });
    return;
  }

  res.status(200).json({
    profile: getAgentProfile(),
    endpoint: config.agentEndpoint,
    publicUrl: config.agentPublicUrl,
    communicationProtocol: "hcs-10",
  });
}
