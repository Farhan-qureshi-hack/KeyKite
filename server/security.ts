// server/security.ts

import fs from "fs";
import path from "path";

// ----------------------
// Types
// ----------------------
export interface Finding {
  line: number;
  type: string;
  snippet: string;
  redacted?: boolean;
}

// ----------------------
// Utility Functions
// ----------------------

// Safe file read (returns empty string on error)
export const readFileSafe = (filePath: string): string => {
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch (err) {
    console.error(`Failed to read file ${filePath}:`, err);
    return "";
  }
};

// Scan a single file (dummy example)
export const scanFile = (filePath: string): Finding[] => {
  const content = readFileSafe(filePath);
  const findings: Finding[] = [];

  const lines = content.split("\n");
  lines.forEach((line, index) => {
    if (line.includes("SECRET")) {
      findings.push({
        line: index + 1,
        type: "SecretFound",
        snippet: line,
        redacted: true,
      });
    }
  });

  return findings;
};

// Scan raw content (string)
export const scanContent = (content: string): Finding[] => {
  const findings: Finding[] = [];
  const lines = content.split("\n");

  lines.forEach((line, index) => {
    if (line.includes("SECRET")) {
      findings.push({
        line: index + 1,
        type: "SecretFound",
        snippet: line,
        redacted: true,
      });
    }
  });

  return findings;
};

// Scan all files in a directory recursively
export const scanDirectory = (dirPath: string): Finding[] => {
  let allFindings: Finding[] = [];

  const items = fs.readdirSync(dirPath, { withFileTypes: true });

  items.forEach((item) => {
    const fullPath = path.join(dirPath, item.name);

    if (item.isDirectory()) {
      allFindings = allFindings.concat(scanDirectory(fullPath));
    } else if (item.isFile()) {
      allFindings = allFindings.concat(scanFile(fullPath));
    }
  });

  return allFindings;
};
