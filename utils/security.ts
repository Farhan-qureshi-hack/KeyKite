// utils/security.ts
import fs from "fs";
import path from "path";

// Define Finding type
export interface Finding {
  type: string;
  snippet: string;
  line?: number;
  redacted?: string; // Optional, for UI display
}

// Safely read a file
export function readFileSafe(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (err) {
    console.error(`Failed to read file ${filePath}:`, err);
    return null;
  }
}

// Scan content for secrets
export function scanContent(content: string): Finding[] {
  const findings: Finding[] = [];

  // Regex for AWS Access Key
  const awsKeyRegex = /AKIA[0-9A-Z]{16}/g;
  const apiKeyRegex = /api_[0-9a-zA-Z]{16,}/g;

  content.match(awsKeyRegex)?.forEach(key => {
    findings.push({
      type: "AWS Access Key",
      snippet: key,
      redacted: key.slice(0, 4) + "..." + key.slice(-4) // partially hide for UI
    });
  });

  content.match(apiKeyRegex)?.forEach(key => {
    findings.push({
      type: "Generic API Key",
      snippet: key,
      redacted: key.slice(0, 4) + "..." + key.slice(-4)
    });
  });

  return findings;
}

// Scan a file for secrets
export function scanFile(filePath: string): Finding[] {
  const content = readFileSafe(filePath);
  if (!content) return [];
  return scanContent(content);
}

// Optional: recursively scan a directory
export function scanDirectory(dirPath: string, exts: string[] = [".js", ".ts", ".env"]): Finding[] {
  const results: Finding[] = [];
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      results.push(...scanDirectory(fullPath, exts));
    } else if (exts.includes(path.extname(file))) {
      results.push(...scanFile(fullPath));
    }
  });

  return results;
}

// Export everything for API usage
export { scanFile, scanContent, scanDirectory };

