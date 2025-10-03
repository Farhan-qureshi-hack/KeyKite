// server/security.ts
import fs from "fs";
import path from "path";
import { Finding } from "../utils/security";

// Safely read a file
export const readFileSafe = (filePath: string): string => {
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return "";
  }
};

// Scan file content for secrets
export const scanFile = (filePath: string): Finding[] => {
  const content = readFileSafe(filePath);
  const lines = content.split("\n");
  const results: Finding[] = [];

  lines.forEach((line, idx) => {
    if (line.toLowerCase().includes("password")) {
      results.push({
        line: idx + 1,
        type: "Potential Secret",
        snippet: line,
      });
    }
  });

  return results;
};

// Scan all files in a directory (recursively)
export const scanDirectory = (dirPath: string): Finding[] => {
  const results: Finding[] = [];
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      results.push(...scanDirectory(fullPath));
    } else {
      results.push(...scanFile(fullPath));
    }
  });

  return results;
};
