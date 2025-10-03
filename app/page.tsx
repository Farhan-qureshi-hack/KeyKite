"use client";

import { useState } from "react";
import RepoInput from "./components/RepoInput";
import ScanResults from "./components/ScanResults";
import SelfTest from "./components/SelfTest";
import { scanRepo, runSelfTest, Finding } from "../utils/security";

export default function Page() {
  const [scanResults, setScanResults] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(false);

  const handleScanRepo = async (repoUrl: string) => {
    try {
      setLoading(true);
      const results: Finding[] = await scanRepo(repoUrl);
      setScanResults(results);
    } catch (err) {
      console.error("Error scanning repo:", err);
      setScanResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelfTest = async (): Promise<Finding[]> => {
    const results = await runSelfTest();
    return results;
  };

  return (
    <div style={{ padding: "32px", fontFamily: "Arial, sans-serif" }}>
      <h1>KeyKite - AI Bug Bounty Hunter</h1>

      <section style={{ marginTop: "24px" }}>
        <h2>Scan Repository</h2>
        <RepoInput onSubmit={handleScanRepo} />
        {loading && <p>Scanning repository...</p>}
        {!loading && scanResults.length > 0 && <ScanResults results={scanResults} />}
      </section>

      <section style={{ marginTop: "48px" }}>
        <h2>Run Self-Test</h2>
        <SelfTest runSelfTest={handleSelfTest} />
      </section>
    </div>
  );
}
