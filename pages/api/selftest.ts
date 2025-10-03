// pages/api/selftest.ts
import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import { scanFile, Finding } from "../../utils/security";

type SelfTestResponse = {
  findings: Finding[];
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SelfTestResponse>
) {
  try {
    // Example self-test file
    const testFilePath = path.join(process.cwd(), "sample.js");
    const findings = scanFile(testFilePath);

    return res.status(200).json({ findings });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ findings: [], error: err.message });
  }
}
