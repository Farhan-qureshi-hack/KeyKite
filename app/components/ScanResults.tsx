"use client";

import type { Finding } from "../../utils/security";

export default function ScanResults({ results }: { results: Finding[] }) {
  if (!results || results.length === 0) {
    return <div style={{ marginTop: 16 }}>No findings.</div>;
  }
  return (
    <div style={{ marginTop: 16 }}>
      <h2 style={{ fontSize: 18, marginBottom: 8 }}>Scan Results ({results.length})</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f6f6f6" }}>
            <th style={{ border: "1px solid #eee", padding: 8 }}>File</th>
            <th style={{ border: "1px solid #eee", padding: 8 }}>Line</th>
            <th style={{ border: "1px solid #eee", padding: 8 }}>Type</th>
            <th style={{ border: "1px solid #eee", padding: 8 }}>Snippet (redacted)</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r, i) => (
            <tr key={i}>
              <td style={{ border: "1px solid #eee", padding: 8 }}>{r.file}</td>
              <td style={{ border: "1px solid #eee", padding: 8 }}>{r.line}</td>
              <td style={{ border: "1px solid #eee", padding: 8 }}>{r.type}</td>
              <td style={{ border: "1px solid #eee", padding: 8, fontFamily: "monospace" }}>{r.redacted ?? r.snippet}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
