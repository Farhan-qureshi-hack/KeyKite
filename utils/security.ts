// utils/security.ts
import fs from "fs";
import path from "path";

// Type for findings
export interface Finding {
  file: string;
  line: number;
  type: string;
  snippet: string;
}

// Safely read file content
export function readFileSafe(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch (err) {
    console.warn(`Cannot read file: ${filePath}`);
    return null;
  }
}

// Scan a single file for secrets
export function scanFile(filePath: string): Finding[] {
  const content = readFileSafe(filePath);
  if (!content) return [];

  const findings: Finding[] = [];
  const lines = content.split("\n");

  const patterns: { type: string; regex: RegExp }[] = [
    { type: "AWS Access Key", regex: /AKIA[0-9A-Z]{16}/ },
    { type: "Generic API Key", regex: /api_[0-9a-zA-Z]{16,}/ },
  ];

  lines.forEach((line, index) => {
    patterns.forEach((p) => {
      const match = line.match(p.regex);
      if (match) {
        findings.push({
          file: filePath,
          line: index + 1,
          type: p.type,
          snippet: match[0],
        });
      }
    });
  });

  return findings;
}

// Scan raw content (string) for secrets
export function scanContent(content: string, fileName = "unknown"): Finding[] {
  const findings: Finding[] = [];
  const lines = content.split("\n");

  const patterns: { type: string; regex: RegExp }[] = [
    { type: "AWS Access Key", regex: /AKIA[0-9A-Z]{16}/ },
    { type: "Generic API Key", regex: /api_[0-9a-zA-Z]{16,}/ },
  ];

  lines.forEach((line, index) => {
    patterns.forEach((p) => {
      const match = line.match(p.regex);
      if (match) {
        findings.push({
          file: fileName,
          line: index + 1,
          type: p.type,
          snippet: match[0],
        });
      }
    });
  });

  return findings;
}

// Recursively scan a directory for secrets
export function scanDirectory(dirPath: string): Finding[] {
  let allFindings: Finding[] = [];

  if (!fs.existsSync(dirPath)) return [];

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      allFindings = allFindings.concat(scanDirectory(fullPath));
    } else if (entry.isFile()) {
      allFindings = allFindings.concat(scanFile(fullPath));
    }
  }

  return allFindings;
}
