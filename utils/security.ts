// utils/security.ts
export interface Finding {
  file: string;
  line: number;
  type: string;
  snippet: string;
  entropy?: number;
  redacted?: string;
}

export function isTextContent(bufOrStr: string): boolean {
  // crude heuristic: if it contains many control chars it's binary
  // but here input is string; check for NULs or many control chars
  return !/[\x00-\x08\x0E-\x1F]/.test(bufOrStr);
}

export function shannonEntropy(s: string): number {
  if (!s || s.length === 0) return 0;
  const freq: Record<string, number> = {};
  for (const ch of s) freq[ch] = (freq[ch] || 0) + 1;
  let ent = 0;
  const len = s.length;
  for (const k of Object.keys(freq)) {
    const p = freq[k] / len;
    ent -= p * Math.log2(p);
  }
  return ent;
}

export function redactSecret(secret: string): string {
  if (!secret) return '[REDACTED]';
  const last = secret.slice(-4);
  return `[REDACTED]...${last}`;
}

const PATTERNS: { type: string; regex: RegExp }[] = [
  { type: 'AWS Access Key', regex: /AKIA[0-9A-Z]{16}/g },
  { type: 'Google API Key', regex: /AIza[0-9A-Za-z-_]{35}/g },
  { type: 'GitHub PAT-like', regex: /gh[pousr]_[0-9a-zA-Z_]{36}/g },
  { type: 'Slack Token', regex: /xox[baprs]-[0-9a-zA-Z-]{10,48}/g },
  { type: 'JWT', regex: /eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*/g },
  { type: 'Generic API Key (var)', regex: /api[_-]?key\s*[:=]\s*['"]?([A-Za-z0-9-_.]+)['"]?/gi },
  { type: 'Password var', regex: /password\s*[:=]\s*['"].+?['"]/gi },
  { type: 'Private Key PEM', regex: /-----BEGIN (RSA |ENCRYPTED )?PRIVATE KEY-----/g }
];

export function scanContent(filePath: string, content: string): Finding[] {
  const findings: Finding[] = [];
  if (!content || typeof content !== 'string') return findings;
  if (!isTextContent(content)) return findings;

  const lines = content.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const p of PATTERNS) {
      let m: RegExpExecArray | null;
      const re = new RegExp(p.regex);
      // run global matches
      while ((m = re.exec(line)) !== null) {
        const raw = m[0];
        const entropy = shannonEntropy(raw);
        findings.push({
          file: filePath,
          line: i + 1,
          type: p.type,
          snippet: raw,
          entropy,
          redacted: redactSecret(raw)
        });
        // avoid infinite loops for zero-length matches
        if (re.lastIndex === m.index) re.lastIndex++;
      }
    }
  }
  return findings;
}
