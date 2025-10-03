interface Finding {
  line: number;
  type: string;
  snippet: string;
}

export default function ScanResults({ results }: { results: Finding[] }) {
  if (!results.length) return <p>No findings yet.</p>;
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
}
