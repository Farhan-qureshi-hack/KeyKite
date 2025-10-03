import type { NextApiRequest, NextApiResponse } from "next";
import { scanDirectory } from "../../server/security";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const { path } = req.body;
  if (!path) return res.status(400).json({ error: "Path is required" });

  const findings = scanDirectory(path);
  res.status(200).json({ findings });
}
