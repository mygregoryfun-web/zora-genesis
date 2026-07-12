import "dotenv/config";

import { pathToFileURL } from "node:url";
import { runAgent } from "./agent.js";

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runAgent().catch(console.error);
}
