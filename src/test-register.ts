import "dotenv/config";
import {
  RegistryBrokerClient,
  RegistryBrokerError,
  isPendingRegisterAgentResponse,
  isSuccessRegisterAgentResponse,
} from "@hol-org/rb-client";
import { getRegistrationPayload } from "./profile.js";

function env(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable ${name}`);
  }
  return value;
}

async function main() {
  const apiKey = env("REGISTRY_BROKER_API_KEY");
  const accountId = env("ACCOUNT_ID");
  const endpoint = env("AGENT_ENDPOINT");

  const client = new RegistryBrokerClient({
    apiKey,
    accountId,
  });

  const payload = {
    ...getRegistrationPayload(),
    endpoint,
  };

  try {
    console.log("Getting registration quote...");

    const quote = await client.getRegistrationQuote(payload);

    console.log(JSON.stringify(quote, null, 2));

    console.log("Registering agent...");

    const registration = await client.registerAgent(payload);

    console.log(JSON.stringify(registration, null, 2));

    if (isSuccessRegisterAgentResponse(registration)) {
      console.log("UAID:", registration.uaid);
      return;
    }

    if (isPendingRegisterAgentResponse(registration)) {
      console.log("Waiting for completion...");

      const pendingRegistration = registration as any;
      const registrationId =
        typeof pendingRegistration.registrationId === "string"
          ? pendingRegistration.registrationId
          : pendingRegistration.registration_id;

      if (!registrationId) {
        throw new Error("Missing registration identifier on pending response");
      }

      const result = await client.waitForRegistrationCompletion(registrationId);

      console.log(JSON.stringify(result, null, 2));

      return;
    }

    console.log("Unknown registration response:");
    console.log(JSON.stringify(registration, null, 2));
  } catch (err) {
    if (err instanceof RegistryBrokerError) {
      console.error("STATUS:", err.status);
      console.error("BODY:", JSON.stringify(err.body, null, 2));
      return;
    }

    console.error(err);
  }
}

main();
