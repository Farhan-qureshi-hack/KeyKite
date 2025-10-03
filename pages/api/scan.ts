// pages/api/scan.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { scanDirectory, Finding } from "../../server/security";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Finding[]>
) {
  const { dir } = req.query;
  if (!dir || typeof dir !== "string") {
    res.status(400).json([]);
    return;
  }

  try {
    const findings = scanDirectory(dir);
    res.status(200).json(findings);
  } catch {
    res.status(500).json([]);
  }
}
