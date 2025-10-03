// utils/security.ts
import fs from "fs";
import path from "path";

// ----------------------
// Types
// ----------------------
export interface Finding {
  line: number;
  type: string;
  snippet: string;
  redacted?: boolean; // optional flag for redacted content
}

// ----------------------
// Utility Functions
// ----------------------

// Safely read a file (returns empty string if file not found)
export function readFileSafe(filePath: string): string {
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch (err) {
    return "";
  }
}

// Scan content for issues (dummy example)
export function scanContent(content: string): Finding[] {
  const findings: Finding[] = [];
  const lines = content.split("\n");

  lines.forEach((line, idx) => {
    if (line.includes("SECRET")) {
      findings.push({
        line: idx + 1,
        type: "Secret detected",
        snippet: line,
        redacted: true,
      });
    }
  });

  return findings;
}

// Scan a single file
export function scanFile(filePath: string): Finding[] {
  const content = readFileSafe(filePath);
  return scanContent(content);
}

// Scan all files in a directory (recursively)
export function scanDirectory(dirPath: string): Finding[] {
  let results: Finding[] = [];
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      results = results.concat(scanDirectory(fullPath));
    } else if (stats.isFile()) {
      results = results.concat(scanFile(fullPath));
    }
  });

  return results;
}

// ----------------------
// Exports
// ----------------------
export { readFileSafe, scanFile, scanContent, scanDirectory, Finding };
