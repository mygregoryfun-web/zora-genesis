import "dotenv/config";
import { RegistryBrokerClient } from "@hol-org/rb-client";

const client = new RegistryBrokerClient({
  apiKey: process.env.REGISTRY_BROKER_API_KEY ?? process.env.HOL_API_KEY,
});

const stats = await client.stats();

console.log(JSON.stringify(stats, null, 2));
