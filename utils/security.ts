// utils/security.ts
import fs from "fs";

export type Finding = {
  file: string;
  line: number;
  type: string;
  snippet: string;
  entropy?: number;
  redacted?: string;
};

const PATTERNS: { type: string; regex: RegExp }[] = [
  { type: "AWS Access Key", regex: /AKIA[0-9A-Z]{16}/g },
  { type: "Google API Key", regex: /AIza[0-9A-Za-z-_]{35}/g },
  { type: "GitHub PAT-like", regex: /gh[pousr]_[0-9A-Za-z_]{36}/g },
  { type: "Generic API Key (var)", regex: /api[_-]?key\s*[:=]\s*['"]?([A-Za-z0-9\-_]+)['"]?/gi },
  { type: "JWT", regex: /eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*/g },
  { type: "Password var", regex: /password\s*[:=]\s*['"].+?['"]/gi },
  { type: "Private Key PEM", regex: /-----BEGIN (?:RSA |ENCRYPTED )?PRIVATE KEY-----/g }
];

export function isText(content: Buffer | string): boolean {
  const s = typeof content === "string" ? content : content.toString("utf8", 0, Math.min(64, content.length));
  // if it has NULs or many control chars, treat as binary
  if (/[\x00]/.test(s)) return false;
  const controlChars = s.replace(/[\r\n\t]/g, "").split("").filter(c => c.charCodeAt(0) < 32).length;
  return controlChars / Math.max(1, s.length) < 0.3;
}

export function shannonEntropy(s: string): number {
  if (!s) return 0;
  const freq: Record<string, number> = {};
  for (const ch of s) freq[ch] = (freq[ch] || 0) + 1;
  let ent = 0;
  const len = s.length;
  for (const k in freq) {
    const p = freq[k] / len;
    ent -= p * Math.log2(p);
  }
  return ent;
}

export function redact(s: string): string {
  if (!s) return "[REDACTED]";
  if (s.length <= 6) return "[REDACTED]";
  return s.slice(0, 4) + "..." + s.slice(-4);
}

export function scanFile(filePath: string, content: string): Finding[] {
  const res: Finding[] = [];
  if (typeof content !== "string") content = String(content);
  const lines = content.split(/\r?\n/);
  lines.forEach((line, idx) => {
    for (const p of PATTERNS) {
      let m: RegExpExecArray | null;
      const regex = new RegExp(p.regex);
      // run global matches on the line
      while ((m = regex.exec(line)) !== null) {
        const raw = m[0];
        const entropy = shannonEntropy(raw);
        res.push({
          file: filePath,
          line: idx + 1,
          type: p.type,
          snippet: raw,
          entropy,
          redacted: redact(raw)
        });
        if (regex.lastIndex === m.index) regex.lastIndex++;
      }
    }
  });
  return res;
}

// helper: read file safely (skip if too big)
export function readFileSafe(path: string, maxBytes = 1024 * 1024): string | null {
  try {
    const stat = fs.statSync(path);
    if (stat.size > maxBytes) return null;
    const buf = fs.readFileSync(path);
    if (!isText(buf)) return null;
    return buf.toString("utf8");
  } catch (e) {
    return null;
  }
}
