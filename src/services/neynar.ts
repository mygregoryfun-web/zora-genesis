import axios from "axios";
import { config } from "../config.js";

export const neynar = axios.create({
  baseURL: "https://api.neynar.com/v2",
  timeout: config.requestTimeoutMs,
  headers: {
    "x-api-key": config.neynarApiKey,
    "Content-Type": "application/json",
  },
});
