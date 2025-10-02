// pages/api/selftest.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { scanContent } from '../../utils/security';

type TestResult = { run: number; findingsCount: number; findingsSample: any[] };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // number of iterations to run
    const iterations = Number(req.query.iterations || 3);
    const sampleFile = `sample.js`;
    const sampleContent = `
      // Demo file with fake keys
      const AWS = "AKIAABCDEFGHIJKLMNOP";
      const TOKEN = "api_key='abcdef1234567890'";
      // normal code
      function hello() { return "ok"; }
    `;

    const out: TestResult[] = [];
    for (let i = 1; i <= iterations; i++) {
      const findings = scanContent(sampleFile, sampleContent);
      out.push({ run: i, findingsCount: findings.length, findingsSample: findings.slice(0, 5) });
      // small delay to simulate repeated runs
      await new Promise((r) => setTimeout(r, 400));
    }

    return res.status(200).json({ success: true, runs: out });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'selftest failed' });
  }
}
