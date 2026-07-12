import "dotenv/config";

console.log("HOL_API_KEY:", (process.env.REGISTRY_BROKER_API_KEY ?? (process.env.REGISTRY_BROKER_API_KEY ?? process.env.HOL_API_KEY)) ? "FOUND" : "MISSING");
console.log("REGISTRY_BROKER_API_KEY:", process.env.REGISTRY_BROKER_API_KEY ? "FOUND" : "MISSING");
console.log("ACCOUNT_ID:", process.env.ACCOUNT_ID ? "FOUND" : "MISSING");
console.log("LEDGER_API_KEY:", process.env.LEDGER_API_KEY ? "FOUND" : "MISSING");
