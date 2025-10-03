// pages/api/selftest.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { scanContent, Finding } from "../../utils/security";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Finding[]>
) {
  // Demo self-test content
  const content = "This is a test.\nPassword=1234\nAnother line";
  const findings = await scanContent(content);

  res.status(200).json(findings);
}
