"use client";

import { useState } from "react";
import { Finding } from "../../utils/security";

interface SelfTestProps {
  runSelfTest: () => Promise<Finding[]>;
}

export default function SelfTest({ runSelfTest }: SelfTestProps) {
  const [results, setResults] = useState<Finding[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    const res = await runSelfTest();
    setResults(res);
    setLoading(false);
  };

  return (
    <div style={{ marginTop: "16px" }}>
      <button
        onClick={handleClick}
        style={{
          padding: "8px 12px",
          borderRadius: "4px",
          border: "none",
          backgroundColor: "#28a745",
          color: "white",
          cursor: "pointer",
        }}
        disabled={loading}
      >
        {loading ? "Running..." : "Run Self-Test"}
      </button>

      {results && results.length > 0 && (
        <div style={{ marginTop: "16px" }}>
          <h3>Self-Test Results:</h3>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid #eee", padding: 8 }}>File</th>
                <th style={{ border: "1px solid #eee", padding: 8 }}>Line</th>
                <th style={{ border: "1px solid #eee", padding: 8 }}>Type</th>
                <th style={{ border: "1px solid #eee", padding: 8 }}>Snippet</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, idx) => (
                <tr key={idx}>
                  <td style={{ border: "1px solid #eee", padding: 8 }}>{r.file}</td>
                  <td style={{ border: "1px solid #eee", padding: 8 }}>{r.line}</td>
                  <td style={{ border: "1px solid #eee", padding: 8 }}>{r.type}</td>
                  <td style={{ border: "1px solid #eee", padding: 8, fontFamily: "monospace" }}>
                    {r.redacted ? r.redacted : r.snippet}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {results && results.length === 0 && <p>No issues detected.</p>}
    </div>
  );
}
