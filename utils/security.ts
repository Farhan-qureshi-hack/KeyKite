// utils/security.ts
// Frontend-safe types + helpers (no Node APIs)

export interface Finding {
  file?: string;
  line: number;
  type: string;
  snippet: string;
  redacted?: string;
}

// Client-side/dummy scan function (used by UI for previews or self-test UI)
// This does not use fs or any Node API.
export function scanContentDummy(content: string, fileName = "inline"): Finding[] {
  const findings: Finding[] = [];
  const lines = content.split("\n");
  const patterns: { type: string; re: RegExp }[] = [
    { type: "Potential AWS Key", re: /AKIA[0-9A-Z]{16}/i },
    { type: "Potential API Key", re: /api_[0-9A-Za-z\-_]{8,}/i },
    { type: "Possible Password", re: /password\s*[:=]\s*[^\s'"]+/i },
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
