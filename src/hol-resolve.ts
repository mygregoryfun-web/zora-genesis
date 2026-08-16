/// <reference types="node" />
import "dotenv/config";
import {
  RegistryBrokerClient,
} from "@hol-org/rb-client";

const requiredAny = (...names: string[]): string => {
  for (const name of names) {
    const value = process.env[name];
    if (value) return value;
  }

  throw new Error(`Missing .env value: ${names.join(" or ")}`);
};

const env = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing .env value: ${name}`);
  }

  return value;
};

const client = new RegistryBrokerClient({
  apiKey: requiredAny("HOL_API_KEY", "REGISTRY_BROKER_API_KEY"),
  accountId: env("ACCOUNT_ID"),
  ledgerApiKey: process.env.LEDGER_API_KEY,
});

const result = await client.resolveUaid(env("HOL_UAID"));
console.log(JSON.stringify(result, null, 2));
