// /server/security.ts
import fs from "fs";
import path from "path";

export function readFileSafe(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch (err) {
    return null;
  }
}

export function scanFile(filePath: string) {
  const content = readFileSafe(filePath);
  if (!content) return [];
  // Example: dummy scan
  const findings = [];
  if (content.includes("AKIA")) {
    findings.push({ line: 1, type: "AWS Access Key", snippet: "AKIA..." });
  }
  return findings;
}

export function scanDirectory(dirPath: string) {
  const files = fs.readdirSync(dirPath);
  let allFindings: any[] = [];
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);
    if (stats.isFile()) {
      allFindings = allFindings.concat(scanFile(filePath));
    }
  }
  return allFindings;
}
