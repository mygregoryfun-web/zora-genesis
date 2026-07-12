/// <reference types="node" />
import "dotenv/config";
import {
  RegistryBrokerClient,
  RegistryBrokerError,
  isPendingRegisterAgentResponse,
  isSuccessRegisterAgentResponse,
} from "@hol-org/rb-client";
import { getRegistrationPayload } from "./profile.js";

const hederaAccountPattern = /^0\.0\.\d+$/;

const requiredAny = (...names: string[]): string => {
  for (const name of names) {
    const value = process.env[name];
    if (value) return value;
  }

  throw new Error(`Missing .env value: ${names.join(" or ")}`);
};

const requireHederaAccountId = () => {
  const accountId = process.env.ACCOUNT_ID;
  if (!accountId) {
    throw new Error("Missing .env value: ACCOUNT_ID");
  }

  if (!hederaAccountPattern.test(accountId)) {
    throw new Error("ACCOUNT_ID must be a Hedera account ID like 0.0.123456, not a UUID.");
  }

  return accountId;
};

const requireAgentEndpoint = () => {
  const endpoint = process.env.AGENT_ENDPOINT;
  if (!endpoint) {
    throw new Error("Missing .env value: AGENT_ENDPOINT");
  }

  if (endpoint === "https://example.com") {
    throw new Error("AGENT_ENDPOINT must be your deployed HTTPS agent URL, not https://example.com.");
  }

  return endpoint;
};

const client = new RegistryBrokerClient({
  apiKey: requiredAny("HOL_API_KEY", "REGISTRY_BROKER_API_KEY"),
  accountId: requireHederaAccountId(),
  ledgerApiKey: process.env.LEDGER_API_KEY,
});

requireAgentEndpoint();
const payload = getRegistrationPayload();

async function main() {
  try {
    console.log("Payload:");
    console.log(JSON.stringify(payload, null, 2));

    const quote = await client.getRegistrationQuote(payload);
    console.log("Registration quote:");
    console.log(JSON.stringify(quote, null, 2));

    const result = await client.registerAgent(payload);
    console.log("Registration result:");
    console.log(JSON.stringify(result, null, 2));

    if (isSuccessRegisterAgentResponse(result)) {
      console.log("UAID:", result.uaid);
      return;
    }

    if (isPendingRegisterAgentResponse(result)) {
      console.log("Registration pending. Waiting...");

      const registrationId = (result as any).registrationId ?? (result as any).registration_id ?? (result as any).id;
      if (!registrationId) throw new Error("Pending registration response missing registration id");

      const completed = await client.waitForRegistrationCompletion(registrationId);

      console.log("Completed registration:");
      console.log(JSON.stringify(completed, null, 2));

      if ("uaid" in completed) {
        console.log("UAID:", completed.uaid);
      }

      return;
    }

    console.log("Partial/unknown registration response:");
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    if (error instanceof RegistryBrokerError) {
      console.error("RegistryBrokerError:");
      console.error("Status:", error.status);
      console.error("Body:", JSON.stringify(error.body, null, 2));

      const bodyText = JSON.stringify(error.body || {});
      if (bodyText.toLowerCase().includes("credit")) {
        console.error("Possible issue: insufficient HOL/ledger credits.");
      }

      process.exit(1);
    }

    console.error(error);
    process.exit(1);
  }
}

main();
