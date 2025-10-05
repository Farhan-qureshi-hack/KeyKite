// app/components/ScanResults.tsx
"use client";
import { Finding } from "../../utils/security";

export default function ScanResults({ results }: { results: Finding[] }) {
  if (!results || results.length === 0) return <div>No findings.</div>;

  return (
    <div style={{ marginTop: 12 }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #eee", padding: 8 }}>File</th>
            <th style={{ border: "1px solid #eee", padding: 8 }}>Line</th>
            <th style={{ border: "1px solid #eee", padding: 8 }}>Type</th>
            <th style={{ border: "1px solid #eee", padding: 8 }}>Snippet</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r, i) => (
            <tr key={i}>
              <td style={{ border: "1px solid #eee", padding: 8 }}>{r.file ?? "-"}</td>
              <td style={{ border: "1px solid #eee", padding: 8 }}>{r.line}</td>
              <td style={{ border: "1px solid #eee", padding: 8 }}>{r.type}</td>
              <td style={{ border: "1px solid #eee", padding: 8, fontFamily: "monospace" }}>
                {r.redacted ?? r.snippet}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
