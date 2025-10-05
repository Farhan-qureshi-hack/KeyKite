// pages/api/scan.ts
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { scanContent } from "../../server/security";
import { Finding } from "../../server/security";

type TResp = { repo: string; findings: Finding[]; error?: string };

function parseGithubRepo(url: string) {
  // accepts https://github.com/owner/repo or git@github.com:owner/repo.git
  try {
    // handle git@... or https
    if (url.startsWith("git@")) {
      const parts = url.split(":")[1].replace(/\.git$/, "");
      const [owner, repo] = parts.split("/");
      return { owner, repo };
    }
    const u = new URL(url);
    const parts = u.pathname.replace(/^\/|\.git$/g, "").split("/");
    const owner = parts[0];
    const repo = parts[1];
    return { owner, repo };
  } catch {
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<TResp>) {
  if (req.method !== "POST") return res.status(405).json({ repo: "", findings: [], error: "Only POST" });

  const { repoUrl } = req.body;
  if (!repoUrl) return res.status(400).json({ repo: "", findings: [], error: "repoUrl required" });

  const repoInfo = parseGithubRepo(repoUrl);
  if (!repoInfo) return res.status(400).json({ repo: repoUrl, findings: [], error: "Invalid repo URL" });

  const { owner, repo } = repoInfo;
  const githubToken = process.env.GITHUB_TOKEN || "";

  try {
    // Get default branch
    const repoResp = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: githubToken ? { Authorization: `token ${githubToken}` } : undefined,
    });
    const defaultBranch = repoResp.data.default_branch || "main";

    // Get tree recursive
    const treeResp = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`,
      { headers: githubToken ? { Authorization: `token ${githubToken}` } : undefined }
    );

    const tree = treeResp.data.tree as Array<{ path: string; type: string; url?: string }>;
    // Filter files by text-like extensions
    const textExts = [
      ".js", ".ts", ".jsx", ".tsx", ".py", ".rb", ".go", ".java", ".json", ".env", ".yml", ".yaml", ".sh", ".txt", ".md",
    ];

    const filePaths = tree
      .filter((t) => t.type === "blob")
      .map((t) => t.path)
      .filter((p) => {
        const ext = p.includes(".") ? p.slice(p.lastIndexOf(".")).toLowerCase() : "";
        return textExts.includes(ext) || ext === "";
      });

    const findings: Finding[] = [];

    // fetch raw file contents (chunks)
    const maxFiles = 100; // safety cap
    let count = 0;
    for (const fp of filePaths) {
      if (count >= maxFiles) break;
      count++;
      try {
        const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/${fp}`;
        const fileResp = await axios.get(rawUrl, {
          headers: githubToken ? { Authorization: `token ${githubToken}` } : undefined,
          responseType: "text",
        });
        const content = fileResp.data as string;
        const found = scanContent(content, fp);
        if (found.length) findings.push(...found);
      } catch (e) {
        // ignore individual file errors
      }
    }

    return res.status(200).json({ repo: `${owner}/${repo}`, findings });
  } catch (err: any) {
    const message = err?.response?.data?.message || err.message || "scan error";
    return res.status(500).json({ repo: `${owner}/${repo}`, findings: [], error: String(message) });
  }
}
