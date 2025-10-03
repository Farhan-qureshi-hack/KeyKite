// utils/security.ts
export interface Finding {
  file: string;
  line: number;
  type: string;
  snippet: string;
}

// Regular expressions to detect secrets
const regexPatterns: { type: string; pattern: RegExp }[] = [
  {
    type: 'AWS Access Key',
    pattern: /\bAKIA[0-9A-Z]{16}\b/g,
  },
  {
    type: 'AWS Secret Key',
    pattern: /\b(?<![A-Z0-9])[A-Za-z0-9/+=]{40}(?![A-Z0-9])\b/g,
  },
  {
    type: 'Generic API Key',
    pattern: /\b(api_)[A-Za-z0-9]{16,40}\b/g,
  },
  {
    type: 'Private Key',
    pattern: /-----BEGIN (?:RSA|EC|DSA)? PRIVATE KEY-----[\s\S]+?-----END (?:RSA|EC|DSA)? PRIVATE KEY-----/g,
  },
];

/**
 * Scan a single file content for secrets.
 * @param fileName - Name of the file
 * @param content - Content of the file
 * @returns Array of findings
 */
export function scanFileContent(fileName: string, content: string): Finding[] {
  const findings: Finding[] = [];
  const lines = content.split('\n');

  lines.forEach((lineContent, index) => {
    regexPatterns.forEach(({ type, pattern }) => {
      const matches = lineContent.match(pattern);
      if (matches) {
        matches.forEach((match) => {
          findings.push({
            file: fileName,
            line: index + 1,
            type,
            snippet: match,
          });
        });
      }
    });
  });

  return findings;
}

/**
 * Scan multiple files content.
 * @param files - Object with filename as key and content as value
 * @returns Array of findings across all files
 */
export function scanRepo(files: Record<string, string>): Finding[] {
  let results: Finding[] = [];

  Object.entries(files).forEach(([fileName, content]) => {
    const fileFindings = scanFileContent(fileName, content);
    results = results.concat(fileFindings);
  });

  return results;
}

/**
 * Scan raw content (for self-test)
 * @param content - Content string
 * @returns Array of findings
 */
export function scanRepoContent(content: string): Finding[] {
  return scanFileContent('selftest.js', content);
}
