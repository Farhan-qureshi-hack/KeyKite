// pages/api/scan.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import axios, { AxiosResponse } from 'axios';
import { scanContent, Finding } from '../../utils/security';

const RETRY = 2;
const DELAY_MS = 250; // small delay between retries to reduce spiky errors
const MAX_FILES = 1000; // safety cap to avoid scanning huge trees (adjustable)

async function axiosGetWithRetry(url: string, headers: any, retries = RETRY): Promise<AxiosResponse<any>> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await axios.get(url, { headers, timeout: 15000 });
    } catch (err: any) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, DELAY_MS * (attempt + 1)));
    }
  }
  throw new Error('unreachable');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const repoParam = (req.query.repo as string) || '';
    if (!repoParam) return res.status(400).json({ success: false, error: 'Missing repo query parameter' });

    const token = process.env.GITHUB_TOKEN;
    if (!token) return res.status(500).json({ success: false, error: 'Server missing GITHUB_TOKEN' });

    const parsed = repoParam.replace(/https?:\/\/(www\.)?github\.com\//i, '').split('/');
    if (parsed.length < 2) return res.status(400).json({ success: false, error: 'Invalid GitHub repo URL' });
    const owner = parsed[0];
    const repo = parsed[1];

    const headers = { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' };

    // 1) Get repo info to find default branch
    const repoInfo = await axiosGetWithRetry(`https://api.github.com/repos/${owner}/${repo}`, headers);
    const defaultBranch = repoInfo.data?.default_branch || 'main';

    // 2) Fetch Git tree recursively
    const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(defaultBranch)}?recursive=1`;
    const treeResp = await axiosGetWithRetry(treeUrl, headers);

    const tree = treeResp.data?.tree || [];
    let files = tree.filter((f: any) => f.type === 'blob');
    if (!Array.isArray(files)) files = [];

    // Safety cap
    const totalFiles = Math.min(files.length, MAX_FILES);
    if (files.length > MAX_FILES) {
      files = files.slice(0, MAX_FILES);
    }

    const findings: Finding[] = [];
    let scanned = 0;

    for (const file of files) {
      scanned++;
      try {
        // fetch file content
        const fileUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(file.path)}?ref=${defaultBranch}`;
        const blobResp = await axiosGetWithRetry(fileUrl, headers);

        const { data } = blobResp;
        if (!data || !data.content || data.encoding !== 'base64') {
          continue;
        }
        const content = Buffer.from(data.content, 'base64').toString('utf8');

        // scan safely
        const fileFindings = scanContent(file.path, content);
        // push redacted/snippet + entropy already present
        findings.push(...fileFindings.map((f) => {
          // ensure we never return raw secrets in snippet field by default in UI (we keep snippet for internal checks)
          return { ...f, snippet: f.redacted || f.snippet };
        }));
      } catch (err: any) {
        console.warn('Skipped file:', file.path, err.message || err);
        // continue scanning next file
      }
    }

    return res.status(200).json({ success: true, results: findings, scanned, total: totalFiles });
  } catch (err: any) {
    console.error('Scan error:', err.message || err);
    return res.status(500).json({ success: false, error: err.message || 'Scan failed' });
  }
}
