// server/security.ts
import fs from "fs";
import path from "path";

// Shared Finding type for server usage
export interface Finding {
  file?: string;
  line: number;
  type: string;
  snippet: string;
  redacted?: string;
}

// Safely read a file; returns empty string on error
export function readFileSafe(filePath: string): string {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (err) {
    // swallow read errors and return empty string
    return "";
  }
}

// Scan raw content for secrets. Server version (same patterns as frontend).
export function scanContent(content: string, fileName = "inline"): Finding[] {
  const findings: Finding[] = [];
  const lines = content.split("\n");
  const patterns: { type: string; re: RegExp }[] = [
    { type: "AWS Access Key", re: /AKIA[0-9A-Z]{16}/ },
    { type: "Generic API Key", re: /api_[0-9A-Za-z\-_]{8,}/ },
    { type: "Possible Password", re: /password\s*[:=]\s*[^\s'"]+/i },
    { type: "Private Key", re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  ];

  lines.forEach((line, idx) => {
    patterns.forEach((p) => {
      const m = line.match(p.re);
      if (m) {
        const snippet = m[0];
        findings.push({
          file: fileName,
          line: idx + 1,
          type: p.type,
          snippet,
          redacted: snippet.length > 8 ? `${snippet.slice(0, 4)}...${snippet.slice(-4)}` : snippet,
        });
      }
    });
  });

  return findings;
}

// Scan single file path
export function scanFile(filePath: string): Finding[] {
  const content = readFileSafe(filePath);
  if (!content) return [];
  return scanContent(content, path.basename(filePath));
}

// Recursively scan a directory (returns all findings)
export function scanDirectory(dirPath: string): Finding[] {
  const results: Finding[] = [];
  if (!fs.existsSync(dirPath)) return results;

  const items = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const item of items) {
    const full = path.join(dirPath, item.name);
    if (item.isDirectory()) {
      results.push(...scanDirectory(full));
    } else if (item.isFile()) {
      // scan only text-like extensions to avoid binary blobs
      const ext = path.extname(item.name).toLowerCase();
      const textExts = [
        ".js", ".ts", ".jsx", ".tsx", ".py", ".rb", ".go", ".java", ".json", ".env", ".yml", ".yaml", ".sh", ".txt", ".md",
      ];
      if (textExts.includes(ext) || ext === "") {
        results.push(...scanFile(full));
      }
    }
  }

  return results;
}
