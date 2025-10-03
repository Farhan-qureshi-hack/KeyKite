// app/components/ScanResults.tsx
import { Finding } from "../../utils/security";

interface ScanResultsProps {
  results: Finding[];
}

const ScanResults = ({ results }: ScanResultsProps) => {
  if (!results || results.length === 0) return <div>No findings yet.</div>;

  return (
    <table style={{ borderCollapse: "collapse", width: "100%" }}>
      <thead>
        <tr>
          <th>Line</th>
          <th>Type</th>
          <th>Snippet</th>
        </tr>
      </thead>
      <tbody>
        {results.map((r, idx) => (
          <tr key={idx}>
            <td style={{ border: "1px solid #eee", padding: 8 }}>{r.line}</td>
            <td style={{ border: "1px solid #eee", padding: 8 }}>{r.type}</td>
            <td style={{ border: "1px solid #eee", padding: 8, fontFamily: "monospace" }}>
              {r.snippet}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ScanResults;
