import "dotenv/config";
import { scanContractSecurity, type SecurityNetwork } from "./services/contract-security.js";

const address = process.argv[2];
const network = (process.argv[3] ?? "base") as SecurityNetwork;

if (!address || !["base", "base-sepolia"].includes(network)) {
  throw new Error("Usage: npm run security:scan -- <contract-address> [base|base-sepolia]");
}

console.log(JSON.stringify(await scanContractSecurity({ address, network }), null, 2));
