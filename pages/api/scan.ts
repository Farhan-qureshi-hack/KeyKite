// pages/api/scan.ts
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { scanContent, scanFile, Finding } from "../../utils/security";

type ScanResponse = {
  repoUrl: string;
  findings: Finding[];
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ScanResponse>
) {
  const { repoUrl } = req.body;

  if (!repoUrl) {
    return res.status(400).json({ repoUrl: "", findings: [], error: "Missing repoUrl" });
  }

  try {
    // Fetch repository content (simple example for a single file)
    const fileUrl = repoUrl.endsWith("/") ? repoUrl + "sample.js" : repoUrl + "/sample.js";
    const response = await axios.get(fileUrl);
    const content = response.data as string;

    const findings = scanContent(content);

    return res.status(200).json({ repoUrl, findings });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ repoUrl, findings: [], error: err.message });
  }
}
