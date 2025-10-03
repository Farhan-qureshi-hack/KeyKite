// pages/api/selftest.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { scanRepoContent, Finding } from '../../utils/security';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Sample content to run self-test
    const testContent = `
      const awsKey = "AKIAEXAMPLE123456";
      const apiKey = "api_example_890";
    `;

    // Run the scan using the latest function
    const results: Finding[] = scanRepoContent(testContent);

    // Return results
    res.status(200).json({ success: true, results });
  } catch (error) {
    console.error('Self-test error:', error);
    res.status(500).json({ success: false, error: 'Self-test failed' });
  }
}
