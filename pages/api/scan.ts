// pages/api/scan.ts
import type { NextApiRequest, NextApiResponse } from "next";
import os from "os";
import path from "path";
import fs from "fs";
import { simpleGit } from "simple-git";
import { scanFile, readFileSafe, Finding } from "../../utils/security";

type Resp = { success: true; findings: Finding[]; scanned: number; totalFiles: number } | { success: false; error: string };

function walkDir(dir: string, exts: string[] = []): string[] {
  const out: string[] = [];
  const items = fs.readdirSync(dir);
  for (const it of items) {
    const full = path.join(dir, it);
    try {
      const st = fs.statSync(full);
      if (st.isDirectory()) {
        out.push(...walkDir(full, exts));
      } else if (st.isFile()) {
        if (exts.length === 0 || exts.some(e => full.endsWith(e))) out.push(full);
      }
    } catch (e) { /* ignore */ }
  }
  return out;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Resp>) {
  if (req.method !== "POST") return res.status(405).json({ success: false, error: "POST only" });

  const { repoUrl } = req.body;
  if (!repoUrl || typeof repoUrl !== "string") return res.status(400).json({ success: false, error: "repoUrl required" });

  // temp dir
  const tmp = path.join(os.tmpdir(), `keykite-${Date.now()}`);
  const git = simpleGit();
  const findings: Finding[] = [];

  try {
    // Prepare clone URL: if GITHUB_TOKEN exists and repoUrl is github.com, use token to allow private clones
    let cloneUrl = repoUrl;
    const token = process.env.GITHUB_TOKEN;
    const githubMatch = repoUrl.match(/https?:\/\/(github\.com\/.+)/i);
    if (token && githubMatch) {
      // embed token for cloning: https://<token>@github.com/owner/repo.git
      // ensure .git suffix
      const repoPath = githubMatch[1].replace(/^\/?/, "");
      const normalized = repoUrl.endsWith(".git") ? repoUrl : `https://github.com/${repoPath}.git`;
      const u = new URL(normalized);
      u.username = token;
      cloneUrl = u.toString();
    }

    // clone shallow to temp dir
    await git.clone(cloneUrl, tmp, ['--depth', '1']);
    // walk files, limit to relevant extensions
    const files = walkDir(tmp, ['.js', '.ts', '.jsx', '.tsx', '.env', '.json', '.py', '.go', '.rb', '.rs', '.java', '.sh', '.yaml', '.yml', '.md']);
    const totalFiles = files.length;
    let scanned = 0;

    for (const file of files) {
      scanned++;
      const content = readFileSafe(file);
      if (!content) continue;
      const fileFindings = scanFile(path.relative(tmp, file), content);
      // redact snippets in returned results (we already have redacted)
      findings.push(...fileFindings);
    }

    // cleanup
    try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) { /* ignore */ }

    return res.status(200).json({ success: true, findings, scanned, totalFiles });
  } catch (err: any) {
    // cleanup
    try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) { /* ignore */ }
    const msg = err?.message || String(err);
    return res.status(500).json({ success: false, error: `Scan failed: ${msg}` });
  }
}
