"use client";

import type { Finding } from "../../utils/security";

export default function SelfTest({ onSetResults }: { onSetResults: (r: Finding[]) => void }) {
  const run = () => {
    const sample: Finding[] = [
      { file: "sample.js", line: 2, type: "AWS Access Key", snippet: "AKIAABCDEFGHIJKLMNOP", redacted: "AKIA...MNOP", entropy: 3.88 },
      { file: "sample.js", line: 3, type: "Generic API Key", snippet: "api_key='abcdef1234567890'", redacted: "api_...890'", entropy: 4.47 }
    ];
    onSetResults(sample);
  };

  return (
    <div style={{ marginTop: 18 }}>
      <button onClick={run} style={{ padding: "8px 12px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 4 }}>
        Run Self-Test
      </button>
    </div>
  );
}
