// app/components/SelfTest.tsx
import { useState } from "react";
import { Finding } from "../../utils/security"; // frontend-safe type

interface SelfTestProps {
  runSelfTest: () => Promise<Finding[]>;
}

const SelfTest = ({ runSelfTest }: SelfTestProps) => {
  const [results, setResults] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(false);

  const handleRun = async () => {
    setLoading(true);
    try {
      const findings = await runSelfTest();
      setResults(findings);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleRun} disabled={loading}>
        {loading ? "Running..." : "Run Self Test"}
      </button>
      {results.length > 0 && (
        <table style={{ borderCollapse: "collapse", marginTop: 16 }}>
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
      )}
    </div>
  );
};

export default SelfTest;
