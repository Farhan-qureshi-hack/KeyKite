// app/components/SelfTest.tsx
"use client";
import { useState } from "react";
import { Finding } from "../../utils/security";

export default function SelfTest({ runSelfTest }: { runSelfTest: () => Promise<Finding[]> }) {
  const [results, setResults] = useState<Finding[] | null>(null);
  const [loading, setLoading] = useState(false);

  const go = async () => {
    setLoading(true);
    const data = await runSelfTest();
    setResults(data);
    setLoading(false);
  };

  return (
    <div style={{ marginTop: 24 }}>
      <button onClick={go} disabled={loading} style={{ padding: "8px 12px" }}>
        {loading ? "Running..." : "Run Self-Test"}
      </button>

      {results && (
        <div style={{ marginTop: 12 }}>
          <h4>Self-Test Results</h4>
          <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(results, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
