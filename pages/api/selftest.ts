// pages/api/selftest.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { scanContent } from "../../server/security";
import { Finding } from "../../server/security";

export default function handler(req: NextApiRequest, res: NextApiResponse<{ findings: Finding[] }>) {
  const sample = `// sample.js
const aws = "AKIAABCDEFGHIJKLMNOP";
const api = "api_example_abcdef123456";
const password = "password=secret123";
`;
  const findings = scanContent(sample, "sample.js");
  res.status(200).json({ findings });
}
