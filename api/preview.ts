import { previewPage } from "../src/server.js";

export default function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.status(405).json({
      ok: false,
      error: "Method not allowed",
    });
    return;
  }

  res.setHeader("content-type", "text/html; charset=utf-8");
  res.status(200).send(previewPage());
}
