import dotenv from "dotenv";

dotenv.config();

export const env = {
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  NEYNAR_API_KEY: process.env.NEYNAR_API_KEY,
  NEYNAR_SIGNER_UUID: process.env.NEYNAR_SIGNER_UUID,
};

// fail-fast
for (const [key, value] of Object.entries(env)) {
  if (!value) {
    throw new Error(`❌ Missing env: ${key}`);
  }
}
